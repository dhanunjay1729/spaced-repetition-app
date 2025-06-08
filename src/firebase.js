// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth"; // Import Firebase Authentication

import { getFirestore } from "firebase/firestore"; // Import Firestore

import { getAnalytics } from "firebase/analytics";


// Load environment variables

const firebaseConfig = {

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,

};


// Initialize Firebase

console.log("Initializing Firebase..."); // Debugging
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app); // Debugging


// Initialize Firebase Authentication and export it

export const auth = getAuth(app); // Export the auth object


// Initialize Firestore and export it

export const db = getFirestore(app);
console.log("Firestore instance:", db); // Debugging


// Initialize analytics only in production

if (process.env.NODE_ENV === "production") {

  const analytics = getAnalytics(app);

}