# Script Studio

A story-structure coach and screenplay editor for short films: pick a
framework (Save the Cat, Hero's Journey, Story Clock, and others), answer
guided beat questions, get AI pushback on weak spots, review a full script
for structural holes, and search for cinematic reference shots.

## Project layout

```
├── src/                  the React app
│   ├── App.jsx           the whole UI (this is the big one)
│   ├── main.jsx          entry point, installs the storage polyfill
│   └── storage-polyfill.js   localStorage-backed save/load (no backend needed)
├── public/fonts/         the Cyber Brush display font
├── worker/               a Cloudflare Worker that proxies AI calls (see worker/README.md)
├── index.html
├── package.json
└── vite.config.js
```

## Running it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Your projects/scripts save to your
browser's localStorage automatically — no setup needed for that part.

The AI features (Poke holes, Review script, Search references) need the
Worker in `worker/` deployed first — see `worker/README.md`. Until then,
those buttons will show a plain "not configured yet" message instead of
failing silently.

## Deploying the frontend for free

Any of these work; pick one:

**Cloudflare Pages**
```bash
npm run build
```
Then connect the repo in the Cloudflare dashboard, or drag-and-drop the
`dist/` folder. Build command: `npm run build`. Output directory: `dist`.
Set `VITE_AI_PROXY_URL` under Settings → Environment Variables.

**Netlify**
Connect the repo. Build command: `npm run build`. Publish directory: `dist`.
Add `VITE_AI_PROXY_URL` under Site settings → Environment variables.

**Vercel**
Connect the repo, framework preset "Vite". Add `VITE_AI_PROXY_URL` under
Project Settings → Environment Variables. Note Vercel's free Hobby tier is
for personal/non-commercial use only (see Netlify/Cloudflare above if that
doesn't fit).

## Deploying the AI proxy

See `worker/README.md`. Short version: it's a small Cloudflare Worker that
holds a free Gemini API key server-side, so the key never sits in your
frontend code where anyone could steal it.

## About storage

Right now, save data lives in `localStorage` — plenty for one person using
this in one browser. If you later want it to sync across your phone and
laptop, or share projects with someone else, that's a real backend +
database (Cloudflare D1 or Neon Postgres are both free and don't expire
from inactivity). That would mean replacing `src/storage-polyfill.js` with
real API calls — the rest of the app doesn't need to change, since it only
ever talks to `window.storage.get/set/delete/list`.

## Fonts

`Cyber Brush` (used for display headings) is your own licensed font file,
sitting in `public/fonts/`. Make sure your license covers using it this way
before publishing publicly.
