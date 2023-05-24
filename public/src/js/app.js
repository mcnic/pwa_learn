let deferredPrompt;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('Service worker registered');
    })
}

window.addEventListener('beforeinstallprompt', event => {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
})

const unregisterServiceWorker = () => {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

fetch('http://httpbin.org/ip')
  .then((resp) => {
    // console.log({ resp })
    if (resp.status === 200)
      return resp.json()
    else throw new Error(resp.statusText)
  })
  .then(data => {
    console.log('data', data);
  })
  .catch(err => console.log({ err }))