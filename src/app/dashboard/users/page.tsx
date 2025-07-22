'use client';

import { UserTable } from '@/components/users/user-table';
import { Group, Title, Text, Badge, Stack } from '@mantine/core';
import { IconCalendar, IconUserCheck } from '@tabler/icons-react';

export default function UsersPage() {
  return (
    <Stack gap="xl">
      {/* Header Section - Tambahkan ini di paling atas */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Manajemen Pengguna</Title>
          <Text c="gray.6">Kelola data mahasiswa dan administrator MySRE</Text>
        </div>
        <Group>
          <Badge leftSection={<IconCalendar size={12} />} variant="light" color="blue">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Badge>
          <Badge leftSection={<IconUserCheck size={12} />} variant="light" color="green">
            Admin Panel
          </Badge>
        </Group>
      </Group>

      {/* Konten UserTable yang sudah ada */}
      <UserTable />
    </Stack>
  );
}
