'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user session from localStorage if present
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('ats_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('ats_user');
        }
      }
    }
    setLoading(false);
  }, []);

  const saveUserSession = (userObj: UserProfile) => {
    setUser(userObj);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ats_user', JSON.stringify(userObj));
      localStorage.setItem('token', 'free-user-session-token');
    }
  };

  const loginWithGoogle = async () => {
    const mockGoogleUser = {
      email: 'user@gmail.com',
      displayName: 'Google User',
    };
    saveUserSession(mockGoogleUser);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const username = email.split('@')[0] || 'User';
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
    saveUserSession({
      email,
      displayName: formattedName,
    });
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const username = email.split('@')[0] || 'User';
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
    saveUserSession({
      email,
      displayName: formattedName,
    });
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ats_user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        logout
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
