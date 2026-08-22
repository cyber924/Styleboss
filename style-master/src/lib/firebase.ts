import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDlUUHWQjl8IpT5XFljw_wouErMLOXZiBI",
  authDomain: "lifeai-ern1c.firebaseapp.com",
  projectId: "lifeai-ern1c",
  storageBucket: "lifeai-ern1c.firebasestorage.app",
  messagingSenderId: "633678862287",
  appId: "1:633678862287:web:f1620c47d0cd732b0de4ba",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
