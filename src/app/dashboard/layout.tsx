'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '@mantine/core';
import { useAuth } from '@/providers/auth-provider';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function DashboardLayoutPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
