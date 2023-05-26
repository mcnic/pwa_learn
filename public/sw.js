const CACHE_VERSION = 2;
const CACHE_NAME = 'static-v' + CACHE_VERSION;
const DYNAMIC_CACHE_NAME = 'dynamic'
const ALL_CACHE = [CACHE_NAME, DYNAMIC_CACHE_NAME]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker ...');

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)

    console.log('[SW] Precaching App Shell ...');

    await cache.addAll([
      '/manifest.json',
      '/',
      '/index.html',
      '/help',
      '/help/index.html',
      '/src/css/app.css',
      '/src/css/feed.css',
      '/src/css/help.css',
      '/src/js/app.js',
      '/src/js/feed.js',
      '/src/js/fetch.js',
      '/src/js/promise.js',
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
    ]);
  })());
});


self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker ...');

  event.waitUntil((async () => {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  // delete old cache
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (!ALL_CACHE.includes(cacheName)) {
            console.log('[SW] remove old cache ...', cacheName);

            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // console.log('[SW] Fetching something ...', event);

  // fetch(event.request)

  // if (event.request.mode === 'navigate') {
  event.respondWith((async () => {
    try {
      // const preloadResponse = await event.preloadResponse;
      // if (preloadResponse) {
      //   return preloadResponse;
      // }

      const response = await caches.match(event.request)
      if (response) {
        return response;
      } else {
        console.log('response NOT in cache, Fetching ...');
        return fetch(event.request)
          .then(async (res) => {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            console.log('[SW] add to cache ...');
            await cache.put(event.request.url, res);
            return res;
          });
      }
    } catch (error) {
      console.log('Fetch failed; returning offline page instead.', event.request, error);

    }
  })());
  // }
});