self.addEventListener('install', (event) => {
  //or self.oninstall = (event) => {
  event.waitUntil(
    caches.open('first-app')
      .then((cache) => {
        cache.addAll([
          '/',
          '/index.html',
          '/src/css/app.css',
          '/src/js/app.js'
        ])
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(function (res) {
        return res;
      })
  );
});