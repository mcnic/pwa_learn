const CACHE_VERSION = 5;
const CACHE_STATIC_NAME = 'static-v' + CACHE_VERSION;
const CACHE_DYNAMIC_NAME = 'dynamic'
const ALL_CACHE = [CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker ...');

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_STATIC_NAME)

    console.log('[SW] Precaching App Shell ...');

    await cache.addAll([
      '/',
      '/manifest.json',
      '/index.html',
      '/offline.html',
      '/src/css/app.css',
      '/src/css/feed.css',
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
            console.log('[SW] remove old cache:', cacheName);

            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

const fetchCacheStrategyCacheWithNetwork = async (event) => {
  try {
    // const preloadResponse = await event.preloadResponse;
    // if (preloadResponse) {
    //   return preloadResponse;
    // }

    const response = await caches.match(event.request);
    if (response) {
      return response;
    }

    console.log('[SW] Response NOT in cache, fetching ...');
    const res = await fetch(event.request)

    console.log({ res });
    console.log('[SW] add to cache:', event.request.url);
    const cache = await caches.open(CACHE_DYNAMIC_NAME);
    await cache.put(event.request.url, res);
    return cache.match(event.request.url);
  } catch (error) {
    console.log('[SW] Fetching failed; returning offline page instead.', event.request, error);
    const cache = await caches.open(CACHE_STATIC_NAME);
    return cache.match('/offline.html');
  }
}

self.addEventListener('fetch', (event) => {
  // console.log('[SW] Fetching something ...', event);

  event.respondWith((
    async () => {
      return await fetchCacheStrategyCacheWithNetwork(event);
    }
  )());
});