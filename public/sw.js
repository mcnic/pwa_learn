const CACHE_NAME = 'offline'

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker ...', event);
  event.waitUntil(async () => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll([
      '/manifest.json',
      '/',
      '/?',
      '/index.html',
      '/help',
      '/help/index.html',
      '/src/css/app.css',
      '/src/css/feed.css',
      '/src/css/help.css',
      '/src/js/app.js',
      '/src/js/feed.js',
      '/src/js/fetch.js',
      '/src/js/primise.js',
      '/src/js/material.min.js',
      '/favicon.ico',
      '/src/images/main-image.jpg',
      '/src/images/icons/app-icon-48x48.png',
      '/src/images/icons/app-icon-96x96.png',
      '/src/images/icons/app-icon-144x144.png',
      '/src/images/icons/app-icon-192x192.png',
      '/src/images/icons/app-icon-256x256.png',
      '/src/images/icons/app-icon-384x384.png',
      '/src/images/icons/app-icon-512x512.png',
      'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
      'https://fonts.googleapis.com/icon?family=Material+Icons',
      'https://fonts.googleapis.com/css?family=Roboto:400,700',
    ])
  }
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker ...', event);
  event.waitUntil((async () => {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // console.log('[SW] Fetching something ...', event);

  // fetch(event.request)

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log('Fetch failed; returning offline page instead.', event.request, error);

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request.url);
        console.log({ cachedResponse });
        return cachedResponse;
      }
    })());
  }
});