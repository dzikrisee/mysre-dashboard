// src/lib/services/brainstorming-session.service.ts
// Service untuk mengakses tabel BrainstormingSession

import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface BrainstormingSession {
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
  // Relasi user
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface BrainstormingSessionInsert {
  title: string;
  description?: string | null;
  userId: string;
  selectedFilterArticles?: string[];
  lastSelectedNodeId?: string | null;
  lastSelectedEdgeId?: string | null;
  graphFilters?: any | null;
  coverColor?: string;
}

export interface BrainstormingSessionUpdate {
  title?: string;
  description?: string | null;
  selectedFilterArticles?: string[];
  lastSelectedNodeId?: string | null;
  lastSelectedEdgeId?: string | null;
  graphFilters?: any | null;
  coverColor?: string;
  lastActivity?: string;
}

export class BrainstormingSessionService {
  /**
   * Get all brainstorming sessions with user info
   */
  static async getAllBrainstormingSessions() {
    try {
      const { data: sessions, error } = await supabase
        .from('BrainstormingSession')
        .select(
          `
        *,
        user:User!BrainstormingSession_userId_fkey(
          id, 
          name, 
          email, 
          avatar_url,
          articles:Article(count)
        )
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
   * Get brainstorming sessions by user ID
   */
  static async getBrainstormingSessionsByUser(userId: string) {
    try {
      const { data: sessions, error } = await supabase
        .from('BrainstormingSession')
        .select(
          `
          *,
          user:User!BrainstormingSession_userId_fkey(id, name, email, avatar_url)
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
   * Get brainstorming session by ID
   */
  static async getBrainstormingSessionById(id: string) {
    try {
      const { data: session, error } = await supabase
        .from('BrainstormingSession')
        .select(
          `
          *,
          user:User!BrainstormingSession_userId_fkey(id, name, email, avatar_url)
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
   * Create new brainstorming session
   */
  static async createBrainstormingSession(data: BrainstormingSessionInsert) {
    try {
      const { data: session, error } = await supabase
        .from('BrainstormingSession')
        .insert({
          id: uuidv4(),
          title: data.title,
          description: data.description || null,
          userId: data.userId,
          selectedFilterArticles: data.selectedFilterArticles || [],
          lastSelectedNodeId: data.lastSelectedNodeId || null,
          lastSelectedEdgeId: data.lastSelectedEdgeId || null,
          graphFilters: data.graphFilters || null,
          coverColor: data.coverColor || '#4c6ef5',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        })
        .select(
          `
          *,
          user:User!BrainstormingSession_userId_fkey(id, name, email, avatar_url)
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
   * Update brainstorming session
   */
  static async updateBrainstormingSession(id: string, data: BrainstormingSessionUpdate) {
    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.selectedFilterArticles !== undefined) updateData.selectedFilterArticles = data.selectedFilterArticles;
      if (data.lastSelectedNodeId !== undefined) updateData.lastSelectedNodeId = data.lastSelectedNodeId;
      if (data.lastSelectedEdgeId !== undefined) updateData.lastSelectedEdgeId = data.lastSelectedEdgeId;
      if (data.graphFilters !== undefined) updateData.graphFilters = data.graphFilters;
      if (data.coverColor !== undefined) updateData.coverColor = data.coverColor;
      if (data.lastActivity !== undefined) updateData.lastActivity = data.lastActivity;

      const { data: session, error } = await supabase
        .from('BrainstormingSession')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          user:User!BrainstormingSession_userId_fkey(id, name, email, avatar_url)
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
   * Delete brainstorming session
   */
  static async deleteBrainstormingSession(id: string) {
    try {
      const { error } = await supabase.from('BrainstormingSession').delete().eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Update last activity for brainstorming session
   */
  static async updateLastActivity(id: string) {
    try {
      const { error } = await supabase
        .from('BrainstormingSession')
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
   * Get brainstorming session statistics
   */
  static async getBrainstormingSessionStats(userId?: string) {
    try {
      let query = supabase.from('BrainstormingSession').select('*', { count: 'exact', head: true });

      if (userId) {
        query = query.eq('userId', userId);
      }

      const { count: totalSessions, error: totalError } = await query;

      if (totalError) throw totalError;

      // Get sessions created in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      let recentQuery = supabase.from('BrainstormingSession').select('*', { count: 'exact', head: true }).gte('createdAt', thirtyDaysAgo);

      if (userId) {
        recentQuery = recentQuery.eq('userId', userId);
      }

      const { count: recentSessions, error: recentError } = await recentQuery;

      if (recentError) throw recentError;

      // Get active sessions (activity in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let activeQuery = supabase.from('BrainstormingSession').select('*', { count: 'exact', head: true }).gte('lastActivity', sevenDaysAgo);

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

  /**
   * Add article to session filter
   */
  static async addArticleToFilter(sessionId: string, articleId: string) {
    try {
      // Get current session
      const { data: session, error: getError } = await supabase.from('BrainstormingSession').select('selectedFilterArticles').eq('id', sessionId).single();

      if (getError) throw getError;

      const currentArticles = session?.selectedFilterArticles || [];
      if (!currentArticles.includes(articleId)) {
        const updatedArticles = [...currentArticles, articleId];

        const { error: updateError } = await supabase
          .from('BrainstormingSession')
          .update({
            selectedFilterArticles: updatedArticles,
            lastActivity: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('id', sessionId);

        if (updateError) throw updateError;
      }

      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Remove article from session filter
   */
  static async removeArticleFromFilter(sessionId: string, articleId: string) {
    try {
      // Get current session
      const { data: session, error: getError } = await supabase.from('BrainstormingSession').select('selectedFilterArticles').eq('id', sessionId).single();

      if (getError) throw getError;

      const currentArticles = session?.selectedFilterArticles || [];
      const updatedArticles = currentArticles.filter((id: string) => id !== articleId);

      const { error: updateError } = await supabase
        .from('BrainstormingSession')
        .update({
          selectedFilterArticles: updatedArticles,
          lastActivity: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}
