// src/app/dashboard/assignments/grade/[submissionId]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Paper, Stack, Group, Title, Text, Badge, Button, Card, Divider, Textarea, NumberInput, Alert, LoadingOverlay, ActionIcon, Box, ScrollArea, Grid, Avatar, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDownload, IconUser, IconCalendar, IconClock, IconFile, IconCheck, IconAlertCircle, IconNotes, IconStar, IconFileText } from '@tabler/icons-react';
import { AssignmentService } from '@/lib/services/assignment.service';
import { useAuth } from '@/providers/auth-provider';
import type { AssignmentSubmission } from '@/lib/types/assignment';

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);

  const form = useForm({
    initialValues: {
      grade: 0,
      feedback: '',
    },
    validate: {
      grade: (value) => {
        if (value < 0 || value > 100) return 'Nilai harus antara 0-100';
        return null;
      },
    },
  });

  useEffect(() => {
    loadSubmissionData();
  }, [submissionId]);

  const loadSubmissionData = async () => {
    try {
      setLoading(true);
      const result = await AssignmentService.getSubmissionById(submissionId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setSubmission(result.data);
        // Set form values jika sudah ada nilai
        if (result.data.grade !== null) {
          form.setValues({
            grade: result.data.grade,
            feedback: result.data.feedback || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data submission',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (values: typeof form.values) => {
    if (!submission) return;

    try {
      setGrading(true);
      const result = await AssignmentService.gradeSubmission(submission.id, values.grade, values.feedback);

      if (result.error) {
        throw new Error(result.error);
      }

      notifications.show({
        title: 'Berhasil',
        message: 'Penilaian berhasil disimpan',
        color: 'green',
      });

      // Refresh data
      await loadSubmissionData();
    } catch (error) {
      console.error('Grading error:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan penilaian',
        color: 'red',
      });
    } finally {
      setGrading(false);
    }
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

  if (!submission) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Submission Tidak Ditemukan" color="red">
          Submission yang Anda cari tidak ditemukan atau telah dihapus.
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
            <ActionIcon variant="light" size="lg" onClick={() => router.back()}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={2}>Penilaian Assignment</Title>
              <Text c="gray.6">Detail submission dan form penilaian</Text>
            </div>
          </Group>

          <Badge leftSection={<IconClock size={12} />} variant="light" color={getStatusColor(submission.status)} size="lg">
            {getStatusLabel(submission.status)}
          </Badge>
        </Group>

        <Grid>
          {/* Left Column - Submission Details */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="md">
              {/* Assignment Info */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4}>Informasi Assignment</Title>
                  <Badge variant="light" color="blue">
                    Minggu {submission.assignment?.week_number}
                  </Badge>
                </Group>

                <Stack gap="sm">
                  <Group>
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconFileText size={14} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">
                        Judul Assignment
                      </Text>
                      <Text size="sm" c="gray.7">
                        {submission.assignment?.title}
                      </Text>
                    </div>
                  </Group>

                  <Group>
                    <ThemeIcon variant="light" color="gray" size="sm">
                      <IconNotes size={14} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">
                        Assignment Code
                      </Text>
                      <Text size="sm" c="gray.7" tt="uppercase" fw={600}>
                        {submission.assignment?.assignment_code}
                      </Text>
                    </div>
                  </Group>

                  {submission.assignment?.due_date && (
                    <Group>
                      <ThemeIcon variant="light" color="orange" size="sm">
                        <IconCalendar size={14} />
                      </ThemeIcon>
                      <div>
                        <Text fw={500} size="sm">
                          Deadline
                        </Text>
                        <Text size="sm" c="gray.7">
                          {new Date(submission.assignment.due_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </div>
                    </Group>
                  )}

                  {submission.assignment?.description && (
                    <>
                      <Divider size="xs" />
                      <div>
                        <Text fw={500} size="sm" mb="xs">
                          Deskripsi Assignment
                        </Text>
                        <ScrollArea style={{ maxHeight: 300 }}>
                          <Text size="sm" c="gray.7" style={{ whiteSpace: 'pre-wrap' }}>
                            {submission.assignment.description}
                          </Text>
                        </ScrollArea>
                      </div>
                    </>
                  )}

                  {submission.assignment?.file_url && (
                    <>
                      <Divider size="xs" />
                      <Group>
                        <ThemeIcon variant="light" color="green" size="sm">
                          <IconFile size={14} />
                        </ThemeIcon>
                        <div style={{ flex: 1 }}>
                          <Text fw={500} size="sm">
                            File Assignment
                          </Text>
                          <Group gap="xs">
                            <Text size="sm" c="gray.7">
                              {submission.assignment.file_name}
                            </Text>
                            <Button variant="subtle" size="xs" leftSection={<IconDownload size={12} />} onClick={() => downloadFile(submission.assignment!.file_url!, submission.assignment!.file_name || 'assignment-file')}>
                              Download
                            </Button>
                          </Group>
                        </div>
                      </Group>
                    </>
                  )}
                </Stack>
              </Card>

              {/* Student Info */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Title order={4} mb="md">
                  Informasi Mahasiswa
                </Title>

                <Group>
                  <Avatar size="lg" color="blue">
                    <IconUser size={24} />
                  </Avatar>
                  <div>
                    <Text fw={600} size="lg">
                      {submission.student?.name}
                    </Text>
                    <Group gap="md">
                      <Text size="sm" c="gray.6">
                        NIM: {submission.student?.nim}
                      </Text>
                      <Badge variant="light" size="sm">
                        Kelas {submission.student?.group}
                      </Badge>
                    </Group>
                    <Text size="sm" c="gray.6">
                      {submission.student?.email}
                    </Text>
                  </div>
                </Group>
              </Card>

              {/* Submission Content */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Title order={4} mb="md">
                  Jawaban Mahasiswa
                </Title>

                <Stack gap="md">
                  <Group>
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconCalendar size={14} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">
                        Waktu Pengumpulan
                      </Text>
                      <Text size="sm" c="gray.7">
                        {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </div>
                  </Group>

                  <Group>
                    <ThemeIcon variant="light" color="gray" size="sm">
                      <IconNotes size={14} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500} size="sm">
                        Code yang Diinput
                      </Text>
                      <Text size="sm" c="gray.7" tt="uppercase" fw={600}>
                        {submission.assignment_code_input}
                      </Text>
                    </div>
                  </Group>

                  {submission.submission_text && (
                    <>
                      <Divider size="xs" />
                      <div>
                        <Text fw={500} size="sm" mb="xs">
                          Jawaban Teks
                        </Text>
                        <Paper withBorder p="md" bg="gray.0">
                          <ScrollArea style={{ maxHeight: 300 }}>
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                              {submission.submission_text}
                            </Text>
                          </ScrollArea>
                        </Paper>
                      </div>
                    </>
                  )}

                  {submission.file_url && (
                    <>
                      <Divider size="xs" />
                      <Group>
                        <ThemeIcon variant="light" color="green" size="sm">
                          <IconFile size={14} />
                        </ThemeIcon>
                        <div style={{ flex: 1 }}>
                          <Text fw={500} size="sm">
                            File Submission
                          </Text>
                          <Group gap="xs">
                            <Text size="sm" c="gray.7">
                              {submission.file_name}
                            </Text>
                            <Button variant="filled" size="sm" leftSection={<IconDownload size={16} />} onClick={() => downloadFile(submission.file_url!, submission.file_name || 'submission-file')}>
                              Download File
                            </Button>
                          </Group>
                        </div>
                      </Group>
                    </>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column - Grading Form */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder shadow="sm" radius="md" p="lg" style={{ position: 'sticky', top: 20 }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={4}>Form Penilaian</Title>
                  {submission.status === 'graded' && (
                    <Badge leftSection={<IconCheck size={12} />} color="green">
                      Sudah Dinilai
                    </Badge>
                  )}
                </Group>

                {submission.status === 'graded' && submission.graded_at && (
                  <Alert icon={<IconCheck size={16} />} color="green" variant="light">
                    <Text size="sm" fw={500}>
                      Sudah dinilai pada:
                    </Text>
                    <Text size="xs">
                      {new Date(submission.graded_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Alert>
                )}

                <form onSubmit={form.onSubmit(handleGradeSubmit)}>
                  <Stack gap="md">
                    <NumberInput
                      label="Nilai (0-100)"
                      placeholder="Masukkan nilai"
                      required
                      min={0}
                      max={100}
                      leftSection={<IconStar size={16} />}
                      {...form.getInputProps('grade')}
                      description={
                        form.values.grade > 0 ? (
                          <Badge color={getGradeColor(form.values.grade)} size="sm" mt="xs">
                            {form.values.grade >= 85 ? 'A' : form.values.grade >= 70 ? 'B' : form.values.grade >= 60 ? 'C' : form.values.grade >= 50 ? 'D' : 'E'}
                          </Badge>
                        ) : null
                      }
                    />

                    <Textarea label="Feedback (Opsional)" placeholder="Berikan feedback untuk mahasiswa..." minRows={4} maxRows={8} autosize leftSection={<IconNotes size={16} />} {...form.getInputProps('feedback')} />

                    <Button type="submit" loading={grading} disabled={!form.isValid()} fullWidth leftSection={<IconCheck size={16} />}>
                      {submission.status === 'graded' ? 'Update Penilaian' : 'Simpan Penilaian'}
                    </Button>

                    <Button variant="light" onClick={() => router.back()} disabled={grading} fullWidth>
                      Kembali
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
