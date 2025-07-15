// src/providers/auth-provider.tsx - UPDATE EXISTING FILE
// Tambahkan/update bagian ini di auth provider yang sudah ada

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile, updateLastActive } from '@/lib/supabase';
import { notifications } from '@mantine/notifications';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  group?: string;
  nim?: string;
  avatar_url?: string;
  // NEW: Additional profile fields
  phone?: string;
  bio?: string;
  university?: string;
  faculty?: string;
  major?: string;
  semester?: number;
  address?: string;
  birthDate?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastActive?: string;
  settings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showProfile: boolean;
    };
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await getUserProfile(userId);

      if (error) {
        throw error;
      }

      if (profile) {
        // Update last active
        await updateLastActive(userId);

        // Map database user to AuthUser
        const authUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          group: profile.group || undefined,
          nim: profile.nim || undefined,
          avatar_url: profile.avatar_url || undefined,
          phone: profile.phone || undefined,
          bio: profile.bio || undefined,
          university: profile.university || undefined,
          faculty: profile.faculty || undefined,
          major: profile.major || undefined,
          semester: profile.semester || undefined,
          address: profile.address || undefined,
          birthDate: profile.birthDate || undefined,
          linkedin: profile.linkedin || undefined,
          github: profile.github || undefined,
          website: profile.website || undefined,
          isEmailVerified: profile.isEmailVerified,
          isPhoneVerified: profile.isPhoneVerified,
          lastActive: profile.lastActive,
          settings: profile.settings || {
            emailNotifications: true,
            pushNotifications: true,
            darkMode: false,
            language: 'id',
            timezone: 'Asia/Jakarta',
            privacy: {
              showEmail: false,
              showPhone: false,
              showProfile: true,
            },
          },
        };

        setUser(authUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat profil pengguna',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Gagal login');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile in database
        const { error: insertError } = await supabase.from('User').insert({
          id: data.user.id,
          email,
          name,
          role: 'USER',
          isEmailVerified: false,
          isPhoneVerified: false,
          lastActive: new Date().toISOString(),
          settings: {
            emailNotifications: true,
            pushNotifications: true,
            darkMode: false,
            language: 'id',
            timezone: 'Asia/Jakarta',
            privacy: {
              showEmail: false,
              showPhone: false,
              showProfile: true,
            },
          },
        });

        if (insertError) {
          throw insertError;
        }

        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Gagal mendaftar');
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (!user) return;

    try {
      const { data: updatedProfile, error } = await supabase
        .from('User')
        .update({
          ...data,
          updateAt: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (updatedProfile) {
        await loadUserProfile(user.id);
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Gagal memperbarui profil');
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;

    try {
      await loadUserProfile(user.id);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Gagal logout');
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAdmin,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
