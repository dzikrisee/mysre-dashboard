// src/lib/services/assignment.service.ts
// COMPLETE FIX: Hapus SEMUA reference ke updatedAt/updated_at

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
    target_classes: string[];
    created_by: string;
  }) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .insert({
          title: data.title,
          description: data.description,
          week_number: data.week_number,
          assignment_code: data.assignment_code,
          file_url: data.file_url || null,
          file_name: data.file_name || null,
          due_date: data.due_date || null,
          is_active: data.is_active ?? true,
          target_classes: data.target_classes,
          created_by: data.created_by,
          createdAt: new Date().toISOString(),
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
      target_classes?: string[];
    },
  ) {
    try {
      // Build update object WITHOUT any timestamp fields
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.week_number !== undefined) updateData.week_number = data.week_number;
      if (data.assignment_code !== undefined) updateData.assignment_code = data.assignment_code;
      if (data.file_url !== undefined) updateData.file_url = data.file_url;
      if (data.file_name !== undefined) updateData.file_name = data.file_name;
      if (data.due_date !== undefined) updateData.due_date = data.due_date;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.target_classes !== undefined) updateData.target_classes = data.target_classes;

      const { data: assignment, error } = await supabase
        .from('Assignment')
        .update(updateData)
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
        .contains('target_classes', [studentClass])
        .order('week_number', { ascending: true });

      if (error) throw error;
      return { data: assignments, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete assignment (Admin only)
   */
  static async deleteAssignment(id: string) {
    try {
      // First delete all submissions for this assignment
      await supabase.from('AssignmentSubmission').delete().eq('assignment_id', id);

      // Then delete the assignment
      const { error } = await supabase.from('Assignment').delete().eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
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
          creator:User!Assignment_created_by_fkey(id, name, email),
          submissions:AssignmentSubmission(
            *,
            student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
          )
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

  /**
   * Check if assignment code exists
   */
  static async checkAssignmentCodeExists(code: string, excludeId?: string) {
    try {
      let query = supabase.from('Assignment').select('id').eq('assignment_code', code);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data && data.length > 0;
    } catch (error: any) {
      console.error('Error checking assignment code:', error);
      return false;
    }
  }

  // ==================== STUDENT METHODS ====================

  /**
   * Get assignment by code (Student view)
   */
  static async getAssignmentByCode(code: string, studentClass: string) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email)
        `,
        )
        .eq('assignment_code', code)
        .eq('is_active', true)
        .contains('target_classes', [studentClass])
        .single();

      if (error) throw error;
      return { data: assignment, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Submit assignment (Student only)
   */
  static async submitAssignment(data: { assignment_id: string; student_id: string; assignment_code_input: string; file_url?: string; file_name?: string; submission_text?: string }) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .insert({
          assignment_id: data.assignment_id,
          student_id: data.student_id,
          assignment_code_input: data.assignment_code_input,
          file_url: data.file_url || null,
          file_name: data.file_name || null,
          submission_text: data.submission_text || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
        .select(
          `
          *,
          assignment:Assignment(*),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
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
   * Get student's submission for assignment
   */
  static async getStudentSubmission(assignmentId: string, studentId: string) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(*),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
        `,
        )
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .single();

      if (error) throw error;
      return { data: submission, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Update submission (Student only)
   */
  static async updateSubmission(
    id: string,
    data: {
      assignment_code_input?: string;
      file_url?: string;
      file_name?: string;
      submission_text?: string;
    },
  ) {
    try {
      const updateData: any = {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      };

      if (data.assignment_code_input !== undefined) updateData.assignment_code_input = data.assignment_code_input;
      if (data.file_url !== undefined) updateData.file_url = data.file_url;
      if (data.file_name !== undefined) updateData.file_name = data.file_name;
      if (data.submission_text !== undefined) updateData.submission_text = data.submission_text;

      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          assignment:Assignment(*),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
        `,
        )
        .single();

      if (error) throw error;
      return { data: submission, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // ==================== GRADING METHODS ====================

  /**
   * Get all submissions for assignment (Admin view)
   */
  static async getSubmissionsForAssignment(assignmentId: string) {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(*),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
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
   * Grade submission (Admin only)
   */
  static async gradeSubmission(
    submissionId: string,
    data: {
      grade: number;
      feedback?: string;
    },
  ) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .update({
          grade: data.grade,
          feedback: data.feedback || null,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select(
          `
          *,
          assignment:Assignment(*),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
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
   * Get all submissions (Admin view)
   */
  static async getAllSubmissions() {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(*),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
        `,
        )
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return { data: submissions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // ==================== STATS METHODS ====================

  /**
   * Get assignment statistics
   */
  static async getAssignmentStats() {
    try {
      // Total assignments
      const { count: totalAssignments } = await supabase.from('Assignment').select('*', { count: 'exact', head: true });

      // Active assignments
      const { count: activeAssignments } = await supabase.from('Assignment').select('*', { count: 'exact', head: true }).eq('is_active', true);

      // Total submissions
      const { count: totalSubmissions } = await supabase.from('AssignmentSubmission').select('*', { count: 'exact', head: true });

      // Pending submissions
      const { count: pendingSubmissions } = await supabase.from('AssignmentSubmission').select('*', { count: 'exact', head: true }).eq('status', 'submitted');

      // Graded submissions
      const { count: gradedSubmissions } = await supabase.from('AssignmentSubmission').select('*', { count: 'exact', head: true }).eq('status', 'graded');

      // Stats per kelas untuk eksperimen
      const { data: classAAssignments } = await supabase.from('Assignment').select('id').contains('target_classes', ['A']);

      const { data: classBAssignments } = await supabase.from('Assignment').select('id').contains('target_classes', ['B']);

      const { data: bothClassesAssignments } = await supabase.from('Assignment').select('id').contains('target_classes', ['A']).contains('target_classes', ['B']);

      return {
        data: {
          totalAssignments: totalAssignments || 0,
          activeAssignments: activeAssignments || 0,
          totalSubmissions: totalSubmissions || 0,
          pendingSubmissions: pendingSubmissions || 0,
          gradedSubmissions: gradedSubmissions || 0,
          classAAssignments: classAAssignments?.length || 0,
          classBAssignments: classBAssignments?.length || 0,
          bothClassesAssignments: bothClassesAssignments?.length || 0,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}
