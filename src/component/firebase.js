// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOWdLTR7XVkMHWgTm3z2Jd8Ix6thjimX8",
  authDomain: "abstinence-app-2adea.firebaseapp.com",
  projectId: "abstinence-app-2adea",
  storageBucket: "abstinence-app-2adea.firebasestorage.app",
  messagingSenderId: "256989681971",
  appId: "1:256989681971:web:d1ceff23d49b24a2ae0646",
  measurementId: "G-YDWDZPZT9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);