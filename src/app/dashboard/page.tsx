'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, Text, Group, Avatar, Stack, Badge, ActionIcon, Title, SimpleGrid, Progress, RingProgress, Center, ThemeIcon, Box } from '@mantine/core';
import { IconUsers, IconUserPlus, IconUserCheck, IconTrendingUp, IconEye, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import { supabase, User } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  recentUsers: User[];
  userGrowth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalRegularUsers: 0,
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
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

      // Get total admins
      const { count: totalAdmins } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin');

      // Get recent users (last 5)
      const { data: recentUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5);

      // Calculate growth (simple mock for now)
      const userGrowth = Math.floor(Math.random() * 20) + 5;

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalRegularUsers: (totalUsers || 0) - (totalAdmins || 0),
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
      title: 'Pengguna Regular',
      value: stats.totalRegularUsers,
      icon: IconUserPlus,
      color: 'green',
      growth: stats.userGrowth - 2,
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
          <Text c="gray.6">Selamat datang kembali, {user?.full_name}!</Text>
        </div>
        <Badge size="lg" variant="light" color="blue">
          {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
        </Badge>
      </Group>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {statCards.map((stat, index) => (
          <Card key={index} padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                  {stat.title}
                </Text>
                <Text fw={700} size="xl">
                  {stat.value}
                </Text>
                <Group gap="xs" mt={5}>
                  {stat.positive ? <IconArrowUpRight size={16} color="var(--mantine-color-green-6)" /> : <IconArrowDownRight size={16} color="var(--mantine-color-red-6)" />}
                  <Text size="sm" c={stat.positive ? 'green' : 'red'}>
                    +{stat.growth}%
                  </Text>
                  <Text size="sm" c="gray.6">
                    dari bulan lalu
                  </Text>
                </Group>
              </div>
              <ThemeIcon color={stat.color} variant="light" size="xl" radius="md">
                <stat.icon size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              Pengguna Terbaru
            </Title>
            <Stack gap="sm">
              {stats.recentUsers.map((user) => (
                <Group
                  key={user.id}
                  justify="space-between"
                  p="sm"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Group gap="sm">
                    <Avatar src={user.avatar_url} alt={user.full_name} size="md" color="blue">
                      {user.full_name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {user.full_name}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {user.email}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="sm">
                    <Badge color={user.role === 'admin' ? 'red' : 'blue'} variant="light" size="sm">
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    <Text size="xs" c="gray.5">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </Text>
                  </Group>
                </Group>
              ))}

              {stats.recentUsers.length === 0 && !loading && (
                <Text ta="center" c="gray.5" py="xl">
                  Belum ada pengguna terdaftar
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Distribusi Pengguna
              </Title>
              <Center>
                <RingProgress
                  size={160}
                  thickness={20}
                  sections={[
                    {
                      value: stats.totalUsers > 0 ? (stats.totalAdmins / stats.totalUsers) * 100 : 0,
                      color: 'red',
                      tooltip: `${stats.totalAdmins} Administrator`,
                    },
                    {
                      value: stats.totalUsers > 0 ? (stats.totalRegularUsers / stats.totalUsers) * 100 : 0,
                      color: 'blue',
                      tooltip: `${stats.totalRegularUsers} Pengguna Regular`,
                    },
                  ]}
                  label={
                    <Text ta="center" fw={700} size="lg">
                      {stats.totalUsers}
                    </Text>
                  }
                />
              </Center>
              <Stack gap="xs" mt="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Box w={12} h={12} bg="red.5" style={{ borderRadius: 2 }} />
                    <Text size="sm">Administrator</Text>
                  </Group>
                  <Text size="sm" fw={500}>
                    {stats.totalAdmins}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Box w={12} h={12} bg="blue.5" style={{ borderRadius: 2 }} />
                    <Text size="sm">Pengguna Regular</Text>
                  </Group>
                  <Text size="sm" fw={500}>
                    {stats.totalRegularUsers}
                  </Text>
                </Group>
              </Stack>
            </Card>

            <Card padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                Aktivitas Sistem
              </Title>
              <Stack gap="md">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Login Rate</Text>
                    <Text size="sm" fw={500}>
                      87%
                    </Text>
                  </Group>
                  <Progress value={87} color="green" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Engagement</Text>
                    <Text size="sm" fw={500}>
                      73%
                    </Text>
                  </Group>
                  <Progress value={73} color="blue" />
                </div>
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Active Users</Text>
                    <Text size="sm" fw={500}>
                      92%
                    </Text>
                  </Group>
                  <Progress value={92} color="violet" />
                </div>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
