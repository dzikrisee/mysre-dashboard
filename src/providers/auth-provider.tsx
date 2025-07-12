// =====================================
// 1. Updated Auth Provider (src/providers/auth-provider.tsx)
// =====================================

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);

        // Record login analytics
        await recordLoginAnalytics(session.user.id);

        const { data: userData } = await supabase.from('User').select('role').eq('id', session.user.id).single();

        if (userData?.role === 'ADMIN') {
          // Updated ke ADMIN
          router.push('/dashboard');
        } else {
          await supabase.auth.signOut();
          notifications.show({
            title: 'Akses Ditolak',
            message: 'Hanya administrator yang dapat mengakses dashboard',
            color: 'red',
            icon: <IconX size={16} />,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const recordLoginAnalytics = async (userId: string) => {
    try {
      await supabase.from('analytics').insert({
        action: 'login',
        userId,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });
    } catch (error) {
      console.error('Failed to record login analytics:', error);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from('User').select('*').eq('id', userId).single();

    if (data && !error) {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar_url: data.avatar_url,
        group: data.group,
        nim: data.nim,
      });
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      let email = identifier;

      // Jika identifier bukan email, cari email berdasarkan NIM
      if (!identifier.includes('@')) {
        const { data: userData, error: userError } = await supabase.from('User').select('email').eq('nim', identifier).single();

        if (userError || !userData) {
          notifications.show({
            title: 'Error',
            message: 'NIM tidak ditemukan',
            color: 'red',
            icon: <IconX size={16} />,
          });
          return { success: false, error: 'NIM tidak ditemukan' };
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
          message: 'Email/NIM atau password salah',
          color: 'red',
          icon: <IconX size={16} />,
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: userData, error: userError } = await supabase.from('User').select('*').eq('id', data.user.id).single();

        if (userError || !userData || userData.role !== 'ADMIN') {
          // Updated ke ADMIN
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
          message: `Selamat datang, ${userData.name}!`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

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

  const signOut = async () => {
    // Record logout analytics
    if (user) {
      try {
        await supabase.from('analytics').insert({
          action: 'logout',
          userId: user.id,
          metadata: { timestamp: new Date().toISOString() },
        });
      } catch (error) {
        console.error('Failed to record logout analytics:', error);
      }
    }

    await supabase.auth.signOut();
    setUser(null);
    router.push('/auth');
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN'; // Updated ke ADMIN
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



// =====================================
// 3. Detailed User Analytics Component
// =====================================



// =====================================
// 4. Updated Dashboard Layout Navigation (src/components/layout/dashboard-layout.tsx)
// =====================================





// =====================================
// 7. Example Usage dalam komponen Brain Module
// =====================================

// Di dalam komponen Node onClick handler:
/*
const handleNodeClick = (node: Node) => {
  // Existing logic...
  
  // Track analytics
  if (user?.id) {
    AnalyticsTracker.trackNodeClick(user.id, node.id, node.type, node.articleId);
  }
};

const handleEdgeClick = (edge: Edge) => {
  // Existing logic...
  
  // Track analytics
  if (user?.id) {
    AnalyticsTracker.trackEdgeClick(user.id, edge.id, edge.relation || 'unknown', edge.articleId);
  }
};

const handleChatSubmit = async (query: string) => {
  // Send chat and get response
  const response = await sendChatMessage(query);
  
  // Track analytics
  if (user?.id && session?.id) {
    AnalyticsTracker.trackChatQuery(user.id, session.id, query, response.length);
  }
};
*/

// =====================================
// 8. Example Usage dalam komponen Writer Module
// =====================================

/*
const handleDraftSave = async (draftData: any) => {
  // Save draft logic...
  const wordCount = calculateWordCount(draftData.content);
  
  // Track analytics
  if (user?.id && draftId) {
    AnalyticsTracker.trackDraftSave(user.id, draftId, wordCount);
  }
};

const handleAnnotationAdd = async (annotation: any) => {
  // Add annotation logic...
  
  // Track analytics
  if (user?.id && articleId) {
    AnalyticsTracker.trackAnnotationCreate(user.id, articleId, annotation.semanticTag || 'general');
  }
};

const handleAIAssistance = async (prompt: string, type: string) => {
  // AI assistance logic...
  
  // Track analytics
  if (user?.id && currentDocument) {
    AnalyticsTracker.trackAIAssistance(user.id, currentDocument.id, type, prompt.length);
  }
};
*/
