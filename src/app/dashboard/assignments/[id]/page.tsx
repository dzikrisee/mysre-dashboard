// src/app/dashboard/assignments/[id]/submissions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Paper, Stack, Group, Title, Text, Badge, Button, Card, Table, ScrollArea, ActionIcon, Alert, LoadingOverlay, Avatar, ThemeIcon, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconUsers, IconFileText, IconClock, IconTrophy, IconGrain, IconDownload, IconUser, IconCalendar, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { AssignmentService } from '@/lib/services/assignment.service';
import { useAuth } from '@/hooks/useAuth';
import type { Assignment, AssignmentSubmission } from '@/lib/types/assignment';

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
    averageGrade: 0,
  });

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load assignment details
      const assignmentResult = await AssignmentService.getAssignmentById(assignmentId);
      if (assignmentResult.error) {
        throw new Error(assignmentResult.error);
      }

      // Load submissions for this assignment
      const submissionsResult = await AssignmentService.getSubmissionsByAssignment(assignmentId);
      if (submissionsResult.error) {
        throw new Error(submissionsResult.error);
      }

      setAssignment(assignmentResult.data);
      setSubmissions(submissionsResult.data || []);

      // Calculate stats
      const allSubmissions = submissionsResult.data || [];
      const gradedSubmissions = allSubmissions.filter((s) => s.status === 'graded');
      const averageGrade = gradedSubmissions.length > 0 ? gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0) / gradedSubmissions.length : 0;

      setStats({
        totalSubmissions: allSubmissions.length,
        pendingSubmissions: allSubmissions.filter((s) => s.status === 'submitted').length,
        gradedSubmissions: gradedSubmissions.length,
        averageGrade: Math.round(averageGrade * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data submissions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = (submission: AssignmentSubmission) => {
    router.push(`/dashboard/assignments/grade/${submission.id}`);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'green';
      case 'submitted':
        return 'blue';
      case 'pending':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'graded':
        return 'Sudah Dinilai';
      case 'submitted':
        return 'Menunggu Penilaian';
      case 'pending':
        return 'Belum Dikumpulkan';
      default:
        return status;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return 'green';
    if (grade >= 70) return 'blue';
    if (grade >= 60) return 'orange';
    return 'red';
  };

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
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="light" size="lg" onClick={() => router.push('/dashboard/assignments')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={2}>Kelola Submissions</Title>
              <Text c="gray.6">
                {assignment.title} - Minggu {assignment.week_number}
              </Text>
            </div>
          </Group>

          <Group>
            <Badge leftSection={<IconUsers size={12} />} variant="light" color="blue" size="lg">
              {assignment.target_classes?.join(' & ') || 'Semua Kelas'}
            </Badge>
          </Group>
        </Group>

        {/* Assignment Info */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Title order={4}>Informasi Assignment</Title>
            <Badge variant="light" color="gray" tt="uppercase" fw={600}>
              {assignment.assignment_code}
            </Badge>
          </Group>

          <Text size="sm" c="gray.7" mb="md">
            {assignment.description}
          </Text>

          <Group>
            {assignment.due_date && (
              <Group gap="xs">
                <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
                <Text size="sm" c="gray.6">
                  Deadline:{' '}
                  {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Group>
            )}

            {assignment.file_url && (
              <Button variant="subtle" size="xs" leftSection={<IconDownload size={12} />} onClick={() => downloadFile(assignment.file_url!, assignment.file_name || 'assignment-file')}>
                Download File Assignment
              </Button>
            )}
          </Group>
        </Card>

        {/* Stats Overview */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Total Submissions
                </Text>
                <Text fw={700} size="xl">
                  {stats.totalSubmissions}
                </Text>
              </div>
              <ThemeIcon color="blue" variant="light" size="xl" radius="md">
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
              </div>
              <ThemeIcon color="green" variant="light" size="xl" radius="md">
                <IconCheck size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Rata-rata Nilai
                </Text>
                <Text fw={700} size="xl">
                  {stats.averageGrade}
                </Text>
              </div>
              <ThemeIcon color={getGradeColor(stats.averageGrade)} variant="light" size="xl" radius="md">
                <IconTrophy size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Submissions Table */}
        <Paper withBorder shadow="sm" radius="md">
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Mahasiswa</Table.Th>
                  <Table.Th>Kelas</Table.Th>
                  <Table.Th>Waktu Submit</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Nilai</Table.Th>
                  <Table.Th>File</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {submissions.map((submission) => (
                  <Table.Tr key={submission.id}>
                    <Table.Td>
                      <Group>
                        <Avatar size="sm" color="blue">
                          <IconUser size={16} />
                        </Avatar>
                        <div>
                          <Text fw={500} size="sm">
                            {submission.student?.name}
                          </Text>
                          <Text size="xs" c="gray.6">
                            NIM: {submission.student?.nim}
                          </Text>
                          <Text size="xs" c="gray.6">
                            {submission.student?.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Badge variant="light" size="sm">
                        Kelas {submission.student?.group}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">
                        {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        variant="light"
                        color={getStatusColor(submission.status)}
                        leftSection={submission.status === 'graded' ? <IconCheck size={12} /> : submission.status === 'submitted' ? <IconClock size={12} /> : <IconX size={12} />}
                      >
                        {getStatusLabel(submission.status)}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      {submission.grade !== null && submission.grade !== undefined ? (
                        <Badge variant="light" color={getGradeColor(submission.grade)} size="lg" leftSection={<IconTrophy size={12} />}>
                          {submission.grade}
                        </Badge>
                      ) : (
                        <Text size="sm" c="gray.5">
                          Belum dinilai
                        </Text>
                      )}
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        {submission.file_url ? (
                          <ActionIcon variant="light" color="blue" size="sm" onClick={() => downloadFile(submission.file_url!, submission.file_name || 'submission-file')} title="Download File Submission">
                            <IconDownload size={16} />
                          </ActionIcon>
                        ) : (
                          <Text size="xs" c="gray.5">
                            Text only
                          </Text>
                        )}
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Button
                        size="xs"
                        variant={submission.status === 'graded' ? 'light' : 'filled'}
                        color={submission.status === 'graded' ? 'green' : 'blue'}
                        leftSection={<IconGrain size={14} />}
                        onClick={() => handleGradeSubmission(submission)}
                      >
                        {submission.status === 'graded' ? 'Edit Nilai' : 'Beri Nilai'}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {submissions.length === 0 && !loading && (
            <Stack align="center" gap="md" p="xl">
              <IconFileText size={48} color="var(--mantine-color-gray-4)" />
              <div style={{ textAlign: 'center' }}>
                <Text fw={600} size="lg" mb={4}>
                  Belum Ada Submission
                </Text>
                <Text c="gray.6" size="sm">
                  Submission dari mahasiswa akan muncul di sini setelah mereka mengumpulkan tugas
                </Text>
              </div>
            </Stack>
          )}
        </Paper>

        {/* Quick Actions */}
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text fw={600} size="md" mb="xs">
                Quick Actions
              </Text>
              <Text size="sm" c="gray.6">
                Kelola assignment dan submissions dengan cepat
              </Text>
            </div>
            <Group>
              <Button variant="light" leftSection={<IconFileText size={16} />} onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}>
                Edit Assignment
              </Button>
              <Button variant="light" leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/dashboard/assignments')}>
                Kembali ke Daftar
              </Button>
            </Group>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
