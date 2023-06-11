importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_VERSION = 24;
const CACHE_STATIC_NAME = 'static-v' + CACHE_VERSION;
const CACHE_DYNAMIC_NAME = 'dynamic'
const ALL_CACHE = [CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME];
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
const FIREBASE_NAME = 'pwa-lern-52f8d'
const FIREBASE_DB_URL = `https://${FIREBASE_NAME}-default-rtdb.firebaseio.com`
const FIREBASE_HOSTING_URL = `https://pwa-lern-52f8d.web.app`
const FIREBASE_FUNCTION_URL = 'https://storepostdata-wuqxsx4jeq-uc.a.run.app';

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

  // event.waitUntil(clients.claim());
});

self.addEventListener("message", (event) => {
  console.log(`[SW] The client sent me a message: ${event.data}`);

  event.source.postMessage("Hi client");
});

addEventListener("sync", (event) => {
  console.log('[SW] sync:', event.tag);
  if (event.tag === 'sync-new-posts') {
    console.log('[SW] Syncing new Posts');
    event.waitUntil((async () => {
      const data = await readAllData('sync-posts');
      console.log({ data });
      for (var dt of data) {
        fetch(FIREBASE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            id: dt.id,
            title: dt.title,
            location: dt.location,
            image: '/src/images/sf-boat.jpg'
          })
        })
          .then(function (res) {
            console.log('Sent data', res);
            res.ok && res.json().then(resData => deleteItemFromData('sync-posts', resData.id));
          })
          .catch(function (err) {
            console.log('Error while sending data', err);
          });
      }
    })());
  }
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
        return response || fetch(event.request)
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

self.addEventListener('notificationclick', function (event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
        .then(function (clis) {
          var client = clis.find(function (c) {
            return c.visibilityState === 'visible';
          });

          if (client !== undefined) {
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
    );
  }
});

self.addEventListener('notificationclose', function (event) {
  console.log('close');
});

self.addEventListener('push', function (event) {
  console.log('[SW} Push:', event);

  let data = { title: 'new', content: 'something new happened', openUrl: '/' }
  if (event.data) {
    data = {
      ...data,
      ...event.data.json()
    };
  }

  const options = {
    body: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
});