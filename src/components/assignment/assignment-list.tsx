// src/components/assignment/assignment-list.tsx - Complete version with target_classes and grading navigation
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
      children: <Text size="sm">Apakah Anda yakin ingin menghapus assignment "{assignment.title}"? Semua submission yang terkait juga akan terhapus. Tindakan ini tidak dapat dibatalkan.</Text>,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const result = await AssignmentService.deleteAssignment(assignment.id);
        if (result.error) {
          notifications.show({
            title: 'Error',
            message: result.error,
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Berhasil',
            message: 'Assignment berhasil dihapus',
            color: 'green',
          });
          onRefresh?.();
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

  const getTargetClassesDisplay = (targetClasses: string[]) => {
    if (!targetClasses || targetClasses.length === 0) return 'Tidak ada';
    if (targetClasses.length === 2 && targetClasses.includes('A') && targetClasses.includes('B')) {
      return 'Kelas A & B';
    }
    return targetClasses.map((cls) => `Kelas ${cls}`).join(', ');
  };

  const getTargetClassesColor = (targetClasses: string[]) => {
    if (!targetClasses || targetClasses.length === 0) return 'gray';
    if (targetClasses.length === 2) return 'blue';
    return targetClasses.includes('A') ? 'green' : 'orange';
  };

  if (assignments.length === 0) {
    return (
      <Card withBorder shadow="sm" radius="md" p="xl">
        <Stack align="center" gap="md">
          <IconUsers size={48} color="var(--mantine-color-gray-4)" />
          <div style={{ textAlign: 'center' }}>
            <Text fw={600} size="lg" mb={4}>
              Belum Ada Assignment
            </Text>
            <Text c="gray.6" size="sm">
              Mulai dengan membuat assignment pertama untuk mahasiswa
            </Text>
          </div>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" wrap="wrap">
          <Group grow style={{ flex: 1, minWidth: 0 }}>
            <TextInput placeholder="Cari assignment..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 300 }} />

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

            <Select
              placeholder="Kelas"
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
                    <div>
                      <Text fw={500} size="sm">
                        {assignment.title}
                      </Text>
                      <Text size="xs" c="gray.6" lineClamp={2}>
                        {assignment.description}
                      </Text>
                      {assignment.due_date && (
                        <Group gap={4} mt={4}>
                          <IconCalendar size={12} color="var(--mantine-color-gray-6)" />
                          <Text size="xs" c="gray.6">
                            {new Date(assignment.due_date).toLocaleDateString('id-ID')}
                          </Text>
                        </Group>
                      )}
                    </div>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color="gray" tt="uppercase" fw={600}>
                      {assignment.assignment_code}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color="blue">
                      Minggu {assignment.week_number}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color={getTargetClassesColor(assignment.target_classes || [])} leftSection={<IconUsers size={12} />}>
                      {getTargetClassesDisplay(assignment.target_classes || [])}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color={assignment.is_active ? 'green' : 'gray'}>
                      {assignment.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <Badge variant="light" color="blue">
                        {getSubmissionCount(assignment)} total
                      </Badge>
                      {getPendingCount(assignment) > 0 && (
                        <Badge variant="light" color="orange">
                          {getPendingCount(assignment)} pending
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue" size="sm" onClick={() => handleViewDetails(assignment)} title="Lihat Detail">
                        <IconEye size={16} />
                      </ActionIcon>

                      <ActionIcon variant="light" color="green" size="sm" onClick={() => handleViewGrading(assignment)} title="Kelola Penilaian">
                        <IconClipboardCheck size={16} />
                      </ActionIcon>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(assignment)}>
                            Edit Assignment
                          </Menu.Item>

                          {assignment.file_url && (
                            <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => downloadFile(assignment)}>
                              Download File
                            </Menu.Item>
                          )}

                          <Menu.Divider />

                          <Menu.Item leftSection={<IconClipboardList size={14} />} onClick={() => handleToggleStatus(assignment)} color={assignment.is_active ? 'orange' : 'green'}>
                            {assignment.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Menu.Item>

                          <Menu.Item leftSection={<IconTrash size={14} />} onClick={() => handleDelete(assignment)} color="red">
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

        {filteredAssignments.length === 0 && !loading && (
          <Box p="xl">
            <Alert icon={<IconFileText size={16} />} color="blue" variant="light">
              <Text fw={500} size="sm" mb={4}>
                {search || statusFilter !== 'all' || weekFilter !== 'all' || classFilter !== 'all' ? 'Tidak ada assignment yang sesuai dengan filter' : 'Belum ada assignment yang dibuat'}
              </Text>
              <Text size="sm">{search || statusFilter !== 'all' || weekFilter !== 'all' || classFilter !== 'all' ? 'Coba ubah kriteria pencarian atau filter yang digunakan' : 'Mulai dengan membuat assignment pertama untuk mahasiswa'}</Text>
            </Alert>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
