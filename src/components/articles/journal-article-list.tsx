// src/components/articles/journal-article-list.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Group, Text, ActionIcon, Button, Paper, TextInput, Stack, Box, LoadingOverlay, Tabs, Alert, Modal, FileInput, Textarea, Card, Badge, ThemeIcon, Tooltip, Container, Title, Menu, Divider, Avatar, Anchor, Flex, Select, Pagination } from '@mantine/core';
import { IconPlus, IconSearch, IconFileText, IconDownload, IconEye, IconUsers, IconAlertCircle, IconEdit, IconTrash, IconDots, IconCalendar, IconUser, IconFile, IconExternalLink, IconFile3d, IconFilter, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

// Article Interface sesuai Prisma Schema
interface JournalArticle {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updateAt?: string;
  userId?: string;
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
  };
}

// Filter Interface
interface ArticleFilters {
  year?: string;
  author?: string;
  role?: string;
}

// Article Form Component
function JournalArticleForm({ 
  isEditing, 
  article, 
  onClose, 
  onSuccess 
}: { 
  isEditing: boolean; 
  article?: JournalArticle | null; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    initialValues: {
      title: article?.title || '',
      abstract: article?.abstract || '',
      author: article?.author || '',
      year: article?.year || '',
      keywords: article?.keywords || '',
      doi: article?.doi || '',
      file: null as File | null,
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Judul minimal 3 karakter' : null),
      file: (value) => (!isEditing && !value ? 'File harus diupload' : null),
    },
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let filePath = article?.filePath || '';

      // ✅ FIXED: Upload file ke bucket 'uploads'
      if (values.file) {
        const fileName = `document-${Date.now()}.pdf`;
        const { data, error } = await supabase.storage
          .from('uploads') // ✅ FIXED: Menggunakan bucket 'uploads'
          .upload(fileName, values.file);

        if (error) throw new Error(`Upload gagal: ${error.message}`);
        filePath = fileName; // ✅ FIXED: Simpan hanya filename, bukan full path
      }

      const payload = {
        title: values.title,
        filePath,
        userId: user?.id,
        abstract: values.abstract || null,
        author: values.author || null,
        year: values.year || null,
        keywords: values.keywords || null,
        doi: values.doi || null,
      };

      const url = '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { id: article?.id, ...payload } : payload;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menyimpan artikel');
      }

      notifications.show({
        title: 'Berhasil',
        message: isEditing ? 'Artikel berhasil diperbarui' : 'Artikel berhasil ditambahkan',
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput 
          label="Judul Artikel" 
          placeholder="Masukkan judul artikel" 
          required 
          {...form.getInputProps('title')} 
        />

        <Textarea 
          label="Abstract" 
          placeholder="Ringkasan artikel (opsional)" 
          rows={4} 
          {...form.getInputProps('abstract')} 
        />

        <Group grow>
          <TextInput 
            label="Author" 
            placeholder="Nama penulis" 
            {...form.getInputProps('author')} 
          />
          <TextInput 
            label="Tahun" 
            placeholder="2024" 
            {...form.getInputProps('year')} 
          />
        </Group>

        <TextInput 
          label="Keywords" 
          placeholder="kata kunci, dipisah, koma" 
          {...form.getInputProps('keywords')} 
        />

        <TextInput 
          label="DOI" 
          placeholder="10.xxxx/xxxx (opsional)" 
          {...form.getInputProps('doi')} 
        />

        <FileInput 
          label={isEditing ? 'File Baru (opsional)' : 'File PDF'} 
          placeholder="Pilih file PDF" 
          accept="application/pdf" 
          {...form.getInputProps('file')} 
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Update' : 'Simpan'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ✅ REMOVED: Article Detail Modal - menggunakan halaman detail terpisah

// Single Article Card Component
function ArticleCard({ 
  article, 
  onEdit, 
  onDelete, 
  onDownload, 
  canEdit 
}: { 
  article: JournalArticle; 
  onEdit: () => void; 
  onDelete: () => void; 
  onDownload: () => void; 
  canEdit: boolean; 
}) {
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

  // ✅ FIXED: Fungsi view PDF yang benar - perbaiki URL double encoding
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

      console.log('Viewing file:', article.filePath); // Debug log

      // ✅ FIXED: Pastikan filePath bersih, tanpa URL prefix
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

      console.log('Clean file path for view:', cleanFilePath); // Debug log

      // ✅ FIXED: URL yang benar untuk view PDF
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(cleanFilePath);

      console.log('Public URL:', data.publicUrl); // Debug log

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      } else {
        throw new Error('Gagal mendapatkan URL file');
      }
    } catch (error: any) {
      console.error('View PDF failed:', error);
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
        <Title 
          order={3} 
          style={{ lineHeight: 1.3, cursor: 'pointer' }} 
          c="dark"
          onClick={() => router.push(`/dashboard/articles/${article.id}`)}
        >
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
            <Text component="span" fw={500}>Keywords:</Text> {article.keywords}
          </Text>
        )}

        {/* User Info */}
        {article.user && (
          <Group gap="sm">
            <Avatar src={article.user.avatar_url} size="sm" />
            <div>
              <Text size="sm" fw={500}>{article.user.name}</Text>
              <Text size="xs" c="dimmed">{article.user.email}</Text>
            </div>
            <Badge size="sm" color={article.user.role === 'ADMIN' ? 'red' : 'blue'}>
              {article.user.role === 'ADMIN' ? 'Admin' : 'Mahasiswa'}
            </Badge>
          </Group>
        )}

        <Divider />

        {/* Actions */}
        <Group justify="space-between">
          <Group gap="sm">
            <Button
              variant="light"
              size="sm"
              leftSection={<IconEye size={16} />}
              onClick={handleViewPdf}
            >
              View PDF
            </Button>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconDownload size={16} />}
              onClick={onDownload}
            >
              Download
            </Button>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconEye size={16} />}
              onClick={() => router.push(`/dashboard/articles/${article.id}`)}
            >
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
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>
                  Edit
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconTrash size={16} />} 
                  color="red" 
                  onClick={onDelete}
                >
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
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<JournalArticle | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  // ✅ REMOVED: Modal states - tidak lagi menggunakan modal detail
  
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

      // ✅ FIXED: Extract unique values for filters dengan type casting
      const years = [...new Set(data.articles?.map((a: JournalArticle) => a.year).filter(Boolean))] as string[];
      const authors = [...new Set(data.articles?.map((a: JournalArticle) => a.author).filter(Boolean))] as string[];
      setUniqueYears(years.sort());
      setUniqueAuthors(authors.sort());

    } catch (error: any) {
      setError(error.message);
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

  // ✅ FIXED: Download function yang benar - perbaiki URL double encoding
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

      console.log('Downloading file:', article.filePath); // Debug log

      // ✅ FIXED: Pastikan filePath bersih, tanpa URL prefix
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

      console.log('Clean file path:', cleanFilePath); // Debug log

      // ✅ FIXED: Download dari bucket 'uploads' dengan path yang bersih
      const { data, error } = await supabase.storage
        .from('uploads')
        .download(cleanFilePath);

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
    } catch (error: any) {
      console.error('Download failed:', error);
      notifications.show({
        title: 'Error',
        message: `Gagal download file: ${error.message}`,
        color: 'red',
      });
    }
  };

  const handleEdit = (article: JournalArticle) => {
    setEditingArticle(article);
    setShowForm(true);
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
            const error = await response.json();
            throw new Error(error.error || 'Gagal menghapus artikel');
          }

          notifications.show({
            title: 'Berhasil',
            message: 'Artikel berhasil dihapus',
            color: 'green',
          });

          fetchArticles();
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message,
            color: 'red',
          });
        }
      },
    });
  };

  const canEdit = (article: JournalArticle) => {
    return isAdmin || article.userId === user?.id;
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
            <Title order={2} mb="sm">Artikel Jurnal</Title>
            <Text c="dimmed">Kelola dan jelajahi koleksi artikel jurnal</Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingArticle(null);
              setShowForm(true);
            }}
          >
            Tambah Artikel
          </Button>
        </Group>

        {/* Search and Filters */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group>
              <TextInput
                placeholder="Cari artikel..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                variant={showFilters ? 'filled' : 'light'}
                leftSection={<IconFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                rightSection={activeFilterCount > 0 && (
                  <Badge size="xs" color="red">
                    {activeFilterCount}
                  </Badge>
                )}
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
                    data={uniqueYears.map(year => ({ value: year, label: year }))}
                    value={filters.year || null}
                    onChange={(value) => setFilters(prev => ({ ...prev, year: value || undefined }))}
                    clearable
                  />
                  <Select
                    label="Penulis"
                    placeholder="Pilih penulis"
                    data={uniqueAuthors.map(author => ({ value: author, label: author }))}
                    value={filters.author || null}
                    onChange={(value) => setFilters(prev => ({ ...prev, author: value || undefined }))}
                    clearable
                    searchable
                  />
                  <Button
                    variant="light"
                    leftSection={<IconX size={16} />}
                    onClick={clearFilters}
                    disabled={activeFilterCount === 0}
                  >
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
                <Title order={3} c="dimmed">Tidak ada artikel</Title>
                <Text c="dimmed">
                  {activeTab === 'my-articles' 
                    ? 'Anda belum memiliki artikel. Mulai dengan menambah artikel pertama.'
                    : 'Belum ada artikel yang tersedia. Tambahkan artikel pertama sekarang.'
                  }
                </Text>
              </div>
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setEditingArticle(null);
                  setShowForm(true);
                }}
              >
                Tambah Artikel Pertama
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="md">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={() => handleEdit(article)}
                onDelete={() => handleDelete(article)}
                onDownload={() => handleDownload(article)}
                canEdit={canEdit(article)}
              />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <Group justify="center">
            <Pagination
              total={Math.ceil(total / pageSize)}
              value={activePage}
              onChange={setActivePage}
              size="sm"
            />
          </Group>
        )}
      </Stack>

      {/* Article Form Modal */}
      <Modal
        opened={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingArticle(null);
        }}
        title={editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
        size="lg"
      >
        <JournalArticleForm
          isEditing={!!editingArticle}
          article={editingArticle}
          onClose={() => {
            setShowForm(false);
            setEditingArticle(null);
          }}
          onSuccess={() => {
            fetchArticles();
            setActivePage(1);
          }}
        />
      </Modal>

      {/* ✅ REMOVED: Article Detail Modal - sekarang menggunakan halaman detail terpisah */}
    </Container>
  );
}