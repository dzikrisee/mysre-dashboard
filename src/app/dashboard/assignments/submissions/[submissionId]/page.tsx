// src/app/dashboard/assignments/submissions/[submissionId]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Paper, Stack, Group, Title, Text, Badge, Button, Card, Textarea, NumberInput, Alert, LoadingOverlay, ActionIcon, Box, Grid, ThemeIcon, Anchor, Breadcrumbs } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconDownload,
  IconUser,
  IconClock,
  IconFile,
  IconCheck,
  IconAlertCircle,
  IconNotes,
  IconStar,
  IconFileText,
  IconCode,
  IconEdit,
  IconDeviceFloppy, // FIXED: Changed from IconSave
} from '@tabler/icons-react';
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

  const loadSubmissionData = useCallback(async () => {
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
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data submission',
        color: 'red',
      });
      router.push('/dashboard/assignments');
    } finally {
      setLoading(false);
    }
  }, [submissionId, form, router]);

  useEffect(() => {
    if (submissionId) {
      loadSubmissionData();
    }
  }, [submissionId, loadSubmissionData]);

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

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'green';
    if (grade >= 60) return 'yellow';
    return 'red';
  };

  // FIXED: Safe grade check
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
                {submission.status === 'submitted' ? 'Menunggu Penilaian' : submission.status === 'graded' ? 'Sudah Dinilai' : 'Pending'}
              </Badge>
              {hasGrade && (
                <Badge size="lg" color={getGradeColor(gradeValue)} variant="filled">
                  Nilai: {gradeValue}
                </Badge>
              )}
            </Group>
          </Group>

          <Grid>
            {/* Student Info */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="lg">
                <Group mb="md">
                  <ThemeIcon size="lg" variant="light" color="blue">
                    <IconUser size={20} />
                  </ThemeIcon>
                  <Text fw={600}>Informasi Mahasiswa</Text>
                </Group>
                <Stack gap="sm">
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Nama:
                    </Text>
                    <Text size="sm">{submission.student?.name || 'N/A'}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      NIM:
                    </Text>
                    <Text size="sm" ff="monospace">
                      {submission.student?.nim || 'N/A'}
                    </Text>
                  </Group>
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Email:
                    </Text>
                    <Text size="sm">{submission.student?.email || 'N/A'}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Kelas:
                    </Text>
                    <Badge variant="light" size="sm">
                      Kelas {submission.student?.group || 'N/A'}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Assignment Info */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" p="lg">
                <Group mb="md">
                  <ThemeIcon size="lg" variant="light" color="green">
                    <IconFileText size={20} />
                  </ThemeIcon>
                  <Text fw={600}>Informasi Assignment</Text>
                </Group>
                <Stack gap="sm">
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Judul:
                    </Text>
                    <Text size="sm">{submission.assignment?.title || 'N/A'}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Code:
                    </Text>
                    <Badge variant="light" color="cyan" size="sm">
                      {submission.assignment?.assignment_code || 'N/A'}
                    </Badge>
                  </Group>
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Minggu:
                    </Text>
                    <Text size="sm">Minggu {submission.assignment?.week_number || 'N/A'}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} size="sm" w={80}>
                      Dibuat:
                    </Text>
                    <Text size="sm">{submission.assignment?.creator?.name || 'N/A'}</Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Submission Content */}
        <Paper withBorder shadow="sm" radius="md" p="xl">
          <Title order={3} mb="lg">
            Konten Submission
          </Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                {/* Submission Info */}
                <Card withBorder radius="md" p="md">
                  <Group mb="md">
                    <IconClock size={16} />
                    <Text fw={600} size="sm">
                      Waktu Submit
                    </Text>
                  </Group>
                  <Text size="sm">
                    {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Card>

                {/* Assignment Code Input */}
                <Card withBorder radius="md" p="md">
                  <Group mb="md">
                    <IconCode size={16} />
                    <Text fw={600} size="sm">
                      Code yang Diinput
                    </Text>
                  </Group>
                  <Group>
                    <Text ff="monospace" fw={600} c={submission.assignment_code_input === submission.assignment?.assignment_code ? 'green' : 'red'}>
                      {submission.assignment_code_input}
                    </Text>
                    {submission.assignment_code_input === submission.assignment?.assignment_code ? <IconCheck size={16} color="green" /> : <IconAlertCircle size={16} color="red" />}
                  </Group>
                  {submission.assignment_code_input !== submission.assignment?.assignment_code && (
                    <Text size="xs" c="red" mt="xs">
                      Code seharusnya: {submission.assignment?.assignment_code}
                    </Text>
                  )}
                </Card>

                {/* File Upload */}
                {submission.file_url && (
                  <Card withBorder radius="md" p="md">
                    <Group mb="md">
                      <IconFile size={16} />
                      <Text fw={600} size="sm">
                        File Submission
                      </Text>
                    </Group>
                    <Group>
                      <Text size="sm">{submission.file_name}</Text>
                      <Button size="xs" leftSection={<IconDownload size={14} />} onClick={() => window.open(submission.file_url!, '_blank')}>
                        Download
                      </Button>
                    </Group>
                  </Card>
                )}

                {/* Text Submission */}
                {submission.submission_text && (
                  <Card withBorder radius="md" p="md">
                    <Group mb="md">
                      <IconNotes size={16} />
                      <Text fw={600} size="sm">
                        Teks Submission
                      </Text>
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {submission.submission_text}
                    </Text>
                  </Card>
                )}
              </Stack>
            </Grid.Col>

            {/* Grading Section - Admin Only */}
            {user?.role === 'ADMIN' && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder radius="md" p="md">
                  <Group justify="space-between" mb="md">
                    <Group>
                      <IconStar size={16} />
                      <Text fw={600} size="sm">
                        Penilaian
                      </Text>
                    </Group>
                    {!editing && submission.status === 'submitted' && (
                      <Button size="xs" leftSection={<IconEdit size={14} />} onClick={() => setEditing(true)}>
                        Beri Nilai
                      </Button>
                    )}
                  </Group>

                  {submission.status === 'graded' && !editing ? (
                    // Display existing grade
                    <Stack gap="md">
                      <Group>
                        <Text fw={500} size="sm">
                          Nilai:
                        </Text>
                        <Badge size="lg" color={getGradeColor(gradeValue)} variant="filled">
                          {gradeValue}/100
                        </Badge>
                      </Group>

                      {submission.feedback && (
                        <Box>
                          <Text fw={500} size="sm" mb="xs">
                            Feedback:
                          </Text>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {submission.feedback}
                          </Text>
                        </Box>
                      )}

                      {submission.graded_at && (
                        <Text size="xs" c="gray.6">
                          Dinilai pada:{' '}
                          {new Date(submission.graded_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}

                      <Button size="xs" variant="light" leftSection={<IconEdit size={14} />} onClick={() => setEditing(true)}>
                        Edit Nilai
                      </Button>
                    </Stack>
                  ) : editing ? (
                    // Grading form
                    <form onSubmit={form.onSubmit(handleGradeSubmit)}>
                      <Stack gap="md">
                        <NumberInput label="Nilai (0-100)" placeholder="Masukkan nilai" min={0} max={100} required {...form.getInputProps('grade')} />

                        <Textarea label="Feedback" placeholder="Berikan feedback untuk mahasiswa..." minRows={3} {...form.getInputProps('feedback')} />

                        <Group>
                          <Button type="submit" loading={grading} leftSection={<IconDeviceFloppy size={16} />}>
                            {grading ? 'Menyimpan...' : 'Simpan Nilai'}
                          </Button>
                          <Button variant="light" onClick={() => setEditing(false)} disabled={grading}>
                            Batal
                          </Button>
                        </Group>
                      </Stack>
                    </form>
                  ) : (
                    // No grade yet
                    <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
                      <Text size="sm">Submission ini belum dinilai. Klik &quot;Beri Nilai&quot; untuk memberikan penilaian.</Text>
                    </Alert>
                  )}
                </Card>
              </Grid.Col>
            )}
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}
