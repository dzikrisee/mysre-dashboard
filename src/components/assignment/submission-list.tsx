// src/components/assignment/submission-list.tsx
// FIXED: Properly display student names and add detail page navigation

'use client';

import { useState } from 'react';
import { Table, ScrollArea, Text, Group, Badge, ActionIcon, Menu, Paper, TextInput, Select, Stack, Box, Card, Modal, NumberInput, Textarea, Button, Tooltip, Anchor, Alert } from '@mantine/core';
import { IconSearch, IconFilter, IconDots, IconEye, IconDownload, IconStar, IconUser, IconCalendar, IconCode, IconFile, IconMail, IconAlertCircle, IconCheck, IconSchool } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { AssignmentSubmission } from '@/lib/types/assignment';
import { AssignmentService } from '@/lib/services/assignment.service';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

interface SubmissionListProps {
  submissions: AssignmentSubmission[];
  onRefresh: () => void;
}

export function SubmissionList({ submissions, onRefresh }: SubmissionListProps) {
  const router = useRouter();
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

  const handleGradeSubmit = async (values: typeof gradingForm.values) => {
    if (!gradingModal) return;

    try {
      setLoading(true);
      const result = await AssignmentService.gradeSubmission(gradingModal.id, values.grade, values.feedback);

      if (result.error) {
        throw new Error(result.error);
      }

      notifications.show({
        title: 'Berhasil',
        message: 'Penilaian berhasil disimpan',
        color: 'green',
      });

      setGradingModal(null);
      gradingForm.reset();
      onRefresh();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menyimpan penilaian',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (submission: AssignmentSubmission) => {
    router.push(`/dashboard/assignments/submissions/${submission.id}`);
  };

  const handleOpenGrading = (submission: AssignmentSubmission) => {
    setGradingModal(submission);
    gradingForm.setValues({
      grade: submission.grade || 0,
      feedback: submission.feedback || '',
    });
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

  // Get unique assignments for filter
  const availableAssignments = Array.from(new Set(submissions.map((s) => s.assignment?.title).filter(Boolean))).map((title) => ({
    value: title!,
    label: title!,
  }));

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      submission.student?.nim?.toLowerCase().includes(search.toLowerCase()) ||
      submission.assignment?.title?.toLowerCase().includes(search.toLowerCase()) ||
      submission.assignment_code_input?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    const matchesAssignment = assignmentFilter === 'all' || submission.assignment?.title === assignmentFilter;

    return matchesSearch && matchesStatus && matchesAssignment;
  });

  return (
    <Stack gap="md">
      {/* Filters */}
      <Paper withBorder shadow="sm" radius="md" p="md">
        <Group gap="md">
          <TextInput placeholder="Cari mahasiswa, assignment, atau code..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <Select
            placeholder="Status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: 'all', label: 'Semua Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'graded', label: 'Graded' },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || 'all')}
            w={150}
          />
          <Select placeholder="Assignment" data={[{ value: 'all', label: 'Semua Assignment' }, ...availableAssignments]} value={assignmentFilter} onChange={(value) => setAssignmentFilter(value || 'all')} w={200} />
        </Group>
      </Paper>

      {/* Submissions Table */}
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
                          {submission.student?.name || 'Nama tidak tersedia'}
                        </Text>
                        <Group gap={4}>
                          <IconSchool size={12} />
                          <Text size="xs" c="gray.6">
                            {submission.student?.nim || 'NIM tidak tersedia'}
                          </Text>
                        </Group>
                        <Group gap={4}>
                          <IconMail size={12} />
                          <Text size="xs" c="gray.6">
                            {submission.student?.email || 'Email tidak tersedia'}
                          </Text>
                        </Group>
                        {submission.student?.group && (
                          <Group gap={4}>
                            <IconUser size={12} />
                            <Text size="xs" c="gray.6">
                              Kelas {submission.student.group}
                            </Text>
                          </Group>
                        )}
                      </div>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <div>
                      <Text fw={500} size="sm">
                        {submission.assignment?.title || 'Assignment tidak tersedia'}
                      </Text>
                      <Text size="xs" c="gray.6">
                        Minggu {submission.assignment?.week_number || 'N/A'}
                      </Text>
                      <Group gap={4} mt={2}>
                        <IconCode size={12} />
                        <Text size="xs" c="gray.6" ff="monospace">
                          {submission.assignment?.assignment_code || 'N/A'}
                        </Text>
                      </Group>
                    </div>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={600} size="sm" ff="monospace" c={submission.assignment_code_input === submission.assignment?.assignment_code ? 'green' : 'red'}>
                        {submission.assignment_code_input}
                      </Text>
                      {submission.assignment_code_input === submission.assignment?.assignment_code ? (
                        <IconCheck size={14} color="green" />
                      ) : (
                        <Tooltip label={`Code seharusnya: ${submission.assignment?.assignment_code}`}>
                          <IconAlertCircle size={14} color="red" />
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
                    {submission.grade !== null && submission.grade !== undefined ? (
                      <Badge size="sm" color={getGradeColor(submission.grade)} variant="filled">
                        {submission.grade}/100
                      </Badge>
                    ) : (
                      <Text size="sm" c="gray.5">
                        Belum dinilai
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Badge variant="light" color={getStatusColor(submission.status)} size="sm">
                      {submission.status === 'submitted' ? 'Menunggu Penilaian' : submission.status === 'graded' ? 'Sudah Dinilai' : 'Pending'}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Group gap={4}>
                      <ActionIcon variant="light" color="blue" onClick={() => handleViewDetail(submission)}>
                        <IconEye size={16} />
                      </ActionIcon>

                      <Menu shadow="md" width={180}>
                        <Menu.Target>
                          <ActionIcon variant="light" color="gray">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleViewDetail(submission)}>
                            Lihat Detail
                          </Menu.Item>

                          {submission.file_url && (
                            <Menu.Item leftSection={<IconDownload size={14} />} onClick={() => window.open(submission.file_url!, '_blank')}>
                              Download File
                            </Menu.Item>
                          )}

                          {submission.status !== 'graded' && (
                            <Menu.Item leftSection={<IconStar size={14} />} onClick={() => handleOpenGrading(submission)} color="blue">
                              Beri Nilai
                            </Menu.Item>
                          )}

                          {submission.status === 'graded' && (
                            <Menu.Item leftSection={<IconStar size={14} />} onClick={() => handleOpenGrading(submission)} color="orange">
                              Edit Nilai
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
          <Box p="xl">
            <Stack align="center">
              <Text fw={600} c="gray.6">
                Tidak ada submission yang sesuai filter
              </Text>
              <Text size="sm" c="gray.5">
                Coba ubah kriteria pencarian atau filter
              </Text>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Grading Modal */}
      <Modal opened={!!gradingModal} onClose={() => setGradingModal(null)} title="Beri Nilai Submission" size="md">
        {gradingModal && (
          <form onSubmit={gradingForm.onSubmit(handleGradeSubmit)}>
            <Stack gap="md">
              {/* Student Info */}
              <Box>
                <Text fw={600} mb="xs">
                  Mahasiswa:
                </Text>
                <Text size="sm">{gradingModal.student?.name}</Text>
                <Text size="xs" c="gray.6">
                  {gradingModal.student?.nim}
                </Text>
              </Box>

              {/* Assignment Info */}
              <Box>
                <Text fw={600} mb="xs">
                  Assignment:
                </Text>
                <Text size="sm">{gradingModal.assignment?.title}</Text>
              </Box>

              {/* Grading Form */}
              <NumberInput label="Nilai (0-100)" placeholder="Masukkan nilai" min={0} max={100} required {...gradingForm.getInputProps('grade')} />

              <Textarea label="Feedback" placeholder="Berikan feedback untuk mahasiswa..." minRows={3} {...gradingForm.getInputProps('feedback')} />

              <Group justify="flex-end">
                <Button variant="light" onClick={() => setGradingModal(null)}>
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
