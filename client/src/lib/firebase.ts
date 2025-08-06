import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "healthcare-demo"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "healthcare-demo",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "healthcare-demo"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize demo users
export const DEMO_USERS = {
  'patient@example.com': { password: 'password123', role: 'patient', plan: 'family' },
  'doctor@example.com': { password: 'password123', role: 'doctor', plan: 'personal' },
  'lab@example.com': { password: 'password123', role: 'lab', plan: 'personal' },
};

export default app;
