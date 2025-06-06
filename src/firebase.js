// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth"; // Import Firebase Authentication

import { getAnalytics } from "firebase/analytics";


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyA3IqF7MWJ5VPbbXQ1O2nrAYIAVFUrTlrQ",

  authDomain: "spaced-repetition-app-c53a4.firebaseapp.com",

  projectId: "spaced-repetition-app-c53a4",

  storageBucket: "spaced-repetition-app-c53a4.firebasestorage.app",

  messagingSenderId: "72094141505",

  appId: "1:72094141505:web:a030f07f0acda74eaccac0",

  measurementId: "G-HV9Z6EKXQM",

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and export it

export const auth = getAuth(app); // Export the auth object


// Initialize analytics only in production

if (process.env.NODE_ENV === "production") {

  const analytics = getAnalytics(app);

}