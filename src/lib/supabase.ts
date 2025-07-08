// src/lib/supabase.ts - Updated untuk tabel User baru
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types untuk tabel User baru
export interface User {
  id: string; // UUID sebagai string
  email: string;
  name: string; // Ganti dari full_name
  password?: string;
  role: 'admin' | 'user';
  createdAt: string; // camelCase sesuai database
  updatedAt: string; // camelCase sesuai database
  group?: 'A' | 'B'; // Group hanya A atau B
  nim?: string; // Nomor Induk Mahasiswa
  avatar_url?: string; // URL foto profil
}

export interface AuthUser {
  id: string;
  email: string;
  name: string; // Ganti dari full_name
  role: 'admin' | 'user';
  avatar_url?: string;
  group?: 'A' | 'B';
  nim?: string;
}

// Database types untuk Supabase dengan tabel User
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

// Helper functions untuk query
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

export const getUsersByRole = async (role: 'admin' | 'user') => {
  return await supabase.from('User').select('*').eq('role', role).order('name');
};

export const createUser = async (userData: UserInsert) => {
  return await supabase.from('User').insert(userData).select().single();
};

export const updateUser = async (id: string, userData: UserUpdate) => {
  return await supabase.from('User').update(userData).eq('id', id).select().single();
};

export const deleteUser = async (id: string) => {
  return await supabase.from('User').delete().eq('id', id);
};
