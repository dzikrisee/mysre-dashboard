// src/lib/supabase.ts - Updated dengan Article interface
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types untuk tabel User
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
  group?: 'A' | 'B';
  nim?: string;
  avatar_url?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  group?: 'A' | 'B';
  nim?: string;
}

// Types untuk tabel Article
export interface Article {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  userId?: string; // UUID sebagai string di TypeScript
  sessionId?: string;

  // Relasi (akan di-populate via JOIN)
  author?: User;
}

// Database types untuk Supabase
export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          name: string;
          password: string | null;
          role: 'admin' | 'user';
          createdAt: string;
          updatedAt: string;
          group: 'A' | 'B' | null;
          nim: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password?: string | null;
          role?: 'admin' | 'user';
          createdAt?: string;
          updatedAt?: string;
          group?: 'A' | 'B' | null;
          nim?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password?: string | null;
          role?: 'admin' | 'user';
          createdAt?: string;
          updatedAt?: string;
          group?: 'A' | 'B' | null;
          nim?: string | null;
          avatar_url?: string | null;
        };
      };
      Article: {
        Row: {
          id: string;
          title: string;
          filePath: string;
          createdAt: string;
          updatedAt: string;
          userId: string | null;
          sessionId: string | null;
        };
        Insert: {
          id: string;
          title: string;
          filePath: string;
          createdAt?: string;
          updatedAt?: string;
          userId?: string | null;
          sessionId?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          filePath?: string;
          createdAt?: string;
          updatedAt?: string;
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

// Helper functions untuk User (existing)
export const getUserByEmail = async (email: string) => {
  return await supabase.from('User').select('*').eq('email', email).single();
};

export const getUserByNim = async (nim: string) => {
  return await supabase.from('User').select('*').eq('nim', nim).single();
};

export const getUsersByGroup = async (group: 'A' | 'B') => {
  return await supabase.from('User').select('*').eq('group', group).order('name');
};

export const getAllUsers = async () => {
  return await supabase.from('User').select('*').order('createdAt', { ascending: false });
};

// Helper functions untuk Article (new)
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

export const getArticlesByRole = async (role: 'admin' | 'user') => {
  return await supabase
    .from('Article')
    .select(
      `
      *,
      author:User!Article_userId_fkey(id, name, email, role, group, nim)
    `,
    )
    .eq('User.role', role)
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
