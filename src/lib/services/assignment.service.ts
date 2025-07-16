// src/lib/services/assignment.service.ts
import { supabase } from '@/lib/supabase';
import { Assignment, AssignmentSubmission, AssignmentInsert, AssignmentUpdate, SubmissionInsert, SubmissionUpdate } from '@/lib/types/assignment';

export class AssignmentService {
  // ==================== ASSIGNMENT METHODS ====================

  /**
   * Create new assignment (Admin only)
   */
  static async createAssignment(data: AssignmentInsert) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .insert({
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
   * Get all assignments with creator info (Admin view)
   */
  static async getAllAssignments() {
    try {
      const { data: assignments, error } = await supabase
        .from('Assignment')
        .select(
          `
          *,
          creator:User!Assignment_created_by_fkey(id, name, email),
          submissions:AssignmentSubmission(
            id, status, student_id,
            student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group)
          )
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
   * Get active assignments for students
   */
  static async getActiveAssignments() {
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
        .order('week_number', { ascending: true });

      if (error) throw error;
      return { data: assignments, error: null };
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
            student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
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
   * Update assignment (Admin only)
   */
  static async updateAssignment(id: string, data: AssignmentUpdate) {
    try {
      const { data: assignment, error } = await supabase
        .from('Assignment')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
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
  static async checkAssignmentCodeExists(code: string, excludeId?: string) {
    try {
      let query = supabase.from('Assignment').select('id').eq('assignment_code', code);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { exists: data && data.length > 0, error: null };
    } catch (error: any) {
      return { exists: false, error: error.message };
    }
  }

  // ==================== SUBMISSION METHODS ====================

  /**
   * Submit assignment by student
   */
  static async submitAssignment(data: SubmissionInsert) {
    try {
      // First verify the assignment code matches
      const { data: assignment, error: assignmentError } = await supabase.from('Assignment').select('id, assignment_code, is_active').eq('id', data.assignment_id).single();

      if (assignmentError) throw new Error('Assignment not found');

      if (!assignment.is_active) {
        throw new Error('Assignment is no longer active');
      }

      if (assignment.assignment_code !== data.assignment_code_input) {
        throw new Error('Invalid assignment code');
      }

      // Check if student already submitted
      const { data: existingSubmission } = await supabase.from('AssignmentSubmission').select('id').eq('assignment_id', data.assignment_id).eq('student_id', data.student_id).single();

      if (existingSubmission) {
        // Update existing submission
        const { data: submission, error } = await supabase
          .from('AssignmentSubmission')
          .update({
            assignment_code_input: data.assignment_code_input,
            file_url: data.file_url,
            file_name: data.file_name,
            submission_text: data.submission_text,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id)
          .select(
            `
            *,
            assignment:Assignment(*),
            student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
          `,
          )
          .single();

        if (error) throw error;
        return { data: submission, error: null };
      } else {
        // Create new submission
        const { data: submission, error } = await supabase
          .from('AssignmentSubmission')
          .insert({
            ...data,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select(
            `
            *,
            assignment:Assignment(*),
            student:User!AssignmentSubmission_student_id_fkey(id, name, nim, group, email)
          `,
          )
          .single();

        if (error) throw error;
        return { data: submission, error: null };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all submissions for admin
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
   * Get submissions by assignment
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
   * Get submissions by student
   */
  static async getSubmissionsByStudent(studentId: string) {
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

  /**
   * Grade submission (Admin only)
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
          updatedAt: new Date().toISOString(),
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
   * Get assignment statistics
   */
  static async getAssignmentStats() {
    try {
      // Total assignments
      const { count: totalAssignments } = await supabase.from('Assignment').select('*', { count: 'exact' });

      // Active assignments
      const { count: activeAssignments } = await supabase.from('Assignment').select('*', { count: 'exact' }).eq('is_active', true);

      // Total submissions
      const { count: totalSubmissions } = await supabase.from('AssignmentSubmission').select('*', { count: 'exact' });

      // Pending submissions
      const { count: pendingSubmissions } = await supabase.from('AssignmentSubmission').select('*', { count: 'exact' }).eq('status', 'submitted');

      // Graded submissions
      const { count: gradedSubmissions } = await supabase.from('AssignmentSubmission').select('*', { count: 'exact' }).eq('status', 'graded');

      return {
        data: {
          totalAssignments: totalAssignments || 0,
          activeAssignments: activeAssignments || 0,
          totalSubmissions: totalSubmissions || 0,
          pendingSubmissions: pendingSubmissions || 0,
          gradedSubmissions: gradedSubmissions || 0,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message,
      };
    }
  }

  /**
   * Upload assignment file
   */
  static async uploadAssignmentFile(file: File, path: string) {
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
  }

  /**
   * Delete assignment file
   */
  static async deleteAssignmentFile(path: string) {
    try {
      const { error } = await supabase.storage.from('assignments').remove([path]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
