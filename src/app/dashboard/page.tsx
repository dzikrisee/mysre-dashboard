'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, Text, Group, Avatar, Stack, Badge, ActionIcon, Title, SimpleGrid, Progress, RingProgress, Center, ThemeIcon, Box, Loader, Paper } from '@mantine/core';
import {
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconTrendingUp,
  IconEye,
  IconArrowUpRight,
  IconArrowDownRight,
  IconSchool,
  IconId,
  IconFileText,
  IconCalendar,
  IconBrain,
  IconPencil,
  IconReportAnalytics,
  IconBulb,
  IconClipboardList,
} from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { usePageAnalytics } from '@/hooks/use-analytics';
import { AnalyticsService } from '@/lib/analytics';

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
  author?: { name: string; id?: string; email?: string; role?: string }; // FIXED: Made optional properties
}

interface Assignment {
  id: string;
  title: string;
  week_number: number;
  is_active: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
  totalGroupA: number;
  totalGroupB: number;
  totalArticles: number;
  totalAssignments: number;
  activeAssignments: number;
  adminArticles: number;
  studentArticles: number;
  recentUsers: User[];
  recentArticles: Article[];
  userGrowth: number;
  totalBrainProjects: number;
  totalDrafts: number;
  avgProductivityScore: number;
  highEngagementUsers: number;
  activitiesLast24h: number;
  weeklyAssignments: Array<{ week: string; count: number }>;
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
    totalAssignments: 0,
    activeAssignments: 0,
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
    weeklyAssignments: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Users data - FIXED: menggunakan field yang benar sesuai schema User table
      const { data: users, error: usersError } = await supabase.from('User').select('id, name, email, role, "group", nim, avatar_url, "createdAt", "updated_at"');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Articles data dengan author info
      const { data: articles, error: articlesError } = await supabase.from('Article').select(`
        id,
        title,
        userId,
        createdAt
      `);

      if (articlesError) {
        console.error('Error fetching articles:', articlesError);
      }

      // Fetch author info untuk setiap artikel
      const articlesWithAuthors = await Promise.all(
        (articles || []).map(async (article) => {
          if (article.userId) {
            const { data: userData } = await supabase.from('User').select('id, name, email, role').eq('id', article.userId).single();

            return { ...article, author: userData || { name: 'Unknown User' } };
          }
          return { ...article, author: { name: 'Unknown User' } };
        }),
      );

