import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'USER' | 'ADMIN'; 
  createdAt: string;
  updateAt: string;
  group?: string;
  nim?: string;
  avatar_url?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar_url?: string;
  group?: string;
  nim?: string;
}

// New Analytics interface untuk Learning Behaviour Analysis
export interface Analytics {
  id: number;
  action: string;
  document?: string;
  userId?: string;
  metadata?: any; // jsonb
  timestamp: string;
}

// Enhanced BrainstormingSession interface
export interface BrainstormingSession {
  id: string;
  title: string;
  description?: string;
  userId: string;
  selectedFilterArticles: string[];
  lastSelectedNodeId?: string;
  lastSelectedEdgeId?: string;
  graphFilters?: any; // jsonb
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  coverColor: string;
}

// Enhanced Article interface
export interface Article {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updateAt: string; // Note: typo di schema
  userId?: string;
  sessionId?: string;
  author?: User;
}

// New interfaces untuk Brain module tracking
export interface Node {
  id: string;
  label: string;
  title?: string;
  att_goal?: string;
  att_method?: string;
  att_background?: string;
  att_future?: string;
  att_gaps?: string;
  att_url?: string;
  type: string;
  content: string;
  articleId: string;
}

export interface Edge {
  id: string;
  fromId: string;
  toId: string;
  relation?: string;
  label?: string;
  color?: string;
  articleId: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: string;
  createdAt: string;
  contextEdgeIds: string[];
  contextNodeIds: string[];
  references?: any; // jsonb
}

// New interfaces untuk Writer module tracking
export interface Draft {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
}

export interface DraftSection {
  id: string;
  draftId: string;
  title: string;
  content: string;
}

export interface Annotation {
  id: string;
  userId?: string;
  articleId?: string;
  page: number;
  highlightedText: string;
  comment: string;
  semanticTag?: string;
  draftSectionId?: string;
  createdAt: string;
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
          role: 'USER' | 'ADMIN';
          createdAt: string;
          updateAt: string;
          group: string | null;
          nim: string | null;
          avatar_url: string | null;
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

// Helper functions untuk User
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

// Helper functions untuk Article
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
