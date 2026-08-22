import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import type { FirebaseConfig } from "../types";

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyB2YzsqY1TE-RHlVW8jBy9XWxsB-K_fxFE",
  authDomain: "appai-9c3b7.firebaseapp.com",
  projectId: "appai-9c3b7",
  storageBucket: "appai-9c3b7.firebasestorage.app",
  messagingSenderId: "205875590879",
  appId: "1:205875590879:web:6d4c691105a4a91a649b6a"
};

const STORAGE_KEY = "stylewise_firebase_config";

export function getStoredFirebaseConfig(): FirebaseConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.projectId === "lifeai-ern1c" || parsed.apiKey === "AIzaSyDlUUHWQjl8IpT5XFljw_wouErMLOXZiBI") {
        // Clear legacy broken config and upgrade to new default
        localStorage.removeItem(STORAGE_KEY);
        return DEFAULT_FIREBASE_CONFIG;
      }
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load Firebase config from localStorage", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save Firebase config", e);
  }
}

export function resetFirebaseConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to reset Firebase config", e);
  }
}

export let app: FirebaseApp = initializeApp(getStoredFirebaseConfig());
export let db: Firestore = getFirestore(app);
export let auth: Auth = getAuth(app);
export let googleProvider = new GoogleAuthProvider();

export function initFirebase(customConfig?: FirebaseConfig) {
  const config = customConfig || getStoredFirebaseConfig();
  
  try {
    const currentApps = getApps();
    if (currentApps.length > 0) {
      currentApps.forEach(existingApp => {
        try {
          deleteApp(existingApp);
        } catch (e) {
          console.warn("Error deleting old firebase app instance", e);
        }
      });
    }
    
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Firebase initialization warning:", error);
    try {
      if (getApps().length > 0) {
        app = getApp();
        db = getFirestore(app);
        auth = getAuth(app);
      }
    } catch (err) {
      console.error("Critical Firebase fallback error:", err);
    }
  }

  return {
    app,
    db,
    auth,
  };
}
