import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBDQ0jSqGuyo6Jw2Kf9bIVpN8si_IIqXuo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-note-app-41f42.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-note-app-41f42",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-note-app-41f42.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "113769554981",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:113769554981:web:058be75e62553fca3fcbcc",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://smart-note-app-41f42-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
