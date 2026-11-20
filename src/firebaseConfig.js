import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isDemoMode = !rawApiKey || rawApiKey.includes('YOUR_API_KEY') || rawApiKey.includes('demo-api-key-safe-placeholder');

const firebaseConfig = {
  apiKey: isDemoMode ? 'demo-api-key-safe-placeholder' : rawApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

let app;
let auth;
let db;

if (!isDemoMode) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization warning (running in demo mode):", error.message);
  }
} else {
  // Demo mode: no real Firebase services
  auth = null;
  db = null;
}

export { auth, db };
