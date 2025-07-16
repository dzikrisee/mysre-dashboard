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
      mostUsedNodeTypes: [], // Will be populated from Node data
      relationshipPatterns: [], // Will be populated from Edge data
    };
  }

  // Writer Module specific analytics
  private static async getWriterModuleAnalytics(userId: string) {
    // Get drafts created from analytics
    const { count: totalDrafts } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'draft_created');

    // Get draft saves from analytics
    const { count: draftSaves } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'draft_saved');

    // Get annotations from analytics
    const { count: totalAnnotations } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'annotation_created');

    // Get AI assistance from analytics
    const { count: aiUsage } = await supabase.from('analytics').select('*', { count: 'exact' }).eq('userId', userId).eq('action', 'ai_assistance_used');

    return {
      totalDrafts: totalDrafts || 0,
      totalAnnotations: totalAnnotations || 0,
      totalWritingSessions: draftSaves || 0,
      aiAssistanceUsage: aiUsage || 0,
      citationCount: 0,
      avgWordsPerDraft: 0,
      writingProgress: [],
      lastWritingActivity: new Date().toISOString(),
      mostUsedSemanticTags: [],
      annotationFrequency: [],
    };
  }

  // Overall user behavior analytics
  private static async getOverallAnalytics(userId: string) {
    // Get login sessions from analytics
    const { data: loginSessions } = await supabase.from('analytics').select('*').eq('userId', userId).eq('action', 'login');

    // Get all user activities
    const { data: allActivities } = await supabase.from('analytics').select('*').eq('userId', userId).order('timestamp', { ascending: false });

    return {
      totalLoginSessions: loginSessions?.length || 0,
      totalTimeSpent: 0, // Will be calculated from session data
      preferredModule: 'both' as const, // Will be determined from activity patterns
      activityPattern: [], // Will be calculated from timestamp analysis
      weeklyActivity: [], // Will be calculated from timestamp analysis
      productivityScore: 75, // Will be calculated based on various metrics
      engagementLevel: 'medium' as const, // Will be determined from activity frequency
    };
  }

  // Get analytics summary for all users (for admin dashboard)
  static async getAllUsersAnalyticsSummary() {
    try {
      const { data: users } = await supabase
        .from('User')
        .select('id, name, email, role, group, nim, createdAt, updateAt') // ✅ Add updateAt field
        .eq('role', 'USER');

      if (!users) return [];

      const userAnalytics = await Promise.all(
        users.map(async (user) => {
          const analytics = await this.getUserLearningAnalytics(user.id);
          return {
            user: {
              ...user,
              // ✅ Ensure all required User fields are present
              password: undefined, // Optional field
              avatar_url: undefined, // Optional field
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
}
