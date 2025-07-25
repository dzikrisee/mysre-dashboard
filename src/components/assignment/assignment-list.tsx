// src/components/assignment/assignment-list.tsx
// FINAL FIXED VERSION - Delete function working

'use client';

import { useState } from 'react';
import { Stack, Paper, Group, Text, Badge, ActionIcon, Menu, Button, TextInput, Select, Table, ScrollArea, Box, Card, ThemeIcon, Alert } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconFilter, IconEdit, IconTrash, IconEye, IconDownload, IconUsers, IconCalendar, IconFileText, IconDots, IconClipboardCheck, IconClipboardList, IconAlertTriangle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { AssignmentService } from '@/lib/services/assignment.service';
import type { Assignment } from '@/lib/types/assignment';

interface AssignmentListProps {
  assignments: Assignment[];
  loading?: boolean;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void; // ENSURE this prop exists
  onRefresh?: () => void;
}

export function AssignmentList({ assignments, loading, onEdit, onDelete, onRefresh }: AssignmentListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleEdit = (assignment: Assignment) => {
    onEdit?.(assignment);
  };

  const handleViewDetails = (assignment: Assignment) => {
    router.push(`/dashboard/assignments/${assignment.id}`);
  };

  // FIXED: Complete delete function
  const handleDelete = (assignment: Assignment) => {
    console.log('🔥 Delete button clicked for:', assignment.title); // DEBUG LOG

    modals.openConfirmModal({
      title: (
        <Group>
          <IconTrash size={20} color="red" />
          <Text fw={600} c="red">
            Hapus Assignment
          </Text>
        </Group>
      ),
      children: (
        <Stack gap="md">
          {/* Assignment Info */}
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            <Text size="sm" fw={600} mb="xs">
              Anda akan menghapus assignment berikut:
            </Text>
            <Stack gap="xs">
              <Group>
                <Text size="sm" fw={500}>
                  Judul:
                </Text>
                <Text size="sm" c="red" fw={600}>
                  {assignment.title}
                </Text>
              </Group>
              <Group>
                <Text size="sm" fw={500}>
                  Code:
                </Text>
                <Badge variant="light" color="cyan" size="sm">
                  {assignment.assignment_code}
                </Badge>
              </Group>
              <Group>
                <Text size="sm" fw={500}>
                  Minggu:
                </Text>
                <Badge variant="outline" size="sm">
                  Minggu {assignment.week_number}
                </Badge>
              </Group>
              <Group>
                <Text size="sm" fw={500}>
                  Target Kelas:
                </Text>
                <Badge variant="light" color="blue" size="sm">
                  {assignment.target_classes?.join(', ') || 'Semua Kelas'}
                </Badge>
              </Group>
            </Stack>
          </Alert>

          {/* Warning Message */}
          <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
            <Text size="sm" fw={600} mb="xs">
              ⚠️ PERINGATAN:
            </Text>
            <Stack gap="xs">
              <Text size="sm">• Semua submission mahasiswa akan terhapus</Text>
              <Text size="sm">• Semua nilai dan feedback akan hilang</Text>
              <Text size="sm">• Data tidak dapat dikembalikan</Text>
              <Text size="sm">• Tindakan ini bersifat permanen</Text>
            </Stack>
          </Alert>

          {/* Final Confirmation */}
          <Text size="sm" ta="center" c="red" fw={600}>
            Apakah Anda YAKIN ingin melanjutkan?
          </Text>
        </Stack>
      ),
      labels: {
        confirm: deleting === assignment.id ? 'Menghapus...' : 'Ya, Hapus Assignment',
        cancel: 'Batal',
      },
      confirmProps: {
        color: 'red',
        size: 'md',
        loading: deleting === assignment.id,
        leftSection: <IconTrash size={16} />,
      },
      cancelProps: {
        size: 'md',
        variant: 'outline',
      },
      size: 'md',
      centered: true,
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      onConfirm: async () => {
        try {
          console.log('🚀 Starting delete process...'); // DEBUG LOG
          setDeleting(assignment.id);

          // Call delete API
          const result = await AssignmentService.deleteAssignment(assignment.id);
          console.log('📡 Delete API result:', result); // DEBUG LOG

          if (result.error) {
            throw new Error(result.error);
          }

          // REMOVED: Success notification - let parent handle it
          // notifications.show({...});

          // Call parent handlers
          onDelete?.(assignment); // Let parent show notification
          onRefresh?.(); // Refresh data
        } catch (error: any) {
          console.error('❌ Delete error:', error); // DEBUG LOG
          notifications.show({
            title: '❌ Gagal Menghapus Assignment',
            message: error.message || 'Terjadi kesalahan saat menghapus assignment',
            color: 'red',
            icon: <IconAlertTriangle size={16} />,
            autoClose: 7000,
          });
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  // Toggle status handler
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
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal mengubah status assignment',
        color: 'red',
      });
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(search.toLowerCase()) || assignment.description.toLowerCase().includes(search.toLowerCase()) || assignment.assignment_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && assignment.is_active) || (statusFilter === 'inactive' && !assignment.is_active);

    const matchesWeek = weekFilter === 'all' || assignment.week_number.toString() === weekFilter;

    const matchesClass = classFilter === 'all' || assignment.target_classes?.includes(classFilter);

    return matchesSearch && matchesStatus && matchesWeek && matchesClass;
  });


  // Helper functions
  const getTargetClassesDisplay = (classes: any) => {
    // Handle berbagai format classes dari database
    let classArray: string[] = [];

    if (!classes) {
      return 'Semua Kelas';
    }

    // Jika sudah array
    if (Array.isArray(classes)) {
      classArray = classes;
    }
    // Jika string PostgreSQL array format: "{A,B}" atau "A,B"
    else if (typeof classes === 'string') {
      // Remove brackets dan split by comma
      classArray = classes
        .replace(/[{}]/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
    }
    // Jika object atau format lain
    else {
      console.warn('Unexpected target_classes format:', classes);
      return 'Format tidak valid';
    }

    if (classArray.length === 0) return 'Semua Kelas';
    if (classArray.length === 2) return 'Kelas A & B';
    return `Kelas ${classArray.join(', ')}`;
  };

  const getTargetClassesColor = (classes: any) => {
    // Handle berbagai format classes dari database
    let classArray: string[] = [];

    if (!classes) return 'gray';

    if (Array.isArray(classes)) {
      classArray = classes;
    } else if (typeof classes === 'string') {
      classArray = classes
        .replace(/[{}]/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
    }

    if (classArray.length === 0) return 'gray';
    if (classArray.length === 2) return 'blue';
    return classArray[0] === 'A' ? 'green' : 'orange';
  };

  return (
    <Stack gap="md">
      {/* Filters */}
      <Paper withBorder shadow="sm" radius="md" p="md">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Filter Assignment</Text>
        </Group>

        <Group gap="md">
          <TextInput placeholder="Cari assignment..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />

          <Select
            placeholder="Status"
            data={[
              { value: 'all', label: 'Semua Status' },
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Nonaktif' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            w={150}
          />

          <Select
            placeholder="Minggu"
            data={[
              { value: 'all', label: 'Semua Minggu' },
              ...Array.from({ length: 20 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Minggu ${i + 1}`,
              })),
            ]}
            value={weekFilter}
            onChange={(value) => setWeekFilter(value || 'all')}
            w={150}
          />

          <Select
            placeholder="Target Kelas"
            data={[
              { value: 'all', label: 'Semua Kelas' },
              { value: 'A', label: 'Kelas A' },
              { value: 'B', label: 'Kelas B' },
            ]}
            value={classFilter}
            onChange={(value) => setClassFilter(value || 'all')}
            w={150}
          />
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

                  <Table.Td>
                    <Badge variant="light" color={getTargetClassesColor(assignment.target_classes)} size="sm">
                      {getTargetClassesDisplay(assignment.target_classes)}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color={assignment.is_active ? 'green' : 'gray'} size="sm">
                      {assignment.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Group gap={4}>
                      <ActionIcon variant="light" color="blue" onClick={() => handleViewDetails(assignment)}>
                        <IconEye size={16} />
                      </ActionIcon>

                      <Menu shadow="md" width={180}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(assignment)}>
                            Edit Assignment
                          </Menu.Item>

                          {assignment.file_url && (
                            <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => window.open(assignment.file_url!, '_blank')}>
                              Download File
                            </Menu.Item>
                          )}

                          <Menu.Item leftSection={<IconClipboardCheck size={14} />} color={assignment.is_active ? 'orange' : 'green'} onClick={() => handleToggleStatus(assignment)}>
                            {assignment.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Menu.Item>

                          <Menu.Divider />

                          {/* FIXED: Delete menu item */}
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => {
                              console.log('🔥 Menu delete clicked'); // DEBUG
                              handleDelete(assignment);
                            }}
                            disabled={deleting === assignment.id}
                          >
                            {deleting === assignment.id ? 'Menghapus...' : 'Hapus Assignment'}
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
    </Stack>
  );
}
