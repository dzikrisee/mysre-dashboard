
'use client';

import { useEffect, useState } from 'react';
import { Stack, Title, Text, Group, Badge, SimpleGrid, Card, ThemeIcon, LoadingOverlay, Select, Button, Box, Avatar, Tabs, Progress, ActionIcon, Modal, ScrollArea, Table, Paper, Center, RingProgress } from '@mantine/core';
import { IconUsers, IconBulb, IconPencil, IconTrendingUp, IconChartBar, IconEye, IconDownload, IconRefresh, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { AnalyticsService, LearningAnalytics } from '@/lib/analytics';
import { User } from '@/lib/supabase';
import { UserAnalyticsCard } from '@/components/analytics/user-analytics-card';
import { usePageAnalytics } from '@/hooks/use-analytics';

interface UserAnalytics {
  user: User;
  analytics: LearningAnalytics;
}

interface DashboardSummary {
  totalUsers: number;
  avgProductivity: number;
  totalBrainProjects: number;
  totalDrafts: number;
  highEngagementUsers: number;
  activeThisWeek: number;
}

export default function AnalyticsDashboardPage() {
  // Auto-track page analytics
  usePageAnalytics('analytics-dashboard');

  const [usersAnalytics, setUsersAnalytics] = useState<UserAnalytics[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalUsers: 0,
    avgProductivity: 0,
    totalBrainProjects: 0,
    totalDrafts: 0,
    highEngagementUsers: 0,
    activeThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'productivity' | 'activity'>('productivity');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await AnalyticsService.getAllUsersAnalyticsSummary();
      // Ensure each user object has updateAt property (fallback to createdAt or null)
      setUsersAnalytics(
        analytics.map((item: any) => ({
          ...item,
          user: {
            ...item.user,
            updateAt: item.user.updateAt ?? item.user.updatedAt ?? item.user.createdAt ?? null,
          },
        })),
      );

      // Calculate summary
      const totalUsers = analytics.length;
      const avgProductivity = analytics.reduce((sum, item) => sum + item.analytics.overallStats.productivityScore, 0) / (totalUsers || 1);
      const totalBrainProjects = analytics.reduce((sum, item) => sum + item.analytics.brainStats.totalProjects, 0);
      const totalDrafts = analytics.reduce((sum, item) => sum + item.analytics.writerStats.totalDrafts, 0);
      const highEngagementUsers = analytics.filter((item) => item.analytics.overallStats.engagementLevel === 'high').length;

      setSummary({
        totalUsers,
        avgProductivity,
        totalBrainProjects,
        totalDrafts,
        highEngagementUsers,
        activeThisWeek: Math.floor(totalUsers * 0.7), // Mock data
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersAnalytics
    .filter((item) => !groupFilter || item.user.group === groupFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.user.name.localeCompare(b.user.name);
        case 'productivity':
          return b.analytics.overallStats.productivityScore - a.analytics.overallStats.productivityScore;
        case 'activity':
          return b.analytics.overallStats.totalLoginSessions - a.analytics.overallStats.totalLoginSessions;
        default:
          return 0;
      }
    });

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Learning Behaviour Analytics</Title>
          <Text c="gray.6">Analisis mendalam perilaku pembelajaran mahasiswa untuk insights yang actionable</Text>
        </div>
        <Group>
          <Button leftSection={<IconRefresh size={16} />} variant="light" onClick={loadAnalytics}>
            Refresh Data
          </Button>
          <Button leftSection={<IconDownload size={16} />} variant="outline">
            Export Report
          </Button>
        </Group>
      </Group>

      {/* Executive Summary */}
      <Card withBorder shadow="md" radius="lg" p="xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={600} mb="sm">
              Executive Summary
            </Text>
            <SimpleGrid cols={3} spacing="xl">
              <div>
                <Text size="sm" opacity={0.9}>
                  Total Active Students
                </Text>
                <Text size="xl" fw={700}>
                  {summary.totalUsers}
                </Text>
                <Group gap="xs" mt="xs">
                  <IconArrowUp size={14} />
                  <Text size="sm">+12% from last month</Text>
                </Group>
              </div>
              <div>
                <Text size="sm" opacity={0.9}>
                  Average Productivity
                </Text>
                <Text size="xl" fw={700}>
                  {summary.avgProductivity.toFixed(1)}/100
                </Text>
                <Group gap="xs" mt="xs">
                  <IconArrowUp size={14} />
                  <Text size="sm">+5.3% improvement</Text>
                </Group>
              </div>
              <div>
                <Text size="sm" opacity={0.9}>
                  High Engagement Rate
                </Text>
                <Text size="xl" fw={700}>
                  {((summary.highEngagementUsers / summary.totalUsers) * 100).toFixed(1)}%
                </Text>
                <Group gap="xs" mt="xs">
                  <IconTrendingUp size={14} />
                  <Text size="sm">Target: 60%</Text>
                </Group>
              </div>
            </SimpleGrid>
          </div>
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: summary.avgProductivity, color: 'white' }]}
            label={
              <Center>
                <Stack gap={0} align="center">
                  <Text size="sm" fw={700}>
                    {summary.avgProductivity.toFixed(0)}%
                  </Text>
                  <Text size="xs" opacity={0.8}>
                    Productivity
                  </Text>
                </Stack>
              </Center>
            }
          />
        </Group>
      </Card>

      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Brain Projects
              </Text>
              <Text fw={700} size="xl">
                {summary.totalBrainProjects}
              </Text>
              <Text size="xs" c="green" mt="xs">
                Avg: {(summary.totalBrainProjects / summary.totalUsers).toFixed(1)} per student
              </Text>
            </div>
            <ThemeIcon color="violet" variant="light" size="xl" radius="md">
              <IconBulb size={28} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Writing Drafts
              </Text>
              <Text fw={700} size="xl">
                {summary.totalDrafts}
              </Text>
              <Text size="xs" c="green" mt="xs">
                Avg: {(summary.totalDrafts / summary.totalUsers).toFixed(1)} per student
              </Text>
            </div>
            <ThemeIcon color="green" variant="light" size="xl" radius="md">
              <IconPencil size={28} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                High Performers
              </Text>
              <Text fw={700} size="xl">
                {summary.highEngagementUsers}
              </Text>
              <Text size="xs" c="blue" mt="xs">
                {((summary.highEngagementUsers / summary.totalUsers) * 100).toFixed(1)}% of total
              </Text>
            </div>
            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
              <IconTrendingUp size={28} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                Active This Week
              </Text>
              <Text fw={700} size="xl">
                {summary.activeThisWeek}
              </Text>
              <Text size="xs" c="blue" mt="xs">
                {((summary.activeThisWeek / summary.totalUsers) * 100).toFixed(1)}% engagement
              </Text>
            </div>
            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
              <IconUsers size={28} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group mb="md">
          <Text fw={600}>Filter & Sort Students:</Text>
          <Select
            placeholder="All Groups"
            data={[
              { value: '', label: 'All Groups' },
              { value: 'A', label: 'Group A' },
              { value: 'B', label: 'Group B' },
            ]}
            value={groupFilter}
            onChange={(value) => setGroupFilter(value || '')}
            w={150}
          />
          <Select
            placeholder="Sort by"
            data={[
              { value: 'productivity', label: 'Productivity Score' },
              { value: 'activity', label: 'Activity Level' },
              { value: 'name', label: 'Name A-Z' },
            ]}
            value={sortBy}
            onChange={(value) => setSortBy(value as any)}
            w={180}
          />
        </Group>

        {/* Students Table */}
        <LoadingOverlay visible={loading} />
        <Paper withBorder radius="md">
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Group</Table.Th>
                  <Table.Th>Brain Projects</Table.Th>
                  <Table.Th>Drafts</Table.Th>
                  <Table.Th>Productivity</Table.Th>
                  <Table.Th>Engagement</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.map(({ user, analytics }) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={user.avatar_url} alt={user.name} size="sm" color="blue">
                          {user.name.charAt(0)}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>
                            {user.name}
                          </Text>
                          <Text size="xs" c="gray.6">
                            {user.nim}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={user.group === 'A' ? 'blue' : 'green'} variant="light">
                        Group {user.group}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {analytics.brainStats.totalProjects}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {analytics.brainStats.totalNodes} nodes
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {analytics.writerStats.totalDrafts}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {analytics.writerStats.totalAnnotations} annotations
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Progress value={analytics.overallStats.productivityScore} size="sm" w={60} color={analytics.overallStats.productivityScore >= 80 ? 'green' : analytics.overallStats.productivityScore >= 60 ? 'yellow' : 'red'} />
                        <Text size="sm" fw={500}>
                          {analytics.overallStats.productivityScore}/100
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={analytics.overallStats.engagementLevel === 'high' ? 'green' : analytics.overallStats.engagementLevel === 'medium' ? 'yellow' : 'red'} variant="light">
                        {analytics.overallStats.engagementLevel}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => {
                          setSelectedUser({ user, analytics });
                          openModal();
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Card>

      {/* Detailed User Modal */}
      <Modal opened={modalOpened} onClose={closeModal} title={selectedUser ? `Detailed Analytics: ${selectedUser.user.name}` : 'User Analytics'} size="xl">
        {selectedUser && <UserAnalyticsCard user={selectedUser.user} analytics={selectedUser.analytics} />}
      </Modal>
    </Stack>
  );
}
