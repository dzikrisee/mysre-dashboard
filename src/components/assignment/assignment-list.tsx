// src/components/assignment/assignment-list.tsx
// Update untuk mendukung eksperimen kelas sesuai permintaan Pak Rio
'use client';

import { useState } from 'react';
import { Stack, Paper, Group, Text, Badge, ActionIcon, Menu, Button, TextInput, Select, Table, ScrollArea, Box, Card, ThemeIcon, Alert } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconFilter, IconEdit, IconTrash, IconEye, IconDownload, IconUsers, IconCalendar, IconFileText, IconDots, IconClipboardCheck, IconClipboardList } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { AssignmentService } from '@/lib/services/assignment.service';
import type { Assignment } from '@/lib/types/assignment';

interface AssignmentListProps {
  assignments: Assignment[];
  loading?: boolean;
  onEdit?: (assignment: Assignment) => void;
  onRefresh?: () => void;
}

export function AssignmentList({ assignments, loading, onEdit, onRefresh }: AssignmentListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const handleEdit = (assignment: Assignment) => {
    onEdit?.(assignment);
  };

  const handleViewDetails = (assignment: Assignment) => {
    router.push(`/dashboard/assignments/${assignment.id}`);
  };

  const handleViewGrading = (assignment: Assignment) => {
    router.push(`/dashboard/assignments/${assignment.id}/submissions`);
  };

  const handleToggleStatus = async (assignment: Assignment) => {
    try {
      const result = await AssignmentService.updateAssignment(assignment.id, {
        is_active: !assignment.is_active,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      notifications.show({
        title: 'Berhasil',
        message: `Assignment berhasil ${assignment.is_active ? 'dinonaktifkan' : 'diaktifkan'}`,
        color: 'green',
      });
      onRefresh?.();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengubah status assignment',
        color: 'red',
      });
    }
  };

  const handleDelete = (assignment: Assignment) => {
    modals.openConfirmModal({
      title: 'Hapus Assignment',
      children: <Text size="sm">Apakah Anda yakin ingin menghapus assignment "{assignment.title}"? Semua submission yang terkait juga akan terhapus.</Text>,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const result = await AssignmentService.deleteAssignment(assignment.id);
          if (result.error) {
            throw new Error(result.error);
          }

          notifications.show({
            title: 'Berhasil',
            message: 'Assignment berhasil dihapus',
            color: 'green',
          });
          onRefresh?.();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menghapus assignment',
            color: 'red',
          });
        }
      },
    });
  };

  const downloadFile = (assignment: Assignment) => {
    if (assignment.file_url) {
      window.open(assignment.file_url, '_blank');
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(search.toLowerCase()) || assignment.description.toLowerCase().includes(search.toLowerCase()) || assignment.assignment_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && assignment.is_active) || (statusFilter === 'inactive' && !assignment.is_active);

    const matchesWeek = weekFilter === 'all' || assignment.week_number.toString() === weekFilter;

    const matchesClass = classFilter === 'all' || (classFilter === 'A' && assignment.target_classes?.includes('A')) || (classFilter === 'B' && assignment.target_classes?.includes('B'));

    return matchesSearch && matchesStatus && matchesWeek && matchesClass;
  });

  // Get unique weeks for filter
  const availableWeeks = Array.from(new Set(assignments.map((a) => a.week_number))).sort((a, b) => a - b);

  const getSubmissionCount = (assignment: Assignment) => {
    return (assignment as any).submissions?.length || 0;
  };

  const getPendingCount = (assignment: Assignment) => {
    const submissions = (assignment as any).submissions || [];
    return submissions.filter((s: any) => s.status === 'submitted').length;
  };

  // UPDATE: Fungsi untuk menampilkan target kelas sesuai eksperimen kelas
  const getTargetClassesDisplay = (targetClasses: string[]) => {
    if (!targetClasses || targetClasses.length === 0) return 'Tidak ada kelas';
    if (targetClasses.length === 2 && targetClasses.includes('A') && targetClasses.includes('B')) {
      return 'Kedua Kelas (A & B)';
    }
    return targetClasses.map((cls) => `Kelas ${cls}`).join(' & ');
  };

  // UPDATE: Warna badge berdasarkan target kelas untuk eksperimen
  const getTargetClassesColor = (targetClasses: string[]) => {
    if (!targetClasses || targetClasses.length === 0) return 'gray';
    if (targetClasses.length === 2) return 'blue'; // Kedua kelas = biru
    return targetClasses.includes('A') ? 'green' : 'orange'; // A = hijau, B = orange
  };

  if (loading) {
    return (
      <Paper withBorder shadow="sm" radius="md" p="lg">
        <Text>Loading assignments...</Text>
      </Paper>
    );
  }

  if (assignments.length === 0) {
    return (
      <Paper withBorder shadow="sm" radius="md" p="lg">
        <Stack align="center" py="xl">
          <ThemeIcon size="xl" variant="light" color="gray">
            <IconClipboardList size={28} />
          </ThemeIcon>
          <Text size="lg" fw={600} c="gray.6">
            Belum ada assignment
          </Text>
          <Text size="sm" c="gray.5" ta="center">
            Buat assignment pertama untuk memulai kegiatan pembelajaran
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {/* Filters */}
      <Paper withBorder shadow="sm" radius="md" p="md">
        <Group justify="space-between" wrap="wrap">
          <Text fw={600} size="sm" c="gray.7">
            Filter Assignment
          </Text>
          <Group gap="xs" wrap="wrap">
            <TextInput placeholder="Cari assignment..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 250 }} />

            <Select
              placeholder="Status"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: 'all', label: 'Semua Status' },
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Tidak Aktif' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || 'all')}
              style={{ maxWidth: 150 }}
            />

            <Select
              placeholder="Minggu"
              leftSection={<IconCalendar size={16} />}
              data={[
                { value: 'all', label: 'Semua Minggu' },
                ...availableWeeks.map((week) => ({
                  value: week.toString(),
                  label: `Minggu ${week}`,
                })),
              ]}
              value={weekFilter}
              onChange={(value) => setWeekFilter(value || 'all')}
              style={{ maxWidth: 150 }}
            />

            {/* UPDATE: Filter kelas untuk eksperimen kelas */}
            <Select
              placeholder="Target Kelas"
              leftSection={<IconUsers size={16} />}
              data={[
                { value: 'all', label: 'Semua Kelas' },
                { value: 'A', label: 'Kelas A' },
                { value: 'B', label: 'Kelas B' },
              ]}
              value={classFilter}
              onChange={(value) => setClassFilter(value || 'all')}
              style={{ maxWidth: 150 }}
            />
          </Group>
        </Group>
      </Paper>

      {/* Assignment Table */}
      <Paper withBorder shadow="sm" radius="md">
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Assignment</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Minggu</Table.Th>
                <Table.Th>Target Kelas</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Submissions</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAssignments.map((assignment) => (
                <Table.Tr key={assignment.id}>
                  <Table.Td>
                    <Box>
                      <Text fw={600} size="sm">
                        {assignment.title}
                      </Text>
                      <Text size="xs" c="gray.6" lineClamp={2}>
                        {assignment.description}
                      </Text>
                      {assignment.due_date && (
                        <Text size="xs" c="red.6" mt={2}>
                          <IconCalendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                          Deadline: {new Date(assignment.due_date).toLocaleDateString('id-ID')}
                        </Text>
                      )}
                    </Box>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color="cyan" size="sm">
                      {assignment.assignment_code}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="outline" size="sm">
                      Minggu {assignment.week_number}
                    </Badge>
                  </Table.Td>

                  {/* UPDATE: Kolom Target Kelas untuk eksperimen */}
                  <Table.Td>
                    <Badge variant="light" color={getTargetClassesColor(assignment.target_classes)} size="sm">
                      {getTargetClassesDisplay(assignment.target_classes)}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color={assignment.is_active ? 'green' : 'gray'} size="sm">
                      {assignment.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <Badge variant="filled" color="blue" size="xs">
                        {getSubmissionCount(assignment)} total
                      </Badge>
                      {getPendingCount(assignment) > 0 && (
                        <Badge variant="filled" color="orange" size="xs">
                          {getPendingCount(assignment)} pending
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue" size="sm" onClick={() => handleViewDetails(assignment)} title="Lihat Detail">
                        <IconEye size={14} />
                      </ActionIcon>

                      <ActionIcon variant="light" color="green" size="sm" onClick={() => handleViewGrading(assignment)} title="Lihat Submissions">
                        <IconClipboardCheck size={14} />
                      </ActionIcon>

                      {assignment.file_url && (
                        <ActionIcon variant="light" color="cyan" size="sm" onClick={() => downloadFile(assignment)} title="Download File">
                          <IconDownload size={14} />
                        </ActionIcon>
                      )}

                      <Menu shadow="md" width={180}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(assignment)}>
                            Edit Assignment
                          </Menu.Item>

                          <Menu.Item leftSection={<IconUsers size={14} />} color={assignment.is_active ? 'orange' : 'green'} onClick={() => handleToggleStatus(assignment)}>
                            {assignment.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Menu.Item>

                          <Menu.Divider />

                          <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => handleDelete(assignment)}>
                            Hapus Assignment
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredAssignments.length === 0 && (
          <Box p="xl">
            <Stack align="center">
              <ThemeIcon size="xl" variant="light" color="gray">
                <IconFileText size={28} />
              </ThemeIcon>
              <Text fw={600} c="gray.6">
                Tidak ada assignment yang sesuai filter
              </Text>
              <Text size="sm" c="gray.5">
                Coba ubah kriteria pencarian atau filter
              </Text>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* INFO: Alert tentang eksperimen kelas */}
      {assignments.length > 0 && (
        <Alert color="blue" variant="light">
          <Group>
            <IconUsers size={16} />
            <div>
              <Text size="sm" fw={600}>
                Eksperimen Kelas
              </Text>
              <Text size="xs" c="gray.6">
                Assignment dapat ditargetkan ke Kelas A, Kelas B, atau kedua kelas sesuai program eksperimen. Admin dapat mengatur manual assignment mana yang tampil di kelas mana.
              </Text>
            </div>
          </Group>
        </Alert>
      )}
    </Stack>
  );
}
