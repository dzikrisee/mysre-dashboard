// src/lib/supabase.ts - UPDATE EXISTING FILE
// Tambahkan/update bagian ini di file yang sudah ada

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// UPDATE: Extended Database types untuk field baru
export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          name: string;
          password: string | null;
          role: 'USER' | 'ADMIN';
          createdAt: string;
          updateAt: string;
          group: string | null;
          nim: string | null;
          avatar_url: string | null;
          // NEW FIELDS
          phone: string | null;
          bio: string | null;
          address: string | null;
          birthDate: string | null;
          university: string | null;
          faculty: string | null;
          major: string | null;
          semester: number | null;
          linkedin: string | null;
          github: string | null;
          website: string | null;
          isEmailVerified: boolean;
          isPhoneVerified: boolean;
          lastActive: string;
          settings: {
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
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password?: string | null;
          role?: 'USER' | 'ADMIN';
          createdAt?: string;
          updateAt?: string;
          group?: string | null;
          nim?: string | null;
          avatar_url?: string | null;
          // NEW FIELDS
          phone?: string | null;
          bio?: string | null;
          address?: string | null;
          birthDate?: string | null;
          university?: string | null;
          faculty?: string | null;
          major?: string | null;
          semester?: number | null;
          linkedin?: string | null;
          github?: string | null;
          website?: string | null;
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string;
          settings?: any; // jsonb
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password?: string | null;
          role?: 'USER' | 'ADMIN';
          createdAt?: string;
          updateAt?: string;
          group?: string | null;
          nim?: string | null;
          avatar_url?: string | null;
          // NEW FIELDS
          phone?: string | null;
          bio?: string | null;
          address?: string | null;
          birthDate?: string | null;
          university?: string | null;
          faculty?: string | null;
          major?: string | null;
          semester?: number | null;
          linkedin?: string | null;
          github?: string | null;
          website?: string | null;
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string;
          settings?: any; // jsonb
        };
      };
      Article: {
        Row: {
          id: string;
          title: string;
          filePath: string;
          createdAt: string;
          updateAt: string;
          userId: string | null;
          sessionId: string | null;
        };
        Insert: {
          id: string;
          title: string;
          filePath: string;
          createdAt?: string;
          updateAt?: string;
          userId?: string | null;
          sessionId?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          filePath?: string;
          createdAt?: string;
          updateAt?: string;
          userId?: string | null;
          sessionId?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Helper types
export type UserRole = Database['public']['Tables']['User']['Row']['role'];
export type UserInsert = Database['public']['Tables']['User']['Insert'];
export type UserUpdate = Database['public']['Tables']['User']['Update'];
export type UserGroup = Database['public']['Tables']['User']['Row']['group'];

export type ArticleInsert = Database['public']['Tables']['Article']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['Article']['Update'];

// NEW: Extended User helper functions for profile management
export const getUserProfile = async (userId: string) => {
  return await supabase.from('User').select('*').eq('id', userId).single();
};

export const updateUserProfile = async (userId: string, profileData: UserUpdate) => {
  return await supabase
    .from('User')
    .update({
      ...profileData,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();
};

export const updateUserSettings = async (userId: string, settings: any) => {
  return await supabase
    .from('User')
    .update({
      settings,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();
};

export const updateLastActive = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      lastActive: new Date().toISOString(),
    })
    .eq('id', userId);
};

export const verifyUserEmail = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      isEmailVerified: true,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId);
};

export const verifyUserPhone = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      isPhoneVerified: true,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId);
};

export const uploadUserAvatar = async (userId: string, file: File) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File harus berupa gambar (JPG, PNG, WEBP)');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Ukuran file tidak boleh lebih dari 5MB');
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    console.log('🚀 Starting avatar upload:', { userId, fileName, fileSize: file.size });

    // Upload file to storage (tanpa auto-create bucket)
    const { error: uploadError, data } = await supabase.storage.from('user-uploads').upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);

      // Better error messages
      if (uploadError.message?.includes('not found')) {
        throw new Error('Bucket storage belum dibuat. Silakan buat bucket "user-uploads" di Supabase Dashboard.');
      } else if (uploadError.message?.includes('denied')) {
        throw new Error('Akses ditolak. Pastikan bucket bersifat public dan policies sudah dikonfigurasi.');
      } else {
        throw new Error(`Upload gagal: ${uploadError.message}`);
      }
    }

    console.log('✅ Upload success:', data);

    // Get public URL
    const { data: urlData } = supabase.storage.from('user-uploads').getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Gagal mendapatkan URL gambar');
    }

    console.log('🔗 Public URL:', urlData.publicUrl);

    // Update user avatar_url in database
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update({
        avatar_url: urlData.publicUrl,
        updateAt: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw new Error(`Gagal update database: ${updateError.message}`);
    }

    console.log('✅ Database updated successfully');
    return { data: updatedUser, error: null };
  } catch (error: any) {
    console.error('💥 Avatar upload error:', error);
    return { data: null, error: error };
  }
};

// EXISTING FUNCTIONS (keep as is)
export const getUserByEmail = async (email: string) => {
  return await supabase.from('User').select('*').eq('email', email).single();
};

export const getUserByNim = async (nim: string) => {
  return await supabase.from('User').select('*').eq('nim', nim).single();
};

export const getUsersByGroup = async (group: string) => {
  return await supabase.from('User').select('*').eq('group', group).order('name');
};

export const getAllUsers = async () => {
  return await supabase.from('User').select('*').order('createdAt', { ascending: false });
};

// Article functions (keep as existing)
export const getAllArticles = async () => {
  return await supabase
    .from('Article')
    .select(
      `
      *,
      author:User!Article_userId_fkey(id, name, email, role, group, nim)
    `,
    )
    .order('createdAt', { ascending: false });
};

export const getArticlesByUser = async (userId: string) => {
  return await supabase
    .from('Article')
    .select(
      `
      *,
      author:User!Article_userId_fkey(id, name, email, role, group, nim)
    `,
    )
    .eq('userId', userId)
    .order('createdAt', { ascending: false });
};

export const createArticle = async (articleData: ArticleInsert) => {
  return await supabase
    .from('Article')
    .insert(articleData)
    .select(
      `
      *,
      author:User!Article_userId_fkey(id, name, email, role, group, nim)
    `,
    )
    .single();
};

export const updateArticle = async (id: string, articleData: ArticleUpdate) => {
  return await supabase
    .from('Article')
    .update(articleData)
    .eq('id', id)
    .select(
      `
      *,
      author:User!Article_userId_fkey(id, name, email, role, group, nim)
    `,
    )
    .single();
};

export const deleteArticle = async (id: string) => {
  return await supabase.from('Article').delete().eq('id', id);
};
