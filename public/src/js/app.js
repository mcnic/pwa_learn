const PUSH_PUBLIC_KEY = 'BBELZbbSF46Jo2cP-dDn2ijMfnCNKA6S-G5BF5lOttrI1-G7by007QanwLpgQI1qCpI9w2Kcr6UmszZz7HAq7Jk';
const PUSH_PRIVATE_KEY = '3VIbw-Y5EG_gIxz3XXCWpfPoxdIldO5YJtWYMlAeXVE'
const FIREBASE_DB_URL = 'https://pwa-lern-52f8d-default-rtdb.firebaseio.com';
let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')

  navigator.serviceWorker.addEventListener("message", (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
  });

  navigator.serviceWorker.ready.then((registration) => {
    registration.active.postMessage("Hi service worker");
  });
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  return false;
})

const unregisterServiceWorker = () => {
  navigator.serviceWorker?.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

function isOnline() {
  var connectionStatus = document.getElementById('connectionStatus');

  if (navigator?.onLine) {
    connectionStatus.innerHTML = `online ${Notification.permission}`;
  } else {
    connectionStatus.innerHTML = `offline ${Notification.permission}`;
  }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);
isOnline();

const displayConfirmNotification = () => {
  const options = {
    body: 'You uccessfully subscribed to our Notifiction service!',
    icon: '/src/images/icons/app-icon-96x96.png',
    image: '/src/images/sf-boat.jpg',
    dir: 'ltr',
    lang: 'en_US',
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app-icon-96x96.png',
    tag: 'confirm-notification',
    renotify: true,
    actions: [
      { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
      { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' },
    ]
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((ServiceWorkerRegistration) => {
        ServiceWorkerRegistration.showNotification('Successfully subscribed!', options);
      })
  }
}

const configurePushSub = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const swreg = await navigator.serviceWorker.ready
  const currentSubscription = await swreg.pushManager.getSubscription();
  // Create a new subscription
  const newSubscription = (currentSubscription === null) ?
    await swreg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUSH_PUBLIC_KEY)
    })
    : {}

  const res = await fetch(`${FIREBASE_DB_URL}/subscriptions.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(newSubscription)
  })
  if (res.ok) {
    displayConfirmNotification();
    // .catch(function (err) {
    //   console.log(err);
    // });
  }
}

const askEnableNoticication = (event) => {
  Notification.requestPermission(result => {
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      // configurePushSub();
      // displayConfirmNotification();
    }
    enableNotificationsButtons.forEach((but) => but.style.display = 'none')
    configurePushSub();
  })
}

if ('Notification' in window && 'serviceWorker' in navigator /*&& Notification.permission === 'default'*/) {
  enableNotificationsButtons.forEach((but) => {
    but.style.display = 'inline-block';
    but.addEventListener('click', askEnableNoticication);
  });
}