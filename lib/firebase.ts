// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔒 config
const firebaseConfig = {
  apiKey: "AIzaSyDmHRMVwt0AK_GRP_ceG9f9JR1DiGQct_0",
  authDomain: "my-wallet-5f5ed.firebaseapp.com",
  projectId: "my-wallet-5f5ed",
  storageBucket: "my-wallet-5f5ed.firebasestorage.app",
  messagingSenderId: "440539203692",
  appId: "1:440539203692:web:58502a7e345d91d820f049",
  measurementId: "G-KSM88YQZT1",
};

// ✅ init seguro
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ firestore e auth são seguros assim
export const db = getFirestore(app);
export const auth = getAuth(app);

// ✅ analytics ONLY no client (lazy)
export const initAnalytics = async () => {
  if (typeof window === "undefined") return null;
  const { getAnalytics } = await import("firebase/analytics");
  return getAnalytics(app);
};