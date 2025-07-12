// =====================================
// FILE: src/hooks/use-analytics.ts
// ACTION: CREATE new file
// =====================================

import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { AnalyticsTracker } from '@/lib/analytics-tracker';

export function usePageAnalytics(pageName: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const startTime = Date.now();

      // Track page view
      AnalyticsTracker.trackPageView(user.id, pageName);

      // Track time spent on page when component unmounts
      return () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        AnalyticsTracker.trackPageView(user.id, pageName, timeSpent);
      };
    }
  }, [user?.id, pageName]);
}

export function useFeatureAnalytics() {
  const { user } = useAuth();

  const trackFeature = (featureName: string, context?: any) => {
    if (user?.id) {
      AnalyticsTracker.trackFeatureUsage(user.id, featureName, context);
    }
  };

  const trackError = (errorType: string, errorMessage: string, context?: any) => {
    if (user?.id) {
      AnalyticsTracker.trackError(user.id, errorType, errorMessage, context);
    }
  };

  return { trackFeature, trackError };
}
