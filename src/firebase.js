import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, collection, getDocs, getDoc, query, where, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB70QF98gP83rnRNdDP_mN1H-NnoAhYi8Y",
    authDomain: "collaborative-app-3a134.firebaseapp.com",
    projectId: "collaborative-app-3a134",
    storageBucket: "collaborative-app-3a134.firebasestorage.app",
    messagingSenderId: "498705675091",
    appId: "1:498705675091:web:405b186d21db2f8d2967a6",
    measurementId: "G-LXEF90JS1C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
    db,
    doc,
    setDoc,
    onSnapshot,
    updateDoc,
    collection,
    getDocs,
    getDoc,
    query,
    where,
    auth,
    addDoc,
    onAuthStateChanged
};