const CACHE_VERSION = 5;
const CACHE_STATIC_NAME = 'static-v' + CACHE_VERSION;
const CACHE_DYNAMIC_NAME = 'dynamic'
const ALL_CACHE = [CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME]
var STATIC_FILES = [
  '/favicon.ico',
  '/manifest.json',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  '/src/images/icons/app-icon-48x48.png',
  '/src/images/icons/app-icon-96x96.png',
  '/src/images/icons/app-icon-144x144.png',
  '/src/images/icons/app-icon-192x192.png',
  '/src/images/icons/app-icon-256x256.png',
  '/src/images/icons/app-icon-384x384.png',
  '/src/images/icons/app-icon-512x512.png',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker ...');

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_STATIC_NAME)
    console.log('[SW] Precaching App Shell ...');
    await cache.addAll([
      '/',
      ...STATIC_FILES
    ]
    );
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
    const response = await caches.match(event.request);
    if (response) {
      return response;
    }

    console.log('[SW] Response NOT in cache, fetching ...');
    const res = await fetch(event.request)

    console.log({ res });
    console.log('[SW] add to cache:', event.request.url);
    const cache = await caches.open(CACHE_DYNAMIC_NAME);
    await cache.put(event.request.url, res.clone());
    return res;
  } catch (error) {
    console.log('[SW] Fetching failed; returning offline page instead.', event.request, error);
    const cache = await caches.open(CACHE_STATIC_NAME);
    return cache.match('/offline.html');
  }
}

const fetchCacheStrategyCacheOnly = async (event) => {
  return await caches.match(event.request);
}


const fetchCacheStrategyNetworkOnly = async (event) => {
  try {
    return await fetch(event.request)
  } catch (error) {
    console.log('[SW] Fetching failed; returning offline page instead.', event.request, error);
    const cache = await caches.open(CACHE_STATIC_NAME);
    return cache.match('/offline.html');
  }
}

const fetchCacheStrategyNetworkWithCacheFailback = async (event) => {
  try {
    const res = await fetch(event.request)

    const cache = await caches.open(CACHE_DYNAMIC_NAME);
    await cache.put(event.request.url, res.clone());
    return res;
  } catch (err) {
    return await caches.match(event.request);
  }
}

// self.addEventListener('fetch', (event) => {
//   // console.log('[SW] Fetching something ...', event);

//   event.respondWith((
//     async () => {
//       return await fetchCacheStrategyCacheWithNetwork(event);
//       // return await  fetchCacheStrategyCacheOnly(event);
//       // return await fetchCacheStrategyNetworkOnly(event);
//       // return await fetchCacheStrategyNetworkWithCacheFailback(event);
//     }
//   )());
// });

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          console.log('get from all cache:', event.request.url);
          return response;
        }

        return fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_DYNAMIC_NAME)
              .then(function (cache) {
                console.log('add to dynamic chache:', event.request.url);
                cache.put(event.request.url, res.clone());
                return res;
                // return cache.match(event.request.url);
              })
          })
          .catch(function (err) {
            return caches.open(CACHE_STATIC_NAME)
              .then(function (cache) {
                console.log('try get from static chache:', event.request.url);
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
              });
          });
      })
  );
});
