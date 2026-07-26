/**
 * Script Studio AI proxy — Cloudflare Worker, Gemini backend.
 *
 * WHY THIS EXISTS
 * The browser can never hold your Gemini API key (anyone can open dev tools
 * and steal it). This Worker holds the key server-side and is the only thing
 * that talks to Google. Your frontend talks to this Worker instead.
 *
 * SETUP
 * 1. Install Wrangler:              npm install -g wrangler
 * 2. Create the Worker:             wrangler init scriptstudio-ai-proxy
 *    (choose "Hello World" template, then replace src/index.js with this file)
 * 3. Get a free Gemini API key:     https://aistudio.google.com/apikey
 * 4. Store it as a secret (never in code, never committed):
 *      wrangler secret put GEMINI_API_KEY
 * 5. Deploy:                        wrangler deploy
 * 6. You'll get a URL like https://scriptstudio-ai-proxy.YOUR-SUBDOMAIN.workers.dev
 *
 * FRONTEND CHANGE
 * In App.jsx, replace the callClaude() function's fetch target and
 * body with a call to this Worker's URL, POSTing { system, messages } exactly
 * as it already does — this Worker accepts that same shape, so the rest of
 * the app (askBeat, runReview, runSearch) needs zero other changes.
 *
 *   const response = await fetch("https://scriptstudio-ai-proxy.YOUR-SUBDOMAIN.workers.dev", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ system, messages }),
 *   });
 *   const data = await response.json();
 *   return data.text;
 */

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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


/* Trigger deployment */
