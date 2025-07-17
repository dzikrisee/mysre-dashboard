// src/hooks/useAuth.ts
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'user' | 'USER';
  group?: string;
  nim?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    // If no context, return a mock context for development
    return {
      user: {
        id: 'mock-user-id',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'ADMIN' as const,
        group: 'A',
        nim: '12345',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      loading: false,
      signIn: async () => ({ error: null }),
      signOut: async () => {},
      refreshUser: async () => {},
      isAdmin: () => true,
      isStudent: () => false,
    };
  }

  const isAdmin = () => {
    return context.user?.role === 'ADMIN';
  };

  const isStudent = () => {
    return context.user?.role === 'user' || context.user?.role === 'USER';
  };

  return {
    ...context,
    isAdmin,
    isStudent,
  };
};
