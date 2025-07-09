// src/app/dashboard/project-brainstorm/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Button,
  Badge,
  Grid,
  SimpleGrid,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Avatar,
  Menu,
  Tooltip,
  ThemeIcon,
  Center,
  Loader,
  Paper,
  Alert,
  Tabs,
  Divider,
  Box,
  Rating,
  Chip,
  Timeline,
  Anchor,
  Spoiler,
  Accordion,
  List,
  Container,
} from '@mantine/core';
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
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconStar,
  IconStarFilled,
  IconThumbUp,
  IconThumbDown,
  IconShare,
  IconBookmark,
  IconTarget,
  IconBrain,
  IconRocket,
  IconTrendingUp,
  IconCategory,
  IconTag,
  IconUsers,
  IconMessageCircle,
  IconHeart,
  IconHeartFilled,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';

// Types
interface BrainstormIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: 'idea' | 'researching' | 'developing' | 'implemented' | 'archived';
  priority: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  isFavorite: boolean;
  estimatedDuration: string; // e.g., "2-3 bulan"
  targetAudience: string;
  researchQuestions: string[];
  relatedIdeas: string[];
}

interface BrainstormStats {
  totalIdeas: number;
  activeIdeas: number;
  implementedIdeas: number;
  totalLikes: number;
  categoriesCount: number;
  monthlyNewIdeas: number;
}

interface Comment {
  id: string;
  ideaId: string;
  content: string;
  authorId: string;
  author: {
    name: string;
    avatar_url?: string;
  };
  createdAt: string;
  likes: number;
}

