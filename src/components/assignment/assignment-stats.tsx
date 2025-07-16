// src/components/assignments/assignment-stats.tsx
'use client';

import { SimpleGrid, Card, Group, Text, ThemeIcon, Stack, Progress, Badge } from '@mantine/core';
import { IconClipboardList, IconFileText, IconClock, IconCheck, IconUsers, IconTrendingUp } from '@tabler/icons-react';

interface AssignmentStatsProps {
  stats: {
    totalAssignments: number;
    activeAssignments: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    gradedSubmissions: number;
  };
}

export function AssignmentStats({ stats }: AssignmentStatsProps) {
  const completionRate = stats.totalSubmissions > 0 ? (stats.gradedSubmissions / stats.totalSubmissions) * 100 : 0;

  const submissionRate = stats.totalSubmissions > 0 ? ((stats.gradedSubmissions + stats.pendingSubmissions) / stats.totalSubmissions) * 100 : 0;

  const statsCards = [
    {
      title: 'Total Assignment',
      value: stats.totalAssignments,
      icon: IconClipboardList,
      color: 'blue',
      description: `${stats.activeAssignments} aktif`,
    },
    {
      title: 'Total Submission',
      value: stats.totalSubmissions,
      icon: IconFileText,
      color: 'green',
      description: 'Semua submission',
    },
    {
      title: 'Menunggu Penilaian',
      value: stats.pendingSubmissions,
      icon: IconClock,
      color: 'orange',
      description: 'Perlu direview',
    },
    {
      title: 'Sudah Dinilai',
      value: stats.gradedSubmissions,
      icon: IconCheck,
      color: 'teal',
      description: 'Selesai dinilai',
    },
  ];

  return (
    <Stack gap="lg">
      {/* Main Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {statsCards.map((stat, index) => (
          <Card key={index} withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  {stat.title}
                </Text>
                <Text fw={700} size="xl">
                  {stat.value.toLocaleString()}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  {stat.description}
                </Text>
              </div>
              <ThemeIcon color={stat.color} variant="light" size="xl" radius="md">
                <stat.icon size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Progress Stats */}
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">
              Tingkat Penilaian
            </Text>
            <Badge size="sm" color="teal" variant="light">
              {completionRate.toFixed(1)}%
            </Badge>
          </Group>
          <Progress value={completionRate} size="lg" radius="md" color="teal" style={{ marginBottom: '8px' }} />
          <Text size="sm" c="gray.6">
            {stats.gradedSubmissions} dari {stats.totalSubmissions} submission sudah dinilai
          </Text>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">
              Tingkat Pengumpulan
            </Text>
            <Badge size="sm" color="blue" variant="light">
              {submissionRate.toFixed(1)}%
            </Badge>
          </Group>
          <Progress value={submissionRate} size="lg" radius="md" color="blue" style={{ marginBottom: '8px' }} />
          <Text size="sm" c="gray.6">
            {stats.pendingSubmissions + stats.gradedSubmissions} submission aktif
          </Text>
        </Card>
      </SimpleGrid>

      {/* Quick Summary */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconTrendingUp size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                Ringkasan Cepat
              </Text>
              <Text size="sm" c="gray.6">
                Status assignment dan submission saat ini
              </Text>
            </div>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Stack gap={4}>
            <Text size="sm" c="gray.6">
              Assignment Aktif
            </Text>
            <Group gap="xs">
              <Text fw={600} size="lg" c="blue">
                {stats.activeAssignments}
              </Text>
              <Text size="sm" c="gray.5">
                / {stats.totalAssignments} total
              </Text>
            </Group>
          </Stack>

          <Stack gap={4}>
            <Text size="sm" c="gray.6">
              Pending Review
            </Text>
            <Group gap="xs">
              <Text fw={600} size="lg" c="orange">
                {stats.pendingSubmissions}
              </Text>
              <Text size="sm" c="gray.5">
                submission
              </Text>
            </Group>
          </Stack>

          <Stack gap={4}>
            <Text size="sm" c="gray.6">
              Completion Rate
            </Text>
            <Group gap="xs">
              <Text fw={600} size="lg" c="teal">
                {completionRate.toFixed(0)}%
              </Text>
              <Text size="sm" c="gray.5">
                dinilai
              </Text>
            </Group>
          </Stack>
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
