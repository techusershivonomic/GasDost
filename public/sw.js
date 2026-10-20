const CACHE = 'lmbg-delivery-v61'; // bump this on every future edit to force old installs to update
const APP_SHELL = [
  './lm_delivery_app.html',
  './i18n.js',
  './install.js',
  './vendor/qr-scanner.umd.min.js',
  './vendor/qr-scanner-worker.min.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first so edits always show up on next load instead of getting stuck
// on a stale cached version. Falls back to cache only when offline.
self.addEventListener('fetch', (e) => {
  // Database calls must always go to the server — never cache or replay them.
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
