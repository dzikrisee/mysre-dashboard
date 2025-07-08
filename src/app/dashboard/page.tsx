'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, Text, Group, Avatar, Stack, Badge, ActionIcon, Title, SimpleGrid, Progress, RingProgress, Center, ThemeIcon, Box } from '@mantine/core';
import { IconUsers, IconUserPlus, IconUserCheck, IconTrendingUp, IconEye, IconArrowUpRight, IconArrowDownRight, IconSchool, IconId } from '@tabler/icons-react';
import { supabase, User } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalStudents: number;
  totalGroupA: number;
  totalGroupB: number;
  recentUsers: User[];
  userGrowth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalStudents: 0,
    totalGroupA: 0,
    totalGroupB: 0,
    recentUsers: [],
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
      const { count: totalUsers } = await supabase
        .from('User') // Updated ke tabel User
        .select('*', { count: 'exact', head: true });

      // Get total admins
      const { count: totalAdmins } = await supabase
        .from('User') // Updated ke tabel User
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Get total students
      const { count: totalStudents } = await supabase
        .from('User') // Updated ke tabel User
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      // Get total Group A
      const { count: totalGroupA } = await supabase
        .from('User') // Updated ke tabel User
        .select('*', { count: 'exact', head: true })
        .eq('group', 'A');

      // Get total Group B
      const { count: totalGroupB } = await supabase
        .from('User') // Updated ke tabel User
        .select('*', { count: 'exact', head: true })
        .eq('group', 'B');

      // Get recent users (last 5)
      const { data: recentUsers } = await supabase
        .from('User') // Updated ke tabel User
        .select('*')
        .order('createdAt', { ascending: false }) // Updated dari created_at ke createdAt
        .limit(5);

      // Calculate growth (simple mock for now)
      const userGrowth = Math.floor(Math.random() * 20) + 5;

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalStudents: totalStudents || 0,
        totalGroupA: totalGroupA || 0,
        totalGroupB: totalGroupB || 0,
        recentUsers: recentUsers || [],
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
      title: 'Administrator',
      value: stats.totalAdmins,
      icon: IconUserCheck,
      color: 'red',
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
    {
      title: 'Aktivitas',
      value: '87%',
      icon: IconTrendingUp,
      color: 'violet',
      growth: 5,
      positive: true,
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Dashboard MySRE</Title>
          <Text c="gray.6">Selamat datang kembali, {user?.name}!</Text> {/* Updated dari full_name ke name */}
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

      {/* Recent Users */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
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
                      {recentUser.name.charAt(0)} {/* Updated dari full_name ke name */}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {recentUser.name} {/* Updated dari full_name ke name */}
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

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={4} mb="md">
              Distribusi Group
            </Title>
            <Stack gap="lg">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Group A</Text>
                  <Text size="sm" fw={500}>
                    {stats.totalGroupA}
                  </Text>
                </Group>
                <Progress value={(stats.totalGroupA / (stats.totalGroupA + stats.totalGroupB)) * 100} color="green" size="lg" />
              </div>
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Group B</Text>
                  <Text size="sm" fw={500}>
                    {stats.totalGroupB}
                  </Text>
                </Group>
                <Progress value={(stats.totalGroupB / (stats.totalGroupA + stats.totalGroupB)) * 100} color="orange" size="lg" />
              </div>
            </Stack>

            <Center mt="xl">
              <RingProgress
                size={120}
                thickness={12}
                sections={[
                  { value: (stats.totalGroupA / (stats.totalGroupA + stats.totalGroupB)) * 100, color: 'green' },
                  { value: (stats.totalGroupB / (stats.totalGroupA + stats.totalGroupB)) * 100, color: 'orange' },
                ]}
                label={
                  <Text c="gray.6" fw={700} ta="center" size="xs">
                    {stats.totalGroupA + stats.totalGroupB}
                    <br />
                    <Text span c="gray.5" size="xs">
                      Mahasiswa
                    </Text>
                  </Text>
                }
              />
            </Center>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
