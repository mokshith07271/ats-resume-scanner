'use client';

import React, { createContext, useContext, useState } from 'react';

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

// Free default user - no login required
const FREE_USER: UserProfile = {
  email: 'guest@ats-scanner.com',
  displayName: 'User',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always logged in as free user
  const [user] = useState<UserProfile | null>(FREE_USER);
  const [loading] = useState(false);

  const loginWithGoogle = async () => {};
  const loginWithEmail = async () => {};
  const signUpWithEmail = async () => {};
  const logout = async () => {};

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
    return {
      user: FREE_USER,
      loading: false,
      loginWithGoogle: async () => {},
      loginWithEmail: async () => {},
      signUpWithEmail: async () => {},
      logout: async () => {},
    };
  }
  return context;
}
