const CACHE_VERSION = 12;
const CACHE_STATIC_NAME = 'static-v' + CACHE_VERSION;
const CACHE_DYNAMIC_NAME = 'dynamic'
const ALL_CACHE = [CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME]
const STATIC_FILES = [
  '/favicon.ico',
  '/manifest.json',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/idb.js',
  '/src/js/utility.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  // '/src/images/main-image.webp',
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

const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !ALL_CACHE.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker ...');

  event.waitUntil((async () => {
    await deleteOldCaches();

    const cache = await caches.open(CACHE_STATIC_NAME)
    // console.log('[SW] Precaching App Shell ...');
    await cache.addAll([
      '/',
      ...STATIC_FILES
    ]);
  })());
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker ...');

  // event.waitUntil(deleteOldCaches());

  self.clients.claim();
});

self.addEventListener("message", (event) => {
  console.log(`[SW] The client sent me a message: ${event.data}`);

  event.source.postMessage("Hi client");
});

addEventListener("sync", (event) => {
  console.log('[SW] sync:', event.tag);
});

addEventListener("periodicsync", (event) => {
  console.log('[SW] periodicsync:', event.tag);
});

addEventListener("push", (event) => {
  let message = event.data.json();
  console.log('[SW] push:', message);
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
          // console.log('get from all cache:', event.request.url);
          return response;
        }

        return fetch(event.request)
          .then(function (res) {
            if (event.request.url.includes('.json')) {
              return res;
            }

            return caches.open(CACHE_DYNAMIC_NAME)
              .then(function (cache) {
                console.log('add to dynamic chache:', event.request.url);
                cache.put(event.request.url, res.clone());
                return res;
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
