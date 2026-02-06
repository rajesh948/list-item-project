// Script to seed app version info to Firestore
// Run with: node scripts/seed-app-version.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config - same as your app
const firebaseConfig = {
  apiKey: "AIzaSyAmOELURBKmQ0fMBuAMT4uROqunNexcFOg",
  authDomain: "catering-app-e0a17.firebaseapp.com",
  projectId: "catering-app-e0a17",
  storageBucket: "catering-app-e0a17.firebasestorage.app",
  messagingSenderId: "4179994158",
  appId: "1:4179994158:web:your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedAppVersion() {
  try {
    // Set version info in Firestore
    await setDoc(doc(db, 'appConfig', 'version'), {
      // Current latest version
      latestVersion: '1.0.0',

      // Minimum version required (for force updates)
      minRequiredVersion: '1.0.0',

      // URL to download the app (landing page or Play Store)
      updateUrl: 'https://caterhub.web.app',

      // Release notes shown to user
      releaseNotes: 'Initial release with all core features!',

      // Timestamp
      updatedAt: new Date(),
    });

    console.log('✅ App version info seeded successfully!');
    console.log('');
    console.log('Version Info:');
    console.log('- Latest Version: 1.0.0');
    console.log('- Min Required: 1.0.0');
    console.log('- Update URL: https://caterhub.web.app');
    console.log('');
    console.log('To update version later, run this script again with new values.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding app version:', error);
    process.exit(1);
  }
}

seedAppVersion();
