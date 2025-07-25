// src/lib/services/writer-session.service.ts
// Service untuk mengakses tabel WriterSession

import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface WriterSession {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  coverColor: string;
  // Relasi user
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface WriterSessionInsert {
  title: string;
  description?: string | null;
  userId: string;
  coverColor?: string;
}

export interface WriterSessionUpdate {
  title?: string;
  description?: string | null;
  coverColor?: string;
  lastActivity?: string;
}

export class WriterSessionService {
  /**
   * Get all writer sessions with user info
   */
  static async getAllWriterSessions() {
    try {
      const { data: sessions, error } = await supabase
        .from('WriterSession')
        .select(
          `
          *,
          user:User!WriterSession_userId_fkey(id, name, email, avatar_url)
        `,
        )
        .order('lastActivity', { ascending: false });

      if (error) throw error;
      return { data: sessions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get writer sessions by user ID
   */
  static async getWriterSessionsByUser(userId: string) {
    try {
      const { data: sessions, error } = await supabase
        .from('WriterSession')
        .select(
          `
          *,
          user:User!WriterSession_userId_fkey(id, name, email, avatar_url)
        `,
        )
        .eq('userId', userId)
        .order('lastActivity', { ascending: false });

      if (error) throw error;
      return { data: sessions, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get writer session by ID
   */
  static async getWriterSessionById(id: string) {
    try {
      const { data: session, error } = await supabase
        .from('WriterSession')
        .select(
          `
          *,
          user:User!WriterSession_userId_fkey(id, name, email, avatar_url)
        `,
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: session, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Create new writer session
   */
  static async createWriterSession(data: WriterSessionInsert) {
    try {
      const { data: session, error } = await supabase
        .from('WriterSession')
        .insert({
          id: uuidv4(),
          title: data.title,
          description: data.description || null,
          userId: data.userId,
          coverColor: data.coverColor || '#4c6ef5',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        })
        .select(
          `
          *,
          user:User!WriterSession_userId_fkey(id, name, email, avatar_url)
        `,
        )
        .single();

      if (error) throw error;
      return { data: session, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Update writer session
   */
  static async updateWriterSession(id: string, data: WriterSessionUpdate) {
    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.coverColor !== undefined) updateData.coverColor = data.coverColor;
      if (data.lastActivity !== undefined) updateData.lastActivity = data.lastActivity;

      const { data: session, error } = await supabase
        .from('WriterSession')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          user:User!WriterSession_userId_fkey(id, name, email, avatar_url)
        `,
        )
        .single();

      if (error) throw error;
      return { data: session, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete writer session
   */
  static async deleteWriterSession(id: string) {
    try {
      const { error } = await supabase.from('WriterSession').delete().eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Update last activity for writer session
   */
  static async updateLastActivity(id: string) {
    try {
      const { error } = await supabase
        .from('WriterSession')
        .update({
          lastActivity: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get writer session statistics
   */
  static async getWriterSessionStats(userId?: string) {
    try {
      let query = supabase.from('WriterSession').select('*', { count: 'exact', head: true });

      if (userId) {
        query = query.eq('userId', userId);
      }

      const { count: totalSessions, error: totalError } = await query;

      if (totalError) throw totalError;

      // Get sessions created in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      let recentQuery = supabase.from('WriterSession').select('*', { count: 'exact', head: true }).gte('createdAt', thirtyDaysAgo);

      if (userId) {
        recentQuery = recentQuery.eq('userId', userId);
      }

      const { count: recentSessions, error: recentError } = await recentQuery;

      if (recentError) throw recentError;

      // Get active sessions (activity in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let activeQuery = supabase.from('WriterSession').select('*', { count: 'exact', head: true }).gte('lastActivity', sevenDaysAgo);

      if (userId) {
        activeQuery = activeQuery.eq('userId', userId);
      }

      const { count: activeSessions, error: activeError } = await activeQuery;

      if (activeError) throw activeError;

      return {
        data: {
          totalSessions: totalSessions || 0,
          recentSessions: recentSessions || 0,
          activeSessions: activeSessions || 0,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}
