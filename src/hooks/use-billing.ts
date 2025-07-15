// src/hooks/use-billing.ts
import { useState, useEffect } from 'react';
import { BillingService } from '@/lib/services/billing-service';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/providers/auth-provider';

export function useBilling() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);

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

    // Refresh user balance from server
    const response = await fetch(`/api/billing/token-usage?userId=${user.id}`);
    const data = await response.json();

    return data.user?.token_balance || 0;
  };

  return {
    recordTokenUsage,
    checkBalance,
    isRecording,
    currentBalance: user?.token_balance || 0,
    monthlyLimit: user?.monthly_token_limit || 1000,
    tier: user?.tier || 'basic',
  };
}
