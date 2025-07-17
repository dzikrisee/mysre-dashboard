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
  token_balance?: number;
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
  createdAt?: string;
  updated_at?: string; // FIXED: Konsisten dengan database
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
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
        // Update last active dengan kolom yang benar
        await supabase
          .from('User')
          .update({
            lastActive: new Date().toISOString(),
            updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
          })
          .eq('id', userId);

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
          token_balance: profile.token_balance || 0,
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
          createdAt: profile.createdAt,
          updated_at: profile.updated_at, // FIXED: Konsisten dengan database
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

  const signIn = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      // Try to authenticate with email or NIM
      let authResult;

      // First try with email
      if (identifier.includes('@')) {
        authResult = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
      } else {
        // Try to find user by NIM first
        const { data: userWithNim } = await supabase.from('User').select('email').eq('nim', identifier).single();

        if (userWithNim) {
          authResult = await supabase.auth.signInWithPassword({
            email: userWithNim.email,
            password,
          });
        } else {
          return { success: false, error: 'NIM tidak ditemukan' };
        }
      }

      if (authResult.error) {
        throw authResult.error;
      }

      if (authResult.data.user) {
        await loadUserProfile(authResult.data.user.id);

        notifications.show({
          title: 'Berhasil',
          message: 'Login berhasil!',
          color: 'green',
        });

        return { success: true };
      }

      return { success: false, error: 'Login gagal' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Terjadi kesalahan saat login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Gagal mendaftar');
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase.from('User').insert({
          id: data.user.id,
          email,
          name,
          role: 'USER',
          isEmailVerified: false,
          isPhoneVerified: false,
          token_balance: 0,
          createdAt: new Date().toISOString(),
          updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
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

        if (profileError) {
          throw new Error(profileError.message || 'Gagal membuat profil');
        }
      }
    } catch (error: any) {
      console.error('Register error:', error);
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
          updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
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

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);

      notifications.show({
        title: 'Berhasil',
        message: 'Logout berhasil!',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal logout',
        color: 'red',
      });
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
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
