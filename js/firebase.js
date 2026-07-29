import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  getDoc,
  doc,
  updateDoc,
  addDoc,
 deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAt7R0Cg-IpBPawPMx5ZxA3uHRAc7abx0",
  authDomain: "bike-rent-cc4d7.firebaseapp.com",
  projectId: "bike-rent-cc4d7",
  storageBucket: "bike-rent-cc4d7.firebasestorage.app",
  messagingSenderId: "223558810676",
  appId: "1:223558810676:web:b17f62a9ca76d4d9f91e61"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export {
    db,
    auth,
    collection,
    getDocs,
    setDoc,
    getDoc,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    onSnapshot
};