# Script Studio AI proxy (Cloudflare Worker)

Holds your Gemini API key server-side and forwards requests from the app.
Free to run on Cloudflare's free tier. See the comment block at the top of
`index.js` for what it does and why it exists.

## Setup

```bash
npm install -g wrangler
cd worker
wrangler login
wrangler secret put GEMINI_API_KEY   # paste your key from https://aistudio.google.com/apikey
wrangler deploy
```

Wrangler will print your live URL, something like:

```
https://scriptstudio-ai-proxy.YOUR-SUBDOMAIN.workers.dev
```

Put that URL in the project root's `.env` file as `VITE_AI_PROXY_URL` (see
`.env.example`), then rebuild the frontend.

## Before going live

`index.js` currently allows requests from any origin (`ALLOWED_ORIGIN = "*"`).
Once your frontend has a real deployed URL, lock this down:

```js
const ALLOWED_ORIGIN = "https://your-actual-site.pages.dev";
```

This stops other sites from riding on your free Gemini quota.
