// src/components/articles/article-list.tsx - ENHANCED UI with Detail Page
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Avatar,
  Badge,
  Group,
  Text,
  ActionIcon,
  Menu,
  Button,
  Paper,
  TextInput,
  Stack,
  Box,
  ScrollArea,
  Pagination,
  Title,
  LoadingOverlay,
  Tabs,
  Alert,
  Modal,
  FileInput,
  Textarea,
  Card,
  Divider,
  ThemeIcon,
  Anchor,
  Tooltip,
  Grid,
  Container,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconFileText,
  IconDownload,
  IconEye,
  IconUsers,
  IconAlertCircle,
  IconCalendar,
  IconUser,
  IconArrowLeft,
  IconFile,
  IconTag,
  IconClock,
  IconExternalLink,
  IconHash,
  IconBook,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

// Interface Article yang lengkap sesuai database
interface Article {
  id: string;
  title: string;
  filePath?: string;
  sessionId?: string;
  userId?: string;
  createdAt: string;
  updateAt?: string;
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
    group?: string;
    nim?: string;
    avatar_url?: string;
  };
}

interface ArticleFormProps {
  isEditing: boolean;
  article?: Article | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Article Form Component
function ArticleForm({ isEditing, article, onClose, onSuccess }: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    initialValues: {
      title: article?.title || '',
      abstract: article?.abstract || '',
      author: article?.author || '',
      doi: article?.doi || '',
      keywords: article?.keywords || '',
      year: article?.year || '',
      file: null as File | null,
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Judul minimal 3 karakter' : null),
      year: (value) => {
        if (value && (!/^\d{4}$/.test(value) || parseInt(value) < 1900 || parseInt(value) > new Date().getFullYear() + 10)) {
          return 'Tahun harus berupa 4 digit angka yang valid';
        }
        return null;
      },
      file: (value) => {
        if (!isEditing && !value) {
          return 'File PDF/Document harus diupload';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      let filePath = article?.filePath || '';

      // Handle file upload
      if (values.file) {
        const file = values.file;
        const fileName = `${Date.now()}_${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        filePath = uploadData.path;
      }

      const articleData = {
        title: values.title,
        filePath: filePath,
        userId: user?.id || null,
        abstract: values.abstract || null,
        author: values.author || null,
        doi: values.doi || null,
        keywords: values.keywords || null,
        year: values.year || null,
      };

      if (isEditing && article) {
        const response = await fetch('/api/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: article.id, ...articleData }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Update failed');
        }

        notifications.show({
          title: 'Berhasil',
          message: 'Artikel berhasil diperbarui',
          color: 'green',
        });
      } else {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleData),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Create failed');
        }

        notifications.show({
          title: 'Berhasil',
          message: 'Artikel baru berhasil dibuat!',
          color: 'green',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

        <Textarea label="Abstract" placeholder="Abstract artikel (opsional)" rows={4} {...form.getInputProps('abstract')} />

        <Group grow>
          <TextInput label="Author" placeholder="Nama penulis (opsional)" {...form.getInputProps('author')} />
          <TextInput label="Tahun" placeholder="Tahun publikasi" {...form.getInputProps('year')} />
        </Group>

        <TextInput label="DOI" placeholder="Digital Object Identifier (opsional)" {...form.getInputProps('doi')} />

        <TextInput label="Keywords" placeholder="Kata kunci (pisahkan dengan koma)" {...form.getInputProps('keywords')} />

        <FileInput label={isEditing ? 'File Baru (Opsional)' : 'File PDF Artikel'} placeholder="Pilih file PDF" accept="application/pdf" required={!isEditing} {...form.getInputProps('file')} />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Simpan Perubahan' : 'Buat Artikel'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// Article Detail Modal Component
function ArticleDetailModal({ article, opened, onClose }: { article: Article | null; opened: boolean; onClose: () => void }) {
  if (!article) return null;

  const handleDownload = async () => {
    try {
      if (!article.filePath) {
        notifications.show({
          title: 'Error',
          message: 'File tidak tersedia untuk didownload',
          color: 'red',
        });
        return;
      }

      const { data, error } = await supabase.storage.from('documents').download(article.filePath);

      if (error) throw error;

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
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal download file',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={null} size="xl" padding="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Title order={2} mb="xs">
              {article.title}
            </Title>
            {article.year && (
              <Badge variant="light" color="blue" mb="sm">
                {article.year}
              </Badge>
            )}
          </Box>
          <Group gap="xs">
            <ActionIcon variant="light" onClick={handleDownload} disabled={!article.filePath}>
              <IconDownload size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" onClick={onClose}>
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider />

        {/* Content */}
        <Grid>
          <Grid.Col span={8}>
            {/* Abstract */}
            {article.abstract && (
              <Card withBorder mb="md">
                <Group mb="sm">
                  <ThemeIcon variant="light" color="blue">
                    <IconBook size={16} />
                  </ThemeIcon>
                  <Text fw={600}>Abstract</Text>
                </Group>
                <Text size="sm" style={{ lineHeight: 1.6 }}>
                  {article.abstract}
                </Text>
              </Card>
            )}

            {/* Keywords */}
            {article.keywords && (
              <Card withBorder mb="md">
                <Group mb="sm">
                  <ThemeIcon variant="light" color="green">
                    <IconTag size={16} />
                  </ThemeIcon>
                  <Text fw={600}>Keywords</Text>
                </Group>
                <Group gap="xs">
                  {article.keywords.split(',').map((keyword, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {keyword.trim()}
                    </Badge>
                  ))}
                </Group>
              </Card>
            )}

            {/* File Info */}
            <Card withBorder>
              <Group mb="sm">
                <ThemeIcon variant="light" color="orange">
                  <IconFile size={16} />
                </ThemeIcon>
                <Text fw={600}>File Information</Text>
              </Group>
              <Group gap="md">
                <Text size="sm">
                  <Text span fw={500}>
                    Filename:{' '}
                  </Text>
                  {article.filePath ? article.filePath.split('/').pop() : 'No file available'}
                </Text>
                {article.filePath && (
                  <Button variant="light" size="xs" onClick={handleDownload}>
                    Download PDF
                  </Button>
                )}
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            {/* Author Info */}
            <Card withBorder mb="md">
              <Group mb="sm">
                <ThemeIcon variant="light" color="grape">
                  <IconUser size={16} />
                </ThemeIcon>
                <Text fw={600}>Author Information</Text>
              </Group>
              <Stack gap="sm">
                {article.author && (
                  <Text size="sm">
                    <Text span fw={500}>
                      Author:{' '}
                    </Text>
                    {article.author}
                  </Text>
                )}
                {article.user && (
                  <Group gap="sm">
                    <Avatar src={article.user.avatar_url} size="sm">
                      {article.user.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {article.user.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {article.user.email}
                      </Text>
                      <Badge size="xs" color={article.user.role === 'ADMIN' ? 'red' : 'blue'}>
                        {article.user.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                      </Badge>
                    </Box>
                  </Group>
                )}
              </Stack>
            </Card>

            {/* Metadata */}
            <Card withBorder>
              <Group mb="sm">
                <ThemeIcon variant="light" color="cyan">
                  <IconHash size={16} />
                </ThemeIcon>
                <Text fw={600}>Metadata</Text>
              </Group>
              <Stack gap="xs">
                {article.doi && (
                  <Text size="sm">
                    <Text span fw={500}>
                      DOI:{' '}
                    </Text>
                    <Anchor href={`https://doi.org/${article.doi}`} target="_blank" size="sm">
                      {article.doi}
                    </Anchor>
                  </Text>
                )}
                <Text size="sm">
                  <Text span fw={500}>
                    Created:{' '}
                  </Text>
                  {new Date(article.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {article.updateAt && article.updateAt !== article.createdAt && (
                  <Text size="sm">
                    <Text span fw={500}>
                      Updated:{' '}
                    </Text>
                    {new Date(article.updateAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Modal>
  );
}

interface ArticleListProps {
  onArticleSelect?: (article: Article) => void;
}

export function ArticleList({ onArticleSelect }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { isAdmin, user } = useAuth();
  const pageSize = 10;

  useEffect(() => {
    fetchArticles();
  }, [activePage, searchQuery, activeTab]);

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

      if (searchQuery && searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data artikel');
      setArticles([]);
      setTotal(0);

      notifications.show({
        title: 'Error',
        message: `Gagal memuat data artikel: ${error.message || 'Unknown error'}`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (article: Article) => {
    setSelectedArticle(article);
    setShowDetail(true);
    if (onArticleSelect) {
      onArticleSelect(article);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = async (article: Article) => {
    modals.openConfirmModal({
      title: 'Hapus Artikel',
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus artikel <strong>{article.title}</strong>? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/articles?id=${article.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Delete failed');
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
            message: error.message || 'Gagal menghapus artikel',
            color: 'red',
          });
        }
      },
    });
  };

  const handleDownload = async (article: Article) => {
    try {
      if (!article.filePath) {
        notifications.show({
          title: 'Error',
          message: 'File tidak tersedia untuk didownload',
          color: 'red',
        });
        return;
      }

      const { data, error } = await supabase.storage.from('documents').download(article.filePath);

      if (error) throw error;

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
      notifications.show({
        title: 'Error',
        message: 'Gagal download file',
        color: 'red',
      });
    }
  };

  const formatAuthor = (article: Article) => {
    if (article.author) return article.author;
    if (article.user?.name) return article.user.name;
    return 'Unknown Author';
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Title order={2}>Manajemen Artikel</Title>
            <Text size="sm" c="dimmed">
              Kelola artikel penelitian dan dokumen ({total} artikel)
            </Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowForm(true)}>
            Tambah Artikel
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<IconFileText size={16} />}>
              Semua Artikel ({total})
            </Tabs.Tab>
            <Tabs.Tab value="my-articles" leftSection={<IconUsers size={16} />}>
              Artikel Saya
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Search */}
        <TextInput placeholder="Cari judul artikel, author, atau kata kunci..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="md" />

        {/* Table */}
        <Paper withBorder radius="md">
          <LoadingOverlay visible={loading} />
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ minWidth: '300px' }}>Artikel</Table.Th>
                  <Table.Th style={{ minWidth: '200px' }}>Author</Table.Th>
                  <Table.Th style={{ minWidth: '150px' }}>Uploader</Table.Th>
                  <Table.Th style={{ minWidth: '120px' }}>Tanggal</Table.Th>
                  <Table.Th style={{ minWidth: '100px' }} ta="center">
                    Aksi
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr key={article.id}>
                    <Table.Td>
                      <Group gap="sm" align="flex-start">
                        <ThemeIcon variant="light" color="blue" size="lg">
                          <IconFileText size={20} />
                        </ThemeIcon>
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={600} lineClamp={2} mb={4}>
                            {article.title}
                          </Text>
                          {article.abstract && (
                            <Text size="xs" c="dimmed" lineClamp={2} mb={4}>
                              {article.abstract}
                            </Text>
                          )}
                          <Group gap="xs">
                            {article.year && (
                              <Badge size="xs" variant="light" color="blue">
                                {article.year}
                              </Badge>
                            )}
                            {article.keywords && (
                              <Badge size="xs" variant="outline" color="gray">
                                {article.keywords.split(',').length} keywords
                              </Badge>
                            )}
                            {article.doi && (
                              <Badge size="xs" variant="outline" color="green">
                                DOI
                              </Badge>
                            )}
                          </Group>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {formatAuthor(article)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={article.user?.avatar_url} size="sm" color="blue">
                          {article.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Text size="sm" fw={500}>
                            {article.user?.name || 'Unknown'}
                          </Text>
                          <Badge size="xs" color={article.user?.role === 'ADMIN' ? 'red' : 'blue'}>
                            {article.user?.role === 'ADMIN' ? 'Admin' : 'User'}
                          </Badge>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconCalendar size={14} color="var(--mantine-color-gray-6)" />
                        <Text size="sm" c="dimmed">
                          {new Date(article.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center">
                        <Tooltip label="Lihat Detail">
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleView(article)}>
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Download">
                          <ActionIcon variant="subtle" color="green" onClick={() => handleDownload(article)} disabled={!article.filePath}>
                            <IconDownload size={16} />
                          </ActionIcon>
                        </Tooltip>
                        {(isAdmin || article.userId === user?.id) && (
                          <Menu position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => handleEdit(article)}>
                                Edit
                              </Menu.Item>
                              <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => handleDelete(article)}>
                                Hapus
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {articles.length === 0 && !loading && !error && (
            <Box p="xl" ta="center">
              <ThemeIcon size="xl" variant="light" color="gray" mb="md" mx="auto">
                <IconFileText size={32} />
              </ThemeIcon>
              <Text c="dimmed" size="lg" fw={500} mb="xs">
                {activeTab === 'my-articles' ? 'Anda belum memiliki artikel' : 'Belum ada artikel'}
              </Text>
              <Text c="dimmed" size="sm">
                {searchQuery ? 'Tidak ada artikel yang sesuai dengan pencarian.' : 'Mulai dengan menambahkan artikel pertama Anda.'}
              </Text>
            </Box>
          )}
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination value={activePage} onChange={setActivePage} total={totalPages} size="sm" showFirst showLast />
          </Group>
        )}

        {/* Form Modal */}
        <Modal
          opened={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingArticle(null);
          }}
          title={editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
          size="lg"
        >
          <ArticleForm
            isEditing={!!editingArticle}
            article={editingArticle}
            onClose={() => {
              setShowForm(false);
              setEditingArticle(null);
            }}
            onSuccess={fetchArticles}
          />
        </Modal>

        {/* Detail Modal */}
        <ArticleDetailModal
          article={selectedArticle}
          opened={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedArticle(null);
          }}
        />
      </Stack>
    </Container>
  );
}
