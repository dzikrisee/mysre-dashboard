import { supabase, User } from './supabase';

export interface LearningAnalytics {
  userId: string;

  // Brain Module Analytics
  brainStats: {
    totalProjects: number;
    totalNodes: number;
    totalEdges: number;
    totalChatQueries: number;
    nodeClicks: number;
    edgeClicks: number;
    sessionDuration: number; // in minutes
    lastActivity: string;
    avgNodesPerProject: number;
    avgEdgesPerProject: number;
    mostUsedNodeTypes: Array<{ type: string; count: number }>;
    relationshipPatterns: Array<{ relation: string; count: number }>;
  };

  // Writer Module Analytics
  writerStats: {
    totalDrafts: number;
    totalAnnotations: number;
    totalWritingSessions: number;
    aiAssistanceUsage: number;
    citationCount: number;
    avgWordsPerDraft: number;
    writingProgress: Array<{ date: string; wordsWritten: number }>;
    lastWritingActivity: string;
    mostUsedSemanticTags: Array<{ tag: string; count: number }>;
    annotationFrequency: Array<{ date: string; count: number }>;
  };

  // Overall User Behavior
  overallStats: {
    recentActivity: number;
    totalLoginSessions: number;
    totalTimeSpent: number; // in minutes
    preferredModule: 'brain' | 'writer' | 'both';
    activityPattern: Array<{ hour: number; activityCount: number }>;
    weeklyActivity: Array<{ day: string; activityCount: number }>;
    productivityScore: number; // 1-100
    engagementLevel: 'low' | 'medium' | 'high';
  };
}

export class AnalyticsService {
  // Record user actions
  static async recordAction(action: string, userId?: string, document?: string, metadata?: any) {
    try {
      const { error } = await supabase.from('analytics').insert({
        action,
        userId,
        document,
        metadata,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Error recording analytics:', error);
      }
    } catch (error) {
      console.error('Analytics recording failed:', error);
    }
  }

  // Get comprehensive learning analytics for a user
  static async getUserLearningAnalytics(userId: string): Promise<LearningAnalytics> {
    try {
      // Fetch Brain Module Analytics
      const brainStats = await this.getBrainModuleAnalytics(userId);

      // Fetch Writer Module Analytics
      const writerStats = await this.getWriterModuleAnalytics(userId);

      // Fetch Overall Analytics
      const overallStats = await this.getOverallAnalytics(userId);

      return {
        userId,
        brainStats,
        writerStats,
        overallStats,
      };
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
      throw error;
    }
  }

  // Brain Module specific analytics
  private static async getBrainModuleAnalytics(userId: string) {
    // Get brainstorming sessions count
    const { data: sessions, count: totalProjects } = await supabase.from('BrainstormingSession').select('*', { count: 'exact' }).eq('userId', userId);

    // Get nodes and edges count from sessions
    const sessionIds = sessions?.map((s) => s.id) || [];

    const { count: totalNodes } = await supabase.from('Node').select('*', { count: 'exact' }).in('articleId', sessionIds);

    const { count: totalEdges } = await supabase.from('Edge').select('*', { count: 'exact' }).in('articleId', sessionIds);

    // Get chat queries count
    const { count: totalChatQueries } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'chat_query');

    // Get node and edge clicks from analytics
    const { data: nodeClicks } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'node_click');

