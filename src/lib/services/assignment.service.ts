// src/lib/services/assignment.service.ts
// Unified service untuk Admin dan Student Assignment - FIXED updatedAt error

import { supabase } from '@/lib/supabase';

export class AssignmentService {
  // ==================== ADMIN METHODS ====================

  /**
   * Create new assignment (Admin only)
   */
  static async createAssignment(data: {
    title: string;
    description: string;
    week_number: number;
    assignment_code: string;
    file_url?: string;
    file_name?: string;
    due_date?: string;
    is_active?: boolean;
    target_classes: string[]; // NEW
    created_by: string;
  }) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .insert({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), // FIXED: Gunakan updatedAt, bukan updated_at
        })
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email)
        `,
        )
        .single();

      if (error) throw error;
      return { data: assignment, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all assignments (Admin view)
   */
  static async getAllAssignments() {
    try {
      const { data: assignments, error } = await supabase
        .from('Assignment')
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email)
        `,
        )
        .order('week_number', { ascending: true });

      if (error) throw error;
      return { data: assignments, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get assignments for specific class (Student view)
   */
  static async getAssignmentsForClass(studentClass: string) {
    try {
      const { data: assignments, error } = await supabase
        .from('Assignment')
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email)
        `,
        )
        .eq('is_active', true)
        .contains('target_classes', [studentClass]) // Filter by target classes
        .order('week_number', { ascending: true });

      if (error) throw error;
      return { data: assignments, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Update assignment (Admin only)
   */
  static async updateAssignment(
    id: string,
    data: {
      title?: string;
      description?: string;
      week_number?: number;
      assignment_code?: string;
      file_url?: string;
      file_name?: string;
      due_date?: string;
      is_active?: boolean;
      target_classes?: string[]; // NEW
    },
  ) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .update({
          ...data,
          updatedAt: new Date().toISOString(), // FIXED: Gunakan updatedAt, bukan updated_at
        })
        .eq('id', id)
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email)
        `,
        )
        .single();

      if (error) throw error;
      return { data: assignment, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete assignment (Admin only)
   */
  static async deleteAssignment(id: string) {
    try {
      const { error } = await supabase.from('Assignment').delete().eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if assignment code exists
   */
  static async checkAssignmentCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase.from('Assignment').select('id').eq('assignment_code', code);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw error;
      }

      return !!data;
    } catch (error: any) {
      console.error('Error checking assignment code:', error);
      return false;
    }
  }

  /**
   * Get assignment by ID
   */
  static async getAssignmentById(id: string) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email)
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: assignment, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // ==================== STUDENT METHODS ====================

  /**
   * Submit assignment (Student only)
   */
  static async submitAssignment(data: { assignment_id: string; student_id: string; assignment_code_input: string; file_url?: string; file_name?: string; submission_text?: string }) {
    try {
      // First verify assignment code
      const { data: assignment } = await this.getAssignmentById(data.assignment_id);
      if (!assignment || assignment.assignment_code !== data.assignment_code_input) {
        throw new Error('Assignment code tidak valid');
      }

      // Check if student already submitted
      const { data: existingSubmission } = await supabase.from('AssignmentSubmission').select('id').eq('assignment_id', data.assignment_id).eq('student_id', data.student_id).single();

      if (existingSubmission) {
        throw new Error('Anda sudah mengumpulkan assignment ini');
      }

      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .insert({
          ...data,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), // FIXED: Gunakan updatedAt, bukan updated_at
        })
        .select(
          `
          *,
          assignment:Assignment(id, title, week_number),
          student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
        `,
        )
        .single();

      if (error) throw error;
      return { data: submission, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get student submissions
   */
  static async getStudentSubmissions(studentId: string) {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(id, title, week_number, assignment_code, due_date),
          student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
        `,
        )
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return { data: submissions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // ==================== ADMIN SUBMISSION MANAGEMENT ====================

  /**
   * Get all submissions (Admin view)
   */
  static async getAllSubmissions() {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(id, title, week_number, assignment_code),
          student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
        `,
        )
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return { data: submissions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Grade submission (Admin only) - FIXED updatedAt
   */
  static async gradeSubmission(submissionId: string, grade: number, feedback?: string) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .update({
          grade,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(), // FIXED: Gunakan updatedAt, bukan updated_at
        })
        .eq('id', submissionId)
        .select(
          `
          *,
          assignment:Assignment(id, title, week_number),
          student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
        `,
        )
        .single();

      if (error) throw error;
      return { data: submission, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get submissions by assignment (Admin view)
   */
  static async getSubmissionsByAssignment(assignmentId: string) {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(id, title, week_number, assignment_code),
          student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
        `,
        )
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return { data: submissions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get submission by ID (for grading page)
   */
  static async getSubmissionById(submissionId: string) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(id, title, week_number, assignment_code, description, due_date, file_url, file_name),
          student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
        `,
        )
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      return { data: submission, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get assignment statistics
   */
  static async getAssignmentStats() {
    try {
      const [assignmentsResult, submissionsResult] = await Promise.all([supabase.from('Assignment').select('id', { count: 'exact' }), supabase.from('AssignmentSubmission').select('id, status', { count: 'exact' })]);

      if (assignmentsResult.error) throw assignmentsResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      const totalAssignments = assignmentsResult.count || 0;
      const allSubmissions = submissionsResult.data || [];

      const stats = {
        totalAssignments,
        totalSubmissions: allSubmissions.length,
        pendingSubmissions: allSubmissions.filter((s) => s.status === 'submitted').length,
        gradedSubmissions: allSubmissions.filter((s) => s.status === 'graded').length,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}
