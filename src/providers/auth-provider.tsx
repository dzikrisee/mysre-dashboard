'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, AuthUser } from '@/lib/supabase';
import { LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
        // Auto redirect ke dashboard setelah login (hanya admin)
        const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single();

        if (userData?.role === 'admin') {
          router.push('/dashboard');
        } else {
          await supabase.auth.signOut();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (data && !error) {
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        avatar_url: data.avatar_url,
      });
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      let email = identifier;

      // Jika identifier bukan email, cari email berdasarkan username
      if (!identifier.includes('@')) {
        const { data: userData, error: userError } = await supabase.from('users').select('email').eq('username', identifier).single();

        if (userError || !userData) {
          notifications.show({
            title: 'Error',
            message: 'Username tidak ditemukan',
            color: 'red',
            icon: <IconX size={16} />,
          });
          return { success: false, error: 'Username tidak ditemukan' };
        }

        email = userData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        notifications.show({
          title: 'Error',
          message: 'Email/Username atau password salah',
          color: 'red',
          icon: <IconX size={16} />,
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Cek apakah user adalah admin
        const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', data.user.id).single();

        if (userError || !userData || userData.role !== 'admin') {
          // Logout user yang bukan admin
          await supabase.auth.signOut();
          notifications.show({
            title: 'Akses Ditolak',
            message: 'Hanya administrator yang dapat mengakses dashboard',
            color: 'red',
            icon: <IconX size={16} />,
          });
          return { success: false, error: 'Akses ditolak' };
        }

        notifications.show({
          title: 'Berhasil',
          message: `Selamat datang, ${userData.full_name}!`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Redirect ke dashboard setelah login berhasil
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
        icon: <IconX size={16} />,
      });
      return { success: false, error: message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // 1. Daftar user di Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        notifications.show({
          title: 'Error',
          message: error.message,
          color: 'red',
          icon: <IconX size={16} />,
        });
        return { success: false, error: error.message };
      }

      // 2. Jika berhasil dan ada user, insert ke tabel users
      if (data.user && !data.user.email_confirmed_at) {
        // User perlu konfirmasi email dulu
        notifications.show({
          title: 'Berhasil',
          message: 'Silakan cek email untuk verifikasi akun.',
          color: 'blue',
          icon: <IconCheck size={16} />,
        });
        return { success: true };
      }

      // 3. Jika user langsung aktif, insert profil
      if (data.user && data.user.email_confirmed_at) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'user',
        });

        if (profileError) {
          console.error('Profile insert error:', profileError);
          // Jangan throw error, karena user auth sudah berhasil
        }
      }

      notifications.show({
        title: 'Berhasil',
        message: 'Akun berhasil dibuat. Silakan cek email untuk verifikasi.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
        icon: <IconX size={16} />,
      });
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      notifications.show({
        title: 'Berhasil',
        message: 'Anda berhasil keluar',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Redirect ke halaman auth setelah logout
      router.push('/auth');
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin,
      }}
    >
      {loading && <LoadingOverlay visible />}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
