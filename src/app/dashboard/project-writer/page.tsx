// src/app/dashboard/project-writer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Stack, Title, Text, Card, Group, Button, Badge, Grid, SimpleGrid, ActionIcon, Modal, TextInput, Textarea, Select, Table, Avatar, Menu, Tooltip, Progress, ThemeIcon, Center, Loader, Paper, Alert } from '@mantine/core';
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
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';

// Types
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  wordCount: number;
  targetWords: number;
  deadline?: string;
}

interface ProjectStats {
  totalProjects: number;
  draftProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  totalWords: number;
  averageProgress: number;
}

export default function ProjectWriterPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    draftProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    totalWords: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'status' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetWords: 1000,
    deadline: '',
  });

  // Simulate data loading
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual Supabase call
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'Analisis Pengaruh Social Media terhadap Pembelajaran',
          description: 'Penelitian tentang dampak penggunaan social media dalam konteks pembelajaran mahasiswa',
          category: 'Penelitian',
          status: 'in-progress',
          priority: 'high',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          wordCount: 2500,
          targetWords: 5000,
          deadline: '2024-03-15',
        },
        {
          id: '2',
          title: 'Implementasi AI dalam Pendidikan Tinggi',
          description: 'Studi kasus implementasi artificial intelligence dalam sistem pendidikan tinggi di Indonesia',
          category: 'Studi Kasus',
          status: 'draft',
          priority: 'medium',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-10T09:00:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          wordCount: 0,
          targetWords: 8000,
          deadline: '2024-04-20',
        },
        {
          id: '3',
          title: 'Evaluasi Sistem Pembelajaran Online',
          description: 'Analisis efektivitas sistem pembelajaran online selama masa pandemi',
          category: 'Evaluasi',
          status: 'completed',
          priority: 'low',
          createdAt: '2023-12-20T08:00:00Z',
          updatedAt: '2024-01-05T16:00:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          wordCount: 6500,
          targetWords: 6000,
          deadline: '2024-01-15',
        },
      ];

      setProjects(mockProjects);
      calculateStats(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data proyek',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projects: Project[]) => {
    const stats: ProjectStats = {
      totalProjects: projects.length,
      draftProjects: projects.filter((p) => p.status === 'draft').length,
      inProgressProjects: projects.filter((p) => p.status === 'in-progress').length,
      completedProjects: projects.filter((p) => p.status === 'completed').length,
      totalWords: projects.reduce((sum, p) => sum + p.wordCount, 0),
      averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + (p.wordCount / p.targetWords) * 100, 0) / projects.length : 0,
    };
    setStats(stats);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Judul dan deskripsi harus diisi',
          color: 'red',
        });
        return;
      }

      // Simulate API call
      const newProject: Project = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: user?.id || '1',
        author: {
          name: user?.name || 'John Doe',
          email: user?.email || 'john@example.com',
          avatar_url: user?.avatar_url,
        },
        wordCount: 0,
      };

      setProjects((prev) => [newProject, ...prev]);
      calculateStats([newProject, ...projects]);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        targetWords: 1000,
        deadline: '',
      });

      close();
      notifications.show({
        title: 'Berhasil',
        message: 'Proyek berhasil dibuat',
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal membuat proyek',
        color: 'red',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'in-progress':
        return 'blue';
      case 'review':
        return 'orange';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'in-progress':
        return 'Sedang Dikerjakan';
      case 'review':
        return 'Review';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Rendah';
      case 'medium':
        return 'Sedang';
      case 'high':
        return 'Tinggi';
      default:
        return priority;
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }

      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * modifier;
    });

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const statCards = [
    {
      title: 'Total Proyek',
      value: stats.totalProjects,
      icon: IconFileText,
      color: 'blue',
    },
    {
      title: 'Sedang Dikerjakan',
      value: stats.inProgressProjects,
      icon: IconClock,
      color: 'orange',
    },
    {
      title: 'Selesai',
      value: stats.completedProjects,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: 'Total Kata',
      value: stats.totalWords.toLocaleString(),
      icon: IconPencil,
      color: 'violet',
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Project Writer</Title>
          <Text c="gray.6">Kelola proyek penulisan naskah akademik Anda</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Buat Proyek Baru
        </Button>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {statCards.map((stat, index) => (
          <Card key={index} withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                  {stat.title}
                </Text>
                <Text fw={700} size="xl">
                  {stat.value}
                </Text>
              </div>
              <ThemeIcon color={stat.color} variant="light" size="xl" radius="md">
                <stat.icon size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {/* Progress Overview */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Progress Keseluruhan</Title>
          <Badge variant="light" size="lg">
            {stats.averageProgress.toFixed(1)}% Rata-rata
          </Badge>
        </Group>
        <Progress value={stats.averageProgress} size="lg" radius="md" />
      </Card>

      {/* Filters and Search */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Proyek</Title>
          <Group>
            <TextInput placeholder="Cari proyek..." leftSection={<IconSearch size={16} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} w={250} />
            <Select
              placeholder="Filter Status"
              data={[
                { value: 'all', label: 'Semua Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'in-progress', label: 'Sedang Dikerjakan' },
                { value: 'review', label: 'Review' },
                { value: 'completed', label: 'Selesai' },
              ]}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value || 'all')}
              leftSection={<IconFilter size={16} />}
              w={180}
            />
          </Group>
        </Group>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} title="Tidak ada proyek">
            {searchTerm || filterStatus !== 'all' ? 'Tidak ada proyek yang sesuai dengan filter yang dipilih.' : 'Belum ada proyek yang dibuat. Klik tombol "Buat Proyek Baru" untuk memulai.'}
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {filteredProjects.map((project) => (
              <Card key={project.id} withBorder shadow="sm" radius="md" p="lg">
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="lg" lineClamp={2}>
                        {project.title}
                      </Text>
                      <Text size="sm" c="gray.6" lineClamp={2} mt={4}>
                        {project.description}
                      </Text>
                    </div>
                    <Menu shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />}>Lihat Detail</Menu.Item>
                        <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
                        <Menu.Item leftSection={<IconDownload size={14} />}>Download</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                          Hapus
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <Group gap="xs">
                    <Badge color={getStatusColor(project.status)} variant="light" size="sm">
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Badge color={getPriorityColor(project.priority)} variant="outline" size="sm">
                      {getPriorityLabel(project.priority)}
                    </Badge>
                    {project.category && (
                      <Badge variant="filled" size="sm" color="gray">
                        {project.category}
                      </Badge>
                    )}
                  </Group>

                  <div>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="gray.6">
                        Progress Penulisan
                      </Text>
                      <Text size="sm" fw={500}>
                        {project.wordCount.toLocaleString()} / {project.targetWords.toLocaleString()} kata
                      </Text>
                    </Group>
                    <Progress value={(project.wordCount / project.targetWords) * 100} size="md" color={project.wordCount >= project.targetWords ? 'green' : 'blue'} />
                  </div>

                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <IconCalendar size={14} color="gray" />
                      <Text size="xs" c="gray.5">
                        {new Date(project.createdAt).toLocaleDateString('id-ID')}
                      </Text>
                    </Group>
                    {project.deadline && (
                      <Group gap="xs">
                        <IconTarget size={14} color="red" />
                        <Text size="xs" c="red">
                          {new Date(project.deadline).toLocaleDateString('id-ID')}
                        </Text>
                      </Group>
                    )}
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Card>

      {/* Create/Edit Project Modal */}
      <Modal opened={opened} onClose={close} title={editingProject ? 'Edit Proyek' : 'Buat Proyek Baru'} size="lg">
        <Stack gap="md">
          <TextInput label="Judul Proyek" placeholder="Masukkan judul proyek..." value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />

          <Textarea label="Deskripsi" placeholder="Deskripsi proyek..." value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} minRows={3} required />

          <Group grow>
            <TextInput label="Kategori" placeholder="Penelitian, Studi Kasus, dll." value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} />

            <Select
              label="Prioritas"
              data={[
                { value: 'low', label: 'Rendah' },
                { value: 'medium', label: 'Sedang' },
                { value: 'high', label: 'Tinggi' },
              ]}
              value={formData.priority}
              onChange={(value) => setFormData((prev) => ({ ...prev, priority: value as any }))}
            />
          </Group>

          <Group grow>
            <TextInput label="Target Jumlah Kata" type="number" value={formData.targetWords} onChange={(e) => setFormData((prev) => ({ ...prev, targetWords: Number(e.target.value) }))} min={0} />

            <TextInput label="Deadline (Opsional)" type="date" value={formData.deadline} onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))} />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={close}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>{editingProject ? 'Update' : 'Buat Proyek'}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
