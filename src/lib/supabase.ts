// src/lib/supabase.ts - FIXED untuk database utama sesuai skema Prisma
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ FIXED: Database types sesuai skema Prisma yang diberikan
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
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          password: string;
          role?: 'USER' | 'ADMIN';
          createdAt?: string;
          updateAt?: string;
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
          updateAt?: string;
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
      Node: {
        Row: {
          id: string;
          label: string;
          title: string | null;
          att_goal: string | null;
          att_method: string | null;
          att_background: string | null;
          att_future: string | null;
          att_gaps: string | null;
          att_url: string | null;
          type: string;
          content: string;
          articleId: string;
        };
        Insert: {
          id?: string;
          label: string;
          title?: string | null;
          att_goal?: string | null;
          att_method?: string | null;
          att_background?: string | null;
          att_future?: string | null;
          att_gaps?: string | null;
          att_url?: string | null;
          type: string;
          content: string;
          articleId: string;
        };
        Update: {
          id?: string;
          label?: string;
          title?: string | null;
          att_goal?: string | null;
          att_method?: string | null;
          att_background?: string | null;
          att_future?: string | null;
          att_gaps?: string | null;
          att_url?: string | null;
          type?: string;
          content?: string;
          articleId?: string;
        };
      };
      Edge: {
        Row: {
          id: string;
          fromId: string;
          toId: string;
          relation: string | null;
          label: string | null;
          color: string | null;
          articleId: string;
        };
        Insert: {
          id?: string;
          fromId: string;
          toId: string;
          relation?: string | null;
          label?: string | null;
          color?: string | null;
          articleId: string;
        };
        Update: {
          id?: string;
          fromId?: string;
          toId?: string;
          relation?: string | null;
          label?: string | null;
          color?: string | null;
          articleId?: string;
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
      BrainstormingSession: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          userId: string;
          selectedFilterArticles: string[];
          lastSelectedNodeId: string | null;
          lastSelectedEdgeId: string | null;
          graphFilters: any | null;
          createdAt: string;
          updatedAt: string;
          lastActivity: string;
          coverColor: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          userId: string;
          selectedFilterArticles?: string[];
          lastSelectedNodeId?: string | null;
          lastSelectedEdgeId?: string | null;
          graphFilters?: any | null;
          createdAt?: string;
          updatedAt?: string;
          lastActivity?: string;
          coverColor?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          userId?: string;
          selectedFilterArticles?: string[];
          lastSelectedNodeId?: string | null;
          lastSelectedEdgeId?: string | null;
          graphFilters?: any | null;
          createdAt?: string;
          updatedAt?: string;
          lastActivity?: string;
          coverColor?: string;
        };
      };
      Analytics: {
        Row: {
          id: number;
          action: string;
          document: string | null;
          userId: string;
          metadata: any | null;
          timestamp: string;
        };
        Insert: {
          id?: number;
          action: string;
          document?: string | null;
          userId: string;
          metadata?: any | null;
          timestamp?: string;
        };
        Update: {
          id?: number;
          action?: string;
          document?: string | null;
          userId?: string;
          metadata?: any | null;
          timestamp?: string;
        };
      };
      Draft: {
        Row: {
          id: string;
          userId: string | null;
          title: string;
          createdAt: string;
          writerId: string | null;
        };
        Insert: {
          id?: string;
          userId?: string | null;
          title: string;
          createdAt?: string;
          writerId?: string | null;
        };
        Update: {
          id?: string;
          userId?: string | null;
          title?: string;
          createdAt?: string;
          writerId?: string | null;
        };
      };
      DraftSection: {
        Row: {
          id: string;
          draftId: string;
          title: string;
          content: string;
        };
        Insert: {
          id?: string;
          draftId: string;
          title: string;
          content: string;
        };
        Update: {
          id?: string;
          draftId?: string;
          title?: string;
          content?: string;
        };
      };
      Annotation: {
        Row: {
          id: string;
          userId: string | null;
          articleId: string | null;
          page: number;
          highlightedText: string;
          comment: string;
          semanticTag: string | null;
          draftSectionId: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId?: string | null;
          articleId?: string | null;
          page: number;
          highlightedText: string;
          comment: string;
          semanticTag?: string | null;
          draftSectionId?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string | null;
          articleId?: string | null;
          page?: number;
          highlightedText?: string;
          comment?: string;
          semanticTag?: string | null;
          draftSectionId?: string | null;
          createdAt?: string;
        };
      };
      ChatMessage: {
        Row: {
          id: string;
          sessionId: string;
          content: string;
          role: string;
          createdAt: string;
          contextEdgeIds: string[];
          contextNodeIds: string[];
          references: any | null;
        };
        Insert: {
          id?: string;
          sessionId: string;
          content: string;
          role: string;
          createdAt?: string;
          contextEdgeIds?: string[];
          contextNodeIds?: string[];
          references?: any | null;
        };
        Update: {
          id?: string;
          sessionId?: string;
          content?: string;
          role?: string;
          createdAt?: string;
          contextEdgeIds?: string[];
          contextNodeIds?: string[];
          references?: any | null;
        };
      };
      WriterSession: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          userId: string;
          createdAt: string;
          updatedAt: string;
          lastActivity: string;
          coverColor: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          userId: string;
          createdAt?: string;
          updatedAt?: string;
          lastActivity?: string;
          coverColor?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          userId?: string;
          createdAt?: string;
          updatedAt?: string;
          lastActivity?: string;
          coverColor?: string;
        };
      };
      Document: {
        Row: {
          id: string;
          content: string;
          metadata: any;
          embedding: any;
          createdAt: string;
        };
        Insert: {
          id?: string;
          content: string;
          metadata?: any;
          embedding?: any;
          createdAt?: string;
        };
        Update: {
          id?: string;
          content?: string;
          metadata?: any;
          embedding?: any;
          createdAt?: string;
        };
      };
      TokenUsage: {
        Row: {
          id: string;
          userId: string;
          sessionId: string | null;
          tokensUsed: number;
          inputTokens: number;
          outputTokens: number;
          model: string;
          purpose: string;
          metadata: any | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          sessionId?: string | null;
          tokensUsed: number;
          inputTokens?: number;
          outputTokens?: number;
          model: string;
          purpose: string;
          metadata?: any | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          sessionId?: string | null;
          tokensUsed?: number;
          inputTokens?: number;
          outputTokens?: number;
          model?: string;
          purpose?: string;
          metadata?: any | null;
          createdAt?: string;
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

// ✅ FIXED: Create client dengan proper headers untuk file upload
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

// ✅ TIDAK UBAH: Interface User sesuai Prisma (TETAP SAMA)
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

// ✅ TIDAK UBAH: Helper functions untuk User Management (TETAP SAMA)
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

// ✅ TIDAK UBAH: Missing functions yang dibutuhkan profile page (TETAP SAMA)
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

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.from('User').delete().eq('id', userId);

  return { data, error };
};

// ✅ ADDED: Helper functions untuk Article (BARU)
export const getArticlesByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('Article')
    .select(
      `
      *,
      user:userId(id, name, email, role, group, nim, avatar_url)
    `,
    )
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  return { data, error };
};

export const getAllArticles = async () => {
  const { data, error } = await supabase
    .from('Article')
    .select(
      `
      *,
      user:userId(id, name, email, role, group, nim, avatar_url)
    `,
    )
    .order('createdAt', { ascending: false });

  return { data, error };
};

// ✅ ADDED: Helper functions untuk Assignment (BARU)
export const getAssignmentsByCreator = async (creatorId: string) => {
  const { data, error } = await supabase.from('Assignment').select('*').eq('created_by', creatorId).order('createdAt', { ascending: false });

  return { data, error };
};

export const getActiveAssignments = async () => {
  const { data, error } = await supabase.from('Assignment').select('*').eq('is_active', true).order('week_number', { ascending: true });

  return { data, error };
};
