'use client';
import { useState, useEffect } from 'react';
import { Group, Text, Button, Paper, TextInput, Stack, Box, LoadingOverlay, Tabs, Alert, Card, Badge, ThemeIcon, Container, Title, Menu, Divider, Avatar, Select, Pagination, ActionIcon } from '@mantine/core';
import { IconPlus, IconSearch, IconFileText, IconDownload, IconEye, IconAlertCircle, IconEdit, IconTrash, IconDots, IconUser, IconFilter, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

// ✅ FIXED: Article Interface sesuai Prisma Schema
interface JournalArticle {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updateAt?: string;
  userId?: string;
  sessionId?: string;
  abstract?: string;
  author?: string;
  doi?: string;
  keywords?: string;
  year?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    avatar_url?: string;
    group?: string;
    nim?: string;
  };
}

// Filter Interface
interface ArticleFilters {
  year?: string;
  author?: string;
  role?: string;
}

// ✅ FIXED: Single Article Card Component dengan proper props
function ArticleCard({ article, onDelete, onDownload, canEdit }: { article: JournalArticle; onDelete: () => void; onDownload: () => void; canEdit: boolean }) {
  const router = useRouter();

  // Clean text from HTML entities
  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/<\/?p>/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // ✅ FIXED: Fungsi view PDF yang benar
  const handleViewPdf = () => {
    try {
      if (!article.filePath) {
        notifications.show({
          title: 'Error',
          message: 'File tidak tersedia',
          color: 'red',
        });
        return;
      }

      let cleanFilePath = article.filePath;

      // Remove any URL prefix if exists
      if (cleanFilePath.includes('supabase.co/storage/v1/object/public/uploads/')) {
        const parts = cleanFilePath.split('supabase.co/storage/v1/object/public/uploads/');
        cleanFilePath = parts[parts.length - 1];
      }

      // Remove any remaining URL artifacts
      if (cleanFilePath.startsWith('http')) {
        const urlParts = cleanFilePath.split('/');
        cleanFilePath = urlParts[urlParts.length - 1];
      }

      // ✅ FIXED: URL yang benar untuk view PDF
      const { data } = supabase.storage.from('uploads').getPublicUrl(cleanFilePath);

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      } else {
        throw new Error('Gagal mendapatkan URL file');
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: `Gagal membuka file: ${error.message}`,
        color: 'red',
      });
    }
  };

  return (
    <Card withBorder padding="lg" radius="md" mb="md">
      <Stack gap="md">
        {/* Article Type & Access */}
        <Group gap="xs">
          <Badge color="blue" variant="light" size="sm">
            Research article
          </Badge>
          <Badge color="green" variant="light" size="sm" leftSection="●">
            Open access
          </Badge>
        </Group>

        {/* Title - Clickable untuk navigate ke detail */}
        <Title order={3} style={{ lineHeight: 1.3, cursor: 'pointer' }} c="dark" onClick={() => router.push(`/dashboard/articles/${article.id}`)}>
          {article.title}
        </Title>

        {/* Authors */}
        {article.author && (
          <Text size="md" c="blue.7" fw={500}>
            {article.author}
          </Text>
        )}

        {/* Publication Info */}
        <Group gap="md">
          <Text size="sm" c="dimmed" fs="italic">
            <Text component="span" fw={500}>
              Uploaded:
            </Text>{' '}
            {formatDate(article.createdAt)}
          </Text>
          {article.year && (
            <Text size="sm" c="dimmed" fs="italic">
              <Text component="span" fw={500}>
                Year:
              </Text>{' '}
              {article.year}
            </Text>
          )}
          {article.doi && (
            <Text size="sm" c="dimmed" fs="italic">
              <Text component="span" fw={500}>
                DOI:
              </Text>{' '}
              {article.doi}
            </Text>
          )}
        </Group>

        {/* Abstract Preview */}
        {article.abstract && (
          <Text size="sm" c="dark.6" style={{ lineHeight: 1.5 }}>
            {cleanText(article.abstract).substring(0, 300)}
            {cleanText(article.abstract).length > 300 && '...'}
          </Text>
        )}

        {/* Keywords */}
        {article.keywords && (
          <Text size="xs" c="dimmed">
            <Text component="span" fw={500}>
              Keywords:
            </Text>{' '}
            {article.keywords}
          </Text>
        )}

        {/* User Info */}
        {article.user && (
          <Group gap="sm">
            <Avatar src={article.user.avatar_url} size="sm" />
            <div>
              <Text size="sm" fw={500}>
                {article.user.name}
              </Text>
              <Text size="xs" c="dimmed">
                {article.user.email}
              </Text>
            </div>
            <Badge size="sm" color={article.user.role === 'ADMIN' ? 'red' : 'blue'}>
              {article.user.role === 'ADMIN' ? 'Admin' : 'User'}
            </Badge>
          </Group>
        )}

        <Divider />

        {/* Actions */}
        <Group justify="space-between">
          <Group gap="sm">
            <Button variant="light" size="sm" leftSection={<IconEye size={16} />} onClick={handleViewPdf}>
              View PDF
            </Button>
            <Button variant="subtle" size="sm" leftSection={<IconDownload size={16} />} onClick={onDownload}>
              Download
            </Button>
            <Button variant="subtle" size="sm" leftSection={<IconEye size={16} />} onClick={() => router.push(`/dashboard/articles/${article.id}`)}>
              Details
            </Button>
          </Group>

          {canEdit && (
            <Menu>
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => router.push(`/dashboard/articles/${article.id}?edit=true`)}>
                  Edit
                </Menu.Item>
                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={onDelete}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

// Main Component
export function JournalArticleList() {
  const router = useRouter();
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('all');

  // ✅ ADDED: Filter states
  const [filters, setFilters] = useState<ArticleFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueYears, setUniqueYears] = useState<string[]>([]);
  const [uniqueAuthors, setUniqueAuthors] = useState<string[]>([]);

  const { isAdmin, user } = useAuth();
  const pageSize = 10;

  // Fetch articles
  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: activePage.toString(),
        limit: pageSize.toString(),
      });

      if (activeTab === 'my-articles' && user) {
        params.append('userId', user.id);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      // ✅ ADDED: Apply filters
      if (filters.year) {
        params.append('year', filters.year);
      }
      if (filters.author) {
        params.append('author', filters.author);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat artikel');
      }

      setArticles(data.articles || []);
      setTotal(data.total || 0);

      // ✅ FIXED: Extract unique values for filters dengan proper typing
      const years = [...new Set(data.articles?.map((a: JournalArticle) => a.year).filter((year: string | undefined): year is string => Boolean(year)))] as string[];
      const authors = [...new Set(data.articles?.map((a: JournalArticle) => a.author).filter((author: string | undefined): author is string => Boolean(author)))] as string[];

      setUniqueYears(years.sort());
      setUniqueAuthors(authors.sort());
    } catch (err: any) {
      setError(err.message);
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk fetch articles
  useEffect(() => {
    fetchArticles();
  }, [activePage, searchQuery, activeTab, user, filters]);

  // ✅ FIXED: Download function yang benar
  const handleDownload = async (article: JournalArticle) => {
    try {
      if (!article.filePath) {
        notifications.show({
          title: 'Error',
          message: 'File tidak tersedia untuk didownload',
          color: 'red',
        });
        return;
      }

      let cleanFilePath = article.filePath;

      // Remove any URL prefix if exists
      if (cleanFilePath.includes('supabase.co/storage/v1/object/public/uploads/')) {
        const parts = cleanFilePath.split('supabase.co/storage/v1/object/public/uploads/');
        cleanFilePath = parts[parts.length - 1];
      }

      // Remove any remaining URL artifacts
      if (cleanFilePath.startsWith('http')) {
        const urlParts = cleanFilePath.split('/');
        cleanFilePath = urlParts[urlParts.length - 1];
      }

      // ✅ FIXED: Download dari bucket 'uploads' dengan path yang bersih
      const { data, error } = await supabase.storage.from('uploads').download(cleanFilePath);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notifications.show({
        title: 'Berhasil',
        message: 'File berhasil didownload',
        color: 'green',
      });
    } catch (err: any) {
      console.error('Download failed:', err);
      notifications.show({
        title: 'Error',
        message: `Gagal download file: ${err.message}`,
        color: 'red',
      });
    }
  };

  // ✅ FIXED: Edit function yang benar - navigate ke halaman detail dengan query parameter
  const handleEdit = (article: JournalArticle) => {
    router.push(`/dashboard/articles/${article.id}?edit=true`);
  };

  const handleDelete = (article: JournalArticle) => {
    modals.openConfirmModal({
      title: 'Hapus Artikel',
      children: `Apakah Anda yakin ingin menghapus artikel "${article.title}"?`,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/articles?id=${article.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gagal menghapus artikel');
          }

          notifications.show({
            title: 'Berhasil',
            message: 'Artikel berhasil dihapus',
            color: 'green',
          });

          fetchArticles();
        } catch (err: any) {
          notifications.show({
            title: 'Error',
            message: err.message,
            color: 'red',
          });
        }
      },
    });
  };

  // ✅ ADDED: Clear filters function
  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  if (loading && articles.length === 0) {
    return (
      <Container size="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2} mb="sm">
              Artikel Jurnal
            </Title>
            <Text c="dimmed">Kelola dan jelajahi koleksi artikel jurnal</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={() => router.push('/dashboard/articles/new')}>
            Tambah Artikel
          </Button>
        </Group>

        {/* Search and Filters */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group>
              <TextInput placeholder="Cari artikel..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
              <Button
                variant={showFilters ? 'filled' : 'light'}
                leftSection={<IconFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                rightSection={
                  activeFilterCount > 0 && (
                    <Badge size="xs" color="red">
                      {activeFilterCount}
                    </Badge>
                  )
                }
              >
                Filter
              </Button>
            </Group>

            {/* ✅ ADDED: Filter Panel */}
            {showFilters && (
              <Paper p="md" withBorder>
                <Group align="end">
                  <Select
                    label="Tahun"
                    placeholder="Pilih tahun"
                    data={uniqueYears.map((year) => ({ value: year, label: year }))}
                    value={filters.year || null}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        year: value || undefined,
                      }))
                    }
                    clearable
                  />
                  <Select
                    label="Penulis"
                    placeholder="Pilih penulis"
                    data={uniqueAuthors.map((author) => ({ value: author, label: author }))}
                    value={filters.author || null}
                    onChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        author: value || undefined,
                      }))
                    }
                    clearable
                    searchable
                  />
                  <Button variant="light" leftSection={<IconX size={16} />} onClick={clearFilters} disabled={activeFilterCount === 0}>
                    Clear
                  </Button>
                </Group>
              </Paper>
            )}
          </Stack>
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<IconFileText size={16} />}>
              Semua Artikel ({total})
            </Tabs.Tab>
            {user && (
              <Tabs.Tab value="my-articles" leftSection={<IconUser size={16} />}>
                Artikel Saya
              </Tabs.Tab>
            )}
          </Tabs.List>
        </Tabs>

        {/* Content */}
        {error ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        ) : articles.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <ThemeIcon size={80} variant="light" color="gray">
                <IconFileText size={40} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Title order={3} c="dimmed">
                  Tidak ada artikel
                </Title>
                <Text c="dimmed">{activeTab === 'my-articles' ? 'Anda belum memiliki artikel. Mulai dengan menambah artikel pertama.' : 'Belum ada artikel yang tersedia. Tambahkan artikel pertama sekarang.'}</Text>
              </div>
              <Button leftSection={<IconPlus size={16} />} onClick={() => router.push('/dashboard/articles/new')}>
                Tambah Artikel Pertama
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="md">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} onDelete={() => handleDelete(article)} onDownload={() => handleDownload(article)} canEdit={isAdmin || article.userId === user?.id} />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <Group justify="center">
            <Pagination total={Math.ceil(total / pageSize)} value={activePage} onChange={setActivePage} size="sm" />
          </Group>
        )}
      </Stack>
    </Container>
  );
}
