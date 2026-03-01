// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmHRMVwt0AK_GRP_ceG9f9JR1DiGQct_0",
  authDomain: "my-wallet-5f5ed.firebaseapp.com",
  projectId: "my-wallet-5f5ed",
  storageBucket: "my-wallet-5f5ed.firebasestorage.app",
  messagingSenderId: "440539203692",
  appId: "1:440539203692:web:58502a7e345d91d820f049",
  measurementId: "G-KSM88YQZT1"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
