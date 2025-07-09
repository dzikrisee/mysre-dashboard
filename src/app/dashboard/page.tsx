// src/app/dashboard/page.tsx - Updated dengan Article statistics
'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, Text, Group, Avatar, Stack, Badge, ActionIcon, Title, SimpleGrid, Progress, RingProgress, Center, ThemeIcon, Box } from '@mantine/core';
import { IconUsers, IconUserPlus, IconUserCheck, IconTrendingUp, IconEye, IconArrowUpRight, IconArrowDownRight, IconSchool, IconId, IconFileText, IconCalendar } from '@tabler/icons-react';
import { supabase, User, Article } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

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
}

export default function DashboardPage() {
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
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase.from('User').select('*', { count: 'exact', head: true });

      // Get total admins
      const { count: totalAdmins } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'admin');

      // Get total students
      const { count: totalStudents } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'user');

      // Get total Group A
      const { count: totalGroupA } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('group', 'A');

      // Get total Group B
      const { count: totalGroupB } = await supabase.from('User').select('*', { count: 'exact', head: true }).eq('group', 'B');

      // Get total articles
      const { count: totalArticles } = await supabase.from('Article').select('*', { count: 'exact', head: true });

      // Get admin articles count
      const { count: adminArticles } = await supabase
        .from('Article')
        .select(
          `
          *,
          author:User!Article_userId_fkey(role)
        `,
          { count: 'exact', head: true },
        )
        .eq('User.role', 'admin');

      // Get student articles count
      const { count: studentArticles } = await supabase
        .from('Article')
        .select(
          `
          *,
          author:User!Article_userId_fkey(role)
        `,
          { count: 'exact', head: true },
        )
        .eq('User.role', 'user');

      // Get recent users (last 5)
      const { data: recentUsers } = await supabase.from('User').select('*').order('createdAt', { ascending: false }).limit(5);

      // Get recent articles (last 5)
      const { data: recentArticles } = await supabase
        .from('Article')
        .select(
          `
          *,
          author:User!Article_userId_fkey(
            id, 
            name, 
            email, 
            role, 
            group
          )
        `,
        )
        .order('createdAt', { ascending: false })
        .limit(5);

      // Calculate growth (simple mock for now)
      const userGrowth = Math.floor(Math.random() * 20) + 5;

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalStudents: totalStudents || 0,
        totalGroupA: totalGroupA || 0,
        totalGroupB: totalGroupB || 0,
        totalArticles: totalArticles || 0,
        adminArticles: adminArticles || 0,
        studentArticles: studentArticles || 0,
        recentUsers: recentUsers || [],
        recentArticles: recentArticles || [],
        userGrowth,
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
      title: 'Total Artikel',
      value: stats.totalArticles,
      icon: IconFileText,
      color: 'red',
      growth: 8,
      positive: true,
    },
    {
      title: 'Administrator',
      value: stats.totalAdmins,
      icon: IconUserCheck,
      color: 'violet',
      growth: 2,
      positive: true,
    },
    {
      title: 'Mahasiswa',
      value: stats.totalStudents,
      icon: IconSchool,
      color: 'green',
      growth: stats.userGrowth - 2,
      positive: true,
    },
    {
      title: 'Group A',
      value: stats.totalGroupA,
      icon: IconId,
      color: 'teal',
      growth: 5,
      positive: true,
    },
    {
      title: 'Group B',
      value: stats.totalGroupB,
      icon: IconId,
      color: 'orange',
      growth: 3,
      positive: true,
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Dashboard MySRE</Title>
          <Text c="gray.6">Selamat datang kembali, {user?.name}!</Text>
        </div>
        <Badge size="lg" variant="light" color="blue">
          {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
        </Badge>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {statCards.map((stat, index) => (
          <Card key={index} withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                  {stat.title}
                </Text>
                <Text fw={700} size="xl">
                  {stat.value}
                </Text>
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
          </Card>
        ))}
      </SimpleGrid>

      {/* Recent Activity */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Pengguna Terbaru</Title>
              <ActionIcon variant="subtle" color="gray">
                <IconEye size={16} />
              </ActionIcon>
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
                    <Badge color={recentUser.role === 'admin' ? 'red' : 'blue'} variant="light" size="sm">
                      {recentUser.role === 'admin' ? 'Admin' : 'Mahasiswa'}
                    </Badge>
                    {recentUser.group && (
                      <Badge color={recentUser.group === 'A' ? 'green' : 'orange'} variant="outline" size="sm">
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
              <ActionIcon variant="subtle" color="gray">
                <IconEye size={16} />
              </ActionIcon>
            </Group>
            <Stack gap="md">
              {stats.recentArticles.map((article) => (
                <Group key={article.id} justify="space-between">
                  <Group>
                    <IconFileText size={20} color="var(--mantine-color-red-6)" />
                    <div>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {article.title}
                      </Text>
                      <Text size="xs" c="gray.6">
                        oleh {article.author?.name || 'Unknown'}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge color={article.author?.role === 'admin' ? 'red' : 'blue'} variant="light" size="sm">
                      {article.author?.role === 'admin' ? 'Admin' : 'Student'}
                    </Badge>
                    <Group gap="xs">
                      <IconCalendar size={12} />
                      <Text size="xs" c="gray.5">
                        {new Date(article.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                    </Group>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Article Distribution */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md">
          Distribusi Artikel
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Artikel Admin</Text>
              <Text size="sm" fw={500}>
                {stats.adminArticles}
              </Text>
            </Group>
            <Progress value={(stats.adminArticles / Math.max(stats.totalArticles, 1)) * 100} color="red" size="lg" />
          </div>
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm">Artikel Mahasiswa</Text>
              <Text size="sm" fw={500}>
                {stats.studentArticles}
              </Text>
            </Group>
            <Progress value={(stats.studentArticles / Math.max(stats.totalArticles, 1)) * 100} color="blue" size="lg" />
          </div>
        </SimpleGrid>

        <Center mt="xl">
          <RingProgress
            size={120}
            thickness={12}
            sections={[
              { value: (stats.adminArticles / Math.max(stats.totalArticles, 1)) * 100, color: 'red' },
              { value: (stats.studentArticles / Math.max(stats.totalArticles, 1)) * 100, color: 'blue' },
            ]}
            label={
              <Text c="gray.6" fw={700} ta="center" size="xs">
                {stats.totalArticles}
                <br />
                <Text span c="gray.5" size="xs">
                  Artikel
                </Text>
              </Text>
            }
          />
        </Center>
      </Card>
    </Stack>
  );
}
