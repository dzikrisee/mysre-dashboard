// src/app/dashboard/project-writer/page.tsx
// Updated to use real WriterSession data from database
'use client';

import { useState, useEffect } from 'react';
import { Stack, Title, Text, Card, Group, Button, Badge, Grid, SimpleGrid, ActionIcon, Modal, TextInput, Textarea, Select, Table, Avatar, Menu, Tooltip, Progress, ThemeIcon, Center, Loader, Paper, Alert, ScrollArea, Box } from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconFileText,
  IconCalendar,
  IconUser,
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconPencil,
  IconBookmark,
  IconTarget,
  IconDots,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';
import { WriterSessionService, type WriterSession } from '@/lib/services/writer-session.service';

interface ProjectStats {
  totalSessions: number;
  recentSessions: number;
  activeSessions: number;
  userSessions: number;
}

export default function ProjectWriterPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WriterSession[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalSessions: 0,
    recentSessions: 0,
    activeSessions: 0,
    userSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingSession, setEditingSession] = useState<WriterSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'lastActivity'>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverColor: '#4c6ef5',
  });

  useEffect(() => {
    loadWriterSessions();
    loadStats();
  }, []);

  const loadWriterSessions = async () => {
    setLoading(true);
    try {
      const result = await WriterSessionService.getAllWriterSessions();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setSessions(result.data || []);
    } catch (error: any) {
      console.error('Error loading writer sessions:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data writer sessions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await WriterSessionService.getWriterSessionStats();
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        // Get user-specific sessions count
        const userSessionsCount = sessions.filter(s => s.userId === user?.id).length;
        
        setStats({
          totalSessions: result.data.totalSessions,
          recentSessions: result.data.recentSessions,
          activeSessions: result.data.activeSessions,
          userSessions: userSessionsCount,
        });
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Judul harus diisi',
          color: 'red',
        });
        return;
      }

      if (!user?.id) {
        notifications.show({
          title: 'Error',
          message: 'User tidak valid',
          color: 'red',
        });
        return;
      }

      let result;
      if (editingSession) {
        result = await WriterSessionService.updateWriterSession(editingSession.id, {
          title: formData.title,
          description: formData.description || null,
          coverColor: formData.coverColor,
        });
      } else {
        result = await WriterSessionService.createWriterSession({
          title: formData.title,
          description: formData.description || null,
          userId: user.id,
          coverColor: formData.coverColor,
        });
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // Reload data
      await loadWriterSessions();
      await loadStats();

      // Reset form
      setFormData({
        title: '',
        description: '',
        coverColor: '#4c6ef5',
      });
      setEditingSession(null);
      close();

      notifications.show({
        title: 'Berhasil',
        message: editingSession ? 'Writer session berhasil diupdate' : 'Writer session berhasil dibuat',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error saving writer session:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menyimpan writer session',
        color: 'red',
      });
    }
  };

  const handleEdit = (session: WriterSession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || '',
      coverColor: session.coverColor,
    });
    open();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await WriterSessionService.deleteWriterSession(id);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await loadWriterSessions();
      await loadStats();

      notifications.show({
        title: 'Berhasil',
        message: 'Writer session berhasil dihapus',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error deleting writer session:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menghapus writer session',
        color: 'red',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const openNewSessionModal = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      description: '',
      coverColor: '#4c6ef5',
    });
    open();
  };

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} minggu lalu`;
  };

  if (loading) {
    return (
      <Center h={500}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Memuat writer sessions...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Project Writer</Title>
          <Text c="dimmed">Kelola sesi penulisan dan proyek draft</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openNewSessionModal}>
          Buat Writer Session
        </Button>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Total Sessions</Text>
              <Text size="xl" fw={700}>{stats.totalSessions}</Text>
            </div>
            <ThemeIcon color="blue" variant="light" size="lg">
              <IconFileText size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Recent (30 days)</Text>
              <Text size="xl" fw={700}>{stats.recentSessions}</Text>
            </div>
            <ThemeIcon color="green" variant="light" size="lg">
              <IconCalendar size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Active (7 days)</Text>
              <Text size="xl" fw={700}>{stats.activeSessions}</Text>
            </div>
            <ThemeIcon color="orange" variant="light" size="lg">
              <IconClock size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">My Sessions</Text>
              <Text size="xl" fw={700}>{sessions.filter(s => s.userId === user?.id).length}</Text>
            </div>
            <ThemeIcon color="violet" variant="light" size="lg">
              <IconUser size={20} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Search and Filter */}
      <Paper withBorder p="md">
        <Group justify="space-between">
          <TextInput
            placeholder="Cari writer sessions..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <Group gap="xs">
            <Select
              placeholder="Sort by"
              data={[
                { value: 'lastActivity', label: 'Last Activity' },
                { value: 'createdAt', label: 'Created Date' },
                { value: 'title', label: 'Title' },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              w={150}
            />
            <ActionIcon 
              variant="light" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Sessions Table */}
      <Paper withBorder>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Session</Table.Th>
                <Table.Th>Author</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Last Activity</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredSessions.map((session) => (
                <Table.Tr key={session.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Box
                        w={12}
                        h={12}
                        style={{
                          backgroundColor: session.coverColor,
                          borderRadius: 2,
                        }}
                      />
                      <div>
                        <Text fw={500} size="sm">{session.title}</Text>
                        {session.description && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {session.description}
                          </Text>
                        )}
                      </div>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <Avatar size="sm" src={session.user?.avatar_url}>
                        {session.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <div>
                        <Text size="sm">{session.user?.name || 'Unknown'}</Text>
                        <Text size="xs" c="dimmed">{session.user?.email}</Text>
                      </div>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm">{formatDate(session.createdAt)}</Text>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm">{formatDate(session.lastActivity)}</Text>
                      <Badge size="xs" variant="light" color="gray">
                        {getTimeSince(session.lastActivity)}
                      </Badge>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEdit(session)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        loading={deletingId === session.id}
                        onClick={() => handleDelete(session.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredSessions.length === 0 && (
          <Box p="xl">
            <Stack align="center">
              <ThemeIcon size="xl" variant="light" color="gray">
                <IconFileText size={28} />
              </ThemeIcon>
              <Text fw={600} c="gray.6">
                {searchTerm ? 'Tidak ada session yang sesuai pencarian' : 'Belum ada writer sessions'}
              </Text>
              <Text size="sm" c="gray.5">
                {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan membuat writer session baru'}
              </Text>
              {!searchTerm && (
                <Button leftSection={<IconPlus size={16} />} onClick={openNewSessionModal}>
                  Buat Writer Session
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Create/Edit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingSession ? 'Edit Writer Session' : 'Buat Writer Session Baru'}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Judul Session"
            placeholder="Masukkan judul writer session"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Textarea
            label="Deskripsi"
            placeholder="Jelaskan tujuan dan konten session ini"
            minRows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">Cover Color</Text>
            <Group gap="xs">
              {['#4c6ef5', '#37b24d', '#f59f00', '#e03131', '#7c2d12', '#1971c2'].map((color) => (
                <ActionIcon
                  key={color}
                  variant={formData.coverColor === color ? 'filled' : 'light'}
                  color={color.replace('#', '')}
                  onClick={() => setFormData({ ...formData, coverColor: color })}
                  style={{ backgroundColor: color }}
                >
                  {formData.coverColor === color && <IconCheck size={16} />}
                </ActionIcon>
              ))}
            </Group>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={close}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title.trim()}>
              {editingSession ? 'Update' : 'Buat'} Session
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}