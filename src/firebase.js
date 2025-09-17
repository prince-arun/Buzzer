// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add your own Firebase configuration from your Firebase project console
// For more information, visit: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyA0cyXarhi30fVWS5bWwjGqJDC3EKYjuyg",
  authDomain: "buzzer-ad433.firebaseapp.com",
  projectId: "buzzer-ad433",
  storageBucket: "buzzer-ad433.firebasestorage.app",
  messagingSenderId: "60027301432",
  appId: "1:60027301432:web:5cfa509f610442232000cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
