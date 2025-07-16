// src/app/dashboard/assignments/page.tsx
// Fixed version dengan form yang berfungsi

'use client';

import { useState, useEffect } from 'react';
import { Container, Stack, Title, Text, Group, Badge, Button, SimpleGrid, Card, ThemeIcon, LoadingOverlay, Alert, Paper, Box, TextInput, Textarea, NumberInput, Switch, Modal, FileInput, Divider } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar, IconPlus, IconClipboardList, IconFileText, IconClock, IconCheck, IconUsers, IconAlertCircle, IconFile } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';

export default function AssignmentPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
  });

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      week_number: 1,
      assignment_code: '',
      due_date: null,
      is_active: true,
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Judul minimal 3 karakter' : null),
      description: (value) => (value.trim().length < 10 ? 'Deskripsi minimal 10 karakter' : null),
      week_number: (value) => (value < 1 || value > 20 ? 'Minggu harus antara 1-20' : null),
      assignment_code: (value) => {
        if (!/^[A-Z0-9]{3,4}$/.test(value)) {
          return 'Code harus 3-4 karakter huruf/angka kapital';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // TODO: Load real data from Supabase
      // Temporarily using mock data
      setStats({
        totalAssignments: 5,
        activeAssignments: 3,
        totalSubmissions: 12,
        pendingSubmissions: 4,
        gradedSubmissions: 8,
      });
    } catch (error) {
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
    setShowCreateModal(true);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldValue('assignment_code', result);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      // TODO: Implement actual save to Supabase
      console.log('Assignment data:', values);

      notifications.show({
        title: 'Success (Demo)',
        message: 'Assignment form submitted! Database integration coming soon.',
        color: 'green',
      });

      setShowCreateModal(false);
      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan assignment',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
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

      <Stack gap="xl">
        {/* Header */}
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
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreateAssignment}>
              Buat Assignment Baru
            </Button>
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

        {/* Coming Soon Sections */}
        <Stack gap="md">
          <Paper withBorder shadow="sm" radius="md" p="xl">
            <Stack align="center" gap="md">
              <IconClipboardList size={48} color="var(--mantine-color-blue-4)" />
              <div style={{ textAlign: 'center' }}>
                <Text fw={600} size="lg" mb={4}>
                  Assignment Management
                </Text>
                <Text c="gray.6" size="sm" mb="md">
                  Sistem untuk membuat dan mengelola assignment dengan code unik 3-4 digit
                </Text>
                <Text size="xs" c="gray.5">
                  Status: Database schema ready, Form integration in progress
                </Text>
              </div>
            </Stack>
          </Paper>

          <Paper withBorder shadow="sm" radius="md" p="xl">
            <Stack align="center" gap="md">
              <IconUsers size={48} color="var(--mantine-color-green-4)" />
              <div style={{ textAlign: 'center' }}>
                <Text fw={600} size="lg" mb={4}>
                  Submission Monitoring
                </Text>
                <Text c="gray.6" size="sm" mb="md">
                  Monitoring pengumpulan tugas mahasiswa dan sistem penilaian
                </Text>
                <Text size="xs" c="gray.5">
                  Status: Database structure complete, implementing UI
                </Text>
              </div>
            </Stack>
          </Paper>
        </Stack>

        {/* Implementation Progress */}
        <Alert icon={<IconAlertCircle size={16} />} title="Implementation Status" color="blue" variant="light">
          <Text size="sm" mb="md">
            <strong>Assignment Management System sedang dalam tahap implementasi:</strong>
          </Text>
          <Stack gap="xs">
            <Text size="sm">✅ Database schema created (Assignment & AssignmentSubmission tables)</Text>
            <Text size="sm">✅ Navigation menu integrated</Text>
            <Text size="sm">✅ Basic form modal implemented</Text>
            <Text size="sm">🔄 Service functions in development</Text>
            <Text size="sm">⏳ File upload integration pending</Text>
            <Text size="sm">⏳ Student submission interface pending</Text>
          </Stack>
        </Alert>
      </Stack>

      {/* Create Assignment Modal */}
      <Modal opened={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Assignment Baru" size="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput label="Judul Assignment" placeholder="Masukkan judul assignment..." required {...form.getInputProps('title')} />

            <Textarea label="Deskripsi" placeholder="Masukkan deskripsi assignment..." required minRows={3} maxRows={6} autosize {...form.getInputProps('description')} />

            <Group grow>
              <NumberInput label="Minggu Ke" placeholder="1" required min={1} max={20} {...form.getInputProps('week_number')} />

              <div>
                <Group mb={5}>
                  <Text component="label" size="sm" fw={500}>
                    Assignment Code *
                  </Text>
                  <Button variant="subtle" size="xs" onClick={generateRandomCode}>
                    Generate Random
                  </Button>
                </Group>
                <TextInput placeholder="A1B2" required maxLength={4} {...form.getInputProps('assignment_code')} />
              </div>
            </Group>

            <DateTimePicker label="Deadline (Opsional)" placeholder="Pilih tanggal dan waktu deadline" leftSection={<IconCalendar size={16} />} clearable {...form.getInputProps('due_date')} />

            <Divider label="File Assignment (Opsional)" labelPosition="left" />

            <FileInput label="Upload File Assignment" placeholder="Pilih file (PDF, DOC, DOCX, max 10MB)" leftSection={<IconFile size={16} />} accept=".pdf,.doc,.docx,.txt" />

            <Switch label="Assignment Aktif" description="Assignment akan terlihat oleh mahasiswa ketika aktif" {...form.getInputProps('is_active', { type: 'checkbox' })} />

            <Group justify="flex-end" mt="xl">
              <Button variant="light" onClick={() => setShowCreateModal(false)}>
                Batal
              </Button>
              <Button type="submit" loading={loading}>
                Buat Assignment
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