export default function ProjectBrainstormPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
  const [stats, setStats] = useState<BrainstormStats>({
    totalIdeas: 0,
    activeIdeas: 0,
    implementedIdeas: 0,
    totalLikes: 0,
    categoriesCount: 0,
    monthlyNewIdeas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [selectedIdea, setSelectedIdea] = useState<BrainstormIdea | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    complexity: 'moderate' as 'simple' | 'moderate' | 'complex',
    estimatedDuration: '',
    targetAudience: '',
    researchQuestions: '',
  });

  // Categories for brainstorming
  const categories = [
    'Teknologi Pendidikan',
    'Pembelajaran Digital',
    'Metode Penelitian',
    'Analisis Data',
    'Sistem Informasi',
    'User Experience',
    'Artificial Intelligence',
    'Machine Learning',
    'Sosial Media',
    'Perilaku Pengguna',
    'E-Learning',
    'Mobile Learning',
    'Gamifikasi',
    'Evaluasi Pendidikan',
    'Inovasi Pembelajaran',
  ];

  // Simulate data loading
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual Supabase call
      const mockIdeas: BrainstormIdea[] = [
        {
          id: '1',
          title: 'Platform AI untuk Personalisasi Pembelajaran',
          description: 'Mengembangkan platform yang menggunakan AI untuk memberikan pengalaman pembelajaran yang dipersonalisasi berdasarkan gaya belajar, kecepatan, dan preferensi setiap mahasiswa.',
          category: 'Artificial Intelligence',
          tags: ['AI', 'Personalisasi', 'Machine Learning', 'Adaptive Learning'],
          status: 'researching',
          priority: 'high',
          complexity: 'complex',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          likes: 15,
          comments: 8,
          isLiked: true,
          isFavorite: false,
          estimatedDuration: '6-8 bulan',
          targetAudience: 'Mahasiswa S1 dan S2',
          researchQuestions: ['Bagaimana AI dapat mengidentifikasi gaya belajar mahasiswa?', 'Metrik apa yang paling efektif untuk mengukur personalisasi?', 'Bagaimana memastikan privasi data mahasiswa?'],
          relatedIdeas: ['2', '3'],
        },
        {
          id: '2',
          title: 'Gamifikasi dalam Pembelajaran Statistik',
          description: 'Mengintegrasikan elemen game untuk membuat pembelajaran statistik lebih menarik dan interaktif, dengan sistem poin, level, dan achievement.',
          category: 'Gamifikasi',
          tags: ['Gamifikasi', 'Statistik', 'Engagement', 'Interactive Learning'],
          status: 'idea',
          priority: 'medium',
          complexity: 'moderate',
          createdAt: '2024-01-12T09:00:00Z',
          updatedAt: '2024-01-12T09:00:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          likes: 23,
          comments: 12,
          isLiked: false,
          isFavorite: true,
          estimatedDuration: '3-4 bulan',
          targetAudience: 'Mahasiswa yang mengambil mata kuliah statistik',
          researchQuestions: ['Elemen gamifikasi apa yang paling efektif untuk pembelajaran statistik?', 'Bagaimana mengukur peningkatan engagement dan pemahaman?', 'Apakah gamifikasi cocok untuk semua tipe mahasiswa?'],
          relatedIdeas: ['1', '4'],
        },
        {
          id: '3',
          title: 'Analisis Sentimen Media Sosial untuk Feedback Pembelajaran',
          description: 'Menggunakan teknik analisis sentimen untuk menganalisis feedback mahasiswa di media sosial tentang metode pembelajaran, untuk meningkatkan kualitas pendidikan.',
          category: 'Analisis Data',
          tags: ['Sentiment Analysis', 'Social Media', 'NLP', 'Feedback Analysis'],
          status: 'developing',
          priority: 'medium',
          complexity: 'complex',
          createdAt: '2024-01-08T11:00:00Z',
          updatedAt: '2024-01-18T16:00:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          likes: 18,
          comments: 6,
          isLiked: true,
          isFavorite: true,
          estimatedDuration: '4-5 bulan',
          targetAudience: 'Institusi pendidikan dan pengajar',
          researchQuestions: [
            'Platform media sosial mana yang paling relevan untuk analisis?',
            'Bagaimana memastikan akurasi analisis sentimen dalam konteks pendidikan?',
            'Bagaimana mengintegrasikan hasil analisis ke dalam perbaikan pembelajaran?',
          ],
          relatedIdeas: ['1', '5'],
        },
        {
          id: '4',
          title: 'VR untuk Simulasi Eksperimen Laboratorium',
          description: 'Mengembangkan aplikasi Virtual Reality untuk mensimulasikan eksperimen laboratorium yang mahal atau berbahaya, memberikan pengalaman praktik yang aman dan cost-effective.',
          category: 'Teknologi Pendidikan',
          tags: ['Virtual Reality', 'Simulation', 'Laboratory', 'Cost Effective'],
          status: 'idea',
          priority: 'high',
          complexity: 'complex',
          createdAt: '2024-01-05T14:00:00Z',
          updatedAt: '2024-01-05T14:00:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          likes: 31,
          comments: 15,
          isLiked: false,
          isFavorite: false,
          estimatedDuration: '8-12 bulan',
          targetAudience: 'Mahasiswa sains dan teknik',
          researchQuestions: [
            'Eksperimen mana yang paling cocok untuk disimulasikan dalam VR?',
            'Bagaimana memastikan akurasi simulasi dengan kondisi laboratorium nyata?',
            'Apakah VR dapat menggantikan pengalaman laboratorium fisik sepenuhnya?',
          ],
          relatedIdeas: ['2'],
        },
        {
          id: '5',
          title: 'Chatbot AI untuk Konseling Akademik',
          description: 'Membuat chatbot berbasis AI yang dapat memberikan konseling akademik 24/7, membantu mahasiswa dalam perencanaan studi, pemilihan mata kuliah, dan bimbingan karir.',
          category: 'Artificial Intelligence',
          tags: ['Chatbot', 'AI', 'Academic Counseling', 'Student Support'],
          status: 'implemented',
          priority: 'high',
          complexity: 'moderate',
          createdAt: '2023-12-20T08:00:00Z',
          updatedAt: '2024-01-10T12:00:00Z',
          authorId: user?.id || '1',
          author: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john@example.com',
            avatar_url: user?.avatar_url,
          },
          likes: 42,
          comments: 20,
          isLiked: true,
          isFavorite: true,
          estimatedDuration: '4-6 bulan',
          targetAudience: 'Semua mahasiswa',
          researchQuestions: ['Bagaimana melatih AI untuk memberikan konseling yang akurat?', 'Apa saja batasan chatbot dalam memberikan konseling?', 'Bagaimana mengintegrasikan dengan sistem akademik yang ada?'],
          relatedIdeas: ['1', '3'],
        },
      ];

      setIdeas(mockIdeas);
      calculateStats(mockIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data ide',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ideas: BrainstormIdea[]) => {
    const stats: BrainstormStats = {
      totalIdeas: ideas.length,
      activeIdeas: ideas.filter((i) => ['idea', 'researching', 'developing'].includes(i.status)).length,
      implementedIdeas: ideas.filter((i) => i.status === 'implemented').length,
      totalLikes: ideas.reduce((sum, i) => sum + i.likes, 0),
      categoriesCount: new Set(ideas.map((i) => i.category)).size,
      monthlyNewIdeas: ideas.filter((i) => {
        const ideaDate = new Date(i.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return ideaDate > monthAgo;
      }).length,
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

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      const researchQuestions = formData.researchQuestions
        .split('\n')
        .map((q) => q.trim())
        .filter((q) => q);

      const newIdea: BrainstormIdea = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags,
        status: 'idea',
        priority: formData.priority,
        complexity: formData.complexity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: user?.id || '1',
        author: {
          name: user?.name || 'John Doe',
          email: user?.email || 'john@example.com',
          avatar_url: user?.avatar_url,
        },
        likes: 0,
        comments: 0,
        isLiked: false,
        isFavorite: false,
        estimatedDuration: formData.estimatedDuration,
        targetAudience: formData.targetAudience,
        researchQuestions,
        relatedIdeas: [],
      };

      setIdeas((prev) => [newIdea, ...prev]);
      calculateStats([newIdea, ...ideas]);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        priority: 'medium',
        complexity: 'moderate',
        estimatedDuration: '',
        targetAudience: '',
        researchQuestions: '',
      });

      close();
      notifications.show({
        title: 'Berhasil',
        message: 'Ide berhasil dibuat',
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating idea:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal membuat ide',
        color: 'red',
      });
    }
  };

  const handleLike = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          return {
            ...idea,
            isLiked: !idea.isLiked,
            likes: idea.isLiked ? idea.likes - 1 : idea.likes + 1,
          };
        }
        return idea;
      }),
    );
  };

  const handleFavorite = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          return { ...idea, isFavorite: !idea.isFavorite };
        }
        return idea;
      }),
    );
  };

  const handleViewDetail = (idea: BrainstormIdea) => {
    setSelectedIdea(idea);
    openDetail();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea':
        return 'gray';
      case 'researching':
        return 'blue';
      case 'developing':
        return 'orange';
      case 'implemented':
        return 'green';
      case 'archived':
        return 'red';
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'green';
      case 'moderate':
        return 'blue';
      case 'complex':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'idea':
        return 'Ide';
      case 'researching':
        return 'Riset';
      case 'developing':
        return 'Pengembangan';
      case 'implemented':
        return 'Terealisasi';
      case 'archived':
        return 'Diarsipkan';
      default:
        return status;
    }
  };

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter((idea) => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || idea.description.toLowerCase().includes(searchTerm.toLowerCase()) || idea.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTab = activeTab === 'all' || (activeTab === 'my-ideas' && idea.authorId === user?.id) || (activeTab === 'favorites' && idea.isFavorite) || (activeTab === 'trending' && idea.likes >= 20);

      const matchesCategory = filterCategory === 'all' || idea.category === filterCategory;

      return matchesSearch && matchesTab && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes;
        case 'trending':
          return b.likes + b.comments - (a.likes + a.comments);
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
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
      title: 'Total Ide',
      value: stats.totalIdeas,
      icon: IconBulb,
      color: 'yellow',
    },
    {
      title: 'Ide Aktif',
      value: stats.activeIdeas,
      icon: IconRocket,
      color: 'blue',
    },
    {
      title: 'Terealisasi',
      value: stats.implementedIdeas,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: IconHeart,
      color: 'red',
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Project Brainstorm</Title>
          <Text c="gray.6">Kumpulkan dan kembangkan ide-ide proyek penelitian yang inovatif</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Tambah Ide Baru
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

      {/* Quick Stats */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between">
          <div>
            <Text fw={600} size="lg">
              Insight Bulanan
            </Text>
            <Text size="sm" c="gray.6">
              Statistik aktivitas brainstorming bulan ini
            </Text>
          </div>
          <Group>
            <Badge variant="light" size="lg" color="blue">
              +{stats.monthlyNewIdeas} Ide Baru
            </Badge>
            <Badge variant="light" size="lg" color="green">
              {stats.categoriesCount} Kategori
            </Badge>
          </Group>
        </Group>
      </Card>

      {/* Tabs and Filters */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="all" leftSection={<IconBulb size={16} />}>
              Semua Ide
            </Tabs.Tab>
            <Tabs.Tab value="my-ideas" leftSection={<IconUser size={16} />}>
              Ide Saya
            </Tabs.Tab>
            <Tabs.Tab value="favorites" leftSection={<IconHeart size={16} />}>
              Favorit
            </Tabs.Tab>
            <Tabs.Tab value="trending" leftSection={<IconTrendingUp size={16} />}>
              Trending
            </Tabs.Tab>
          </Tabs.List>

          {/* Filters */}
          <Group justify="space-between" mb="lg">
            <Group>
              <TextInput placeholder="Cari ide..." leftSection={<IconSearch size={16} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} w={250} />
              <Select
                placeholder="Kategori"
                data={[{ value: 'all', label: 'Semua Kategori' }, ...categories.map((cat) => ({ value: cat, label: cat }))]}
                value={filterCategory}
                onChange={(value) => setFilterCategory(value || 'all')}
                leftSection={<IconCategory size={16} />}
                w={200}
              />
            </Group>
            <Select
              placeholder="Urutkan"
              data={[
                { value: 'latest', label: 'Terbaru' },
                { value: 'popular', label: 'Terpopuler' },
                { value: 'trending', label: 'Trending' },
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              leftSection={<IconSortAscending size={16} />}
              w={150}
            />
          </Group>

          {/* Ideas Grid */}
          <Tabs.Panel value={activeTab}>
            {filteredIdeas.length === 0 ? (
              <Alert icon={<IconAlertCircle size={16} />} title="Tidak ada ide">
                {searchTerm || filterCategory !== 'all'
                  ? 'Tidak ada ide yang sesuai dengan filter yang dipilih.'
                  : activeTab === 'my-ideas'
                  ? 'Anda belum membuat ide apapun. Mulai brainstorming sekarang!'
                  : activeTab === 'favorites'
                  ? 'Belum ada ide yang ditandai sebagai favorit.'
                  : 'Belum ada ide yang dibuat. Mulai brainstorming bersama!'}
              </Alert>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                {filteredIdeas.map((idea) => (
                  <Card key={idea.id} withBorder shadow="sm" radius="md" p="lg" style={{ cursor: 'pointer' }}>
                    <Stack gap="md">
                      <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="lg" lineClamp={2} onClick={() => handleViewDetail(idea)}>
                            {idea.title}
                          </Text>
                          <Text size="sm" c="gray.6" lineClamp={3} mt={4}>
                            {idea.description}
                          </Text>
                        </div>
                        <ActionIcon variant={idea.isFavorite ? 'filled' : 'subtle'} color={idea.isFavorite ? 'red' : 'gray'} onClick={() => handleFavorite(idea.id)}>
                          {idea.isFavorite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                        </ActionIcon>
                      </Group>

                      {/* Tags */}
                      <Group gap="xs">
                        {idea.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="light" size="xs" color="blue">
                            {tag}
                          </Badge>
                        ))}
                        {idea.tags.length > 3 && (
                          <Badge variant="light" size="xs" color="gray">
                            +{idea.tags.length - 3}
                          </Badge>
                        )}
                      </Group>

                      {/* Status and Priority */}
                      <Group gap="xs">
                        <Badge color={getStatusColor(idea.status)} variant="filled" size="sm">
                          {getStatusLabel(idea.status)}
                        </Badge>
                        <Badge color={getPriorityColor(idea.priority)} variant="outline" size="sm">
                          {idea.priority.toUpperCase()}
                        </Badge>
                        <Badge color={getComplexityColor(idea.complexity)} variant="light" size="sm">
                          {idea.complexity}
                        </Badge>
                      </Group>

                      {/* Category */}
                      <Text size="xs" c="gray.5" fw={500}>
                        📂 {idea.category}
                      </Text>

                      {/* Engagement Stats */}
                      <Group justify="space-between" align="center">
                        <Group gap="lg">
                          <Group gap="xs">
                            <ActionIcon variant={idea.isLiked ? 'filled' : 'subtle'} color={idea.isLiked ? 'red' : 'gray'} size="sm" onClick={() => handleLike(idea.id)}>
                              {idea.isLiked ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
                            </ActionIcon>
                            <Text size="sm" c="gray.6">
                              {idea.likes}
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <IconMessageCircle size={14} color="gray" />
                            <Text size="sm" c="gray.6">
                              {idea.comments}
                            </Text>
                          </Group>
                        </Group>

                        <Group gap="xs">
                          <Avatar src={idea.author.avatar_url} size="xs" color="blue">
                            {idea.author.name.charAt(0)}
                          </Avatar>
                          <Text size="xs" c="gray.5" truncate>
                            {idea.author.name}
                          </Text>
                        </Group>
                      </Group>

                      {/* Date */}
                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <IconCalendar size={12} color="gray" />
                          <Text size="xs" c="gray.5">
                            {new Date(idea.createdAt).toLocaleDateString('id-ID')}
                          </Text>
                        </Group>
                        <Tooltip label="Estimasi Durasi">
                          <Group gap="xs">
                            <IconClock size={12} color="gray" />
                            <Text size="xs" c="gray.5">
                              {idea.estimatedDuration}
                            </Text>
                          </Group>
                        </Tooltip>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>
        </Tabs>
      </Card>

      {/* Create Idea Modal */}
      <Modal opened={opened} onClose={close} title="Tambah Ide Baru" size="lg">
        <Stack gap="md">
          <TextInput label="Judul Ide" placeholder="Masukkan judul ide yang menarik..." value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />

          <Textarea label="Deskripsi" placeholder="Jelaskan ide Anda secara detail..." value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} minRows={4} required />

          <Group grow>
            <Select
              label="Kategori"
              placeholder="Pilih kategori"
              data={categories.map((cat) => ({ value: cat, label: cat }))}
              value={formData.category}
              onChange={(value) => setFormData((prev) => ({ ...prev, category: value || '' }))}
              searchable
            />

            <TextInput label="Estimasi Durasi" placeholder="e.g., 3-4 bulan" value={formData.estimatedDuration} onChange={(e) => setFormData((prev) => ({ ...prev, estimatedDuration: e.target.value }))} />
          </Group>

          <Group grow>
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

            <Select
              label="Kompleksitas"
              data={[
                { value: 'simple', label: 'Sederhana' },
                { value: 'moderate', label: 'Sedang' },
                { value: 'complex', label: 'Kompleks' },
              ]}
              value={formData.complexity}
              onChange={(value) => setFormData((prev) => ({ ...prev, complexity: value as any }))}
            />
          </Group>

          <TextInput label="Target Audience" placeholder="Siapa yang akan mendapat manfaat dari ide ini?" value={formData.targetAudience} onChange={(e) => setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))} />

          <TextInput label="Tags" placeholder="Masukkan tags dipisahkan dengan koma (e.g., AI, Machine Learning, Education)" value={formData.tags} onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))} />

          <Textarea
            label="Research Questions"
            placeholder="Masukkan pertanyaan penelitian, satu per baris..."
            value={formData.researchQuestions}
            onChange={(e) => setFormData((prev) => ({ ...prev, researchQuestions: e.target.value }))}
            minRows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={close}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan Ide</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Detail Idea Modal */}
      <Modal opened={detailOpened} onClose={closeDetail} title={selectedIdea?.title} size="xl">
        {selectedIdea && (
          <Stack gap="lg">
            {/* Header Info */}
            <Group justify="space-between" align="flex-start">
              <Group>
                <Avatar src={selectedIdea.author.avatar_url} size="md" color="blue">
                  {selectedIdea.author.name.charAt(0)}
                </Avatar>
                <div>
                  <Text fw={500}>{selectedIdea.author.name}</Text>
                  <Text size="sm" c="gray.6">
                    {new Date(selectedIdea.createdAt).toLocaleDateString('id-ID')}
                  </Text>
                </div>
              </Group>
              <Group>
                <ActionIcon variant={selectedIdea.isLiked ? 'filled' : 'subtle'} color={selectedIdea.isLiked ? 'red' : 'gray'} onClick={() => handleLike(selectedIdea.id)}>
                  {selectedIdea.isLiked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                </ActionIcon>
                <Text size="sm">{selectedIdea.likes}</Text>
              </Group>
            </Group>

            {/* Status Badges */}
            <Group>
              <Badge color={getStatusColor(selectedIdea.status)} variant="filled">
                {getStatusLabel(selectedIdea.status)}
              </Badge>
              <Badge color={getPriorityColor(selectedIdea.priority)} variant="outline">
                Prioritas {selectedIdea.priority.toUpperCase()}
              </Badge>
              <Badge color={getComplexityColor(selectedIdea.complexity)} variant="light">
                Kompleksitas {selectedIdea.complexity}
              </Badge>
            </Group>

            {/* Description */}
            <div>
              <Text fw={600} mb="sm">
                Deskripsi
              </Text>
              <Text>{selectedIdea.description}</Text>
            </div>

            {/* Details */}
            <SimpleGrid cols={2} spacing="md">
              <div>
                <Text fw={600} mb="xs">
                  Kategori
                </Text>
                <Text c="gray.6">{selectedIdea.category}</Text>
              </div>
              <div>
                <Text fw={600} mb="xs">
                  Estimasi Durasi
                </Text>
                <Text c="gray.6">{selectedIdea.estimatedDuration}</Text>
              </div>
              <div>
                <Text fw={600} mb="xs">
                  Target Audience
                </Text>
                <Text c="gray.6">{selectedIdea.targetAudience}</Text>
              </div>
              <div>
                <Text fw={600} mb="xs">
                  Status
                </Text>
                <Text c="gray.6">{getStatusLabel(selectedIdea.status)}</Text>
              </div>
            </SimpleGrid>

            {/* Tags */}
            <div>
              <Text fw={600} mb="sm">
                Tags
              </Text>
              <Group gap="xs">
                {selectedIdea.tags.map((tag, index) => (
                  <Badge key={index} variant="light" color="blue">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </div>

            {/* Research Questions */}
            {selectedIdea.researchQuestions.length > 0 && (
              <div>
                <Text fw={600} mb="sm">
                  Research Questions
                </Text>
                <List spacing="xs">
                  {selectedIdea.researchQuestions.map((question, index) => (
                    <List.Item key={index}>
                      <Text size="sm">{question}</Text>
                    </List.Item>
                  ))}
                </List>
              </div>
            )}

            {/* Actions */}
            <Group justify="flex-end">
              <Button variant="light" leftSection={<IconEdit size={16} />}>
                Edit Ide
              </Button>
              <Button leftSection={<IconRocket size={16} />}>Kembangkan Proyek</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
