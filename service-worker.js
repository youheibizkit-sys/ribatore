// Scoped offline assets for リバトレ. Leave unrelated caches on the same origin untouched.
const CACHE_NAME = 'ribatore-v4-header-mascot';
const OWN_CACHE_PREFIXES = ['ribatore-', 'reversi-training-'];
const ASSETS = ['./index.html', './manifest.webmanifest', './icon-situp-192.png', './icon-situp-512.png', './icon-situp-maskable-512.png', './header-logo.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys
      .filter(key => key !== CACHE_NAME && OWN_CACHE_PREFIXES.some(prefix => key.startsWith(prefix)))
      .map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)));
      }
      return res;
    }).catch(() => caches.match('./index.html')));
  } else {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});
