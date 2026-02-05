import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export default defineNuxtPlugin(() => {
  // Firebase configuration for Catering App
  const firebaseConfig = {
    apiKey: "AIzaSyAudiW6v9OlVudtm2hIS3O68z86c-MjiJE",
    authDomain: "catering-app-e0a17.firebaseapp.com",
    projectId: "catering-app-e0a17",
    storageBucket: "catering-app-e0a17.firebasestorage.app",
    messagingSenderId: "4179994158",
    appId: "1:4179994158:web:a56fa92eebe7c9358be1bf",
    measurementId: "G-7KDPWJZKQL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return {
    provide: {
      firebase: app,
      auth,
      db,
      storage,
    },
  };
});
