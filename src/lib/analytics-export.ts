import { AnalyticsService, LearningAnalytics } from './analytics';
import { User } from './supabase';

export interface AnalyticsReport {
  generatedAt: string;
  reportType: 'individual' | 'group' | 'summary';
  timeRange: {
    start: string;
    end: string;
  };
  data: any;
}

export class AnalyticsExporter {
  static async generateIndividualReport(userId: string): Promise<AnalyticsReport> {
    const analytics = await AnalyticsService.getUserLearningAnalytics(userId);

    return {
      generatedAt: new Date().toISOString(),
      reportType: 'individual',
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end: new Date().toISOString(),
      },
      data: {
        userId,
        analytics,
        summary: this.generateIndividualSummary(analytics),
        recommendations: this.generateRecommendations(analytics),
      },
    };
  }

  static async generateGroupReport(groupId: string): Promise<AnalyticsReport> {
    const allAnalytics = await AnalyticsService.getAllUsersAnalyticsSummary();
    const groupAnalytics = allAnalytics.filter((item) => item.user.group === groupId);

    return {
      generatedAt: new Date().toISOString(),
      reportType: 'group',
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      data: {
        groupId,
        totalStudents: groupAnalytics.length,
        groupStats: this.calculateGroupStats(groupAnalytics),
        topPerformers: this.getTopPerformers(groupAnalytics, 5),
        strugglingStudents: this.getStrugglingStudents(groupAnalytics, 3),
        recommendations: this.generateGroupRecommendations(groupAnalytics),
      },
    };
  }

  static async generateSummaryReport(): Promise<AnalyticsReport> {
    const allAnalytics = await AnalyticsService.getAllUsersAnalyticsSummary();

    return {
      generatedAt: new Date().toISOString(),
      reportType: 'summary',
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      data: {
        totalStudents: allAnalytics.length,
        overallStats: this.calculateOverallStats(allAnalytics),
        groupComparison: this.compareGroups(allAnalytics),
        trends: this.analyzeTrends(allAnalytics),
        insights: this.generateSystemInsights(allAnalytics),
      },
    };
  }

  private static generateIndividualSummary(analytics: LearningAnalytics) {
    const { brainStats, writerStats, overallStats } = analytics;

    return {
      strengths: [
        brainStats.totalProjects > 3 ? 'Active in brainstorming activities' : null,
        writerStats.totalDrafts > 2 ? 'Consistent in writing practice' : null,
        overallStats.productivityScore > 75 ? 'High productivity score' : null,
        brainStats.avgNodesPerProject > 10 ? 'Detailed project development' : null,
      ].filter(Boolean),

      areasForImprovement: [
        brainStats.totalChatQueries < 5 ? 'Could benefit from more AI assistance in brainstorming' : null,
        writerStats.aiAssistanceUsage < 3 ? 'Underutilizing AI writing assistance' : null,
        overallStats.engagementLevel === 'low' ? 'Low engagement with the platform' : null,
        writerStats.citationCount < 5 ? 'Need to improve citation practices' : null,
      ].filter(Boolean),

      keyMetrics: {
        productivityScore: overallStats.productivityScore,
        totalProjects: brainStats.totalProjects,
        totalDrafts: writerStats.totalDrafts,
        engagementLevel: overallStats.engagementLevel,
      },
    };
  }

  private static generateRecommendations(analytics: LearningAnalytics): string[] {
    const recommendations = [];
    const { brainStats, writerStats, overallStats } = analytics;

    if (brainStats.totalProjects < 2) {
      recommendations.push('Start more brainstorming projects to enhance idea development skills');
    }

    if (writerStats.totalDrafts < 2) {
      recommendations.push('Increase writing practice by creating more drafts');
    }

    if (brainStats.totalChatQueries < 5) {
      recommendations.push('Utilize AI chat assistance more frequently for better insights');
    }

    if (writerStats.aiAssistanceUsage < 3) {
      recommendations.push('Explore AI writing assistance features to improve content quality');
    }

    if (overallStats.engagementLevel === 'low') {
      recommendations.push('Increase platform engagement by exploring different features');
    }

    if (brainStats.avgNodesPerProject < 8) {
      recommendations.push('Develop more detailed mind maps with additional nodes and connections');
    }

    return recommendations.length > 0 ? recommendations : ['Keep up the excellent work! Continue maintaining current engagement levels.'];
  }

  private static calculateGroupStats(groupAnalytics: Array<{ user: User; analytics: LearningAnalytics }>) {
    const totalStudents = groupAnalytics.length;

    return {
      avgProductivity: groupAnalytics.reduce((sum, item) => sum + item.analytics.overallStats.productivityScore, 0) / totalStudents,
      avgBrainProjects: groupAnalytics.reduce((sum, item) => sum + item.analytics.brainStats.totalProjects, 0) / totalStudents,
      avgDrafts: groupAnalytics.reduce((sum, item) => sum + item.analytics.writerStats.totalDrafts, 0) / totalStudents,
      highEngagementCount: groupAnalytics.filter((item) => item.analytics.overallStats.engagementLevel === 'high').length,
      mediumEngagementCount: groupAnalytics.filter((item) => item.analytics.overallStats.engagementLevel === 'medium').length,
      lowEngagementCount: groupAnalytics.filter((item) => item.analytics.overallStats.engagementLevel === 'low').length,
    };
  }

  private static getTopPerformers(groupAnalytics: Array<{ user: User; analytics: LearningAnalytics }>, count: number) {
    return groupAnalytics
      .sort((a, b) => b.analytics.overallStats.productivityScore - a.analytics.overallStats.productivityScore)
      .slice(0, count)
      .map((item) => ({
        name: item.user.name,
        nim: item.user.nim,
        productivityScore: item.analytics.overallStats.productivityScore,
        brainProjects: item.analytics.brainStats.totalProjects,
        drafts: item.analytics.writerStats.totalDrafts,
      }));
  }

  private static getStrugglingStudents(groupAnalytics: Array<{ user: User; analytics: LearningAnalytics }>, count: number) {
    return groupAnalytics
      .filter((item) => item.analytics.overallStats.productivityScore < 50 || item.analytics.overallStats.engagementLevel === 'low')
      .sort((a, b) => a.analytics.overallStats.productivityScore - b.analytics.overallStats.productivityScore)
      .slice(0, count)
      .map((item) => ({
        name: item.user.name,
        nim: item.user.nim,
        productivityScore: item.analytics.overallStats.productivityScore,
        engagementLevel: item.analytics.overallStats.engagementLevel,
        issuesIdentified: [
          item.analytics.brainStats.totalProjects === 0 ? 'No brainstorming activity' : null,
          item.analytics.writerStats.totalDrafts === 0 ? 'No writing activity' : null,
          item.analytics.overallStats.totalLoginSessions < 5 ? 'Low platform usage' : null,
        ].filter(Boolean),
      }));
  }

  private static generateGroupRecommendations(groupAnalytics: Array<{ user: User; analytics: LearningAnalytics }>): string[] {
    const recommendations = [];
    const stats = this.calculateGroupStats(groupAnalytics);

    if (stats.avgProductivity < 60) {
      recommendations.push('Group productivity is below target. Consider additional training sessions.');
    }

    if (stats.avgBrainProjects < 2) {
      recommendations.push('Encourage more brainstorming activities within the group.');
    }

    if (stats.avgDrafts < 2) {
      recommendations.push('Implement more structured writing assignments.');
    }

    if (stats.lowEngagementCount > groupAnalytics.length * 0.3) {
      recommendations.push('High number of low-engagement students. Consider motivational interventions.');
    }

    return recommendations.length > 0 ? recommendations : ['Group is performing well. Continue current strategies.'];
  }

  static exportToCSV(report: AnalyticsReport): string {
    if (report.reportType === 'summary') {
      // CSV export for summary report
      let csv = 'Student Name,NIM,Group,Productivity Score,Brain Projects,Drafts,Engagement Level,Login Sessions\n';

      // This would include individual student data in the summary report
      report.data.individualData?.forEach((item: any) => {
        csv += `${item.user.name},${item.user.nim},${item.user.group},${item.analytics.overallStats.productivityScore},${item.analytics.brainStats.totalProjects},${item.analytics.writerStats.totalDrafts},${item.analytics.overallStats.engagementLevel},${item.analytics.overallStats.totalLoginSessions}\n`;
      });

      return csv;
    }

    return 'Report type not supported for CSV export';
  }

  private static calculateOverallStats(allAnalytics: Array<{ user: User; analytics: LearningAnalytics }>) {
    const totalStudents = allAnalytics.length;

    return {
      totalStudents,
      avgProductivity: allAnalytics.reduce((sum, item) => sum + item.analytics.overallStats.productivityScore, 0) / totalStudents,
      totalBrainProjects: allAnalytics.reduce((sum, item) => sum + item.analytics.brainStats.totalProjects, 0),
      totalDrafts: allAnalytics.reduce((sum, item) => sum + item.analytics.writerStats.totalDrafts, 0),
      totalNodes: allAnalytics.reduce((sum, item) => sum + item.analytics.brainStats.totalNodes, 0),
      totalEdges: allAnalytics.reduce((sum, item) => sum + item.analytics.brainStats.totalEdges, 0),
      totalAnnotations: allAnalytics.reduce((sum, item) => sum + item.analytics.writerStats.totalAnnotations, 0),
      highEngagementRate: (allAnalytics.filter((item) => item.analytics.overallStats.engagementLevel === 'high').length / totalStudents) * 100,
      mediumEngagementRate: (allAnalytics.filter((item) => item.analytics.overallStats.engagementLevel === 'medium').length / totalStudents) * 100,
      lowEngagementRate: (allAnalytics.filter((item) => item.analytics.overallStats.engagementLevel === 'low').length / totalStudents) * 100,
    };
  }

  private static compareGroups(allAnalytics: Array<{ user: User; analytics: LearningAnalytics }>) {
    const groupA = allAnalytics.filter((item) => item.user.group === 'A');
    const groupB = allAnalytics.filter((item) => item.user.group === 'B');

    return {
      groupA: {
        studentCount: groupA.length,
        avgProductivity: groupA.reduce((sum, item) => sum + item.analytics.overallStats.productivityScore, 0) / (groupA.length || 1),
        avgBrainProjects: groupA.reduce((sum, item) => sum + item.analytics.brainStats.totalProjects, 0) / (groupA.length || 1),
        avgDrafts: groupA.reduce((sum, item) => sum + item.analytics.writerStats.totalDrafts, 0) / (groupA.length || 1),
        highEngagementCount: groupA.filter((item) => item.analytics.overallStats.engagementLevel === 'high').length,
      },
      groupB: {
        studentCount: groupB.length,
        avgProductivity: groupB.reduce((sum, item) => sum + item.analytics.overallStats.productivityScore, 0) / (groupB.length || 1),
        avgBrainProjects: groupB.reduce((sum, item) => sum + item.analytics.brainStats.totalProjects, 0) / (groupB.length || 1),
        avgDrafts: groupB.reduce((sum, item) => sum + item.analytics.writerStats.totalDrafts, 0) / (groupB.length || 1),
        highEngagementCount: groupB.filter((item) => item.analytics.overallStats.engagementLevel === 'high').length,
      },
    };
  }

  private static analyzeTrends(allAnalytics: Array<{ user: User; analytics: LearningAnalytics }>) {
    // Mock trend analysis - in real implementation, this would analyze historical data
    return {
      weeklyGrowth: {
        newProjects: 15,
        newDrafts: 23,
        newUsers: 3,
        increasedEngagement: 12,
      },
      monthlyComparison: {
        productivityChange: 5.2, // percentage change
        projectsChange: 18,
        draftsChange: 25,
        engagementChange: 8.1,
      },
      predictions: {
        expectedNewProjectsNextWeek: 18,
        expectedProductivityImprovement: 3.1,
        studentsAtRisk: allAnalytics.filter((item) => item.analytics.overallStats.productivityScore < 40 || item.analytics.overallStats.engagementLevel === 'low').length,
      },
    };
  }

  private static generateSystemInsights(allAnalytics: Array<{ user: User; analytics: LearningAnalytics }>): string[] {
    const insights = [];
    const stats = this.calculateOverallStats(allAnalytics);

    if (stats.avgProductivity > 75) {
      insights.push('Excellent overall productivity across the platform. Current teaching methods are highly effective.');
    } else if (stats.avgProductivity < 50) {
      insights.push('Overall productivity is below expectations. Consider reviewing teaching strategies and platform features.');
    }

    if (stats.highEngagementRate > 60) {
      insights.push('High engagement rate indicates strong student motivation and platform usability.');
    }

    if (stats.lowEngagementRate > 30) {
      insights.push('Significant number of students showing low engagement. Intervention may be needed.');
    }

    const groupComparison = this.compareGroups(allAnalytics);
    const productivityDiff = Math.abs(groupComparison.groupA.avgProductivity - groupComparison.groupB.avgProductivity);

    if (productivityDiff > 15) {
      insights.push(`Significant productivity gap between groups (${productivityDiff.toFixed(1)} points). Consider balancing teaching approaches.`);
    }

    if (stats.totalBrainProjects / stats.totalStudents < 1.5) {
      insights.push('Students are underutilizing the Brain module. Consider promoting brainstorming activities.');
    }

    if (stats.totalDrafts / stats.totalStudents < 1.2) {
      insights.push('Writing activity is below optimal levels. Encourage more draft creation and revision.');
    }

    return insights.length > 0 ? insights : ['System is performing optimally with balanced usage across all features.'];
  }
}
