// src/lib/services/billing-service.ts
import { supabase } from '@/lib/supabase';
import type { TokenUsage, BillingHistory, SubscriptionPlan, UserWithBilling, MonthlyUsageSummary, BillingStats, UserBillingAnalytics } from '@/lib/types/billing';

export class BillingService {
  // Record token usage for AI operations
  static async recordTokenUsage(userId: string, action: string, tokensUsed: number, context?: string, metadata?: any): Promise<{ success: boolean; error?: string; remaining_balance?: number }> {
    try {
      // Get user's current tier and balance
      const { data: user, error: userError } = await supabase.from('User').select('tier, token_balance, monthly_token_limit').eq('id', userId).single();

      if (userError || !user) {
        return { success: false, error: 'User not found' };
      }

      // Check if user has enough token balance
      if (user.token_balance < tokensUsed) {
        return { success: false, error: 'Insufficient token balance' };
      }

      // Get cost per token for user's tier
      const { data: plan } = await supabase.from('SubscriptionPlan').select('cost_per_token').eq('name', user.tier).single();

      const costPerToken = plan?.cost_per_token || 0.000002;
      const totalCost = tokensUsed * costPerToken;

      // Start transaction: Record usage and update balance
      const { data: tokenUsage, error: usageError } = await supabase
        .from('TokenUsage')
        .insert({
          userId,
          action,
          tokens_used: tokensUsed,
          cost_per_token: costPerToken,
          total_cost: totalCost, // Manual calculation since no computed column
          context,
          metadata,
        })
        .select()
        .single();

      if (usageError) {
        return { success: false, error: usageError.message };
      }

      // Update user balance manually (since no trigger)
      const newBalance = user.token_balance - tokensUsed;
      const { error: balanceError } = await supabase
        .from('User')
        .update({
          token_balance: newBalance,
          updateAt: new Date().toISOString(),
        })
        .eq('id', userId);

      if (balanceError) {
        // Rollback: delete the token usage record if balance update fails
        await supabase.from('TokenUsage').delete().eq('id', tokenUsage.id);

        return { success: false, error: 'Failed to update token balance' };
      }

      return {
        success: true,
        remaining_balance: newBalance,
      };
    } catch (error) {
      console.error('Error recording token usage:', error);
      return { success: false, error: 'Failed to record token usage' };
    }
  }

  // Get monthly usage summary for a user
  static async getMonthlyUsage(userId: string, month?: Date): Promise<MonthlyUsageSummary | null> {
    try {
      const targetMonth = month || new Date();
      const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase.from('TokenUsage').select('action, tokens_used, total_cost').eq('userId', userId).gte('createdAt', startOfMonth.toISOString()).lte('createdAt', endOfMonth.toISOString());

      if (error) throw error;

      // Aggregate the data
      const totalTokens = data?.reduce((sum, item) => sum + item.tokens_used, 0) || 0;
      const totalCost = data?.reduce((sum, item) => sum + parseFloat(item.total_cost), 0) || 0;

      const usageByAction: { [key: string]: any } = {};
      data?.forEach((item) => {
        if (!usageByAction[item.action]) {
          usageByAction[item.action] = { tokens: 0, cost: 0, count: 0 };
        }
        usageByAction[item.action].tokens += item.tokens_used;
        usageByAction[item.action].cost += parseFloat(item.total_cost);
        usageByAction[item.action].count += 1;
      });

      return {
        total_tokens: totalTokens,
        total_cost: totalCost,
        usage_by_action: usageByAction,
      };
    } catch (error) {
      console.error('Error fetching monthly usage:', error);
      return null;
    }
  }

  // Get all users with their billing information for admin dashboard
  static async getAllUsersBilling(): Promise<UserBillingAnalytics[]> {
    try {
      const { data: users, error: usersError } = await supabase.from('User').select('*').eq('role', 'USER').order('createdAt', { ascending: false });

      if (usersError) throw usersError;

      const userAnalytics = await Promise.all(
        (users || []).map(async (user) => {
          const currentMonthUsage = await this.getMonthlyUsage(user.id);

          const { data: billingHistory } = await supabase.from('BillingHistory').select('*').eq('userId', user.id).order('billing_period', { ascending: false }).limit(12);

          const { data: recentTokenUsage } = await supabase.from('TokenUsage').select('*').eq('userId', user.id).order('createdAt', { ascending: false }).limit(20);

          // Get usage trend for last 30 days
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const { data: trendData } = await supabase.from('TokenUsage').select('createdAt, tokens_used, total_cost').eq('userId', user.id).gte('createdAt', thirtyDaysAgo.toISOString()).order('createdAt');

          // Aggregate trend data by day
          const usageTrend = this.aggregateUsageByDay(trendData || []);

          // Generate tier recommendation
          const tierRecommendation = this.generateTierRecommendation(user as UserWithBilling, currentMonthUsage);

          return {
            user: user as UserWithBilling,
            currentMonthUsage: currentMonthUsage || {
              total_tokens: 0,
              total_cost: 0,
              usage_by_action: {},
            },
            billingHistory: billingHistory || [],
            recentTokenUsage: recentTokenUsage || [],
            usageTrend,
            tierRecommendation,
          };
        }),
      );

      return userAnalytics;
    } catch (error) {
      console.error('Error fetching users billing data:', error);
      return [];
    }
  }

