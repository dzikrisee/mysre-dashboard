// src/app/dashboard/assignments/page.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Button, Group, Stack, Card, SimpleGrid, ThemeIcon, Badge, LoadingOverlay, Alert, Paper, Box } from '@mantine/core';
import { IconPlus, IconClipboardList, IconUsers, IconClock, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { AssignmentService } from '@/lib/services/assignment.service';
import { Assignment, AssignmentSubmission } from '@/lib/types/assignment';
import { AssignmentList } from '@/components/assignment/assignment-list';
import { SubmissionList } from '@/components/assignment/submission-list';
import { AssignmentForm } from '@/components/assignment/assignment-form';
import { notifications } from '@mantine/notifications';

interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    activeAssignments: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAssignments(), loadSubmissions(), loadStats()]);
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

  const loadAssignments = async () => {
    try {
      const result = await AssignmentService.getAllAssignments();
      if (result.error) {
        throw new Error(result.error);
      }
      setAssignments(result.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      const result = await AssignmentService.getAllSubmissions();
      if (result.error) {
        throw new Error(result.error);
      }
      setSubmissions(result.data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const result = await AssignmentService.getAssignmentStats();
      if (result.error) {
        throw new Error(result.error);
      }
      setStats(
        result.data || {
          totalAssignments: 0,
          activeAssignments: 0,
          totalSubmissions: 0,
          pendingSubmissions: 0,
          gradedSubmissions: 0,
        },
      );
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingAssignment(null);
    loadData(); // Refresh data setelah create/update
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    try {
      const result = await AssignmentService.deleteAssignment(assignment.id);
      if (result.error) {
        throw new Error(result.error);
      }

      notifications.show({
        title: 'Berhasil',
        message: `Assignment "${assignment.title}" berhasil dihapus`,
        color: 'green',
      });

      loadData(); // Refresh data
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menghapus assignment',
        color: 'red',
      });
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Akses Ditolak" color="red">
          Halaman ini hanya dapat diakses oleh admin.
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
            <AssignmentForm assignment={editingAssignment} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
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
                <IconUsers size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Perlu Review
                </Text>
                <Text fw={700} size="xl">
                  {stats.pendingSubmissions}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Menunggu penilaian
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
                  Submission lengkap
                </Text>
              </div>
              <ThemeIcon color="teal" variant="light" size="xl" radius="md">
                <IconClipboardList size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Assignment List */}
        <div>
          <Title order={3} mb="md">
            Daftar Assignment
          </Title>
          <AssignmentList assignments={assignments} onEdit={handleEditAssignment} onDelete={handleDeleteAssignment} onRefresh={loadData} />
        </div>

        {/* Submission List */}
        <div>
          <Title order={3} mb="md">
            Daftar Submission
          </Title>
          <SubmissionList submissions={submissions} onRefresh={loadData} />
        </div>
      </Stack>
    </Container>
  );
}
