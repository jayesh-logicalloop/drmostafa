importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyAinIMdbOdg1N2hCXyGQDJkgZFIDH4FUY0",
  authDomain: "mostafa-a4b2c.firebaseapp.com",
  databaseURL: "https://mostafa-a4b2c-default-rtdb.firebaseio.com",
  projectId: "mostafa-a4b2c",
  storageBucket: "mostafa-a4b2c.appspot.com",
  messagingSenderId: "845083122541",
  appId: "1:845083122541:web:7ee4087cdcaefdfaf15864"

});

const messaging = firebase.messaging();
