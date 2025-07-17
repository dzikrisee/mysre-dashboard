// src/lib/supabase.ts - UPDATED VERSION with Assignment Tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'ADMIN' | 'USER';
          avatar_url: string | null;
          group: string | null;
          nim: string | null;
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
          isEmailVerified: boolean;
          isPhoneVerified: boolean;
          lastActive: string | null;
          token_balance: number;
          settings: any;
          createdAt: string;
          updateAt: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'ADMIN' | 'USER';
          avatar_url?: string | null;
          group?: string | null;
          nim?: string | null;
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
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string | null;
          token_balance?: number;
          settings?: any;
          createdAt?: string;
          updateAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'ADMIN' | 'USER';
          avatar_url?: string | null;
          group?: string | null;
          nim?: string | null;
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
          isEmailVerified?: boolean;
          isPhoneVerified?: boolean;
          lastActive?: string | null;
          token_balance?: number;
          settings?: any;
          createdAt?: string;
          updateAt?: string;
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
          id?: string;
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
      // NEW ASSIGNMENT TABLES
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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper types
export type UserRole = Database['public']['Tables']['User']['Row']['role'];
export type UserInsert = Database['public']['Tables']['User']['Insert'];
export type UserUpdate = Database['public']['Tables']['User']['Update'];
export type UserGroup = Database['public']['Tables']['User']['Row']['group'];

export type ArticleInsert = Database['public']['Tables']['Article']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['Article']['Update'];

// NEW: Assignment helper types
export type AssignmentRow = Database['public']['Tables']['Assignment']['Row'];
export type AssignmentInsert = Database['public']['Tables']['Assignment']['Insert'];
export type AssignmentUpdate = Database['public']['Tables']['Assignment']['Update'];

export type AssignmentSubmissionRow = Database['public']['Tables']['AssignmentSubmission']['Row'];
export type AssignmentSubmissionInsert = Database['public']['Tables']['AssignmentSubmission']['Insert'];
export type AssignmentSubmissionUpdate = Database['public']['Tables']['AssignmentSubmission']['Update'];

// Existing User helper functions
export const getUserProfile = async (userId: string) => {
  return await supabase.from('User').select('*').eq('id', userId).single();
};

// Update HANYA bagian helper functions di src/lib/supabase.ts
// Ganti semua fungsi helper ini dengan versi yang menggunakan updated_at

export const updateUserProfile = async (userId: string, profileData: any) => {
  return await supabase
    .from('User')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
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
      updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
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
      updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
    })
    .eq('id', userId);
};

export const verifyUserEmail = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      isEmailVerified: true,
      updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
    })
    .eq('id', userId);
};

export const verifyUserPhone = async (userId: string) => {
  return await supabase
    .from('User')
    .update({
      isPhoneVerified: true,
      updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
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
        updated_at: new Date().toISOString(), // FIXED: Gunakan updated_at
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

// NEW: Assignment helper functions
export const createAssignment = async (assignment: AssignmentInsert) => {
  return await supabase
    .from('Assignment')
    .insert({
      ...assignment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('*')
    .single();
};

export const getAssignments = async () => {
  return await supabase
    .from('Assignment')
    .select(
      `
      *,
      creator:User!Assignment_created_by_fkey(id, name, email)
    `,
    )
    .order('week_number', { ascending: true });
};

export const getActiveAssignments = async () => {
  return await supabase
    .from('Assignment')
    .select(
      `
      *,
      creator:User!Assignment_created_by_fkey(id, name, email)
    `,
    )
    .eq('is_active', true)
    .order('week_number', { ascending: true });
};

export const updateAssignment = async (id: string, assignment: AssignmentUpdate) => {
  return await supabase
    .from('Assignment')
    .update({
      ...assignment,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
};

export const deleteAssignment = async (id: string) => {
  return await supabase.from('Assignment').delete().eq('id', id);
};

// NEW: Assignment Submission helper functions
export const createSubmission = async (submission: AssignmentSubmissionInsert) => {
  return await supabase
    .from('AssignmentSubmission')
    .insert({
      ...submission,
      submitted_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('*')
    .single();
};

export const getSubmissions = async () => {
  return await supabase
    .from('AssignmentSubmission')
    .select(
      `
      *,
      assignment:Assignment(id, title, week_number, assignment_code),
      student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
    `,
    )
    .order('submitted_at', { ascending: false });
};

export const updateSubmission = async (id: string, submission: AssignmentSubmissionUpdate) => {
  return await supabase
    .from('AssignmentSubmission')
    .update({
      ...submission,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
};

export const gradeSubmission = async (id: string, grade: number, feedback?: string) => {
  return await supabase
    .from('AssignmentSubmission')
    .update({
      grade,
      feedback,
      status: 'graded' as const,
      graded_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
};

// NEW: Storage helpers for assignments
export const uploadAssignmentFile = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage.from('assignments').upload(path, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(path);

    return {
      data: {
        path: data.path,
        url: urlData.publicUrl,
      },
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const deleteAssignmentFile = async (path: string) => {
  try {
    const { error } = await supabase.storage.from('assignments').remove([path]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
