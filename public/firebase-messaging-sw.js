// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAudiW6v9OlVudtm2hIS3O68z86c-MjiJE",
  authDomain: "catering-app-e0a17.firebaseapp.com",
  projectId: "catering-app-e0a17",
  storageBucket: "catering-app-e0a17.firebasestorage.app",
  messagingSenderId: "4179994158",
  appId: "1:4179994158:web:a56fa92eebe7c9358be1bf",
  measurementId: "G-7KDPWJZKQL"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'CaterHub';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: payload.data?.tag || 'caterhub-notification',
    data: payload.data,
    actions: getNotificationActions(payload.data?.type),
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'premium_expiry':
      return [
        { action: 'renew', title: 'Renew Now' },
        { action: 'dismiss', title: 'Later' },
      ];
    case 'event_reminder':
      return [
        { action: 'view', title: 'View Event' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    case 'request_update':
      return [
        { action: 'view', title: 'View Status' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
    default:
      return [];
  }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  let urlToOpen = '/';

  // Determine URL based on action and notification type
  if (action === 'renew' || data?.type === 'premium_expiry') {
    urlToOpen = '/subscription';
  } else if (action === 'view' && data?.type === 'event_reminder') {
    urlToOpen = '/calendar';
  } else if (action === 'view' && data?.type === 'request_update') {
    urlToOpen = '/my-requests';
  } else if (data?.url) {
    urlToOpen = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
