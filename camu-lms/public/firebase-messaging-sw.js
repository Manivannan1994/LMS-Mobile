// Scripts for firebase and firebase messaging
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);


const firebaseConfig = {
  apiKey: "AIzaSyC9wOx8yNVvjf2z7AHxAqMnCGWMGitrQJo",
  authDomain: "camuweb-d9df1.firebaseapp.com",
  projectId: "camuweb-d9df1",
  storageBucket: "camuweb-d9df1.appspot.com",
  messagingSenderId: "614746299795",
  appId: "1:614746299795:web:ba0dabd0cc03ebcc195c66",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/lms-root/camulogo.png'
  };

  
  self.registration.showNotification(notificationTitle, notificationOptions);
});
