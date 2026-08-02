/**
 * Script Studio AI proxy — Cloudflare Worker, Gemini + YouTube backend.
 *
 * WHY THIS EXISTS
 * The browser can never hold API keys (anyone can open dev tools and steal
 * them). This Worker holds them server-side and is the only thing that talks
 * to Google. Your frontend talks to this Worker instead.
 *
 * TWO JOBS, ONE WORKER
 * - POST { system, messages }   \u2192 Gemini text generation (Poke holes, Review, etc.)
 * - POST { videoSearch: "..." } \u2192 YouTube Data API: finds the real trailer video ID
 *   for a title, so the app can embed an actual inline YouTube player instead
 *   of guessing at hardcoded video IDs that could be wrong or go stale.
 *
 * SETUP
 * 1. Install Wrangler:              npm install -g wrangler
 * 2. Create the Worker:             wrangler init scriptstudio-ai-proxy
 *    (choose "Hello World" template, then replace src/index.js with this file)
 * 3. Get a free Gemini API key:     https://aistudio.google.com/apikey
 * 4. Enable the YouTube Data API v3 on the same Google Cloud project, then
 *    create a second API key (or reuse one) restricted to that API:
 *      https://console.cloud.google.com/apis/library/youtube.googleapis.com
 * 5. Store both as secrets (never in code, never committed):
 *      wrangler secret put GEMINI_API_KEY
 *      wrangler secret put YOUTUBE_API_KEY
 * 6. Deploy:                        wrangler deploy
 * 7. You'll get a URL like https://scriptstudio-ai-proxy.YOUR-SUBDOMAIN.workers.dev
 *
 * FRONTEND CHANGE
 * In App.jsx, callClaude() posts { system, messages } exactly as before \u2014
 * no change needed there. A new fetchTrailerId() function posts
 * { videoSearch } to this same URL and reads back { videoId }.
 *
 * FREE TIER NOTE
 * YouTube Data API v3 gives 10,000 free quota units/day; a search.list call
 * costs 100 units, so about 100 trailer lookups/day before you'd hit a quota
 * error \u2014 plenty for personal use.
 */

const GEMINI_MODEL = "gemini-3.1-flash-lite"; // gemini-2.5-flash is deprecated for new API keys \u2014 keep this one
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// Lock this down to your real deployed frontend origin before going live.
const ALLOWED_ORIGIN = "*";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST." }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // --- Job 2: YouTube trailer lookup ---
    if (typeof payload.videoSearch === "string") {
      try {
        const params = new URLSearchParams({
          part: "snippet",
          type: "video",
          maxResults: "1",
          q: payload.videoSearch,
          key: env.YOUTUBE_API_KEY,
        });
        const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
        if (!res.ok) {
          const errText = await res.text();
          return new Response(JSON.stringify({ error: "YouTube search failed.", detail: errText }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
        }
        const data = await res.json();
        const videoId = data.items?.[0]?.id?.videoId || null;
        if (!videoId) return new Response(JSON.stringify({ error: "No video found." }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ videoId }), { headers: { ...cors, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Something went wrong calling YouTube.", detail: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
      }
    }

    // --- Job 1: Gemini text generation ---
    const { system, messages } = payload;
    const userText = Array.isArray(messages) && messages[0] ? String(messages[0].content || "") : "";

    const geminiBody = {
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { maxOutputTokens: 1000 },
    };

    try {
      const res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: "Gemini request failed.", detail: errText }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
      }

      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
      return new Response(JSON.stringify({ text }), { headers: { ...cors, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Something went wrong calling Gemini.", detail: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }
  },
};
