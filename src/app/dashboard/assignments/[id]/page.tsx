// src/app/dashboard/assignments/[id]/page.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Stack, Title, Text, Group, Badge, Button, Card, SimpleGrid, ThemeIcon, LoadingOverlay, Alert, Breadcrumbs, Anchor, Divider, ActionIcon, Menu, Tabs, Paper, Box, Progress, Tooltip } from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconDownload,
  IconUsers,
  IconCalendar,
  IconCode,
  IconFile,
  IconClipboardList,
  IconStar,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconToggleLeft,
  IconToggleRight,
  IconChartBar,
  IconEye,
  IconDots,
} from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { AssignmentService } from '@/lib/services/assignment.service';
import { Assignment, AssignmentSubmission } from '@/lib/types/assignment';
import { SubmissionList } from '@/components/assignment/submission-list';
import { AssignmentForm } from '@/components/assignment/assignment-form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  useEffect(() => {
    if (assignmentId) {
      loadAssignmentData();
    }
  }, [assignmentId]);

  const loadAssignmentData = async () => {
    setLoading(true);
    try {
      const [assignmentResult, submissionsResult] = await Promise.all([AssignmentService.getAssignmentById(assignmentId), AssignmentService.getSubmissionsByAssignment(assignmentId)]);

      if (assignmentResult.error) {
        console.error('Error loading assignment:', assignmentResult.error);
        notifications.show({
          title: 'Error',
          message: 'Assignment tidak ditemukan',
          color: 'red',
        });
        router.push('/dashboard/assignments');
        return;
      }

      if (submissionsResult.error) {
        console.error('Error loading submissions:', submissionsResult.error);
      }

      setAssignment(assignmentResult.data);
      setSubmissions(submissionsResult.data || []);
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

  const handleToggleStatus = async () => {
    if (!assignment) return;

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
        await loadAssignmentData();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengubah status assignment',
        color: 'red',
      });
    }
  };

  const handleDeleteAssignment = () => {
    if (!assignment) return;

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
          router.push('/dashboard/assignments');
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    loadAssignmentData();
  };

  const downloadFile = () => {
    if (assignment?.file_url) {
      window.open(assignment.file_url, '_blank');
    }
  };

  // Calculate statistics with safe null checking
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  // Safe calculation for average grade
  const gradedSubmissions = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
  const averageGrade = gradedSubmissions.length > 0 ? gradedSubmissions.reduce((acc, s) => acc + (s.grade as number), 0) / gradedSubmissions.length : 0;

  // Check admin access
  if (!user || user.role !== 'ADMIN') {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Akses Ditolak" color="red">
          Halaman ini hanya dapat diakses oleh admin.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible={loading} />
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Assignment Tidak Ditemukan" color="red">
          Assignment yang Anda cari tidak ditemukan atau telah dihapus.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/dashboard/assignments')} style={{ cursor: 'pointer' }}>
            Assignments
          </Anchor>
          <Text>{assignment.title}</Text>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="subtle" color="gray" onClick={() => router.push('/dashboard/assignments')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={2}>{assignment.title}</Title>
              <Group gap="xs" mt={4}>
                <Badge size="sm" variant="light" color="blue">
                  Minggu {assignment.week_number}
                </Badge>
                <Badge size="sm" variant="light" color="violet" leftSection={<IconCode size={12} />}>
                  {assignment.assignment_code}
                </Badge>
                <Badge size="sm" color={assignment.is_active ? 'green' : 'gray'} variant="light">
                  {assignment.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
                {assignment.due_date && (
                  <Badge size="sm" variant="light" color="orange" leftSection={<IconCalendar size={12} />}>
                    {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Badge>
                )}
              </Group>
            </div>
          </Group>

          <Group>
            <Tooltip label={assignment.is_active ? 'Nonaktifkan Assignment' : 'Aktifkan Assignment'}>
              <ActionIcon variant="light" color={assignment.is_active ? 'orange' : 'green'} onClick={handleToggleStatus} size="lg">
                {assignment.is_active ? <IconToggleRight size={20} /> : <IconToggleLeft size={20} />}
              </ActionIcon>
            </Tooltip>

            <Button leftSection={<IconEdit size={16} />} variant="light" onClick={() => setShowEditForm(true)}>
              Edit
            </Button>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="light" color="gray" size="lg">
                  <IconDots size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {assignment.file_url && (
                  <Menu.Item leftSection={<IconDownload size={16} />} onClick={downloadFile}>
                    Download File
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={handleDeleteAssignment}>
                  Hapus Assignment
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Edit Form */}
        {showEditForm && (
          <Paper withBorder shadow="sm" radius="md" p="xl">
            <AssignmentForm assignment={assignment} onSuccess={handleFormSuccess} onCancel={() => setShowEditForm(false)} />
          </Paper>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconEye size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="submissions" leftSection={<IconUsers size={16} />}>
              Submissions ({totalSubmissions})
            </Tabs.Tab>
            <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
              Analytics
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xl">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Assignment Details */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Title order={4} mb="md">
                  Detail Assignment
                </Title>
                <Stack gap="md">
                  <div>
                    <Text size="sm" c="gray.6" mb={4}>
                      Deskripsi:
                    </Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {assignment.description}
                    </Text>
                  </div>

                  {assignment.file_url && (
                    <div>
                      <Text size="sm" c="gray.6" mb={4}>
                        File Assignment:
                      </Text>
                      <Group gap="xs">
                        <IconFile size={16} />
                        <Anchor onClick={downloadFile} style={{ cursor: 'pointer' }}>
                          {assignment.file_name}
                        </Anchor>
                      </Group>
                    </div>
                  )}

                  <div>
                    <Text size="sm" c="gray.6" mb={4}>
                      Dibuat oleh:
                    </Text>
                    <Text size="sm">{assignment.creator?.name}</Text>
                  </div>

                  <div>
                    <Text size="sm" c="gray.6" mb={4}>
                      Tanggal dibuat:
                    </Text>
                    <Text size="sm">
                      {new Date(assignment.createdAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </div>
                </Stack>
              </Card>

              {/* Statistics */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Title order={4} mb="md">
                  Statistik Submission
                </Title>
                <SimpleGrid cols={2} spacing="md">
                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="gray.6">
                        Total Submission
                      </Text>
                      <Text size="sm" fw={600}>
                        {totalSubmissions}
                      </Text>
                    </Group>
                    <Progress value={(totalSubmissions / Math.max(totalSubmissions, 1)) * 100} color="blue" size="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="gray.6">
                        Dikumpulkan
                      </Text>
                      <Text size="sm" fw={600}>
                        {submittedCount}
                      </Text>
                    </Group>
                    <Progress value={totalSubmissions > 0 ? (submittedCount / totalSubmissions) * 100 : 0} color="green" size="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="gray.6">
                        Perlu Review
                      </Text>
                      <Text size="sm" fw={600}>
                        {submittedCount}
                      </Text>
                    </Group>
                    <Progress value={totalSubmissions > 0 ? (submittedCount / totalSubmissions) * 100 : 0} color="orange" size="sm" />
                  </div>

                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="gray.6">
                        Sudah Dinilai
                      </Text>
                      <Text size="sm" fw={600}>
                        {gradedCount}
                      </Text>
                    </Group>
                    <Progress value={totalSubmissions > 0 ? (gradedCount / totalSubmissions) * 100 : 0} color="teal" size="sm" />
                  </div>
                </SimpleGrid>

                {gradedCount > 0 && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
                    <Group justify="space-between">
                      <Text size="sm" c="gray.6">
                        Nilai Rata-rata:
                      </Text>
                      <Badge size="lg" color={averageGrade >= 80 ? 'green' : averageGrade >= 60 ? 'orange' : 'red'}>
                        {averageGrade.toFixed(1)}
                      </Badge>
                    </Group>
                  </div>
                )}
              </Card>
            </SimpleGrid>

            {/* Recent Submissions Preview */}
            <Card withBorder shadow="sm" radius="md" p="lg" mt="xl">
              <Group justify="space-between" mb="md">
                <Title order={4}>Submission Terbaru</Title>
                <Button variant="light" size="sm" onClick={() => setActiveTab('submissions')}>
                  Lihat Semua
                </Button>
              </Group>

              {submissions.length === 0 ? (
                <Box p="xl" ta="center">
                  <IconUsers size={48} color="var(--mantine-color-gray-4)" />
                  <Text c="gray.5" mt="md">
                    Belum ada submission
                  </Text>
                </Box>
              ) : (
                <Stack gap="sm">
                  {submissions.slice(0, 5).map((submission) => (
                    <Group key={submission.id} justify="space-between" p="sm" style={{ borderRadius: '8px', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                      <div>
                        <Text fw={500} size="sm">
                          {submission.student?.name}
                        </Text>
                        <Text size="xs" c="gray.6">
                          {submission.student?.nim}
                        </Text>
                      </div>
                      <Group gap="xs">
                        <Badge size="sm" color={submission.status === 'graded' ? 'green' : submission.status === 'submitted' ? 'blue' : 'gray'} variant="light">
                          {submission.status === 'graded' ? 'Dinilai' : submission.status === 'submitted' ? 'Dikumpulkan' : 'Pending'}
                        </Badge>
                        {submission.grade !== null && submission.grade !== undefined && (
                          <Badge size="sm" color={submission.grade >= 80 ? 'green' : submission.grade >= 60 ? 'orange' : 'red'}>
                            {submission.grade}
                          </Badge>
                        )}
                      </Group>
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="submissions" pt="xl">
            <SubmissionList submissions={submissions} onRefresh={loadAssignmentData} />
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="xl">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Title order={4} mb="md">
                  Distribusi Status
                </Title>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="gray" variant="light">
                        <IconClock size={14} />
                      </ThemeIcon>
                      <Text size="sm">Pending</Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {pendingCount}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="blue" variant="light">
                        <IconClipboardList size={14} />
                      </ThemeIcon>
                      <Text size="sm">Dikumpulkan</Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {submittedCount}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" variant="light">
                        <IconCheck size={14} />
                      </ThemeIcon>
                      <Text size="sm">Dinilai</Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {gradedCount}
                    </Text>
                  </Group>
                </Stack>
              </Card>

              <Card withBorder shadow="sm" radius="md" p="lg">
                <Title order={4} mb="md">
                  Distribusi Nilai
                </Title>
                {gradedCount === 0 ? (
                  <Text c="gray.5" ta="center" py="xl">
                    Belum ada nilai yang diberikan
                  </Text>
                ) : (
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text size="sm">A (≥80)</Text>
                      <Text size="sm" fw={600}>
                        {submissions.filter((s) => s.grade !== null && s.grade !== undefined && s.grade >= 80).length}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">B (60-79)</Text>
                      <Text size="sm" fw={600}>
                        {submissions.filter((s) => s.grade !== null && s.grade !== undefined && s.grade >= 60 && s.grade < 80).length}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">C (&lt;60)</Text>
                      <Text size="sm" fw={600}>
                        {submissions.filter((s) => s.grade !== null && s.grade !== undefined && s.grade < 60).length}
                      </Text>
                    </Group>
                  </Stack>
                )}
              </Card>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
