'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthStatus } from '../types';
import { userAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.LOADING);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        // Try to fetch fresh user data from API
        const freshUser = await userAPI.getProfile();
        setUser(freshUser);
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(freshUser));
        setStatus(AuthStatus.AUTHENTICATED);
      } catch (error) {
        // If API call fails, use cached user data
        setUser(JSON.parse(savedUser));
        setStatus(AuthStatus.AUTHENTICATED);
      }
    } else {
      setStatus(AuthStatus.UNAUTHENTICATED);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await userAPI.getProfile();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (error) {
      // Silently fail - user data will remain as is
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setStatus(AuthStatus.AUTHENTICATED);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStatus(AuthStatus.UNAUTHENTICATED);
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
