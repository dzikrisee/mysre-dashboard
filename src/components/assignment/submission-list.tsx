// src/components/assignments/submission-list.tsx
'use client';

import { useState } from 'react';
import { Table, ScrollArea, Text, Group, Badge, ActionIcon, Menu, Paper, TextInput, Select, Stack, Box, Card, Modal, NumberInput, Textarea, Button, Tooltip, Anchor, Alert } from '@mantine/core';
import { IconSearch, IconFilter, IconDots, IconEye, IconDownload, IconStar, IconUser, IconCalendar, IconCode, IconFile, IconMail, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { AssignmentSubmission } from '@/lib/types/assignment';
import { AssignmentService } from '@/lib/services/assignment.service';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

interface SubmissionListProps {
  submissions: AssignmentSubmission[];
  onRefresh: () => void;
}

export function SubmissionList({ submissions, onRefresh }: SubmissionListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [gradingModal, setGradingModal] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(false);

  const gradingForm = useForm({
    initialValues: {
      grade: 0,
      feedback: '',
    },
    validate: {
      grade: (value) => (value < 0 || value > 100 ? 'Nilai harus antara 0-100' : null),
    },
  });

  const handleGradeSubmission = async (values: typeof gradingForm.values) => {
    if (!gradingModal) return;

    setLoading(true);
    try {
      const result = await AssignmentService.gradeSubmission(gradingModal.id, values.grade, values.feedback);

      if (result.error) {
        notifications.show({
          title: 'Error',
          message: result.error,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Berhasil',
          message: 'Submission berhasil dinilai',
          color: 'green',
        });
        setGradingModal(null);
        gradingForm.reset();
        onRefresh();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memberikan nilai',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (submission: AssignmentSubmission) => {
    setGradingModal(submission);
    gradingForm.setValues({
      grade: submission.grade || 0,
      feedback: submission.feedback || '',
    });
  };

  const downloadFile = (submission: AssignmentSubmission) => {
    if (submission.file_url) {
      window.open(submission.file_url, '_blank');
    }
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      submission.student?.nim?.toLowerCase().includes(search.toLowerCase()) ||
      submission.assignment?.title?.toLowerCase().includes(search.toLowerCase()) ||
      submission.assignment_code_input?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    const matchesAssignment = assignmentFilter === 'all' || submission.assignment_id === assignmentFilter;

    return matchesSearch && matchesStatus && matchesAssignment;
  });

  // Get unique assignments for filter
  const availableAssignments = Array.from(new Set(submissions.map((s) => s.assignment_id))).map((id) => {
    const submission = submissions.find((s) => s.assignment_id === id);
    return {
      value: id,
      label: submission?.assignment?.title || 'Unknown Assignment',
    };
  });

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
        return 'Pending';
      default:
        return status;
    }
  };

  if (submissions.length === 0) {
    return (
      <Card withBorder shadow="sm" radius="md" p="xl">
        <Stack align="center" gap="md">
          <IconFile size={48} color="var(--mantine-color-gray-4)" />
          <div style={{ textAlign: 'center' }}>
            <Text fw={600} size="lg" mb={4}>
              Belum Ada Submission
            </Text>
            <Text c="gray.6" size="sm">
              Submission akan muncul ketika mahasiswa mulai mengumpulkan tugas
            </Text>
          </div>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Filters */}
      <Paper withBorder shadow="sm" radius="md" p="md">
        <Group>
          <TextInput placeholder="Cari mahasiswa, NIM, atau assignment..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <Select
            placeholder="Status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: 'all', label: 'Semua Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'submitted', label: 'Dikumpulkan' },
              { value: 'graded', label: 'Dinilai' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            clearable={false}
            w={150}
          />
          <Select placeholder="Assignment" data={[{ value: 'all', label: 'Semua Assignment' }, ...availableAssignments]} value={assignmentFilter} onChange={(value) => setAssignmentFilter(value || 'all')} clearable={false} w={200} />
        </Group>
      </Paper>

      {/* Results Summary */}
      <Group justify="space-between">
        <Text size="sm" c="gray.6">
          Menampilkan {filteredSubmissions.length} dari {submissions.length} submission
        </Text>
        <Group gap="md">
          <Badge size="sm" color="blue" variant="light">
            {submissions.filter((s) => s.status === 'submitted').length} Perlu Review
          </Badge>
          <Badge size="sm" color="green" variant="light">
            {submissions.filter((s) => s.status === 'graded').length} Sudah Dinilai
          </Badge>
        </Group>
      </Group>

      {/* Submission Table */}
      <Paper withBorder shadow="sm" radius="md">
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Mahasiswa</Table.Th>
                <Table.Th>Assignment</Table.Th>
                <Table.Th>Code Input</Table.Th>
                <Table.Th>Waktu Submit</Table.Th>
                <Table.Th>Nilai</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredSubmissions.map((submission) => (
                <Table.Tr key={submission.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <div>
                        <Text fw={500} size="sm">
                          {submission.student?.name}
                        </Text>
                        <Group gap={4}>
                          <IconUser size={12} />
                          <Text size="xs" c="gray.6">
                            {submission.student?.nim}
                          </Text>
                        </Group>
                        <Group gap={4}>
                          <IconMail size={12} />
                          <Text size="xs" c="gray.6">
                            {submission.student?.email}
                          </Text>
                        </Group>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={500} size="sm">
                        {submission.assignment?.title}
                      </Text>
                      <Text size="xs" c="gray.6">
                        Minggu {submission.assignment?.week_number}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconCode size={14} />
                      <Text fw={600} size="sm" ff="monospace" c={submission.assignment_code_input === submission.assignment?.assignment_code ? 'green' : 'red'}>
                        {submission.assignment_code_input}
                      </Text>
                      {submission.assignment_code_input !== submission.assignment?.assignment_code && (
                        <Tooltip label={`Code seharusnya: ${submission.assignment?.assignment_code}`}>
                          <IconAlertCircle size={14} color="var(--mantine-color-red-6)" />
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconCalendar size={14} />
                      <Text size="sm">
                        {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {submission.grade !== null ? (
                      <Badge size="sm" color={submission.grade >= 80 ? 'green' : submission.grade >= 60 ? 'orange' : 'red'} variant="light">
                        {submission.grade}
                      </Badge>
                    ) : (
                      <Text size="sm" c="gray.5">
                        Belum dinilai
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={getStatusColor(submission.status)} variant="light">
                      {getStatusLabel(submission.status)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {submission.status === 'submitted' && (
                        <Tooltip label="Beri Nilai">
                          <ActionIcon variant="subtle" color="blue" onClick={() => openGradingModal(submission)} size="sm">
                            <IconStar size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={16} />}
                            onClick={() => {
                              // Show submission detail modal or navigate to detail page
                              console.log('View submission detail:', submission);
                            }}
                          >
                            Lihat Detail
                          </Menu.Item>
                          {submission.file_url && (
                            <Menu.Item leftSection={<IconDownload size={16} />} onClick={() => downloadFile(submission)}>
                              Download File
                            </Menu.Item>
                          )}
                          {submission.status !== 'pending' && (
                            <Menu.Item leftSection={<IconStar size={16} />} onClick={() => openGradingModal(submission)}>
                              {submission.grade !== null ? 'Edit Nilai' : 'Beri Nilai'}
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredSubmissions.length === 0 && (
          <Box p="xl" ta="center">
            <Text c="gray.5">{search || statusFilter !== 'all' || assignmentFilter !== 'all' ? 'Tidak ada submission yang sesuai dengan filter' : 'Belum ada submission'}</Text>
          </Box>
        )}
      </Paper>

      {/* Grading Modal */}
      <Modal opened={!!gradingModal} onClose={() => setGradingModal(null)} title="Penilaian Submission" size="md">
        {gradingModal && (
          <form onSubmit={gradingForm.onSubmit(handleGradeSubmission)}>
            <Stack gap="md">
              {/* Submission Info */}
              <Alert icon={<IconCheck size={16} />} color="blue" variant="light">
                <Text fw={500} size="sm" mb={4}>
                  Submission Details
                </Text>
                <Text size="sm">
                  <strong>Mahasiswa:</strong> {gradingModal.student?.name} ({gradingModal.student?.nim})
                </Text>
                <Text size="sm">
                  <strong>Assignment:</strong> {gradingModal.assignment?.title}
                </Text>
                <Text size="sm">
                  <strong>Code Input:</strong> {gradingModal.assignment_code_input}
                </Text>
                {gradingModal.file_url && (
                  <Anchor size="sm" onClick={() => downloadFile(gradingModal)}>
                    Download File Submission
                  </Anchor>
                )}
              </Alert>

              {/* Grading Form */}
              <NumberInput label="Nilai (0-100)" placeholder="Masukkan nilai..." required min={0} max={100} {...gradingForm.getInputProps('grade')} />

              <Textarea label="Feedback (Opsional)" placeholder="Berikan feedback untuk mahasiswa..." minRows={3} maxRows={6} autosize {...gradingForm.getInputProps('feedback')} />

              <Group justify="flex-end">
                <Button variant="light" onClick={() => setGradingModal(null)} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" loading={loading}>
                  Simpan Nilai
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Stack>
  );
}
