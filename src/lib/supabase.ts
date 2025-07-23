// src/lib/supabase.ts - FIXED DATABASE SCHEMA
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// FIXED: Updated Database schema sesuai dengan struktur aktual
export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string;
          role: 'ADMIN' | 'STUDENT';
          nim?: string | null;
          group?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
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
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string | null;
          token_balance?: number;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name: string;
          role?: 'ADMIN' | 'STUDENT';
          nim?: string | null;
          group?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
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
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string | null;
          token_balance?: number;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string;
          role?: 'ADMIN' | 'STUDENT';
          nim?: string | null;
          group?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
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
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string | null;
          token_balance?: number;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      Article: {
        Row: {
          id: string;
          title: string;
          filePath: string;
          created_at: string;
          updated_at: string;
          userId: string | null;
          sessionId: string | null;
        };
        Insert: {
          title: string;
          filePath: string;
          created_at?: string;
          updated_at?: string;
          userId?: string | null;
          sessionId?: string | null;
        };
        Update: {
          title?: string;
          filePath?: string;
          created_at?: string;
          updated_at?: string;
          userId?: string | null;
          sessionId?: string | null;
        };
      };
      // FIXED: Assignment table sesuai database schema aktual
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
          target_classes: string[]; // Array field
          created_by: string;
          createdAt: string; // Quoted camelCase
          updated_at: string; // Snake case
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
          target_classes: string[];
          created_by: string;
          createdAt?: string; // Quoted camelCase
          updated_at?: string; // Snake case
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
          target_classes?: string[];
          created_by?: string;
          createdAt?: string; // Quoted camelCase
          updated_at?: string; // Snake case
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
          created_at: string;
          updated_at: string; // FIXED: Use snake_case
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
          created_at?: string;
          updated_at?: string; // FIXED: Use snake_case
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
          created_at?: string;
          updated_at?: string; // FIXED: Use snake_case
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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper types
export type UserRole = Database['public']['Tables']['User']['Row']['role'];
export type UserInsert = Database['public']['Tables']['User']['Insert'];
export type UserUpdate = Database['public']['Tables']['User']['Update'];
export type UserGroup = Database['public']['Tables']['User']['Row']['group'];

export type ArticleInsert = Database['public']['Tables']['Article']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['Article']['Update'];

// FIXED: Assignment helper types dengan target_classes
export type AssignmentRow = Database['public']['Tables']['Assignment']['Row'];
export type AssignmentInsert = Database['public']['Tables']['Assignment']['Insert'];
export type AssignmentUpdate = Database['public']['Tables']['Assignment']['Update'];

export type AssignmentSubmissionRow = Database['public']['Tables']['AssignmentSubmission']['Row'];
export type AssignmentSubmissionInsert = Database['public']['Tables']['AssignmentSubmission']['Insert'];
export type AssignmentSubmissionUpdate = Database['public']['Tables']['AssignmentSubmission']['Update'];

// ✅ ADDED: Missing interfaces that other files need to import
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'STUDENT';
  nim?: string | null;
  group?: string | null; // ✅ FIXED: Keep null to match database schema
  phone?: string | null;
  avatar_url?: string | null;
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
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastActive?: string | null;
  token_balance?: number;
  settings?: any;
  created_at?: string;
  updated_at?: string;
}

// ✅ ADDED: Draft interfaces needed by draft-editor.tsx
export interface DraftSection {
  id: string;
  content: string;
  order: number;
  type: 'paragraph' | 'heading' | 'list' | 'quote';
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  sections: DraftSection[];
  userId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    wordCount: number;
    readingTime: number;
    tags: string[];
    category?: string;
  };
}

// ✅ ADDED: Node interface needed by node-component.tsx
export interface Node {
  id: string;
  articleId: string;
  type: string;
  content: string;
  x?: number;
  y?: number;
  created_at?: string;
  updated_at?: string;
  userId?: string;
}

// ✅ ADDED: Article interface for consistent usage
export interface Article {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updateAt: string; // Note: database uses updateAt, not updated_at
  userId: string | null;
  sessionId: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    group?: string;
    nim?: string;
    avatar_url?: string;
  };
}

// User helper functions - FIXED timestamps
export const getUserProfile = async (userId: string) => {
  return await supabase.from('User').select('*').eq('id', userId).single();
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  return await supabase
    .from('User')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(), // FIXED: snake_case
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
      updated_at: new Date().toISOString(), // FIXED: snake_case
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
      updated_at: new Date().toISOString(), // FIXED: snake_case
    })
    .eq('id', userId);
};

export const verifyUserEmail = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      isEmailVerified: true,
      updated_at: new Date().toISOString(), // FIXED: snake_case
    })
    .eq('id', userId);
};

export const verifyUserPhone = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      isPhoneVerified: true,
      updated_at: new Date().toISOString(), // FIXED: snake_case
    })
    .eq('id', userId);
};

// FIXED: Avatar upload function
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

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { data: updateData, error: updateError } = await supabase
      .from('User')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(), // FIXED: snake_case
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    return { data: updateData, error: null };
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return { data: null, error: error.message };
  }
};

// FIXED: Assignment helper functions
export const createAssignment = async (assignment: AssignmentInsert) => {
  return await supabase
    .from('Assignment')
    .insert({
      ...assignment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();
};

export const updateAssignment = async (id: string, assignment: AssignmentUpdate) => {
  return await supabase
    .from('Assignment')
    .update({
      ...assignment,
      updated_at: new Date().toISOString(), // FIXED: snake_case
    })
    .eq('id', id)
    .select('*')
    .single();
};
