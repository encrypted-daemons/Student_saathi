import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
          setUser(JSON.parse(savedUser)); // Load from local storage immediately
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data)); // Sync fresh data
          }
        } catch (error) {
          console.error("Session check failed", error);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  // 👇 NEW FUNCTION: Force Update UI without Login
  const updateUserProfile = (updatedData) => {
      console.log("🔄 Updating Context User:", updatedData);
      setUser(updatedData);
      localStorage.setItem('user', JSON.stringify(updatedData));
  };

  const value = {
    user,
    login,
    logout,
    updateUserProfile, // ✅ Exported here
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};