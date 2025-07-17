// src/app/dashboard/assignments/page.tsx - Updated for students with class filtering
'use client';

import { useState, useEffect } from 'react';
import { Container, Paper, Stack, Group, Title, Text, Badge, Button, Card, SimpleGrid, Tabs, Table, ScrollArea, Alert, LoadingOverlay, ActionIcon, ThemeIcon, Progress, FileInput, TextInput, Textarea, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconUsers, IconFileText, IconTrophy, IconClock, IconFile, IconSend, IconEye, IconAlertCircle, IconCode, IconDownload, IconCheck } from '@tabler/icons-react';
import { AssignmentService } from '@/lib/services/assignment.service';
import { uploadFile } from '@/lib/services/storage.service';
import { useAuth } from '@/hooks/useAuth';
import type { Assignment, AssignmentSubmission } from '@/lib/types/assignment';

export default function StudentAssignmentsPage() {
  const { user, isAdmin } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    submittedAssignments: 0,
    gradedAssignments: 0,
    averageGrade: 0,
  });

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submissionForm = useForm({
    initialValues: {
      assignment_code_input: '',
      submission_text: '',
      file: null as File | null,
    },
    validate: {
      assignment_code_input: (value) => (!value ? 'Assignment code harus diisi' : null),
    },
  });

  useEffect(() => {
    if (user && !isAdmin()) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get user's class
      const studentClass = user?.group; // Assuming user.group contains 'A' or 'B'

      if (!studentClass) {
        throw new Error('Student class information not found');
      }

      // Load assignments for student's class only
      const assignmentsResult = await AssignmentService.getAssignmentsForClass(studentClass);
      if (assignmentsResult.error) {
        throw new Error(assignmentsResult.error);
      }

      // Load student submissions
      const submissionsResult = await AssignmentService.getStudentSubmissions(user!.id);
      if (submissionsResult.error) {
        throw new Error(submissionsResult.error);
      }

      setAssignments(assignmentsResult.data || []);
      setSubmissions(submissionsResult.data || []);

      // Calculate stats
      const totalAssignments = assignmentsResult.data?.length || 0;
      const submittedAssignments = submissionsResult.data?.length || 0;
      const gradedSubmissions = submissionsResult.data?.filter((s) => s.status === 'graded') || [];
      const averageGrade = gradedSubmissions.length > 0 ? gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0) / gradedSubmissions.length : 0;

      setStats({
        totalAssignments,
        submittedAssignments,
        gradedAssignments: gradedSubmissions.length,
        averageGrade,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data assignments',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitForm(true);
    submissionForm.reset();
  };

  const handleSubmissionSubmit = async (values: typeof submissionForm.values) => {
    if (!selectedAssignment || !user) return;

    try {
      setSubmitting(true);

      let fileUrl = null;
      let fileName = null;

      // Upload file if selected
      if (values.file) {
        const uploadResult = await uploadFile(values.file, 'submissions');
        if (uploadResult.error) {
          throw new Error(uploadResult.error);
        }
        fileUrl = uploadResult.url;
        fileName = values.file.name;
      }

      const result = await AssignmentService.submitAssignment({
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        assignment_code_input: values.assignment_code_input,
        submission_text: values.submission_text || undefined,
        file_url: fileUrl || undefined,
        file_name: fileName || undefined,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      notifications.show({
        title: 'Berhasil',
        message: 'Assignment berhasil dikumpulkan',
        color: 'green',
      });

      setShowSubmitForm(false);
      submissionForm.reset();
      loadData(); // Refresh data
    } catch (error: any) {
      console.error('Submit error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal mengumpulkan assignment',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
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
        return 'Dinilai';
      case 'submitted':
        return 'Dikumpulkan';
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

  const isAssignmentSubmitted = (assignmentId: string) => {
    return submissions.some((s) => s.assignment_id === assignmentId);
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find((s) => s.assignment_id === assignmentId);
  };

  const completionPercentage = stats.totalAssignments > 0 ? (stats.submittedAssignments / stats.totalAssignments) * 100 : 0;

  // Redirect admin to admin dashboard
  if (isAdmin()) {
    return (
      <Container size="md" mt="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Admin Access" color="blue">
          <Text mb="md">Anda login sebagai admin. Halaman ini untuk mahasiswa.</Text>
          <Button onClick={() => (window.location.href = '/dashboard/assignments')}>Go to Admin Dashboard</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>My Assignments</Title>
            <Text c="gray.6">Kelola dan kumpulkan tugas-tugas Anda</Text>
            {user?.group && (
              <Badge leftSection={<IconUsers size={12} />} variant="light" color="blue" mt="xs">
                Kelas {user.group}
              </Badge>
            )}
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
          </Group>
        </Group>

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
                  Assignment tersedia untuk kelas Anda
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
                  Dikumpulkan
                </Text>
                <Text fw={700} size="xl">
                  {stats.submittedAssignments}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Assignment yang sudah dikumpulkan
                </Text>
              </div>
              <ThemeIcon color="green" variant="light" size="xl" radius="md">
                <IconCheck size={28} />
              </ThemeIcon>
            </Group>
            <Progress value={completionPercentage} mt="md" size="sm" color="green" />
            <Text size="xs" c="gray.6" mt={4}>
              Progress: {completionPercentage.toFixed(1)}%
            </Text>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Dinilai
                </Text>
                <Text fw={700} size="xl">
                  {stats.gradedAssignments}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Assignment yang sudah dinilai
                </Text>
              </div>
              <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                <IconTrophy size={28} />
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
                  {stats.averageGrade.toFixed(1)}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Dari {stats.gradedAssignments} assignment
                </Text>
              </div>
              <ThemeIcon color={getGradeColor(stats.averageGrade)} variant="light" size="xl" radius="md">
                <IconTrophy size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Tabs Content */}
        <Tabs defaultValue="assignments">
          <Tabs.List>
            <Tabs.Tab value="assignments" leftSection={<IconFileText size={16} />}>
              Daftar Assignment ({assignments.length})
            </Tabs.Tab>
            <Tabs.Tab value="submissions" leftSection={<IconClock size={16} />}>
              Riwayat Submission ({submissions.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="assignments" pt="md">
            <Paper withBorder shadow="sm" radius="md">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Assignment</Table.Th>
                      <Table.Th>Code</Table.Th>
                      <Table.Th>Minggu</Table.Th>
                      <Table.Th>Deadline</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Aksi</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {assignments.map((assignment) => {
                      const submission = getSubmissionForAssignment(assignment.id);
                      const isSubmitted = isAssignmentSubmitted(assignment.id);

                      return (
                        <Table.Tr key={assignment.id}>
                          <Table.Td>
                            <div>
                              <Text fw={500} size="sm">
                                {assignment.title}
                              </Text>
                              <Text size="xs" c="gray.6" lineClamp={2}>
                                {assignment.description}
                              </Text>
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
                            {assignment.due_date ? (
                              <Text size="sm">
                                {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </Text>
                            ) : (
                              <Text size="sm" c="gray.5">
                                Tidak ada deadline
                              </Text>
                            )}
                          </Table.Td>

                          <Table.Td>
                            <Badge variant="light" color={getStatusColor(submission?.status || 'pending')}>
                              {getStatusLabel(submission?.status || 'pending')}
                            </Badge>
                            {submission?.grade !== null && submission?.grade !== undefined && (
                              <Badge variant="light" color={getGradeColor(submission.grade)} ml="xs">
                                {submission.grade}
                              </Badge>
                            )}
                          </Table.Td>

                          <Table.Td>
                            <Group gap="xs">
                              {assignment.file_url && (
                                <ActionIcon variant="light" color="green" size="sm" onClick={() => window.open(assignment.file_url!, '_blank')} title="Download File Assignment">
                                  <IconDownload size={16} />
                                </ActionIcon>
                              )}

                              {!isSubmitted ? (
                                <Button size="xs" leftSection={<IconSend size={14} />} onClick={() => handleSubmitAssignment(assignment)}>
                                  Kumpulkan
                                </Button>
                              ) : (
                                <Badge variant="light" color="green" size="sm">
                                  <IconCheck size={12} style={{ marginRight: 4 }} />
                                  Sudah dikumpulkan
                                </Badge>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {assignments.length === 0 && !loading && (
                <Stack align="center" gap="md" p="xl">
                  <IconFileText size={48} color="var(--mantine-color-gray-4)" />
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={600} size="lg" mb={4}>
                      Belum Ada Assignment
                    </Text>
                    <Text c="gray.6" size="sm">
                      Assignment untuk kelas Anda akan muncul di sini
                    </Text>
                  </div>
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="submissions" pt="md">
            <Paper withBorder shadow="sm" radius="md">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Assignment</Table.Th>
                      <Table.Th>Dikumpulkan</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Nilai</Table.Th>
                      <Table.Th>Aksi</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {submissions.map((submission) => (
                      <Table.Tr key={submission.id}>
                        <Table.Td>
                          <div>
                            <Text fw={500} size="sm">
                              {submission.assignment?.title}
                            </Text>
                            <Badge variant="light" color="gray" size="xs" mt={2}>
                              {submission.assignment?.assignment_code}
                            </Badge>
                          </div>
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
                          <Badge variant="light" color={getStatusColor(submission.status)}>
                            {getStatusLabel(submission.status)}
                          </Badge>
                        </Table.Td>

                        <Table.Td>
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <Badge variant="light" color={getGradeColor(submission.grade)} size="lg">
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
                            {submission.file_url && (
                              <ActionIcon variant="light" color="blue" size="sm" onClick={() => window.open(submission.file_url!, '_blank')} title="Download File Submission">
                                <IconDownload size={16} />
                              </ActionIcon>
                            )}

                            {submission.feedback && (
                              <ActionIcon
                                variant="light"
                                color="orange"
                                size="sm"
                                onClick={() => {
                                  notifications.show({
                                    title: 'Feedback Dosen',
                                    message: submission.feedback,
                                    color: 'blue',
                                    autoClose: 10000,
                                  });
                                }}
                                title="Lihat Feedback"
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            )}
                          </Group>
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
                      Submission Anda akan muncul di sini setelah mengumpulkan tugas
                    </Text>
                  </div>
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* Submit Assignment Form */}
        {showSubmitForm && selectedAssignment && (
          <Paper withBorder shadow="sm" radius="md" p="xl">
            <form onSubmit={submissionForm.onSubmit(handleSubmissionSubmit)}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Kumpulkan Assignment</Title>
                  <Button variant="light" onClick={() => setShowSubmitForm(false)}>
                    Tutup
                  </Button>
                </Group>

                <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
                  <Text fw={500} size="sm" mb={4}>
                    Assignment: {selectedAssignment.title}
                  </Text>
                  <Text size="sm">
                    Masukkan <strong>assignment code</strong> yang diberikan dosen untuk memverifikasi tugas yang benar.
                  </Text>
                </Alert>

                <TextInput label="Assignment Code" placeholder="Masukkan code assignment (contoh: A001)" required leftSection={<IconCode size={16} />} {...submissionForm.getInputProps('assignment_code_input')} />

                <Textarea label="Submission Text" placeholder="Ketik jawaban atau penjelasan Anda di sini..." minRows={4} maxRows={8} autosize {...submissionForm.getInputProps('submission_text')} />

                <Divider label="ATAU" labelPosition="center" />

                <FileInput label="Upload File" placeholder="Pilih file untuk dikumpulkan" leftSection={<IconFile size={16} />} accept=".pdf,.doc,.docx,.txt,.zip,.rar" {...submissionForm.getInputProps('file')} />

                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setShowSubmitForm(false)} disabled={submitting}>
                    Batal
                  </Button>
                  <Button type="submit" loading={submitting} leftSection={<IconSend size={16} />}>
                    Kumpulkan Tugas
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
