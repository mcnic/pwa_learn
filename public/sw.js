self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker ...', event);
  // event.waitUntil(
  //   caches.open('first-app')
  //     .then((cache) => {
  //       cache.addAll([
  //         '/manifest.json',
  //         '/',
  //         '/?',
  //         '/index.html',
  //         '/help',
  //         '/help/index.html',
  //         '/src/css/app.css',
  //         '/src/css/feed.css',
  //         '/src/css/help.css',
  //         '/src/js/app.js',
  //         '/src/js/feed.js',
  //         '/src/js/material.min.js',
  //         '/favicon.ico',
  //         '/src/images/main-image.jpg',
  //         '/src/images/icons/app-icon-48x48.png',
  //         '/src/images/icons/app-icon-96x96.png',
  //         '/src/images/icons/app-icon-144x144.png',
  //         '/src/images/icons/app-icon-192x192.png',
  //         '/src/images/icons/app-icon-256x256.png',
  //         '/src/images/icons/app-icon-384x384.png',
  //         '/src/images/icons/app-icon-512x512.png',
  //         'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
  //         'https://fonts.googleapis.com/icon?family=Material+Icons',
  //         'https://fonts.googleapis.com/css?family=Roboto:400,700',
  //       ])
  //     })
  // );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker ...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // console.log('[SW] Fetching something ...', event);
  fetch(event.request)

  // event.respondWith(
  //   caches.match(event.request)
  //     .then((res) => res)
  // );
});