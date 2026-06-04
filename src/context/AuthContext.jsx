import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('YOUR_API_KEY');

  useEffect(() => {
    if (isDemoMode) {
      const savedUser = localStorage.getItem('demo_user');
      const savedData = localStorage.getItem('demo_user_data');
      if (savedUser && savedData) {
        setCurrentUser(JSON.parse(savedUser));
        setUserData(JSON.parse(savedData));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const res = await fetch(`/api/users/${user.uid}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          } else {
            setUserData({ role: "user" });
          }
        } catch (error) {
          console.error("Error fetching user data from Postgres:", error);
          setUserData({ role: "user" });
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    if (isDemoMode || email.includes('demo.com')) {
      const role = email.toLowerCase() === 'admin@demo.com' ? 'admin' : 'user';
      const name = role === 'admin' ? 'Demo Admin' : 'Demo User';
      const user = { uid: `demo-${role}-uid`, email, displayName: name };
      const data = { role, name, email, phone: "+233 24 000 0000", address: "Demo Street, Accra" };

      setCurrentUser(user);
      setUserData(data);
      localStorage.setItem('demo_user', JSON.stringify(user));
      localStorage.setItem('demo_user_data', JSON.stringify(data));
      return Promise.resolve(user);
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, additionalData) => {
    if (isDemoMode) {
      const user = { uid: `demo-user-${Date.now()}`, email, displayName: additionalData.name || "Demo User" };
      const data = { role: "user", email, createdAt: new Date().toISOString(), ...additionalData };

      setCurrentUser(user);
      setUserData(data);
      localStorage.setItem('demo_user', JSON.stringify(user));
      localStorage.setItem('demo_user_data', JSON.stringify(data));
      return Promise.resolve(user);
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
        ...additionalData
      })
    });
    
    return user;
  };

  const logout = () => {
    if (isDemoMode || (currentUser && currentUser.uid.startsWith('demo-'))) {
      setCurrentUser(null);
      setUserData(null);
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_user_data');
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
