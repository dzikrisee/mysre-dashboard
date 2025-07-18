// src/lib/services/assignment.service.ts
// FINAL FIXED - Relations & Submission System

import { supabase } from '@/lib/supabase';

export class AssignmentService {
  // ==================== ADMIN METHODS ====================

  /**
   * Create new assignment (Admin only) - FIXED
   */
  static async createAssignment(data: {
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
          updated_at: new Date().toISOString(),
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
   * Update assignment (Admin only) - FIXED
   */
  static async updateAssignment(
    id: string,
    data: {
      title?: string;
      description?: string;
      week_number?: number;
      assignment_code?: string;
      file_url?: string | null;
      file_name?: string | null;
      due_date?: string | null;
      is_active?: boolean;
      target_classes?: string[];
    },
  ) {
    try {
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
   * Get all assignments (Admin view) - FIXED WITH RELATIONS
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
   * Get assignment by ID - FIXED WITH RELATIONS
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

  /**
   * Get assignments for specific class (Student view) - FIXED TARGET CLASSES
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
      const { error } = await supabase.from('Assignment').delete().eq('id', id);
      if (error) throw error;
      return { data: true, error: null };
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
      return false;
    }
  }

  // ==================== STUDENT SUBMISSION METHODS ====================

  /**
   * Get assignment by code for student submission - FIXED TARGET CLASSES
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
   * Submit assignment (Student only) - FIXED
   */
  static async submitAssignment(data: { assignment_id: string; student_id: string; assignment_code_input: string; file_url?: string | null; file_name?: string | null; submission_text?: string | null }) {
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
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
   * Get student's submission for assignment - FIXED
   */
  static async getStudentSubmission(assignmentId: string, studentId: string) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
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
   * Update submission (Student only) - FIXED
   */
  static async updateSubmission(
    id: string,
    data: {
      assignment_code_input?: string;
      file_url?: string | null;
      file_name?: string | null;
      submission_text?: string | null;
    },
  ) {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
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

  // ==================== ADMIN SUBMISSION METHODS ====================

  /**
   * Get all submissions for admin - FIXED WITH RELATIONS
   */
  static async getAllSubmissions() {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
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

  /**
   * Get submissions by assignment ID - FIXED WITH RELATIONS
   */
  static async getSubmissionsByAssignment(assignmentId: string) {
    try {
      const { data: submissions, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
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
   * Get submission by ID - NEW METHOD for detail page
   */
  static async getSubmissionById(submissionId: string) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
          student:User!AssignmentSubmission_student_id_fkey(id, name, email, nim, group)
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

  /**
   * Grade submission (Admin only) - FIXED
   */
  static async gradeSubmission(id: string, grade: number, feedback?: string) {
    try {
      const { data: submission, error } = await supabase
        .from('AssignmentSubmission')
        .update({
          status: 'graded',
          grade,
          feedback,
          graded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          assignment:Assignment(
            *,
            creator:User!Assignment_created_by_fkey(id, name, email)
          ),
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

  // ==================== STATS METHODS ====================

  /**
   * Get assignment statistics - FIXED
   */
  static async getAssignmentStats() {
    try {
      const [{ count: totalAssignments }, { count: activeAssignments }, { count: totalSubmissions }, { count: pendingSubmissions }, { count: gradedSubmissions }] = await Promise.all([
        supabase.from('Assignment').select('*', { count: 'exact', head: true }),
        supabase.from('Assignment').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('AssignmentSubmission').select('*', { count: 'exact', head: true }),
        supabase.from('AssignmentSubmission').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('AssignmentSubmission').select('*', { count: 'exact', head: true }).eq('status', 'graded'),
      ]);

      const stats = {
        totalAssignments: totalAssignments || 0,
        activeAssignments: activeAssignments || 0,
        totalSubmissions: totalSubmissions || 0,
        pendingSubmissions: pendingSubmissions || 0,
        gradedSubmissions: gradedSubmissions || 0,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return {
        data: {
          totalAssignments: 0,
          activeAssignments: 0,
          totalSubmissions: 0,
          pendingSubmissions: 0,
          gradedSubmissions: 0,
        },
        error: null,
      };
    }
  }
}
