// src/app/dashboard/assignments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Container, Stack, Title, Text, Group, Badge, Button, Tabs, SimpleGrid, Card, ThemeIcon, ActionIcon, Menu, LoadingOverlay, Box, Paper, Alert } from '@mantine/core';
import { IconCalendar, IconPlus, IconClipboardList, IconFileText, IconClock, IconCheck, IconUsers, IconDots, IconEye, IconEdit, IconTrash, IconDownload, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { AssignmentService } from '@/lib/services/assignment.service';
import { Assignment, AssignmentSubmission } from '@/lib/types/assignment';
// Import components - will be created separately
// import { AssignmentForm } from '@/components/assignments/assignment-form';
// import { AssignmentList } from '@/components/assignments/assignment-list';
// import { SubmissionList } from '@/components/assignments/submission-list';
// import { AssignmentStats } from '@/components/assignments/assignment-stats';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

export default function AssignmentDashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentsResult, submissionsResult, statsResult] = await Promise.all([AssignmentService.getAllAssignments(), AssignmentService.getAllSubmissions(), AssignmentService.getAssignmentStats()]);

      if (assignmentsResult.error) {
        console.error('Error loading assignments:', assignmentsResult.error);
      } else {
        setAssignments(assignmentsResult.data || []);
      }

      if (submissionsResult.error) {
        console.error('Error loading submissions:', submissionsResult.error);
      } else {
        setSubmissions(submissionsResult.data || []);
      }

      if (statsResult.error) {
        console.error('Error loading stats:', statsResult.error);
      } else {
        setStats(statsResult.data || stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data assignment',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowCreateForm(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowCreateForm(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    modals.openConfirmModal({
      title: 'Hapus Assignment',
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus assignment <strong>{assignment.title}</strong>? Semua submission yang terkait juga akan terhapus. Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
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
          loadData();
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingAssignment(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setEditingAssignment(null);
  };

  if (!isAdmin()) {
    return (
      <Container size="md" mt="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Akses Ditolak" color="red">
          Halaman ini hanya dapat diakses oleh administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      {/* Header */}
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={2}>Assignment Management</Title>
            <Text c="gray.6">Kelola tugas dan monitoring pengumpulan mahasiswa</Text>
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
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateAssignment} disabled={showCreateForm}>
              Buat Assignment Baru
            </Button>
          </Group>
        </Group>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Paper withBorder shadow="sm" radius="md" p="xl">
            <Box>
              <Title order={3} mb="md">
                {editingAssignment ? 'Edit Assignment' : 'Buat Assignment Baru'}
              </Title>
              <Text c="gray.6" mb="lg">
                Form assignment akan ditampilkan di sini setelah component dibuat
              </Text>
              <Group>
                <Button variant="light" onClick={handleFormCancel}>
                  Batal
                </Button>
                <Button onClick={handleFormSuccess}>Simpan</Button>
              </Group>
            </Box>
          </Paper>
        )}

        {/* Stats Overview */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Total Assignment
                </Text>
                <Text fw={700} size="xl">
                  {stats.totalAssignments}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  {stats.activeAssignments} aktif
                </Text>
              </div>
              <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                <IconClipboardList size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Total Submission
                </Text>
                <Text fw={700} size="xl">
                  {stats.totalSubmissions}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Semua submission
                </Text>
              </div>
              <ThemeIcon color="green" variant="light" size="xl" radius="md">
                <IconFileText size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Menunggu Penilaian
                </Text>
                <Text fw={700} size="xl">
                  {stats.pendingSubmissions}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Perlu direview
                </Text>
              </div>
              <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                <IconClock size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Sudah Dinilai
                </Text>
                <Text fw={700} size="xl">
                  {stats.gradedSubmissions}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Selesai dinilai
                </Text>
              </div>
              <ThemeIcon color="teal" variant="light" size="xl" radius="md">
                <IconCheck size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Tabs Content */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconClipboardList size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="assignments" leftSection={<IconFileText size={16} />}>
              Daftar Assignment ({assignments.length})
            </Tabs.Tab>
            <Tabs.Tab value="submissions" leftSection={<IconUsers size={16} />}>
              Submission ({submissions.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xl">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Recent Assignments */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="lg">
                    Assignment Terbaru
                  </Text>
                  <ActionIcon variant="subtle" color="blue" onClick={() => setActiveTab('assignments')}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Group>
                <Stack gap="sm">
                  {assignments.slice(0, 3).map((assignment) => (
                    <Group key={assignment.id} justify="space-between" p="sm" style={{ borderRadius: '8px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                      <div>
                        <Text fw={500} size="sm">
                          {assignment.title}
                        </Text>
                        <Text size="xs" c="gray.6">
                          Minggu {assignment.week_number} • Code: {assignment.assignment_code}
                        </Text>
                      </div>
                      <Badge size="sm" color={assignment.is_active ? 'green' : 'gray'} variant="light">
                        {assignment.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </Group>
                  ))}
                  {assignments.length === 0 && (
                    <Text size="sm" c="gray.5" ta="center" py="xl">
                      Belum ada assignment yang dibuat
                    </Text>
                  )}
                </Stack>
              </Card>

              {/* Recent Submissions */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="lg">
                    Submission Terbaru
                  </Text>
                  <ActionIcon variant="subtle" color="blue" onClick={() => setActiveTab('submissions')}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Group>
                <Stack gap="sm">
                  {submissions.slice(0, 3).map((submission) => (
                    <Group key={submission.id} justify="space-between" p="sm" style={{ borderRadius: '8px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                      <div>
                        <Text fw={500} size="sm">
                          {submission.student?.name}
                        </Text>
                        <Text size="xs" c="gray.6">
                          {submission.assignment?.title}
                        </Text>
                      </div>
                      <Badge size="sm" color={submission.status === 'graded' ? 'green' : submission.status === 'submitted' ? 'blue' : 'gray'} variant="light">
                        {submission.status === 'graded' ? 'Dinilai' : submission.status === 'submitted' ? 'Dikumpulkan' : 'Pending'}
                      </Badge>
                    </Group>
                  ))}
                  {submissions.length === 0 && (
                    <Text size="sm" c="gray.5" ta="center" py="xl">
                      Belum ada submission
                    </Text>
                  )}
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="assignments" pt="xl">
            <Paper withBorder shadow="sm" radius="md" p="xl">
              <Stack align="center" gap="md">
                <IconFileText size={48} color="var(--mantine-color-gray-4)" />
                <div style={{ textAlign: 'center' }}>
                  <Text fw={600} size="lg" mb={4}>
                    Assignment List
                  </Text>
                  <Text c="gray.6" size="sm">
                    Component AssignmentList akan ditampilkan di sini setelah dibuat
                  </Text>
                </div>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="submissions" pt="xl">
            <Paper withBorder shadow="sm" radius="md" p="xl">
              <Stack align="center" gap="md">
                <IconUsers size={48} color="var(--mantine-color-gray-4)" />
                <div style={{ textAlign: 'center' }}>
                  <Text fw={600} size="lg" mb={4}>
                    Submission List
                  </Text>
                  <Text c="gray.6" size="sm">
                    Component SubmissionList akan ditampilkan di sini setelah dibuat
                  </Text>
                </div>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
