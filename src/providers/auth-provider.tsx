// src/providers/auth-provider.tsx - DEBUG VERSION
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, User } from '@/lib/supabase';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);

      const savedUser = localStorage.getItem('mysre_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);

        const { data, error } = await supabase.from('User').select('*').eq('id', userData.id).single();

        if (data && !error) {
          await supabase
            .from('User')
            .update({
              lastActive: new Date().toISOString(),
              updateAt: new Date().toISOString(),
            })
            .eq('id', data.id);

          setUser(data);
        } else {
          localStorage.removeItem('mysre_user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      localStorage.removeItem('mysre_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      let userData = null;

      if (identifier.includes('@')) {
        const result = await supabase.from('User').select('*').eq('email', identifier).single();

        if (result.data && result.data.password === password) {
          userData = result.data;
        }
      } else {
        const result = await supabase.from('User').select('*').eq('nim', identifier).single();

        if (result.data && result.data.password === password) {
          userData = result.data;
        }
      }

      if (!userData) {
        return {
          success: false,
          error: 'Email/NIM atau password salah',
        };
      }

      if (userData.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Hanya administrator yang dapat mengakses dashboard',
        };
      }

      await supabase
        .from('User')
        .update({
          lastActive: new Date().toISOString(),
          updateAt: new Date().toISOString(),
        })
        .eq('id', userData.id);

      setUser(userData);
      localStorage.setItem('mysre_user', JSON.stringify(userData));

      notifications.show({
        title: 'Login Berhasil',
        message: `Selamat datang, ${userData.name || userData.email}!`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: `Terjadi kesalahan saat login: ${error.message}`,
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      setUser(null);
      localStorage.removeItem('mysre_user');

      notifications.show({
        title: 'Logout Berhasil',
        message: 'Anda telah keluar dari sistem',
        color: 'blue',
        icon: <IconCheck size={16} />,
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.from('User').select('*').eq('id', user.id).single();

      if (data && !error) {
        setUser(data);
        localStorage.setItem('mysre_user', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const isAdmin = (): boolean => {
    console.log('isAdmin called, user:', user);
    return user?.role === 'ADMIN';
  };

  // DEBUG: Log the context value
  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
    isAdmin,
  };

  console.log('AuthProvider value:', value);
  console.log('isAdmin function:', value.isAdmin);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // DEBUG: Log what we're returning
  console.log('useAuth returning:', context);
  console.log('isAdmin in useAuth:', context.isAdmin);

  return context;
}

export function useRequireAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}
