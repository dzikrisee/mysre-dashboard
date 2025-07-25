// src/components/articles/journal-article-list.tsx - JOURNAL STYLE LAYOUT
'use client';

import { useState, useEffect } from 'react';
import { Group, Text, ActionIcon, Button, Paper, TextInput, Stack, Box, LoadingOverlay, Tabs, Alert, Modal, FileInput, Textarea, Card, Badge, ThemeIcon, Tooltip, Container, Title, Menu, Divider, Avatar, Anchor, Flex } from '@mantine/core';
import { IconPlus, IconSearch, IconFileText, IconDownload, IconEye, IconUsers, IconAlertCircle, IconEdit, IconTrash, IconDots, IconCalendar, IconUser, IconFile, IconExternalLink, IconFile3d } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

// Article Interface
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

// Article Form Component
function JournalArticleForm({ isEditing, article, onClose, onSuccess }: { isEditing: boolean; article?: JournalArticle | null; onClose: () => void; onSuccess: () => void }) {
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

      // Upload file if provided
      if (values.file) {
        const fileName = `${Date.now()}_${values.file.name}`;
        const { data, error } = await supabase.storage.from('documents').upload(fileName, values.file);

        if (error) throw new Error(`Upload gagal: ${error.message}`);
        filePath = data.path;
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
        <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

        <Textarea label="Abstract" placeholder="Ringkasan artikel (opsional)" rows={4} {...form.getInputProps('abstract')} />

        <Group grow>
          <TextInput label="Author" placeholder="Nama penulis" {...form.getInputProps('author')} />
          <TextInput label="Tahun" placeholder="2024" {...form.getInputProps('year')} />
        </Group>

        <TextInput label="Keywords" placeholder="kata kunci, dipisah, koma" {...form.getInputProps('keywords')} />

        <TextInput label="DOI" placeholder="10.xxxx/xxxx (opsional)" {...form.getInputProps('doi')} />

        <FileInput label={isEditing ? 'File Baru (opsional)' : 'File PDF'} placeholder="Pilih file PDF" accept="application/pdf" {...form.getInputProps('file')} />

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

// Single Article Card Component
function ArticleCard({ article, onView, onEdit, onDelete, onDownload, canEdit }: { article: JournalArticle; onView: () => void; onEdit: () => void; onDelete: () => void; onDownload: () => void; canEdit: boolean }) {
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

        {/* Title */}
        <Title order={3} style={{ lineHeight: 1.3 }} c="dark">
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
          <Group gap="xs">
            <Text size="sm" fw={500} c="dimmed">
              Keywords:
            </Text>
            {article.keywords
              .split(',')
              .slice(0, 5)
              .map((keyword, idx) => (
                <Badge key={idx} variant="outline" size="sm" color="gray">
                  {keyword.trim()}
                </Badge>
              ))}
            {article.keywords.split(',').length > 5 && (
              <Text size="sm" c="dimmed">
                +{article.keywords.split(',').length - 5} more
              </Text>
            )}
          </Group>
        )}

        {/* Uploader Info */}
        {article.user && (
          <Group gap="sm">
            <Text size="sm" c="dimmed">
              Uploaded by:
            </Text>
            <Avatar src={article.user.avatar_url} size="sm">
              {article.user.name?.charAt(0)}
            </Avatar>
            <Text size="sm" fw={500}>
              {article.user.name}
            </Text>
            <Badge size="xs" color={article.user.role === 'ADMIN' ? 'red' : 'blue'}>
              {article.user.role === 'ADMIN' ? 'Admin' : 'User'}
            </Badge>
          </Group>
        )}

        {/* Action Buttons */}
        <Group justify="space-between" align="center" mt="md">
          <Group gap="md">
            <Button variant="light" size="sm" leftSection={<IconFile size={16} />} onClick={onDownload}>
              View PDF
            </Button>

            <Button variant="subtle" size="sm" leftSection={<IconEye size={16} />} onClick={onView}>
              Article preview
            </Button>
          </Group>

          {/* Edit/Delete Menu for authorized users */}
          {canEdit && (
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>
                  Edit Article
                </Menu.Item>
                <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={onDelete}>
                  Delete Article
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

// Article Detail Modal
function ArticleDetailModal({ article, opened, onClose }: { article: JournalArticle | null; opened: boolean; onClose: () => void }) {
  if (!article) return null;

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

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage.from('documents').download(article.filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.title}.pdf`;
      a.click();
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
    <Modal opened={opened} onClose={onClose} size="lg" title="Article Details">
      <Stack gap="lg">
        {/* Header */}
        <Box>
          <Group gap="xs" mb="sm">
            <Badge color="blue" variant="light">
              Research article
            </Badge>
            <Badge color="green" variant="light" leftSection="●">
              Open access
            </Badge>
          </Group>

          <Title order={2} mb="md" style={{ lineHeight: 1.3 }}>
            {article.title}
          </Title>

          {article.author && (
            <Text size="lg" c="blue.7" fw={500} mb="sm">
              {article.author}
            </Text>
          )}

          <Group gap="md" mb="md">
            <Text size="sm" c="dimmed" fs="italic">
              Uploaded:{' '}
              {new Date(article.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            {article.year && (
              <Text size="sm" c="dimmed" fs="italic">
                Year: {article.year}
              </Text>
            )}
          </Group>
        </Box>

        <Divider />

        {/* Abstract */}
        {article.abstract && (
          <Box>
            <Title order={4} mb="sm">
              Abstract
            </Title>
            <Text size="sm" style={{ lineHeight: 1.6 }}>
              {cleanText(article.abstract)}
            </Text>
          </Box>
        )}

        {/* Keywords */}
        {article.keywords && (
          <Box>
            <Title order={4} mb="sm">
              Keywords
            </Title>
            <Group gap="xs">
              {article.keywords.split(',').map((keyword, idx) => (
                <Badge key={idx} variant="outline" color="blue">
                  {keyword.trim()}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        {/* Metadata */}
        <Box>
          <Title order={4} mb="sm">
            Article Information
          </Title>
          <Stack gap="xs">
            {article.doi && (
              <Group>
                <Text size="sm" fw={500} w={80}>
                  DOI:
                </Text>
                <Anchor href={`https://doi.org/${article.doi}`} target="_blank" size="sm">
                  {article.doi}
                </Anchor>
              </Group>
            )}
            <Group>
              <Text size="sm" fw={500} w={80}>
                File:
              </Text>
              <Text size="sm">{article.filePath.split('/').pop()}</Text>
            </Group>
            {article.user && (
              <Group>
                <Text size="sm" fw={500} w={80}>
                  Uploader:
                </Text>
                <Group gap="sm">
                  <Avatar src={article.user.avatar_url} size="sm">
                    {article.user.name?.charAt(0)}
                  </Avatar>
                  <Text size="sm">{article.user.name}</Text>
                  <Badge size="xs" color={article.user.role === 'ADMIN' ? 'red' : 'blue'}>
                    {article.user.role === 'ADMIN' ? 'Admin' : 'User'}
                  </Badge>
                </Group>
              </Group>
            )}
          </Stack>
        </Box>

        {/* Actions */}
        <Group justify="center" mt="lg">
          <Button leftSection={<IconDownload size={16} />} onClick={handleDownload} size="md">
            Download PDF
          </Button>
        </Group>
      </Stack>
    </Modal>
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
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);
  const [showDetail, setShowDetail] = useState(false);

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

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat artikel');
      }

      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      setError(error.message);
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activePage, searchQuery, activeTab]);

  // Handlers
  const handleView = (article: JournalArticle) => {
    setSelectedArticle(article);
    setShowDetail(true);
  };

  const handleEdit = (article: JournalArticle) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = (article: JournalArticle) => {
    modals.openConfirmModal({
      title: 'Delete Article',
      children: <Text>Are you sure you want to delete "{article.title}"?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/articles?id=${article.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete');

          notifications.show({
            title: 'Success',
            message: 'Article deleted successfully',
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

  const handleDownload = async (article: JournalArticle) => {
    try {
      const { data, error } = await supabase.storage.from('documents').download(article.filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${article.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      notifications.show({
        title: 'Success',
        message: 'File downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to download file',
        color: 'red',
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Box>
            <Title order={2}>Research Articles</Title>
            <Text c="dimmed">Browse and manage research articles and publications</Text>
          </Box>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowForm(true)}>
            Add Article
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<IconFileText size={16} />}>
              All Articles ({total})
            </Tabs.Tab>
            <Tabs.Tab value="my-articles" leftSection={<IconUsers size={16} />}>
              My Articles
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Search */}
        <TextInput placeholder="Search articles by title, author, keywords..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="md" />

        {/* Articles List */}
        <Box pos="relative">
          <LoadingOverlay visible={loading} />

          {articles.length > 0 ? (
            <Stack gap="md">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onView={() => handleView(article)}
                  onEdit={() => handleEdit(article)}
                  onDelete={() => handleDelete(article)}
                  onDownload={() => handleDownload(article)}
                  canEdit={isAdmin || article.userId === user?.id}
                />
              ))}
            </Stack>
          ) : (
            !loading && (
              <Paper withBorder p="xl" ta="center">
                <ThemeIcon size="xl" variant="light" color="gray" mb="md" mx="auto">
                  <IconFileText size={32} />
                </ThemeIcon>
                <Text size="lg" fw={500} c="dimmed" mb="xs">
                  {activeTab === 'my-articles' ? 'No articles found' : 'No articles available'}
                </Text>
                <Text size="sm" c="dimmed">
                  {searchQuery ? 'No articles match your search criteria' : 'Start by adding your first research article'}
                </Text>
              </Paper>
            )
          )}
        </Box>

        {/* Pagination Info */}
        {totalPages > 1 && (
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Showing {articles.length} of {total} articles
            </Text>
            <Group gap="xs">
              <Button variant="subtle" size="sm" disabled={activePage === 1} onClick={() => setActivePage(activePage - 1)}>
                Previous
              </Button>
              <Text size="sm" c="dimmed">
                Page {activePage} of {totalPages}
              </Text>
              <Button variant="subtle" size="sm" disabled={activePage === totalPages} onClick={() => setActivePage(activePage + 1)}>
                Next
              </Button>
            </Group>
          </Group>
        )}

        {/* Modals */}
        <Modal
          opened={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingArticle(null);
          }}
          title={editingArticle ? 'Edit Article' : 'Add New Article'}
          size="lg"
        >
          <JournalArticleForm
            isEditing={!!editingArticle}
            article={editingArticle}
            onClose={() => {
              setShowForm(false);
              setEditingArticle(null);
            }}
            onSuccess={fetchArticles}
          />
        </Modal>

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
