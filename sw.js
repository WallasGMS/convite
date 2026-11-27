// Convite service worker: makes the site installable and keeps the last copy for offline use.
// Network first, so a new publish shows up right away; the cache is only a fallback without signal.
const CACHE = 'convite-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // fonts, maps, WhatsApp: straight to network
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then((r) => r || Response.error())),
  );
});
