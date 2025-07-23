// src/hooks/use-billing.ts
import { useState, useEffect } from 'react';
import { BillingService } from '@/lib/services/billing-service';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/providers/auth-provider';

// FIXED: Extended user interface to include billing fields
interface UserWithBilling {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  token_balance?: number;
  monthly_token_limit?: number;
  tier?: 'basic' | 'pro' | 'enterprise';
}

export function useBilling() {
  const { user } = useAuth();
  const [userWithBilling, setUserWithBilling] = useState<UserWithBilling | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Fetch full user data with billing info on mount
  useEffect(() => {
    const fetchUserBillingData = async () => {
      if (!user?.id) return;

      try {
        // Fetch user data with billing fields from database
        const response = await fetch(`/api/users/${user.id}/billing`);
        if (response.ok) {
          const billingData = await response.json();
          setUserWithBilling(billingData);
        } else {
          // Fallback: use basic user data with defaults
          setUserWithBilling({
            id: user.id,
            name: user.name,
            email: user.email,
            token_balance: 0,
            monthly_token_limit: 1000,
            tier: 'basic',
          });
        }
      } catch (error) {
        console.error('Error fetching user billing data:', error);
        // Fallback to defaults
        setUserWithBilling({
          id: user.id,
          name: user.name,
          email: user.email,
          token_balance: 0,
          monthly_token_limit: 1000,
          tier: 'basic',
        });
      }
    };

    fetchUserBillingData();
  }, [user?.id, user?.name, user?.email]);

  const recordTokenUsage = async (action: string, tokensUsed: number, context?: string, metadata?: any) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsRecording(true);
    try {
      const result = await BillingService.recordTokenUsage(user.id, action, tokensUsed, context, metadata);

      if (!result.success) {
        notifications.show({
          title: 'Token Usage Error',
          message: result.error || 'Failed to record token usage',
          color: 'red',
        });
        throw new Error(result.error);
      }

      // Update local user billing data
      if (result.remaining_balance !== undefined && userWithBilling) {
        setUserWithBilling({
          ...userWithBilling,
          token_balance: result.remaining_balance,
        });
      }

      // Check for low balance warning
      if (result.remaining_balance !== undefined && result.remaining_balance < 100) {
        notifications.show({
          title: 'Low Token Balance',
          message: `Only ${result.remaining_balance} tokens remaining. Consider upgrading your plan.`,
          color: 'orange',
          autoClose: false,
        });
      }

      return result;
    } finally {
      setIsRecording(false);
    }
  };

  const checkBalance = async () => {
    if (!user?.id) return false;

    try {
      // Refresh user balance from server
      const response = await fetch(`/api/billing/token-usage?userId=${user.id}`);
      const data = await response.json();

      const currentBalance = data.user?.token_balance || 0;

      // Update local state
      if (userWithBilling) {
        setUserWithBilling({
          ...userWithBilling,
          token_balance: currentBalance,
        });
      }

      return currentBalance;
    } catch (error) {
      console.error('Error checking balance:', error);
      return userWithBilling?.token_balance || 0;
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/billing`);
      if (response.ok) {
        const billingData = await response.json();
        setUserWithBilling(billingData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return {
    recordTokenUsage,
    checkBalance,
    refreshUserData,
    isRecording,
    // FIXED: Use userWithBilling instead of directly accessing user properties
    currentBalance: userWithBilling?.token_balance || 0,
    monthlyLimit: userWithBilling?.monthly_token_limit || 1000,
    tier: userWithBilling?.tier || 'basic',
    userWithBilling,
  };
}
