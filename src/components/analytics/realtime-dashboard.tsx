'use client';

import { useEffect, useState } from 'react';
import { Card, Group, Text, Badge, Stack, SimpleGrid, ThemeIcon, Progress, Timeline, Box, ActionIcon, Tooltip } from '@mantine/core';
import { IconUsers, IconTrendingUp, IconClock, IconActivity, IconBrain, IconPencil, IconRefresh, IconEye } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

interface RealtimeActivity {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userGroup: string;
  timestamp: string;
  metadata?: any;
}

interface RealtimeStats {
  activeUsers: number;
  activitiesLastHour: number;
  brainActivitiesLast24h: number;
  writerActivitiesLast24h: number;
  recentActivities: RealtimeActivity[];
}

export function RealtimeDashboard() {
  const [stats, setStats] = useState<RealtimeStats>({
    activeUsers: 0,
    activitiesLastHour: 0,
    brainActivitiesLast24h: 0,
    writerActivitiesLast24h: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealtimeStats();

    // Set up real-time subscription
    const subscription = supabase
      .channel('analytics_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics',
        },
        (payload) => {
          handleRealtimeUpdate(payload.new);
        },
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(loadRealtimeStats, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadRealtimeStats = async () => {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get activities last hour
      const { count: activitiesLastHour } = await supabase.from('analytics').select('*', { count: 'exact', head: true }).gte('timestamp', oneHourAgo.toISOString());

      // Get brain activities last 24h
      const { count: brainActivitiesLast24h } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .in('action', ['node_click', 'edge_click', 'chat_query', 'session_created'])
        .gte('timestamp', oneDayAgo.toISOString());

      // Get writer activities last 24h
      const { count: writerActivitiesLast24h } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .in('action', ['draft_created', 'draft_saved', 'annotation_created', 'ai_assistance_used'])
        .gte('timestamp', oneDayAgo.toISOString());

      // Get recent activities with user info
      const { data: recentActivities } = await supabase
        .from('analytics')
        .select(
          `
          *,
          User!analytics_userId_fkey(name, group)
        `,
        )
        .order('timestamp', { ascending: false })
        .limit(10);

      // Count unique active users in last hour
      const { data: activeUsersData } = await supabase.from('analytics').select('userId').gte('timestamp', oneHourAgo.toISOString());

      const uniqueActiveUsers = new Set(activeUsersData?.map((item) => item.userId) || []).size;

      setStats({
        activeUsers: uniqueActiveUsers,
        activitiesLastHour: activitiesLastHour || 0,
        brainActivitiesLast24h: brainActivitiesLast24h || 0,
        writerActivitiesLast24h: writerActivitiesLast24h || 0,
        recentActivities:
          recentActivities?.map((activity) => ({
            id: activity.id,
            action: activity.action,
            userId: activity.userId || '',
            userName: activity.User?.name || 'Unknown User',
            userGroup: activity.User?.group || '',
            timestamp: activity.timestamp,
            metadata: activity.metadata,
          })) || [],
      });
    } catch (error) {
      console.error('Error loading realtime stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeUpdate = (newActivity: any) => {
    // Update stats when new activity comes in
    setStats((prev) => ({
      ...prev,
      activitiesLastHour: prev.activitiesLastHour + 1,
      recentActivities: [
        {
          id: newActivity.id,
          action: newActivity.action,
          userId: newActivity.userId || '',
          userName: 'New User', // Will be updated on next refresh
          userGroup: '',
          timestamp: newActivity.timestamp,
          metadata: newActivity.metadata,
        },
        ...prev.recentActivities.slice(0, 9),
      ],
    }));
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('brain') || action.includes('node') || action.includes('edge') || action.includes('chat')) {
      return <IconBrain size={16} color="var(--mantine-color-violet-6)" />;
    }
    if (action.includes('draft') || action.includes('annotation') || action.includes('ai_assistance')) {
      return <IconPencil size={16} color="var(--mantine-color-green-6)" />;
    }
    return <IconActivity size={16} color="var(--mantine-color-blue-6)" />;
  };

  const getActivityDescription = (activity: RealtimeActivity) => {
    switch (activity.action) {
      case 'node_click':
        return 'clicked on a node';
      case 'edge_click':
        return 'explored a relationship';
      case 'chat_query':
        return 'asked AI a question';
      case 'session_created':
        return 'started a new brainstorming session';
      case 'draft_created':
        return 'created a new draft';
      case 'draft_saved':
        return 'saved draft progress';
      case 'annotation_created':
        return 'added an annotation';
      case 'ai_assistance_used':
        return 'used AI writing assistance';
      case 'login':
        return 'logged into the system';
      case 'logout':
        return 'logged out';
      default:
        return activity.action.replace('_', ' ');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="lg" fw={600}>
            Real-time Activity Dashboard
          </Text>
          <Text size="sm" c="gray.6">
            Live monitoring of student learning activities
          </Text>
        </div>
        <Group>
          <Tooltip label="Refresh data">
            <ActionIcon variant="light" onClick={loadRealtimeStats} loading={loading}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Badge color="green" variant="light" leftSection={<IconActivity size={12} />}>
            Live
          </Badge>
        </Group>
      </Group>

      {/* Real-time Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        <Card withBorder p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Active Users
              </Text>
              <Text fw={700} size="xl">
                {stats.activeUsers}
              </Text>
              <Text size="xs" c="gray.6">
                Last hour
              </Text>
            </div>
            <ThemeIcon color="blue" variant="light" size="xl">
              <IconUsers size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Total Activities
              </Text>
              <Text fw={700} size="xl">
                {stats.activitiesLastHour}
              </Text>
              <Text size="xs" c="gray.6">
                Last hour
              </Text>
            </div>
            <ThemeIcon color="orange" variant="light" size="xl">
              <IconTrendingUp size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Brain Activities
              </Text>
              <Text fw={700} size="xl">
                {stats.brainActivitiesLast24h}
              </Text>
              <Text size="xs" c="gray.6">
                Last 24 hours
              </Text>
            </div>
            <ThemeIcon color="violet" variant="light" size="xl">
              <IconBrain size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Writer Activities
              </Text>
              <Text fw={700} size="xl">
                {stats.writerActivitiesLast24h}
              </Text>
              <Text size="xs" c="gray.6">
                Last 24 hours
              </Text>
            </div>
            <ThemeIcon color="green" variant="light" size="xl">
              <IconPencil size={24} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Activity Breakdown */}
      <Card withBorder p="lg">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Module Usage Distribution (24h)</Text>
          <Badge variant="light">Live Data</Badge>
        </Group>

        <SimpleGrid cols={2} spacing="md">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Brain Module</Text>
              <Text size="sm" fw={500}>
                {stats.brainActivitiesLast24h} activities
              </Text>
            </Group>
            <Progress value={(stats.brainActivitiesLast24h / (stats.brainActivitiesLast24h + stats.writerActivitiesLast24h)) * 100} color="violet" size="lg" />
          </Box>

          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Writer Module</Text>
              <Text size="sm" fw={500}>
                {stats.writerActivitiesLast24h} activities
              </Text>
            </Group>
            <Progress value={(stats.writerActivitiesLast24h / (stats.brainActivitiesLast24h + stats.writerActivitiesLast24h)) * 100} color="green" size="lg" />
          </Box>
        </SimpleGrid>
      </Card>

      {/* Recent Activities Timeline */}
      <Card withBorder p="lg">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Recent Activities</Text>
          <Badge variant="light">{stats.recentActivities.length} recent</Badge>
        </Group>

        <Timeline active={stats.recentActivities.length} bulletSize={20} lineWidth={2}>
          {stats.recentActivities.map((activity, index) => (
            <Timeline.Item
              key={activity.id}
              bullet={getActivityIcon(activity.action)}
              title={
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {activity.userName}
                  </Text>
                  {activity.userGroup && (
                    <Badge size="xs" color={activity.userGroup === 'A' ? 'blue' : 'green'}>
                      {activity.userGroup}
                    </Badge>
                  )}
                </Group>
              }
            >
              <Text size="xs" c="gray.6" mb={4}>
                {getActivityDescription(activity)}
              </Text>
              <Text size="xs" c="gray.5">
                {formatTimeAgo(activity.timestamp)}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>

        {stats.recentActivities.length === 0 && (
          <Text size="sm" c="gray.5" ta="center" py="xl">
            No recent activities to display
          </Text>
        )}
      </Card>
    </Stack>
  );
}
