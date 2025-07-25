// src/app/dashboard/project-brainstorm/page.tsx
// Updated to use real BrainstormingSession data from database
'use client';

import { useState, useEffect } from 'react';
import { Stack, Title, Text, Card, Group, Button, Badge, SimpleGrid, ActionIcon, Modal, TextInput, Textarea, Select, Avatar, ThemeIcon, Center, Loader, Paper, Alert, Tabs, Box, ScrollArea, Table, Tooltip } from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconBulb,
  IconCalendar,
  IconUser,
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconBrain,
  IconRocket,
  IconTrendingUp,
  IconUsers,
  IconMessageCircle,
  IconHeart,
  IconTarget,
  IconFilter,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';
import { BrainstormingSessionService, type BrainstormingSession } from '@/lib/services/brainstorming-session.service';
import { supabase } from '@/lib/supabase';

interface BrainstormStats {
  totalSessions: number;
  recentSessions: number;
  activeSessions: number;
  userSessions: number;
}

export default function ProjectBrainstormPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<BrainstormingSession[]>([]);
  const [stats, setStats] = useState<BrainstormStats>({
    totalSessions: 0,
    recentSessions: 0,
    activeSessions: 0,
    userSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [editingSession, setEditingSession] = useState<BrainstormingSession | null>(null);
  const [selectedSession, setSelectedSession] = useState<BrainstormingSession | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'lastActivity'>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // TAMBAHKAN DI SINI bersama useState lainnya
  const [articleCounts, setArticleCounts] = useState<{ [userId: string]: number }>({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverColor: '#4c6ef5',
  });

  // SETELAH semua useState, baru function definitions
  const loadArticleCounts = async () => {
    try {
      const { data: articles, error } = await supabase.from('Article').select('userId').not('userId', 'is', null);

      if (error) throw error;

      const counts: { [userId: string]: number } = {};
      articles?.forEach((article) => {
        if (article.userId) {
          counts[article.userId] = (counts[article.userId] || 0) + 1;
        }
      });

      setArticleCounts(counts);
    } catch (error) {
      console.error('Error loading article counts:', error);
    }
  };

  useEffect(() => {
    loadBrainstormingSessions();
    loadStats();
    loadArticleCounts();
  }, []);

  const loadBrainstormingSessions = async () => {
    setLoading(true);
    try {
      const result = await BrainstormingSessionService.getAllBrainstormingSessions();

      if (result.error) {
        throw new Error(result.error);
      }

      setSessions(result.data || []);
    } catch (error: any) {
      console.error('Error loading brainstorming sessions:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data brainstorming sessions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await BrainstormingSessionService.getBrainstormingSessionStats();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        // Get user-specific sessions count
        const userSessionsCount = sessions.filter((s) => s.userId === user?.id).length;

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
        result = await BrainstormingSessionService.updateBrainstormingSession(editingSession.id, {
          title: formData.title,
          description: formData.description || null,
          coverColor: formData.coverColor,
        });
      } else {
        result = await BrainstormingSessionService.createBrainstormingSession({
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
      await loadBrainstormingSessions();
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
        message: editingSession ? 'Brainstorming session berhasil diupdate' : 'Brainstorming session berhasil dibuat',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error saving brainstorming session:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menyimpan brainstorming session',
        color: 'red',
      });
    }
  };

  const handleEdit = (session: BrainstormingSession) => {
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
      const result = await BrainstormingSessionService.deleteBrainstormingSession(id);

      if (result.error) {
        throw new Error(result.error);
      }

      await loadBrainstormingSessions();
      await loadStats();

      notifications.show({
        title: 'Berhasil',
        message: 'Brainstorming session berhasil dihapus',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error deleting brainstorming session:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menghapus brainstorming session',
        color: 'red',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetail = (session: BrainstormingSession) => {
    setSelectedSession(session);
    openDetail();
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

  const isRecentSession = (session: BrainstormingSession) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return new Date(session.createdAt) > thirtyDaysAgo;
  };

  const isActiveSession = (session: BrainstormingSession) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(session.lastActivity) > sevenDaysAgo;
  };

  const filteredSessions = sessions
    .filter((session) => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) || session.description?.toLowerCase().includes(searchTerm.toLowerCase()) || session.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = activeTab === 'all' || (activeTab === 'my-sessions' && session.userId === user?.id) || (activeTab === 'recent' && isRecentSession(session)) || (activeTab === 'active' && isActiveSession(session));

      return matchesSearch && matchesTab;
    })
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
          <Text>Memuat brainstorming sessions...</Text>
        </Stack>
      </Center>
    );
  }

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: IconBulb,
      color: 'yellow',
    },
    {
      title: 'Recent (30d)',
      value: stats.recentSessions,
      icon: IconCalendar,
      color: 'blue',
    },
    {
      title: 'Active (7d)',
      value: stats.activeSessions,
      icon: IconRocket,
      color: 'green',
    },
    {
      title: 'My Sessions',
      value: sessions.filter((s) => s.userId === user?.id).length,
      icon: IconUser,
      color: 'violet',
    },
  ];

  const limitWords = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Project Brainstorm</Title>
          <Text c="dimmed">Kumpulkan dan kembangkan ide-ide proyek penelitian yang inovatif</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openNewSessionModal}>
          Buat Session Baru
        </Button>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {statCards.map((stat, index) => (
          <Card key={index} withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  {stat.title}
                </Text>
                <Text size="xl" fw={700}>
                  {stat.value}
                </Text>
              </div>
              <ThemeIcon color={stat.color} variant="light" size="lg">
                <stat.icon size={20} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Tabs and Filters */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="all" leftSection={<IconBulb size={16} />}>
              Semua Sessions
            </Tabs.Tab>
            <Tabs.Tab value="my-sessions" leftSection={<IconUser size={16} />}>
              Session Saya
            </Tabs.Tab>
            <Tabs.Tab value="recent" leftSection={<IconCalendar size={16} />}>
              Terbaru
            </Tabs.Tab>
            <Tabs.Tab value="active" leftSection={<IconTrendingUp size={16} />}>
              Aktif
            </Tabs.Tab>
          </Tabs.List>

          {/* Search and Sort */}
          <Group justify="space-between" mb="lg">
            <TextInput placeholder="Cari brainstorming sessions..." leftSection={<IconSearch size={16} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1 }} />
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
              <ActionIcon variant="light" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
              </ActionIcon>
            </Group>
          </Group>

          {/* Sessions Table */}
          <Tabs.Panel value={activeTab}>
            {filteredSessions.length === 0 ? (
              <Alert icon={<IconAlertCircle size={16} />} title="Tidak ada session">
                {searchTerm
                  ? 'Tidak ada session yang sesuai dengan pencarian.'
                  : activeTab === 'my-sessions'
                  ? 'Anda belum membuat session apapun. Mulai brainstorming sekarang!'
                  : 'Belum ada brainstorming session yang dibuat. Mulai brainstorming bersama!'}
              </Alert>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Session</Table.Th>
                      <Table.Th>Author</Table.Th>
                      <Table.Th>Created</Table.Th>
                      <Table.Th>Last Activity</Table.Th>
                      <Table.Th>Articles</Table.Th>
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
                              <Text fw={500} size="sm" lineClamp={1} style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(session)}>
                                {session.title}
                              </Text>
                              {session.description && (
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {limitWords(session.description, 5)}
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
                              <Text size="xs" c="dimmed">
                                {session.user?.email}
                              </Text>
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
                            <Badge size="sm" variant="light" color="blue">
                              {/* Tampilkan jumlah artikel user, bukan selectedFilterArticles */}
                              {articleCounts[session.userId] || 0} articles
                            </Badge>
                            <Badge size="sm" variant="light" color="green">
                              {session.selectedFilterArticles?.length || 0} filtered
                            </Badge>
                          </Group>
                        </Table.Td>

                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon variant="light" color="blue" onClick={() => handleViewDetail(session)}>
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="orange" onClick={() => handleEdit(session)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="red" loading={deletingId === session.id} onClick={() => handleDelete(session.id)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Tabs.Panel>
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal opened={opened} onClose={close} title={editingSession ? 'Edit Brainstorming Session' : 'Buat Brainstorming Session Baru'} size="md">
        <Stack gap="md">
          <TextInput label="Judul Session" placeholder="Masukkan judul brainstorming session" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

          <Textarea label="Deskripsi" placeholder="Jelaskan tujuan dan fokus brainstorming session ini" minRows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Cover Color
            </Text>
            <Group gap="xs">
              {['#4c6ef5', '#37b24d', '#f59f00', '#e03131', '#7c2d12', '#1971c2'].map((color) => (
                <ActionIcon key={color} variant={formData.coverColor === color ? 'filled' : 'light'} color={color.replace('#', '')} onClick={() => setFormData({ ...formData, coverColor: color })} style={{ backgroundColor: color }}>
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

      {/* Detail Modal */}
      <Modal opened={detailOpened} onClose={closeDetail} title="Detail Brainstorming Session" size="lg">
        {selectedSession && (
          <Stack gap="lg">
            <Group>
              <Box
                w={20}
                h={20}
                style={{
                  backgroundColor: selectedSession.coverColor,
                  borderRadius: 4,
                }}
              />
              <div>
                <Text fw={600} size="lg">
                  {selectedSession.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedSession.description}
                </Text>
              </div>
            </Group>

            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text fw={600} mb="xs">
                  Author
                </Text>
                <Group gap="xs">
                  <Avatar size="sm" src={selectedSession.user?.avatar_url}>
                    {selectedSession.user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <div>
                    <Text size="sm">{selectedSession.user?.name}</Text>
                    <Text size="xs" c="dimmed">
                      {selectedSession.user?.email}
                    </Text>
                  </div>
                </Group>
              </div>
              <div>
                <Text fw={600} mb="xs">
                  Created
                </Text>
                <Text c="gray.6">{formatDate(selectedSession.createdAt)}</Text>
              </div>
              <div>
                <Text fw={600} mb="xs">
                  Last Activity
                </Text>
                <Text c="gray.6">{formatDate(selectedSession.lastActivity)}</Text>
              </div>
              <div>
                <Text fw={600} mb="xs">
                  Filtered Articles
                </Text>
                <Badge color="blue" variant="light">
                  {selectedSession.selectedFilterArticles?.length || 0} articles
                </Badge>
              </div>
            </SimpleGrid>

            {/* Graph Filters */}
            {selectedSession.graphFilters && (
              <div>
                <Text fw={600} mb="sm">
                  Graph Filters
                </Text>
                <Paper withBorder p="sm">
                  <Text size="xs" ff="monospace">
                    {JSON.stringify(selectedSession.graphFilters, null, 2)}
                  </Text>
                </Paper>
              </div>
            )}

            {/* Selected Articles */}
            {selectedSession.selectedFilterArticles && selectedSession.selectedFilterArticles.length > 0 && (
              <div>
                <Text fw={600} mb="sm">
                  Selected Articles
                </Text>
                <Stack gap="xs">
                  {selectedSession.selectedFilterArticles.map((articleId, index) => (
                    <Badge key={index} variant="light" color="blue">
                      Article ID: {articleId}
                    </Badge>
                  ))}
                </Stack>
              </div>
            )}

            {/* Actions */}
            <Group justify="flex-end">
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  closeDetail();
                  handleEdit(selectedSession);
                }}
              >
                Edit Session
              </Button>
              <Button leftSection={<IconBrain size={16} />}>Open Brainstorming</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
