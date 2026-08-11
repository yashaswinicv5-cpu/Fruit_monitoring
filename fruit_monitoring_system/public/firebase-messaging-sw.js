importScripts('https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: 'AIzaSyANZ-e3iJxKkT_sOb4djuJPErOerF59jaE',
  authDomain: 'quality-monitoring-of-fruits.firebaseapp.com',
  projectId: 'quality-monitoring-of-fruits',
  messagingSenderId: '60094862083',
  appId: '1:60094862083:web:9d28226aad2cab770e8f36',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || '',
    icon: payload.notification?.icon || '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
