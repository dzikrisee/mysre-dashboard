// src/lib/types/billing.ts
export interface TokenUsage {
  id: string;
  userId: string;
  action: string;
  tokens_used: number;
  cost_per_token: number;
  total_cost: number;
  context?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface BillingHistory {
  id: string;
  userId: string;
  billing_period: string;
  tokens_used: number;
  total_cost: number;
  tier: 'basic' | 'pro' | 'enterprise';
  payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: string;
  invoice_number?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  monthly_token_limit: number;
  cost_per_token: number;
  monthly_fee: number;
  features: string[];
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ADDED: Missing User interface definition
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nim?: string;
  group?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserWithBilling extends User {
  tier?: 'basic' | 'pro' | 'enterprise';
  token_balance?: number;
  monthly_token_limit?: number;
}

export interface MonthlyUsageSummary {
  total_tokens: number;
  total_cost: number;
  usage_by_action: {
    [action: string]: {
      tokens: number;
      cost: number;
      count: number;
    };
  };
}

export interface BillingStats {
  totalUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageTokensPerUser: number;
  topSpendingUsers: Array<{
    user: UserWithBilling;
    monthly_cost: number;
    tokens_used: number;
  }>;
  revenueByTier: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  usageGrowth: {
    current_month: number;
    previous_month: number;
    growth_rate: number;
  };
}

export interface UserBillingAnalytics {
  user: UserWithBilling;
  currentMonthUsage: MonthlyUsageSummary;
  billingHistory: BillingHistory[];
  recentTokenUsage: TokenUsage[];
  usageTrend: {
    date: string;
    tokens: number;
    cost: number;
  }[];
  tierRecommendation?: {
    recommended_tier: string;
    potential_savings: number;
    reason: string;
  };
}
