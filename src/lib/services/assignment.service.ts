// src/lib/services/assignment.service.ts
// FINAL FIXED VERSION - Semua masalah diperbaiki

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
    file_url?: string | null; // FIXED: Accept null
    file_name?: string | null; // FIXED: Accept null
    due_date?: string | null; // FIXED: Accept null
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
          // FIXED: Sesuai schema database
          createdAt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
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
      file_url?: string | null; // FIXED: Accept null
      file_name?: string | null; // FIXED: Accept null
      due_date?: string | null; // FIXED: Accept null
      is_active?: boolean;
      target_classes?: string[];
    },
  ) {
    try {
      // FIXED: Simple update object
      const updateData: any = {};

      // Only include defined values
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.week_number !== undefined) updateData.week_number = data.week_number;
      if (data.assignment_code !== undefined) updateData.assignment_code = data.assignment_code;
      if (data.file_url !== undefined) updateData.file_url = data.file_url;
      if (data.file_name !== undefined) updateData.file_name = data.file_name;
      if (data.due_date !== undefined) updateData.due_date = data.due_date;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.target_classes !== undefined) updateData.target_classes = data.target_classes;

      // FIXED: Let database trigger handle updated_at automatically
      const { data: assignment, error } = await supabase.from('Assignment').update(updateData).eq('id', id).select('*').single();

      if (error) throw error;
      return { data: assignment, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get all assignments (Admin view) - SIMPLIFIED
   */
  static async getAllAssignments() {
    try {
      const { data: assignments, error } = await supabase.from('Assignment').select('*').order('week_number', { ascending: true });

      if (error) throw error;
      return { data: assignments, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get assignment by ID - SIMPLIFIED
   */
  static async getAssignmentById(id: string) {
    try {
      const { data: assignment, error } = await supabase.from('Assignment').select('*').eq('id', id).single();

      if (error) throw error;
      return { data: assignment, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete assignment (Admin only) - FIXED
   */
  static async deleteAssignment(id: string) {
    try {
      // Delete assignment (submissions will be deleted by CASCADE)
      const { error } = await supabase.from('Assignment').delete().eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Check if assignment code exists - FIXED
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

  // ==================== SUBMISSION METHODS ====================

  /**
   * Get all submissions for admin - SIMPLIFIED
   */
  static async getAllSubmissions() {
    try {
      const { data: submissions, error } = await supabase.from('AssignmentSubmission').select('*').order('submitted_at', { ascending: false });

      if (error) throw error;
      return { data: submissions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get submissions by assignment ID - SIMPLIFIED
   */
  static async getSubmissionsByAssignment(assignmentId: string) {
    try {
      const { data: submissions, error } = await supabase.from('AssignmentSubmission').select('*').eq('assignment_id', assignmentId).order('submitted_at', { ascending: false });

      if (error) throw error;
      return { data: submissions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // ==================== STATS METHODS ====================

  /**
   * Get assignment statistics - SIMPLIFIED
   */
  static async getAssignmentStats() {
    try {
      // Parallel queries for better performance
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
      // Return default stats on error
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