    const { data: edgeClicks } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'edge_click');

    return {
      totalProjects: totalProjects || 0,
      totalNodes: totalNodes || 0,
      totalEdges: totalEdges || 0,
      totalChatQueries: totalChatQueries || 0,
      nodeClicks: nodeClicks?.length || 0,
      edgeClicks: edgeClicks?.length || 0,
      sessionDuration: 0, // Will be calculated from session analytics
      lastActivity: sessions?.[0]?.lastActivity || '',
      avgNodesPerProject: totalProjects ? (totalNodes || 0) / totalProjects : 0,
      avgEdgesPerProject: totalProjects ? (totalEdges || 0) / totalProjects : 0,
      mostUsedNodeTypes: [], // Will be populated from node data analysis
      relationshipPatterns: [], // Will be populated from edge data analysis
    };
  }

  // Writer Module specific analytics
  private static async getWriterModuleAnalytics(userId: string) {
    // Get drafts count - assuming there's a drafts table or similar
    const { count: totalDrafts } = await supabase.from('Article').select('*', { count: 'exact' }).eq('userId', userId);

    // Get writing sessions from analytics
    const { count: totalWritingSessions } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'draft_save');

    // Get AI assistance usage
    const { count: aiAssistanceUsage } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'ai_assist');

    return {
      totalDrafts: totalDrafts || 0,
      totalAnnotations: 0, // Will be calculated from annotations data
      totalWritingSessions: totalWritingSessions || 0,
      aiAssistanceUsage: aiAssistanceUsage || 0,
      citationCount: 0, // Will be calculated from document analysis
      avgWordsPerDraft: 0, // Will be calculated from document content
      writingProgress: [], // Will be populated from historical data
      lastWritingActivity: '',
      mostUsedSemanticTags: [], // Will be populated from tag analysis
      annotationFrequency: [], // Will be populated from annotation data
    };
  }

  // Overall user behavior analytics
  private static async getOverallAnalytics(userId: string) {
    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentActivity } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).gte('timestamp', sevenDaysAgo);

    // Get total login sessions
    const { count: totalLoginSessions } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'login');

    return {
      recentActivity: recentActivity || 0, // ✅ FIXED: Added missing recentActivity
      totalLoginSessions: totalLoginSessions || 0,
      totalTimeSpent: 0, // Will be calculated from session duration data
      preferredModule: 'both' as const,
      activityPattern: [], // Will be populated from hourly activity analysis
      weeklyActivity: [], // Will be populated from daily activity analysis
      productivityScore: 75, // Will be calculated based on various metrics
      engagementLevel: 'medium' as const, // Will be determined from activity frequency
    };
  }

  // Get analytics summary for all users (for admin dashboard)
  static async getAllUsersAnalyticsSummary() {
    try {
      const { data: users } = await supabase
        .from('User')
        .select('id, name, email, role, group, nim, createdAt, updated_at') // ✅ FIXED: Use updated_at instead of updateAt
        .eq('role', 'STUDENT'); // ✅ FIXED: Use STUDENT instead of USER

      if (!users) return [];

      const userAnalytics = await Promise.all(
        users.map(async (user) => {
          const analytics = await this.getUserLearningAnalytics(user.id);
          return {
            user: {
              ...user,
              // ✅ FIXED: Proper type conversion - only include fields that exist
              password: 'dummy', // Required field, but we don't expose real password
              avatar_url: null, // Optional field
            } as User,
            analytics,
          };
        }),
      );

      return userAnalytics;
    } catch (error) {
      console.error('Error fetching all users analytics:', error);
      return [];
    }
  }

  // Track specific Brain module actions
  static async trackNodeClick(userId: string, nodeId: string, nodeType: string, articleId: string) {
    return this.recordAction('node_click', userId, articleId, {
      nodeId,
      nodeType,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackEdgeClick(userId: string, edgeId: string, articleId: string) {
    return this.recordAction('edge_click', userId, articleId, {
      edgeId,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackChatQuery(userId: string, query: string, articleId: string) {
    return this.recordAction('chat_query', userId, articleId, {
      query: query.substring(0, 100), // Limit query length for storage
      timestamp: new Date().toISOString(),
    });
  }

  // Track specific Writer module actions
  static async trackDraftSave(userId: string, draftId: string, wordCount: number) {
    return this.recordAction('draft_save', userId, draftId, {
      wordCount,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackAIAssist(userId: string, assistType: string, draftId: string) {
    return this.recordAction('ai_assist', userId, draftId, {
      assistType,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackAnnotation(userId: string, annotationType: string, draftId: string) {
    return this.recordAction('annotation', userId, draftId, {
      annotationType,
      timestamp: new Date().toISOString(),
    });
  }

  // Track general user actions
  static async trackLogin(userId: string) {
    return this.recordAction('login', userId, undefined, {
      timestamp: new Date().toISOString(),
    });
  }

  static async trackPageView(userId: string, page: string) {
    return this.recordAction('page_view', userId, undefined, {
      page,
      timestamp: new Date().toISOString(),
    });
  }
}
