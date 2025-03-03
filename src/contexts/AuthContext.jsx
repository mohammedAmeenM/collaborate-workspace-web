import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, doc, setDoc } from '../firebase'; // Adjust path as needed
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to sign up a new user
  async function signup(email, password, fullName) {
    try {
      setError('');
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Create a user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Function to log in a user
  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time in Firestore
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), 
        { lastLogin: new Date().toISOString() }, 
        { merge: true }
      );
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Function to log out
  function logout() {
    return signOut(auth);
  }

  // Set up an observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    error,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}