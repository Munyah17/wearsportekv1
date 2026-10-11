/* WearSportek service worker — app-shell cache + network-first for API calls. */
const VERSION = 'ws-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const IMG_CACHE = `${VERSION}-img`;

const SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // never cache payment/API traffic
  if (url.hostname.includes('paynow') || url.pathname.startsWith('/api')) {
    return e.respondWith(fetch(e.request));
  }

  // images: cache-first
  if (/\.(png|jpe?g|webp|avif|gif|svg)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit || fetch(e.request).then((res) => {
          if (res.ok && res.status === 200) {
            const clone = res.clone();
            caches.open(IMG_CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        }).catch(() => hit)
      )
    );
    return;
  }

  // everything else: network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('/')))
  );
});
