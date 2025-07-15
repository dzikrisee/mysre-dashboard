'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, Text, Group, Avatar, Stack, Badge, ActionIcon, Title, SimpleGrid, Progress, RingProgress, Center, ThemeIcon, Box } from '@mantine/core';
import { IconUsers, IconUserPlus, IconUserCheck, IconTrendingUp, IconEye, IconArrowUpRight, IconArrowDownRight, IconSchool, IconId, IconFileText, IconCalendar, IconBrain, IconPencil, IconReportAnalytics } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

// Define User and Article interfaces locally if not exported from supabase
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  group?: string;
  nim?: string;
  avatar_url?: string;
  createdAt?: string;
}

interface Article {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  author?: User;
}
import { useAuth } from '@/providers/auth-provider';
import { usePageAnalytics } from '@/hooks/use-analytics';
import { AnalyticsService } from '@/lib/analytics';

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
  totalGroupA: number;
  totalGroupB: number;
  totalArticles: number;
  adminArticles: number;
  studentArticles: number;
  recentUsers: User[];
  recentArticles: Article[];
  userGrowth: number;

  // New analytics stats
  totalBrainProjects: number;
  totalDrafts: number;
  avgProductivityScore: number;
  highEngagementUsers: number;
  activitiesLast24h: number;
}

