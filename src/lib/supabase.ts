// src/lib/supabase.ts - SESUAI SCHEMA PRISMA DATABASE UTAMA
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Database schema sesuai Prisma schema yang diberikan
export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          password: string;
          role: 'USER' | 'ADMIN';
          createdAt: string;
          updateAt: string; // ✅ FIXED: updateAt bukan updated_at
          group: string | null;
          nim: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          university: string | null;
          faculty: string | null;
          major: string | null;
          semester: number | null;
          address: string | null;
          birthDate: string | null;
          linkedin: string | null;
          github: string | null;
          website: string | null;
          isEmailVerified: boolean | null;
          isPhoneVerified: boolean | null;
          lastActive: string | null;
          token_balance: number | null;
          settings: any | null;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          password: string;
          role?: 'USER' | 'ADMIN';
          createdAt?: string;
          updateAt?: string; // ✅ FIXED: updateAt bukan updated_at
          group?: string | null;
          nim?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          university?: string | null;
          faculty?: string | null;
          major?: string | null;
          semester?: number | null;
          address?: string | null;
          birthDate?: string | null;
          linkedin?: string | null;
          github?: string | null;
          website?: string | null;
          isEmailVerified?: boolean | null;
          isPhoneVerified?: boolean | null;
          lastActive?: string | null;
          token_balance?: number | null;
          settings?: any | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          password?: string;
          role?: 'USER' | 'ADMIN';
          createdAt?: string;
          updateAt?: string; // ✅ FIXED: updateAt bukan updated_at
          group?: string | null;
          nim?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          university?: string | null;
          faculty?: string | null;
          major?: string | null;
          semester?: number | null;
          address?: string | null;
          birthDate?: string | null;
          linkedin?: string | null;
          github?: string | null;
          website?: string | null;
          isEmailVerified?: boolean | null;
          isPhoneVerified?: boolean | null;
          lastActive?: string | null;
          token_balance?: number | null;
          settings?: any | null;
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
          abstract: string | null;
          author: string | null;
          doi: string | null;
          keywords: string | null;
          year: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          filePath: string;
          createdAt?: string;
          updateAt?: string;
          userId?: string | null;
          sessionId?: string | null;
          abstract?: string | null;
          author?: string | null;
          doi?: string | null;
          keywords?: string | null;
          year?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          filePath?: string;
          createdAt?: string;
          updateAt?: string;
          userId?: string | null;
          sessionId?: string | null;
          abstract?: string | null;
          author?: string | null;
          doi?: string | null;
          keywords?: string | null;
          year?: string | null;
        };
      };
      Assignment: {
        Row: {
          id: string;
          title: string;
          description: string;
          week_number: number;
          assignment_code: string;
          file_url: string | null;
          file_name: string | null;
          due_date: string | null;
          is_active: boolean;
          created_by: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          week_number: number;
          assignment_code: string;
          file_url?: string | null;
          file_name?: string | null;
          due_date?: string | null;
          is_active?: boolean;
          created_by: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          week_number?: number;
          assignment_code?: string;
          file_url?: string | null;
          file_name?: string | null;
          due_date?: string | null;
          is_active?: boolean;
          created_by?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      AssignmentSubmission: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          assignment_code_input: string;
          file_url: string | null;
          file_name: string | null;
          submission_text: string | null;
          status: 'pending' | 'submitted' | 'graded';
          grade: number | null;
          feedback: string | null;
          submitted_at: string;
          graded_at: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          assignment_code_input: string;
          file_url?: string | null;
          file_name?: string | null;
          submission_text?: string | null;
          status?: 'pending' | 'submitted' | 'graded';
          grade?: number | null;
          feedback?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          assignment_code_input?: string;
          file_url?: string | null;
          file_name?: string | null;
          submission_text?: string | null;
          status?: 'pending' | 'submitted' | 'graded';
          grade?: number | null;
          feedback?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
          createdAt?: string;
          updatedAt?: string;
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
}

// FIXED: Create client dengan proper headers untuk file upload
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      // REMOVED: 'Content-Type': 'application/json', - ini yang bikin conflict!
      Prefer: 'return=representation',
    },
  },
});

// Helper types
export type UserRole = Database['public']['Tables']['User']['Row']['role'];
export type UserInsert = Database['public']['Tables']['User']['Insert'];
export type UserUpdate = Database['public']['Tables']['User']['Update'];

// Interface User sesuai Prisma
export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updateAt: string;
  group: string | null;
  nim: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  university: string | null;
  faculty: string | null;
  major: string | null;
  semester: number | null;
  address: string | null;
  birthDate: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  isEmailVerified: boolean | null;
  isPhoneVerified: boolean | null;
  lastActive: string | null;
  token_balance: number | null;
  settings: any | null;
}

// Helper functions untuk User Management (TIDAK UBAH FUNGSI)
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from('User').select('*').eq('id', userId).single();

  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: UserUpdate) => {
  const { data, error } = await supabase
    .from('User')
    .update({
      ...updates,
      updateAt: new Date().toISOString(), // ✅ FIXED: updateAt bukan updated_at
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const getAllUsers = async () => {
  const { data, error } = await supabase.from('User').select('*').order('createdAt', { ascending: false });

  return { data, error };
};

export const getUsersByRole = async (role: 'ADMIN' | 'USER') => {
  const { data, error } = await supabase.from('User').select('*').eq('role', role);

  return { data, error };
};

// ✅ ADDED: Missing functions yang dibutuhkan profile page
export const updateUserSettings = async (userId: string, settings: any) => {
  const { data, error } = await supabase
    .from('User')
    .update({
      settings,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const verifyUserEmail = async (userId: string) => {
  const { data, error } = await supabase
    .from('User')
    .update({
      isEmailVerified: true,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const verifyUserPhone = async (userId: string) => {
  const { data, error } = await supabase
    .from('User')
    .update({
      isPhoneVerified: true,
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const uploadUserAvatar = async (userId: string, file: File) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File harus berupa gambar (JPG, PNG, WEBP)');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file tidak boleh lebih dari 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Update user profile
    const { data, error: updateError } = await supabase
      .from('User')
      .update({
        avatar_url: urlData.publicUrl,
        updateAt: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateLastActive = async (userId: string) => {
  const { data, error } = await supabase
    .from('User')
    .update({
      lastActive: new Date().toISOString(),
      updateAt: new Date().toISOString(),
    })
    .eq('id', userId);

  return { data, error };
};
