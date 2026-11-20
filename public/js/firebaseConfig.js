import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ─── Environment Resolution ───────────────────────────────────────────────────
// When running via Express (npm run dev):
//   Values come from window.__ENV__ — injected by the server at GET /js/env-config.js
// When bundled by Vite (npm run build / npm run dev:client):
//   Values come from import.meta.env.VITE_* — loaded from the .env file at build time
// ─────────────────────────────────────────────────────────────────────────────
const env = (typeof window !== 'undefined' && window.__ENV__)
  ? window.__ENV__
  : (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {});

const rawApiKey = env.VITE_FIREBASE_API_KEY;
const isDemo = !rawApiKey || rawApiKey.includes('YOUR_API_KEY') || rawApiKey.includes('demo-api-key-safe-placeholder');

const firebaseConfig = {
  apiKey:            rawApiKey,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId:         env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:             env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase safely
let app = null, auth = null, db = null;
if (!isDemo && rawApiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase client initialization warning:", e.message);
  }
}

export { 
  isDemo, 
  db,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  setDoc
};