export default function DashboardPage() {
  // Auto-track page analytics
  usePageAnalytics('dashboard-home');

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalStudents: 0,
    totalGroupA: 0,
    totalGroupB: 0,
    totalArticles: 0,
    adminArticles: 0,
    studentArticles: 0,
    recentUsers: [],
    recentArticles: [],
    userGrowth: 0,
    totalBrainProjects: 0,
    totalDrafts: 0,
    avgProductivityScore: 0,
    highEngagementUsers: 0,
    activitiesLast24h: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Original stats queries...
      const { count: totalUsers } = await supabase.from('User').select('*', { count: 'exact', head: true });
      const { count: totalAdmins } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'ADMIN');
      const { count: totalStudents } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'USER');

      // Group counts
      const { count: totalGroupA } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('group', 'A');
      const { count: totalGroupB } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('group', 'B');

      // Articles
      const { count: totalArticles } = await supabase.from('Article').select('*', { count: 'exact', head: true });

      // Recent users
      const { data: recentUsers } = await supabase.from('User').select('*').order('createdAt', { ascending: false }).limit(5);

      const { data: recentArticles } = await supabase
        .from('Article')
        .select(
          `
          *,
          author:User!Article_userId_fkey(id, name, email, role, group, nim)
        `,
        )
        .order('createdAt', { ascending: false })
        .limit(5);

      // NEW: Analytics-based stats
      const userGrowth = Math.floor(Math.random() * 20) + 5; // Mock for now

      // Get learning analytics summary
      const analyticsData = await AnalyticsService.getAllUsersAnalyticsSummary();

      const totalBrainProjects = analyticsData.reduce((sum, item) => sum + item.analytics.brainStats.totalProjects, 0);
      const totalDrafts = analyticsData.reduce((sum, item) => sum + item.analytics.writerStats.totalDrafts, 0);
      const avgProductivityScore = analyticsData.length > 0 ? analyticsData.reduce((sum, item) => sum + item.analytics.overallStats.productivityScore, 0) / analyticsData.length : 0;
      const highEngagementUsers = analyticsData.filter((item) => item.analytics.overallStats.engagementLevel === 'high').length;

      // Get activities last 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { count: activitiesLast24h } = await supabase.from('analytics').select('*', { count: 'exact', head: true }).gte('timestamp', yesterday.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalStudents: totalStudents || 0,
        totalGroupA: totalGroupA || 0,
        totalGroupB: totalGroupB || 0,
        totalArticles: totalArticles || 0,
        adminArticles: 0, // Calculate if needed
        studentArticles: 0, // Calculate if needed
        recentUsers: recentUsers || [],
        recentArticles: recentArticles || [],
        userGrowth,
        totalBrainProjects,
        totalDrafts,
        avgProductivityScore,
        highEngagementUsers,
        activitiesLast24h: activitiesLast24h || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: IconUsers,
      color: 'blue',
      growth: stats.userGrowth,
      positive: true,
    },
    {
      title: 'Learning Analytics',
      value: `${stats.avgProductivityScore.toFixed(0)}%`,
      icon: IconReportAnalytics,
      color: 'violet',
      growth: 8.5,
      positive: true,
      subtitle: 'Avg Productivity',
    },
    {
      title: 'Brain Projects',
      value: stats.totalBrainProjects,
      icon: IconBrain,
      color: 'indigo',
      growth: 15,
      positive: true,
      subtitle: 'Total Created',
    },
    {
      title: 'Writing Drafts',
      value: stats.totalDrafts,
      icon: IconPencil,
      color: 'green',
      growth: 12,
      positive: true,
      subtitle: 'Total Drafts',
    },
    {
      title: 'High Performers',
      value: stats.highEngagementUsers,
      icon: IconTrendingUp,
      color: 'orange',
      growth: 5,
      positive: true,
      subtitle: `${stats.totalStudents > 0 ? ((stats.highEngagementUsers / stats.totalStudents) * 100).toFixed(1) : 0}% of students`,
    },
    {
      title: 'Activities (24h)',
      value: stats.activitiesLast24h,
      icon: IconUsers,
      color: 'cyan',
      growth: 22,
      positive: true,
      subtitle: 'User Interactions',
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Dashboard MySRE</Title>
          <Text c="gray.6">Selamat datang kembali, {user?.name}!</Text>
          <Text size="sm" c="gray.5" mt="xs">
            Learning Behaviour Analytics Dashboard - Monitor student progress dan engagement
          </Text>
        </div>
        <Group>
          <Badge size="lg" variant="light" color="blue">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
          </Badge>
          <Badge size="lg" variant="gradient" gradient={{ from: 'violet', to: 'cyan' }}>
            Analytics Enabled
          </Badge>
        </Group>
      </Group>

      {/* Enhanced Stats Cards dengan Analytics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {statCards.map((stat, index) => (
          <Card key={index} withBorder shadow="sm" radius="md" p="lg" style={{ position: 'relative', overflow: 'hidden' }}>
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                  {stat.title}
                </Text>
                <Text fw={700} size="xl">
                  {stat.value}
                </Text>
                {stat.subtitle && (
                  <Text size="xs" c="gray.6" mt="xs">
                    {stat.subtitle}
                  </Text>
                )}
              </div>
              <ThemeIcon color={stat.color} variant="light" size="xl" radius="md">
                <stat.icon size={28} />
              </ThemeIcon>
            </Group>
            <Group justify="space-between" mt="md">
              <Text c="gray.6" size="sm">
                {stat.positive ? 'Meningkat' : 'Menurun'}
              </Text>
              <Group gap={4}>
                {stat.positive ? <IconArrowUpRight size={16} color="var(--mantine-color-green-6)" /> : <IconArrowDownRight size={16} color="var(--mantine-color-red-6)" />}
                <Text c={stat.positive ? 'green' : 'red'} size="sm" fw={500}>
                  {stat.growth}%
                </Text>
              </Group>
            </Group>

            {/* Progress bar untuk analytics cards */}
            {stat.title.includes('Analytics') && <Progress value={stats.avgProductivityScore} size="xs" mt="sm" color={stats.avgProductivityScore > 75 ? 'green' : stats.avgProductivityScore > 50 ? 'yellow' : 'red'} />}
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Analytics Overview */}
      <Card withBorder shadow="md" radius="lg" p="xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={600} mb="sm">
              Learning Behaviour Insights
            </Text>
            <SimpleGrid cols={3} spacing="xl">
              <div>
                <Text size="sm" opacity={0.9}>
                  Avg. Brain Projects per Student
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStudents > 0 ? (stats.totalBrainProjects / stats.totalStudents).toFixed(1) : '0'}
                </Text>
              </div>
              <div>
                <Text size="sm" opacity={0.9}>
                  Avg. Drafts per Student
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStudents > 0 ? (stats.totalDrafts / stats.totalStudents).toFixed(1) : '0'}
                </Text>
              </div>
              <div>
                <Text size="sm" opacity={0.9}>
                  Engagement Rate
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStudents > 0 ? ((stats.highEngagementUsers / stats.totalStudents) * 100).toFixed(1) : '0'}%
                </Text>
              </div>
            </SimpleGrid>
          </div>
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: stats.avgProductivityScore, color: 'white' }]}
            label={
              <Center>
                <Text size="sm" fw={700} ta="center">
                  {stats.avgProductivityScore.toFixed(0)}%
                  <br />
                  <Text size="xs" opacity={0.8}>
                    Productivity
                  </Text>
                </Text>
              </Center>
            }
          />
        </Group>
      </Card>

      {/* Enhanced Recent Activity dengan Analytics Context */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Pengguna Terbaru</Title>
              <Group>
                <Badge size="sm" variant="light" color="blue">
                  {stats.totalStudents} Students
                </Badge>
                <ActionIcon variant="subtle" color="gray">
                  <IconEye size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Stack gap="md">
              {stats.recentUsers.map((recentUser) => (
                <Group key={recentUser.id} justify="space-between">
                  <Group>
                    <Avatar src={recentUser.avatar_url} alt={recentUser.name} size="sm" color="blue">
                      {recentUser.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {recentUser.name}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {recentUser.email}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge color={recentUser.role === 'ADMIN' ? 'red' : 'blue'} variant="light" size="sm">
                      {recentUser.role === 'ADMIN' ? 'Admin' : 'Student'}
                    </Badge>
                    {recentUser.group && (
                      <Badge color={recentUser.group === 'A' ? 'teal' : 'orange'} variant="outline" size="sm">
                        {recentUser.group}
                      </Badge>
                    )}
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Artikel Terbaru</Title>
              <Group>
                <Badge size="sm" variant="light" color="green">
                  {stats.totalArticles} Total
                </Badge>
                <ActionIcon variant="subtle" color="gray">
                  <IconEye size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Stack gap="md">
              {stats.recentArticles.map((article) => (
                <Group key={article.id} justify="space-between">
                  <Group>
                    <ThemeIcon color="red" variant="light" size="sm">
                      <IconFileText size={16} />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {article.title}
                      </Text>
                      <Text size="xs" c="gray.6">
                        by {article.author?.name || 'Unknown'}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge color={article.author?.role === 'ADMIN' ? 'red' : 'blue'} variant="light" size="sm">
                      {article.author?.role === 'ADMIN' ? 'Admin' : 'Student'}
                    </Badge>
                    <Text size="xs" c="gray.5">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
