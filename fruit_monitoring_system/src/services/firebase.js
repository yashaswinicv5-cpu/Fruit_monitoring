import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || window.location.hostname,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const hasFirebaseConfig = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
};

const app = hasFirebaseConfig()
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

const messaging = () => {
  if (!hasFirebaseConfig() || !app) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }
  return getMessaging(app);
};

export const requestFirebaseNotificationPermission = async () => {
  if (!hasFirebaseConfig() || !app) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("This browser does not support push notifications or service workers.");
  }

  const isSecureContext = window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (!isSecureContext) {
    throw new Error("Notifications require a secure context. Please use https:// or localhost.");
  }

  if (Notification.permission === "denied") {
    throw new Error("Notifications are blocked.");
  }

  const permission = Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging(), {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Failed to obtain FCM token.");
  }

  return token;
};

export const onForegroundMessage = (callback) => {
  if (!hasFirebaseConfig() || !app) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  return onMessage(messaging(), callback);
};

export const listenToAuthState = (callback) => {
  if (!auth) {
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

export const signInWithEmail = async (email, password) => {
  if (!auth) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email, password) => {
  if (!auth) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  if (!auth) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logOut = async () => {
  if (!auth) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  return signOut(auth);
};

export const getAuthErrorMessage = (error) => {
  if (!error) {
    return "Authentication failed.";
  }

  if (error.code === "auth/configuration-not-found") {
    return "Firebase Auth is not configured correctly for this app. Please enable Authentication in Firebase Console and use the correct web auth domain.";
  }

  if (error.code === "auth/invalid-credential") {
    return "The email or password is incorrect.";
  }

  if (error.code === "auth/popup-closed-by-user") {
    return "Google sign-in was canceled.";
  }

  if (error.code === "auth/unauthorized-domain") {
    return "This domain is not authorized for Firebase Authentication. Add it to the authorized domains list in Firebase Console.";
  }

  return error.message || "Authentication failed.";
};

export const fetchFruitData = async () => {
  if (!hasFirebaseConfig() || !db) {
    throw new Error("Firebase is not configured. Set VITE_FIREBASE_* environment variables.");
  }

  const fruitsCollection = collection(db, "fruit monitoring");
  const snapshot = await getDocs(fruitsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
