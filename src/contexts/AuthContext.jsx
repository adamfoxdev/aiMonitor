import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, supabase } from '../services/api.js';
import apiClient from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
          // Store token from Supabase
          localStorage.setItem('authToken', session.access_token);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (emailOrUsername, password, isEmail = true) => {
    try {
      setError(null);
      console.log('Attempting login with:', isEmail ? 'email' : 'username', emailOrUsername);
      // API expects either email or username parameter
      const loginData = isEmail 
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };
      const { data } = await apiClient.post('/auth/login', loginData);
      console.log('Login successful:', data);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (err) {
      let message = 'Login failed';
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.status === 0 || err.message?.includes('Network') || err.code === 'ERR_NETWORK') {
        message = 'Network error - unable to reach the server. Please check your connection and try again.';
      } else if (err.code === 'ECONNABORTED') {
        message = 'Request timeout - the server took too long to respond. Please try again.';
      } else if (err.message) {
        message = err.message;
      }
      
      console.error('Login failed:', message, err);
      setError(message);
      throw new Error(message);
    }
  };

  const signup = async (email, username, password, name, company) => {
    try {
      setError(null);
      console.log('Attempting signup with email:', email, 'username:', username);
      const { data } = await authAPI.signup(email, username, password, name, company);
      console.log('Signup successful:', data);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      return data;
    } catch (err) {
      let message = 'Signup failed';
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.status === 0 || err.message?.includes('Network') || err.code === 'ERR_NETWORK') {
        message = 'Network error - unable to reach the server. Please check your connection and try again.';
      } else if (err.code === 'ECONNABORTED') {
        message = 'Request timeout - the server took too long to respond. Please try again.';
      } else if (err.message) {
        message = err.message;
      }
      
      console.error('Signup failed:', message, err);
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await authAPI.forgotPassword(email);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      setError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      await authAPI.resetPassword(token, password);
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      setError(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
