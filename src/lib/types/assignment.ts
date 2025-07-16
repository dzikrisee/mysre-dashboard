export interface Assignment {
  id: string;
  title: string;
  description: string;
  week_number: number;
  assignment_code: string; // 3-4 digit code
  file_url?: string | null;
  file_name?: string | null;
  due_date?: string | null;
  is_active: boolean;
  created_by: string; // admin user id
  createdAt: string;
  updatedAt: string;
  // Relations
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  assignment_code_input: string; // code yang diinput student
  file_url?: string | null;
  file_name?: string | null;
  submission_text?: string | null;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number | null;
  feedback?: string | null;
  submitted_at: string;
  graded_at?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  assignment?: Assignment;
  student?: {
    id: string;
    name: string;
    email: string;
    nim: string;
    group: string;
  };
}

export interface AssignmentInsert {
  title: string;
  description: string;
  week_number: number;
  assignment_code: string;
  file_url?: string | null;
  file_name?: string | null;
  due_date?: string | null;
  is_active?: boolean;
  created_by: string;
}

export interface AssignmentUpdate {
  title?: string;
  description?: string;
  week_number?: number;
  assignment_code?: string;
  file_url?: string | null;
  file_name?: string | null;
  due_date?: string | null;
  is_active?: boolean;
  updatedAt?: string;
}

export interface SubmissionInsert {
  assignment_id: string;
  student_id: string;
  assignment_code_input: string;
  file_url?: string | null;
  file_name?: string | null;
  submission_text?: string | null;
  status?: 'pending' | 'submitted';
}

export interface SubmissionUpdate {
  assignment_code_input?: string;
  file_url?: string | null;
  file_name?: string | null;
  submission_text?: string | null;
  status?: 'pending' | 'submitted' | 'graded';
  grade?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
  updatedAt?: string;
}

// Supabase Database Schema Extension
export type AssignmentDatabase = {
  public: {
    Tables: {
      Assignment: {
        Row: Assignment;
        Insert: AssignmentInsert;
        Update: AssignmentUpdate;
      };
      AssignmentSubmission: {
        Row: AssignmentSubmission;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
      };
    };
  };
};
