'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User, LoginCredentials, RegisterData } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          apiClient.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const tokens = await apiClient.login(credentials);
    const currentUser = await apiClient.getCurrentUser();
    setUser(currentUser);
  };

  const register = async (data: RegisterData) => {
    await apiClient.register(data);
    // Auto-login after registration
    await login({ username: data.username, password: data.password });
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