  // Get billing statistics for admin dashboard
  static async getBillingStats(): Promise<BillingStats> {
    try {
      const currentMonth = new Date();

      // Get total users
      const { count: totalUsers } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'USER');

      // Get current month revenue
      const { data: currentMonthBilling } = await supabase.from('BillingHistory').select('total_cost, tier').gte('billing_period', new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString()).eq('payment_status', 'paid');

      const monthlyRevenue = currentMonthBilling?.reduce((sum, item) => sum + parseFloat(item.total_cost), 0) || 0;

      // Get total revenue (all time)
      const { data: allTimeBilling } = await supabase.from('BillingHistory').select('total_cost').eq('payment_status', 'paid');

      const totalRevenue = allTimeBilling?.reduce((sum, item) => sum + parseFloat(item.total_cost), 0) || 0;

      // Get top spending users this month
      const usersBilling = await this.getAllUsersBilling();
      const topSpendingUsers = usersBilling
        .map((item) => ({
          user: item.user,
          monthly_cost: item.currentMonthUsage.total_cost,
          tokens_used: item.currentMonthUsage.total_tokens,
        }))
        .sort((a, b) => b.monthly_cost - a.monthly_cost)
        .slice(0, 10);

      // Calculate revenue by tier
      const revenueByTier = currentMonthBilling?.reduce(
        (acc, item) => {
          acc[item.tier as keyof typeof acc] = (acc[item.tier as keyof typeof acc] || 0) + parseFloat(item.total_cost);
          return acc;
        },
        { basic: 0, pro: 0, enterprise: 0 },
      ) || { basic: 0, pro: 0, enterprise: 0 };

      // Calculate average tokens per user
      const averageTokensPerUser = usersBilling.length > 0 ? usersBilling.reduce((sum, item) => sum + item.currentMonthUsage.total_tokens, 0) / usersBilling.length : 0;

      return {
        totalUsers: totalUsers || 0,
        totalRevenue,
        monthlyRevenue,
        averageTokensPerUser,
        topSpendingUsers,
        revenueByTier,
        usageGrowth: {
          current_month: monthlyRevenue,
          previous_month: 0,
          growth_rate: 0,
        },
      };
    } catch (error) {
      console.error('Error fetching billing stats:', error);
      return {
        totalUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageTokensPerUser: 0,
        topSpendingUsers: [],
        revenueByTier: { basic: 0, pro: 0, enterprise: 0 },
        usageGrowth: { current_month: 0, previous_month: 0, growth_rate: 0 },
      };
    }
  }

  // Helper function to aggregate usage by day
  private static aggregateUsageByDay(trendData: any[]) {
    const dailyUsage: { [key: string]: { tokens: number; cost: number } } = {};

    trendData.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      if (!dailyUsage[date]) {
        dailyUsage[date] = { tokens: 0, cost: 0 };
      }
      dailyUsage[date].tokens += item.tokens_used;
      dailyUsage[date].cost += parseFloat(item.total_cost);
    });

    return Object.entries(dailyUsage)
      .map(([date, usage]) => ({
        date,
        tokens: usage.tokens,
        cost: usage.cost,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Helper function to generate tier recommendation
  private static generateTierRecommendation(user: UserWithBilling, monthlyUsage: MonthlyUsageSummary | null) {
    if (!monthlyUsage) return undefined;

    const currentUsage = monthlyUsage.total_tokens;
    const currentLimit = user.monthly_token_limit || 1000;
    const usagePercent = (currentUsage / currentLimit) * 100;

    if (user.tier === 'basic' && usagePercent > 80) {
      return {
        recommended_tier: 'pro',
        potential_savings: 0,
        reason: 'You are using 80%+ of your token limit. Upgrade to Pro for more tokens and lower cost per token.',
      };
    }

    if (user.tier === 'pro' && usagePercent < 20) {
      return {
        recommended_tier: 'basic',
        potential_savings: 29.99,
        reason: 'You are using less than 20% of your token limit. Downgrade to Basic to save money.',
      };
    }

    return undefined;
  }

  // Top up user token balance
  static async topUpTokens(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Fetch current token balance
      const { data: user, error: userError } = await supabase
        .from('User')
        .select('token_balance')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { success: false, error: 'User not found' };
      }

      const newBalance = (user.token_balance || 0) + amount;

      const { error } = await supabase
        .from('User')
        .update({
          token_balance: newBalance,
          updateAt: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error topping up tokens:', error);
      return { success: false, error: 'Failed to top up tokens' };
    }
  }

  // Update user tier
  static async updateUserTier(userId: string, newTier: 'basic' | 'pro' | 'enterprise'): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the subscription plan details
      const { data: plan, error: planError } = await supabase.from('SubscriptionPlan').select('monthly_token_limit').eq('name', newTier).single();

      if (planError || !plan) {
        return { success: false, error: 'Invalid subscription plan' };
      }

      // Update user tier and token limit
      const { error } = await supabase
        .from('User')
        .update({
          tier: newTier,
          monthly_token_limit: plan.monthly_token_limit,
          updateAt: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating user tier:', error);
      return { success: false, error: 'Failed to update user tier' };
    }
  }
}
