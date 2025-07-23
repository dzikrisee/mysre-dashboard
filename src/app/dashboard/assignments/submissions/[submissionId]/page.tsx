// src/app/dashboard/assignments/submissions/[submissionId]/page.tsx
// FIXED: Infinite loop issue

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Paper, Stack, Group, Title, Text, Badge, Button, Card, Textarea, NumberInput, Alert, LoadingOverlay, ActionIcon, Box, Grid, ThemeIcon, Anchor, Breadcrumbs } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDownload, IconUser, IconClock, IconFile, IconCheck, IconAlertCircle, IconNotes, IconStar, IconFileText, IconCode, IconEdit, IconDeviceFloppy, IconCalendar } from '@tabler/icons-react';
import { AssignmentService } from '@/lib/services/assignment.service';
import { useAuth } from '@/providers/auth-provider';
import type { AssignmentSubmission } from '@/lib/types/assignment';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [editing, setEditing] = useState(false);

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

  // FIXED: Remove useCallback dan dependency yang menyebabkan infinite loop
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
        if (result.data.grade !== null && result.data.grade !== undefined) {
          form.setValues({
            grade: result.data.grade,
            feedback: result.data.feedback || '',
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading submission:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data submission',
        color: 'red',
      });
      router.push('/dashboard/assignments');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Hanya dependency submissionId yang stabil
  useEffect(() => {
    if (submissionId) {
      loadSubmissionData();
    }
  }, [submissionId]);

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

      setEditing(false);
      // Reload data setelah berhasil
      await loadSubmissionData();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menyimpan penilaian',
        color: 'red',
      });
    } finally {
      setGrading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'submitted':
        return 'blue';
      case 'graded':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Belum Dikumpulkan';
      case 'submitted':
        return 'Menunggu Penilaian';
      case 'graded':
        return 'Sudah Dinilai';
      default:
        return status;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'green';
    if (grade >= 60) return 'yellow';
    return 'red';
  };

  // Safe grade check
  const hasGrade = submission?.grade !== null && submission?.grade !== undefined;
  const gradeValue = submission?.grade || 0;

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible={loading} />
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Submission Tidak Ditemukan" color="red">
          Submission yang Anda cari tidak ditemukan atau telah dihapus.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Group>
          <ActionIcon variant="light" onClick={() => router.back()}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Breadcrumbs>
            <Anchor onClick={() => router.push('/dashboard/assignments')}>Assignments</Anchor>
            <Text>Detail Submission</Text>
          </Breadcrumbs>
        </Group>

        {/* Header */}
        <Paper withBorder shadow="sm" radius="md" p="xl">
          <Group justify="space-between" mb="xl">
            <div>
              <Title order={2}>Detail Submission</Title>
              <Text c="gray.6">Submission untuk assignment {submission.assignment?.title}</Text>
            </div>
            <Group>
              <Badge size="lg" color={getStatusColor(submission.status)} variant="light">
                {getStatusLabel(submission.status)}
              </Badge>
              {hasGrade && (
                <Badge size="lg" color={getGradeColor(gradeValue)} variant="filled">
                  {gradeValue}/100
                </Badge>
              )}
            </Group>
          </Group>

          {/* Student Info */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="md">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="blue" size="lg">
                    <IconUser size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="lg">
                      {submission.student?.name}
                    </Text>
                    <Group gap="xs">
                      <Text size="sm" c="gray.6">
                        NIM: {submission.student?.nim}
                      </Text>
                      <Badge size="xs" variant="light">
                        Group {submission.student?.group}
                      </Badge>
                    </Group>
                  </div>
                </Group>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="md">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="green" size="lg">
                    <IconClock size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="lg">
                      Waktu Pengumpulan
                    </Text>
                    <Text size="sm" c="gray.6">
                      {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('id-ID') : 'Belum dikumpulkan'}
                    </Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Assignment Details */}
        <Paper withBorder shadow="sm" radius="md" p="xl">
          <Title order={3} mb="md">
            Detail Assignment
          </Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Group>
                  <ThemeIcon variant="light" color="blue" size="sm">
                    <IconFileText size={14} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500} size="sm">
                      Judul
                    </Text>
                    <Text size="sm" c="gray.7">
                      {submission.assignment?.title}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon variant="light" color="violet" size="sm">
                    <IconCode size={14} />
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
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="sm">
                <Group>
                  <ThemeIcon variant="light" color="orange" size="sm">
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500} size="sm">
                      Minggu
                    </Text>
                    <Text size="sm" c="gray.7">
                      Minggu {submission.assignment?.week_number}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon variant="light" color="red" size="sm">
                    <IconClock size={14} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500} size="sm">
                      Deadline
                    </Text>
                    <Text size="sm" c="gray.7">
                      {submission.assignment?.due_date ? new Date(submission.assignment.due_date).toLocaleString('id-ID') : 'Tidak ada deadline'}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>

          {submission.assignment?.description && (
            <Box mt="md">
              <Text fw={500} size="sm" mb="xs">
                Deskripsi
              </Text>
              <Text size="sm" c="gray.7" style={{ whiteSpace: 'pre-wrap' }}>
                {submission.assignment.description}
              </Text>
            </Box>
          )}
        </Paper>

        {/* Submission Content */}
        <Paper withBorder shadow="sm" radius="md" p="xl">
          <Title order={3} mb="md">
            Konten Submission
          </Title>

          {submission.file_url && (
            <Card withBorder radius="md" p="md" mb="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon variant="light" color="blue" size="lg">
                    <IconFile size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>File Attachment</Text>
                    <Text size="sm" c="gray.6">
                      {submission.file_name || 'file.pdf'}
                    </Text>
                  </div>
                </Group>
                <Button leftSection={<IconDownload size={16} />} variant="light" component="a" href={submission.file_url} target="_blank">
                  Download
                </Button>
              </Group>
            </Card>
          )}

          {submission.submission_text && (
            <Card withBorder radius="md" p="md">
              <Text fw={600} mb="sm">
                Teks Submission
              </Text>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {submission.submission_text}
              </Text>
            </Card>
          )}

          {submission.assignment_code_input && (
            <Card withBorder radius="md" p="md" mt="md">
              <Text fw={600} mb="sm">
                Assignment Code yang Dimasukkan
              </Text>
              <Text size="sm" tt="uppercase" fw={600} c="blue">
                {submission.assignment_code_input}
              </Text>
            </Card>
          )}
        </Paper>

        {/* Grading Section */}
        {user?.role === 'ADMIN' && (
          <Paper withBorder shadow="sm" radius="md" p="xl">
            <Group justify="space-between" mb="md">
              <Title order={3}>Penilaian</Title>
              {!editing && (
                <Button leftSection={<IconEdit size={16} />} variant="light" onClick={() => setEditing(true)}>
                  {hasGrade ? 'Edit Nilai' : 'Beri Nilai'}
                </Button>
              )}
            </Group>

            {editing ? (
              <form onSubmit={form.onSubmit(handleGradeSubmit)}>
                <Stack gap="md">
                  <NumberInput label="Nilai (0-100)" placeholder="Masukkan nilai" min={0} max={100} {...form.getInputProps('grade')} required />

                  <Textarea label="Feedback" placeholder="Berikan feedback untuk mahasiswa (opsional)" rows={4} {...form.getInputProps('feedback')} />

                  <Group>
                    <Button type="submit" leftSection={<IconDeviceFloppy size={16} />} loading={grading}>
                      Simpan Penilaian
                    </Button>
                    <Button variant="light" color="gray" onClick={() => setEditing(false)}>
                      Batal
                    </Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <Stack gap="md">
                {hasGrade ? (
                  <>
                    <Group>
                      <ThemeIcon variant="light" color={getGradeColor(gradeValue)} size="lg">
                        <IconStar size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600} size="lg">
                          Nilai: {gradeValue}/100
                        </Text>
                        <Badge color={getGradeColor(gradeValue)} variant="light">
                          {gradeValue >= 80 ? 'Excellent' : gradeValue >= 60 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </Group>

                    {submission.feedback && (
                      <Card withBorder radius="md" p="md">
                        <Text fw={600} mb="sm">
                          Feedback
                        </Text>
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                          {submission.feedback}
                        </Text>
                      </Card>
                    )}
                  </>
                ) : (
                  <Alert icon={<IconAlertCircle size={16} />} color="blue">
                    Submission ini belum dinilai. Klik "Beri Nilai" untuk memberikan penilaian.
                  </Alert>
                )}
              </Stack>
            )}
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
