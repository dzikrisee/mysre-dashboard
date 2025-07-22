'use client';

import { Card, Group, Text, Badge, Stack, SimpleGrid, Box, Tabs, Avatar, RingProgress, Center } from '@mantine/core';
import { IconBulb, IconPencil, IconChartBar, IconClock } from '@tabler/icons-react';
import { LearningAnalytics } from '@/lib/analytics';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  group?: string;
  nim?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserAnalyticsCardProps {
  user: User;
  analytics: LearningAnalytics;
  compact?: boolean;
  onClick?: () => void;
}

// Component untuk menampilkan analytics per user
export function UserAnalyticsCard({ user, analytics, compact = false }: UserAnalyticsCardProps) {
  const { brainStats, writerStats, overallStats } = analytics;

  if (compact) {
    return (
      <Card withBorder shadow="sm" radius="md" p="md">
        <Group justify="space-between" mb="xs">
          <Group gap="sm">
            <Avatar size="sm" color="blue">
              {user.name.charAt(0)}
            </Avatar>
            <div>
              <Text size="sm" fw={500}>
                {user.name}
              </Text>
              <Text size="xs" c="gray.6">
                {user.nim || user.email}
              </Text>
            </div>
          </Group>
          <Badge color={user.group === 'A' ? 'blue' : 'green'} variant="light" size="sm">
            {user.group}
          </Badge>
        </Group>

        <SimpleGrid cols={3} spacing="xs">
          <Box>
            <Text size="xs" c="gray.6">
              Brain Projects
            </Text>
            <Text size="sm" fw={600}>
              {brainStats.totalProjects}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="gray.6">
              Drafts
            </Text>
            <Text size="sm" fw={600}>
              {writerStats.totalDrafts}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="gray.6">
              Engagement
            </Text>
            <Text size="sm" fw={600}>
              {overallStats.engagementLevel}
            </Text>
          </Box>
        </SimpleGrid>
      </Card>
    );
  }

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Group justify="space-between" mb="lg">
        <Group gap="md">
          <Avatar size="lg" color="blue">
            {user.name.charAt(0)}
          </Avatar>
          <div>
            <Text size="lg" fw={600}>
              {user.name}
            </Text>
            <Text size="sm" c="gray.6">
              {user.email}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge color={user.group === 'A' ? 'blue' : 'green'} variant="light">
                Group {user.group}
              </Badge>
              <Badge color="gray" variant="outline" size="sm">
                {user.nim}
              </Badge>
            </Group>
          </div>
        </Group>
        <Box ta="right">
          <Text size="sm" c="gray.6">
            Productivity Score
          </Text>
          <Text size="xl" fw={700} c="blue">
            {overallStats.productivityScore}/100
          </Text>
        </Box>
      </Group>

      <Tabs defaultValue="brain">
        <Tabs.List>
          <Tabs.Tab value="brain" leftSection={<IconBulb size={16} />}>
            Brain Analytics
          </Tabs.Tab>
          <Tabs.Tab value="writer" leftSection={<IconPencil size={16} />}>
            Writer Analytics
          </Tabs.Tab>
          <Tabs.Tab value="overall" leftSection={<IconChartBar size={16} />}>
            Overall Behavior
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="brain" pt="md">
          <SimpleGrid cols={2} spacing="md">
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Total Projects
              </Text>
              <Text size="xl" fw={700}>
                {brainStats.totalProjects}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Nodes Created
              </Text>
              <Text size="xl" fw={700}>
                {brainStats.totalNodes}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Relationships
              </Text>
              <Text size="xl" fw={700}>
                {brainStats.totalEdges}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Chat Queries
              </Text>
              <Text size="xl" fw={700}>
                {brainStats.totalChatQueries}
              </Text>
            </Card>
          </SimpleGrid>

          <Text size="sm" c="gray.6" mt="md">
            Avg Nodes per Project: {brainStats.avgNodesPerProject.toFixed(1)} | Node Clicks: {brainStats.nodeClicks} | Edge Clicks: {brainStats.edgeClicks}
          </Text>
        </Tabs.Panel>

        <Tabs.Panel value="writer" pt="md">
          <SimpleGrid cols={2} spacing="md">
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Total Drafts
              </Text>
              <Text size="xl" fw={700}>
                {writerStats.totalDrafts}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Annotations
              </Text>
              <Text size="xl" fw={700}>
                {writerStats.totalAnnotations}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                AI Assistance
              </Text>
              <Text size="xl" fw={700}>
                {writerStats.aiAssistanceUsage}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Citations
              </Text>
              <Text size="xl" fw={700}>
                {writerStats.citationCount}
              </Text>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="overall" pt="md">
          <SimpleGrid cols={2} spacing="md">
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Login Sessions
              </Text>
              <Text size="xl" fw={700}>
                {overallStats.totalLoginSessions}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Time Spent
              </Text>
              <Text size="xl" fw={700}>
                {Math.round(overallStats.totalTimeSpent / 60)}h
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Preferred Module
              </Text>
              <Text size="lg" fw={600} tt="capitalize">
                {overallStats.preferredModule}
              </Text>
            </Card>
            <Card withBorder p="md">
              <Text size="sm" c="gray.6" mb="xs">
                Engagement Level
              </Text>
              <Badge color={overallStats.engagementLevel === 'high' ? 'green' : overallStats.engagementLevel === 'medium' ? 'yellow' : 'red'} variant="light" size="lg">
                {overallStats.engagementLevel}
              </Badge>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
