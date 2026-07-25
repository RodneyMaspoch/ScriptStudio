/**
 * Polyfills the window.storage key-value API (originally provided by the
 * Claude.ai artifact sandbox) using the browser's localStorage.
 *
 * This means the app works completely standalone, with no backend and no
 * database, as long as it's just you using it in your own browser. Data
 * lives in that browser only — it won't sync across devices and clearing
 * site data / using a different browser starts you fresh.
 *
 * If you later want multi-device sync or shared data, swap this file's
 * implementation for real fetch() calls to your own backend + database
 * (Cloudflare D1, Neon, etc.) — the rest of the app doesn't need to change,
 * since it only ever calls window.storage.get/set/delete/list.
 *
 * The "shared" parameter is accepted for API compatibility but has no effect
 * here — everything is local to this browser regardless of its value.
 */

const PREFIX = "throughline:";

function fullKey(key) {
  return PREFIX + key;
}

window.storage = {
  async get(key) {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) {
      throw new Error(`Key not found: ${key}`);
    }
    return { key, value: raw, shared: false };
  },

  async set(key, value) {
    window.localStorage.setItem(fullKey(key), value);
    return { key, value, shared: false };
  },

  async delete(key) {
    window.localStorage.removeItem(fullKey(key));
    return { key, deleted: true, shared: false };
  },

  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        const bare = k.slice(PREFIX.length);
        if (!prefix || bare.startsWith(prefix)) keys.push(bare);
      }
    }
    return { keys, prefix, shared: false };
  },
};
