// src/components/assignments/assignment-list.tsx
'use client';

import { useState } from 'react';
import { Table, ScrollArea, Text, Group, Badge, ActionIcon, Menu, Paper, TextInput, Select, Stack, Button, Box, Card, Tooltip, Anchor } from '@mantine/core';
import { IconSearch, IconFilter, IconDots, IconEye, IconEdit, IconTrash, IconDownload, IconUsers, IconCalendar, IconCode, IconFile, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { Assignment } from '@/lib/types/assignment';
import { AssignmentService } from '@/lib/services/assignment.service';
import { notifications } from '@mantine/notifications';

interface AssignmentListProps {
  assignments: Assignment[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onRefresh: () => void;
}

export function AssignmentList({ assignments, onEdit, onDelete, onRefresh }: AssignmentListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');

  const toggleActiveStatus = async (assignment: Assignment) => {
    try {
      const result = await AssignmentService.updateAssignment(assignment.id, {
        is_active: !assignment.is_active,
      });

      if (result.error) {
        notifications.show({
          title: 'Error',
          message: result.error,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Berhasil',
          message: `Assignment ${assignment.is_active ? 'dinonaktifkan' : 'diaktifkan'}`,
          color: 'green',
        });
        onRefresh();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengubah status assignment',
        color: 'red',
      });
    }
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

    return matchesSearch && matchesStatus && matchesWeek;
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
      <Paper withBorder shadow="sm" radius="md" p="md">
        <Group>
          <TextInput placeholder="Cari assignment..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <Select
            placeholder="Status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: 'all', label: 'Semua Status' },
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Nonaktif' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            clearable={false}
            w={150}
          />
          <Select
            placeholder="Minggu"
            data={[
              { value: 'all', label: 'Semua Minggu' },
              ...availableWeeks.map((week) => ({
                value: week.toString(),
                label: `Minggu ${week}`,
              })),
            ]}
            value={weekFilter}
            onChange={(value) => setWeekFilter(value || 'all')}
            clearable={false}
            w={140}
          />
        </Group>
      </Paper>

      {/* Results Summary */}
      <Text size="sm" c="gray.6">
        Menampilkan {filteredAssignments.length} dari {assignments.length} assignment
      </Text>

      {/* Assignment Table */}
      <Paper withBorder shadow="sm" radius="md">
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Assignment</Table.Th>
                <Table.Th>Minggu</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Deadline</Table.Th>
                <Table.Th>Submission</Table.Th>
                <Table.Th>Status</Table.Th>
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
                      {assignment.file_url && (
                        <Group gap={4} mt={4}>
                          <IconFile size={12} />
                          <Anchor size="xs" onClick={() => downloadFile(assignment)} style={{ cursor: 'pointer' }}>
                            {assignment.file_name}
                          </Anchor>
                        </Group>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color="blue">
                      Minggu {assignment.week_number}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconCode size={14} />
                      <Text fw={600} size="sm" style={{ fontFamily: 'monospace' }}>
                        {assignment.assignment_code}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {assignment.due_date ? (
                      <Group gap="xs">
                        <IconCalendar size={14} />
                        <Text size="sm">
                          {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Group>
                    ) : (
                      <Text size="sm" c="gray.5">
                        Tidak ada deadline
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={4}>
                      <Group gap="xs">
                        <IconUsers size={14} />
                        <Text size="sm">{getSubmissionCount(assignment)} total</Text>
                      </Group>
                      {getPendingCount(assignment) > 0 && (
                        <Badge size="xs" color="orange" variant="light">
                          {getPendingCount(assignment)} pending
                        </Badge>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={assignment.is_active ? 'green' : 'gray'} variant="light">
                      {assignment.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label={assignment.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                        <ActionIcon variant="subtle" color={assignment.is_active ? 'orange' : 'green'} onClick={() => toggleActiveStatus(assignment)} size="sm">
                          {assignment.is_active ? <IconToggleRight size={16} /> : <IconToggleLeft size={16} />}
                        </ActionIcon>
                      </Tooltip>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={16} />}
                            onClick={() => {
                              // Navigate to assignment detail/submissions
                              window.location.href = `/dashboard/assignments/${assignment.id}`;
                            }}
                          >
                            Lihat Detail
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconUsers size={16} />}
                            onClick={() => {
                              // Navigate to submissions for this assignment
                              window.location.href = `/dashboard/assignments/${assignment.id}/submissions`;
                            }}
                          >
                            Lihat Submission
                          </Menu.Item>
                          {assignment.file_url && (
                            <Menu.Item leftSection={<IconDownload size={16} />} onClick={() => downloadFile(assignment)}>
                              Download File
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => onEdit(assignment)}>
                            Edit
                          </Menu.Item>
                          <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => onDelete(assignment)}>
                            Hapus
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
          <Box p="xl" ta="center">
            <Text c="gray.5">{search || statusFilter !== 'all' || weekFilter !== 'all' ? 'Tidak ada assignment yang sesuai dengan filter' : 'Belum ada assignment yang dibuat'}</Text>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
