
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, collection, getDocs, getDoc, query, where,addDoc } from "firebase/firestore";
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

// Example of creating an Auth Context for your React app
// This would go in a separate file like authContext.js
/*
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from './firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
*/

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