import { AnalyticsService } from './analytics';

export class AnalyticsTracker {
  // Brain Module tracking functions
  static async trackNodeClick(userId: string, nodeId: string, nodeType: string, articleId: string) {
    await AnalyticsService.recordAction('node_click', userId, articleId, {
      nodeId,
      nodeType,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackEdgeClick(userId: string, edgeId: string, relation: string, articleId: string) {
    await AnalyticsService.recordAction('edge_click', userId, articleId, {
      edgeId,
      relation,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackChatQuery(userId: string, sessionId: string, query: string, responseLength: number) {
    await AnalyticsService.recordAction('chat_query', userId, sessionId, {
      query: query.substring(0, 100), // Store first 100 chars for privacy
      queryLength: query.length,
      responseLength,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackSessionCreate(userId: string, sessionId: string, title: string) {
    await AnalyticsService.recordAction('session_created', userId, sessionId, {
      title,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackSessionEnd(userId: string, sessionId: string, duration: number) {
    await AnalyticsService.recordAction('session_ended', userId, sessionId, {
      duration, // in seconds
      timestamp: new Date().toISOString(),
    });
  }

  // Writer Module tracking functions
  static async trackDraftCreate(userId: string, draftId: string, title: string) {
    await AnalyticsService.recordAction('draft_created', userId, draftId, {
      title,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackDraftSave(userId: string, draftId: string, wordCount: number) {
    await AnalyticsService.recordAction('draft_saved', userId, draftId, {
      wordCount,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackAnnotationCreate(userId: string, articleId: string, annotationType: string) {
    await AnalyticsService.recordAction('annotation_created', userId, articleId, {
      annotationType,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackAIAssistance(userId: string, document: string, assistanceType: string, promptLength: number) {
    await AnalyticsService.recordAction('ai_assistance_used', userId, document, {
      assistanceType,
      promptLength,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackCitationAdd(userId: string, draftId: string, citationType: string) {
    await AnalyticsService.recordAction('citation_added', userId, draftId, {
      citationType,
      timestamp: new Date().toISOString(),
    });
  }

  // General tracking functions
  static async trackPageView(userId: string, page: string, timeSpent?: number) {
    await AnalyticsService.recordAction('page_view', userId, page, {
      page,
      timeSpent,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackFeatureUsage(userId: string, feature: string, context?: any) {
    await AnalyticsService.recordAction('feature_used', userId, feature, {
      feature,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackError(userId: string, errorType: string, errorMessage: string, context?: any) {
    await AnalyticsService.recordAction('error_occurred', userId, 'system', {
      errorType,
      errorMessage: errorMessage.substring(0, 200), // Limit error message length
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