      // Assignments data - BARU: tambahkan query assignment
      const { data: assignments, error: assignmentsError } = await supabase.from('Assignment').select('id, title, week_number, is_active, "createdAt"');

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
      }

      // Users count by role - SESUAI SCHEMA: role values USER/ADMIN
      const totalUsers = users?.length || 0;
      const totalAdmins = users?.filter((u) => u.role === 'ADMIN').length || 0;
      const totalStudents = users?.filter((u) => u.role === 'USER').length || 0;
      const totalGroupA = users?.filter((u) => u.group === 'A').length || 0;
      const totalGroupB = users?.filter((u) => u.group === 'B').length || 0;

      const totalArticles = articles?.length || 0;
      const totalAssignments = assignments?.length || 0;
      const activeAssignments = assignments?.filter((a) => a.is_active).length || 0;

      // Recent users (last 5)
      const recentUsers = users
        ?.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5)
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          group: u.group,
          nim: u.nim,
          avatar_url: u.avatar_url,
          createdAt: u.createdAt,
        }));

      // Recent articles (last 5) dengan author info
      const recentArticles: Article[] = articlesWithAuthors.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).slice(0, 5);

      // Calculate user growth (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentUsersCount = users?.filter((u) => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo).length;
      const prevUsersCount = users?.filter((u) => u.createdAt && new Date(u.createdAt) >= sixtyDaysAgo && new Date(u.createdAt) < thirtyDaysAgo).length;

      // Safe calculations to avoid NaN
      const safePrevCount = prevUsersCount ?? 0;
      const safeRecentCount = recentUsersCount ?? 0;
      const userGrowth = safePrevCount > 0 ? ((safeRecentCount - safePrevCount) / safePrevCount) * 100 : 0;

      // Generate weekly assignment data for visual display
      const weeklyAssignments = generateWeeklyAssignmentData(assignments || []);

      // Enhanced analytics
      let analyticsData = {
        totalBrainProjects: 0,
        totalDrafts: 0,
        avgProductivityScore: 75,
        highEngagementUsers: 0,
        activitiesLast24h: 0,
      };

      try {
        const analytics = await AnalyticsService.getAllUsersAnalyticsSummary();
        const totalAnalytics = analytics.reduce(
          (acc, item) => {
            acc.totalBrainProjects += item.analytics.brainStats.totalProjects;
            acc.totalDrafts += item.analytics.writerStats.totalDrafts;
            acc.avgProductivityScore += item.analytics.overallStats.productivityScore;
            if (item.analytics.overallStats.engagementLevel === 'high') {
              acc.highEngagementUsers++;
            }
            acc.activitiesLast24h += item.analytics.overallStats.recentActivity;
            return acc;
          },
          { totalBrainProjects: 0, totalDrafts: 0, avgProductivityScore: 0, highEngagementUsers: 0, activitiesLast24h: 0 },
        );

        if (analytics.length > 0) {
          totalAnalytics.avgProductivityScore = totalAnalytics.avgProductivityScore / analytics.length;
        }

        analyticsData = totalAnalytics;
      } catch (analyticsError) {
        console.log('Analytics not available, using mock data');
      }

      setStats({
        totalUsers: totalUsers,
        totalAdmins: totalAdmins,
        totalStudents: totalStudents,
        totalGroupA: totalGroupA,
        totalGroupB: totalGroupB,
        totalArticles: totalArticles,
        totalAssignments: totalAssignments,
        activeAssignments: activeAssignments,
        adminArticles: 0,
        studentArticles: 0,
        recentUsers: recentUsers || [],
        recentArticles: recentArticles,
        userGrowth,
        weeklyAssignments,
        ...analyticsData,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk generate weekly assignment data
  const generateWeeklyAssignmentData = (assignments: any[]) => {
    const weekData: { [key: number]: number } = {};
    assignments.forEach((assignment) => {
      const week = assignment.week_number;
      weekData[week] = (weekData[week] || 0) + 1;
    });

    return Object.entries(weekData)
      .map(([week, count]) => ({
        week: `Minggu ${week}`,
        count: count as number,
      }))
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));
  };

  // HANYA INI YANG DIUBAH: Loading state menjadi spinner biru
  if (loading) {
    return (
      <Center h={400}>
        <Loader color="blue" size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Paper withBorder shadow="sm" radius="lg" p="xl" className="dashboard-header-card">
        <Group justify="space-between" align="center">
          <Group gap="md" align="center">
            <Avatar src={user?.avatar_url} size="xl" radius="xl" color="blue" className="dashboard-avatar">
              {user?.name?.charAt(0)}
            </Avatar>
            <div>
              <Title order={1} size="h2" fw={600} className="dashboard-title">
                Dashboard MySRE
              </Title>
              <Group gap="xs" mt="xs">
                <Text size="lg" className="dashboard-welcome">
                  Selamat datang,{' '}
                  <Text span fw={600} className="dashboard-name">
                    {user?.name}
                  </Text>
                  !
                </Text>
              </Group>
              <Group gap="xs" mt="xs">
                <Badge variant="light" color={user?.role === 'ADMIN' ? 'red' : 'blue'} size="md" radius="md">
                  {user?.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                </Badge>
                <Badge variant="outline" color="gray" size="md" radius="md">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Badge>
              </Group>
            </div>
          </Group>

          <Group gap="sm" align="center">
            <Paper withBorder radius="md" p="md" className="status-indicator">
              <Group gap="xs">
                <div className="status-dot"></div>
                <Text size="sm" fw={500} className="status-text">
                  Sistem Online
                </Text>
              </Group>
            </Paper>
          </Group>
        </Group>
      </Paper>

      {/* Stats Cards - DITAMBAHKAN: Total Assignment */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg">
        {/* Total Users */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Total Pengguna
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalUsers}
              </Text>
            </div>
            <ThemeIcon color="blue" size={40} radius="md">
              <IconUsers size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            <span style={{ color: stats.userGrowth >= 0 ? 'green' : 'red' }}>
              {stats.userGrowth >= 0 ? '+' : ''}
              {stats.userGrowth.toFixed(1)}%
            </span>{' '}
            dari bulan lalu
          </Text>
        </Card>

        {/* Total Admin */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Administrator
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalAdmins}
              </Text>
            </div>
            <ThemeIcon color="red" size={40} radius="md">
              <IconUserCheck size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Admin aktif sistem
          </Text>
        </Card>

        {/* Total Students */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Mahasiswa
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalStudents}
              </Text>
            </div>
            <ThemeIcon color="green" size={40} radius="md">
              <IconSchool size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Pengguna terdaftar
          </Text>
        </Card>

        {/* Total Articles */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Total Artikel
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalArticles}
              </Text>
            </div>
            <ThemeIcon color="orange" size={40} radius="md">
              <IconFileText size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Naskah yang dibuat
          </Text>
        </Card>

        {/* BARU: Total Assignments */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Total Tugas
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalAssignments}
              </Text>
            </div>
            <ThemeIcon color="violet" size={40} radius="md">
              <IconClipboardList size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            {stats.activeAssignments} tugas aktif
          </Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Role Distribution */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Text fw={500} mb="md">
            Distribusi Role Pengguna
          </Text>
          <Center>
            <RingProgress
              size={200}
              sections={[
                { value: (stats.totalAdmins / Math.max(stats.totalUsers, 1)) * 100, color: 'red', tooltip: `Admin: ${stats.totalAdmins}` },
                { value: (stats.totalStudents / Math.max(stats.totalUsers, 1)) * 100, color: 'blue', tooltip: `Mahasiswa: ${stats.totalStudents}` },
              ]}
              label={
                <Text size="xs" ta="center">
                  Total
                  <br />
                  {stats.totalUsers}
                </Text>
              }
            />
          </Center>
          <Group justify="center" mt="md">
            <Group gap="xs">
              <Box w={12} h={12} bg="red" />
              <Text size="sm">Admin ({stats.totalAdmins})</Text>
            </Group>
            <Group gap="xs">
              <Box w={12} h={12} bg="blue" />
              <Text size="sm">Mahasiswa ({stats.totalStudents})</Text>
            </Group>
          </Group>
        </Card>

        {/* Group Distribution */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Text fw={500} mb="md">
            Distribusi Kelompok Mahasiswa
          </Text>
          <Center>
            <RingProgress
              size={200}
              sections={[
                { value: (stats.totalGroupA / Math.max(stats.totalStudents, 1)) * 100, color: 'blue', tooltip: `Kelompok A: ${stats.totalGroupA}` },
                { value: (stats.totalGroupB / Math.max(stats.totalStudents, 1)) * 100, color: 'cyan', tooltip: `Kelompok B: ${stats.totalGroupB}` },
              ]}
              label={
                <Text size="xs" ta="center">
                  Total
                  <br />
                  {stats.totalStudents}
                </Text>
              }
            />
          </Center>
          <Group justify="center" mt="md">
            <Group gap="xs">
              <Box w={12} h={12} bg="blue" />
              <Text size="sm">Kelompok A ({stats.totalGroupA})</Text>
            </Group>
            <Group gap="xs">
              <Box w={12} h={12} bg="cyan" />
              <Text size="sm">Kelompok B ({stats.totalGroupB})</Text>
            </Group>
          </Group>
        </Card>

        {/* Weekly Assignments Visual */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Text fw={500} mb="md">
            Distribusi Tugas per Minggu
          </Text>
          <Stack gap="sm">
            {stats.weeklyAssignments.map((item, index) => (
              <div key={index}>
                <Group justify="space-between" mb={5}>
                  <Text size="sm">{item.week}</Text>
                  <Text size="sm" fw={500}>
                    {item.count} tugas
                  </Text>
                </Group>
                <Progress value={(item.count / Math.max(...stats.weeklyAssignments.map((w) => w.count), 1)) * 100} color="violet" size="sm" />
              </div>
            ))}
          </Stack>
        </Card>

        {/* System Overview */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Text fw={500} mb="md">
            Ringkasan Sistem
          </Text>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" color="blue" variant="light">
                  <IconUsers size={14} />
                </ThemeIcon>
                <Text size="sm">Total Pengguna</Text>
              </Group>
              <Text size="sm" fw={600}>
                {stats.totalUsers}
              </Text>
            </Group>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" color="orange" variant="light">
                  <IconFileText size={14} />
                </ThemeIcon>
                <Text size="sm">Total Artikel</Text>
              </Group>
              <Text size="sm" fw={600}>
                {stats.totalArticles}
              </Text>
            </Group>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" color="violet" variant="light">
                  <IconClipboardList size={14} />
                </ThemeIcon>
                <Text size="sm">Total Tugas</Text>
              </Group>
              <Text size="sm" fw={600}>
                {stats.totalAssignments}
              </Text>
            </Group>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="sm" color="green" variant="light">
                  <IconTrendingUp size={14} />
                </ThemeIcon>
                <Text size="sm">Pertumbuhan User</Text>
              </Group>
              <Text size="sm" fw={600} c={stats.userGrowth >= 0 ? 'green' : 'red'}>
                {stats.userGrowth >= 0 ? '+' : ''}
                {stats.userGrowth.toFixed(1)}%
              </Text>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Enhanced Analytics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {/* Brain Projects */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Proyek Brain
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalBrainProjects}
              </Text>
            </div>
            <ThemeIcon color="purple" size={40} radius="md">
              <IconBrain size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Ide dan konsep
          </Text>
        </Card>

        {/* Total Drafts */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Draft
              </Text>
              <Text size="lg" fw={700}>
                {stats.totalDrafts}
              </Text>
            </div>
            <ThemeIcon color="cyan" size={40} radius="md">
              <IconPencil size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Naskah dalam proses
          </Text>
        </Card>

        {/* High Engagement Users */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Pengguna Aktif
              </Text>
              <Text size="lg" fw={700}>
                {stats.highEngagementUsers}
              </Text>
            </div>
            <ThemeIcon color="teal" size={40} radius="md">
              <IconTrendingUp size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Tingkat keterlibatan tinggi
          </Text>
        </Card>

        {/* Productivity Score */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Skor Produktivitas
              </Text>
              <Text size="lg" fw={700}>
                {stats.avgProductivityScore.toFixed(0)}%
              </Text>
            </div>
            <ThemeIcon color="yellow" size={40} radius="md">
              <IconReportAnalytics size={20} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt={7}>
            Rata-rata keseluruhan
          </Text>
        </Card>
      </SimpleGrid>

      <Grid>
        {/* Recent Users */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Pengguna Terbaru</Text>
              <ActionIcon variant="light" color="blue">
                <IconEye size={16} />
              </ActionIcon>
            </Group>
            <Stack gap="sm">
              {stats.recentUsers.slice(0, 5).map((user) => (
                <Group key={user.id} justify="space-between">
                  <Group gap="sm">
                    <Avatar src={user.avatar_url} size={32} radius="xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {user.name}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {user.email}
                      </Text>
                    </div>
                  </Group>
                  <div style={{ textAlign: 'right' }}>
                    <Badge size="xs" color={user.role === 'ADMIN' ? 'red' : user.role === 'USER' ? 'blue' : 'gray'}>
                      {user.role === 'ADMIN' ? 'Admin' : user.role === 'USER' ? 'Mahasiswa' : user.role}
                    </Badge>
                    {user.nim && (
                      <Text size="xs" c="gray.6">
                        {user.nim}
                      </Text>
                    )}
                  </div>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Recent Articles */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={500}>Artikel Terbaru</Text>
              <ActionIcon variant="light" color="blue">
                <IconEye size={16} />
              </ActionIcon>
            </Group>
            <Stack gap="sm">
              {stats.recentArticles.slice(0, 5).map((article) => (
                <Group key={article.id} justify="space-between">
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {article.title}
                    </Text>
                    <Text size="xs" c="gray.6">
                      oleh {article.author?.name || 'Unknown User'}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text size="xs" c="gray.6">
                      {new Date(article.createdAt).toLocaleDateString('id-ID')}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Group Distribution - Progress bars */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Text fw={500} mb="md">
          Distribusi Kelompok
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Kelompok A</Text>
              <Text size="sm" fw={500}>
                {stats.totalGroupA} orang
              </Text>
            </Group>
            <Progress value={(stats.totalGroupA / Math.max(stats.totalStudents, 1)) * 100} color="blue" />
          </Box>
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Kelompok B</Text>
              <Text size="sm" fw={500}>
                {stats.totalGroupB} orang
              </Text>
            </Group>
            <Progress value={(stats.totalGroupB / Math.max(stats.totalStudents, 1)) * 100} color="cyan" />
          </Box>
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
