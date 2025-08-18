// Very small service worker for offline shell
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open('poker-shell-v1').then((cache) => cache.addAll(['/','/index.html']))
  );
});

self.addEventListener('fetch', (event: any) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
