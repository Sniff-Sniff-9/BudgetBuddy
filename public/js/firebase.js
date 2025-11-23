
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  increment,
  collection,     
  getDocs,       
  query,         
  where          
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4yLjdgDOO7Ftpv9x__9Kripg7VL-vkKA",
  authDomain: "budgetbuddy-theateam5.firebaseapp.com",
  projectId: "budgetbuddy-theateam5",
  storageBucket: "budgetbuddy-theateam5.firebasestorage.app",
  messagingSenderId: "805110744039",
  appId: "1:805110744039:web:62b10275f66d65f6607342",
  measurementId: "G-SW5X1VW94P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  increment,
  collection,   
  getDocs,      
  query,       
  where,
  updatePassword,   
  storage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
};