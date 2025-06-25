// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCa9S2LePBuzTi3PwVfCC-ZLb2q7c-LufI",
  authDomain: "leticiabot-3e1f3.firebaseapp.com",
  projectId: "leticiabot-3e1f3",
  storageBucket: "leticiabot-3e1f3.firebasestorage.app",
  messagingSenderId: "932245054102",
  appId: "1:932245054102:web:bc3d1b6854387be54258b7",
  measurementId: "G-VRLQVMRQ51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };