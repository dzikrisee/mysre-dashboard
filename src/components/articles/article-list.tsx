'use client';

import { useState, useEffect } from 'react';
import { Table, Avatar, Badge, Group, Text, ActionIcon, Menu, Button, Paper, TextInput, Select, Stack, Flex, Box, ScrollArea, Pagination, Card, Title, LoadingOverlay, Tabs, Alert, Modal, FileInput, Textarea } from '@mantine/core';
import { IconDots, IconEdit, IconTrash, IconPlus, IconSearch, IconFilter, IconFileText, IconDownload, IconEye, IconUsers, IconSchool, IconId, IconAlertCircle, IconCalendar, IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

// Define Article interface locally since it's not exported from supabase
interface Article {
  id: string;
  title: string;
  filePath?: string;
  sessionId?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    group?: string;
    nim?: string;
    avatar_url?: string; // Tambah ini
  };
}

// Simple Article Form Component
function SimpleArticleForm({ article, onClose, onSuccess }: { article?: any; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const isEditing = !!article;

  const form = useForm({
    initialValues: {
      title: article?.title || '',
      description: '',
      file: null,
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Judul minimal 3 karakter' : null),
      file: (value) => {
        if (!isEditing && !value) {
          return 'File PDF/Document harus diupload';
        }
        return null;
      },
    },
  });

  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      console.log('📤 Uploading file to:', filePath);
      setUploadProgress(20);

      const { data, error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket belum dibuat. Silakan buat bucket "documents" di Supabase Dashboard > Storage');
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(70);

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

      setUploadProgress(100);
      console.log('✅ Upload successful:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      let filePath = article?.filePath || '';

      if (values.file) {
        try {
          filePath = await uploadFileToStorage(values.file);
        } catch (uploadError) {
          notifications.show({
            title: 'Error Upload',
            message: uploadError instanceof Error ? uploadError.message : 'Gagal upload file',
            color: 'red',
          });
          setLoading(false);
          return;
        }
      }

      if (isEditing && article) {
        const updateData = {
          title: values.title,
          filePath: filePath,
          updateAt: new Date().toISOString(), // Sesuai dengan schema SQL (updateAt bukan updated_at)
        };

        console.log('📝 Updating article:', article.id, 'with data:', updateData);

        const { error } = await supabase.from('Article').update(updateData).eq('id', article.id);

        if (error) {
          console.error('🚨 Update error:', error);
          throw new Error(`Update failed: ${error.message}`);
        }

        notifications.show({
          title: 'Berhasil',
          message: 'Artikel berhasil diperbarui',
          color: 'green',
        });
      } else {
        // Generate ID manual karena table tidak auto-increment
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const articleId = `art_${timestamp}_${randomStr}`;

        const insertData = {
          id: articleId, // HARUS ada ID manual
          title: values.title,
          filePath: filePath,
          userId: user?.id || null,
        };

        console.log('📝 Inserting article data (with manual ID):', insertData);

        const { error, data } = await supabase.from('Article').insert(insertData).select();

        if (error) {
          console.error('🚨 Insert error:', error);
          throw new Error(`Database error: ${error.message || 'Unknown error'}`);
        }

        console.log('✅ Article created successfully:', data);

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
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

        <Textarea label="Deskripsi (Opsional)" placeholder="Deskripsi singkat tentang artikel" rows={3} {...form.getInputProps('description')} />

        <FileInput
          label={isEditing ? 'Upload File Baru (Opsional)' : 'Upload File PDF/Document'}
          placeholder="Pilih file PDF, DOC, atau DOCX"
          leftSection={<IconUpload size={16} />}
          accept=".pdf,.doc,.docx"
          required={!isEditing}
          {...form.getInputProps('file')}
        />

        {loading && uploadProgress > 0 && (
          <Box>
            <Text size="sm" c="blue" mb="xs">
              Uploading: {uploadProgress}%
            </Text>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: '#228be6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </Box>
        )}

        {isEditing && article?.filePath && (
          <Box p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
            <Text size="sm" fw={500} mb="xs">
              File Saat Ini:
            </Text>
            <Group gap="xs">
              <IconFileText size={16} color="var(--mantine-color-red-6)" />
              <Text size="sm" c="gray.7">
                {article.filePath.split('/').pop()}
              </Text>
            </Group>
          </Box>
        )}

        <Box p="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '8px' }}>
          <Text size="sm" fw={500} mb="xs">
            Penulis:
          </Text>
          <Text size="sm">
            <strong>{user?.name}</strong> ({user?.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'})
          </Text>
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? (uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Menyimpan...') : isEditing ? 'Simpan Perubahan' : 'Buat Artikel'}
          </Button>
        </Group>
      </Stack>
    </form>
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
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const { isAdmin, user } = useAuth();
  const pageSize = 10;

  useEffect(() => {
    fetchArticles();
  }, [activePage, searchQuery, activeTab]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching articles...');

      let query = supabase.from('Article').select('*', { count: 'exact' });

      if (activeTab === 'my-articles' && user) {
        console.log('🔍 Applying my articles filter');
        query = query.eq('userId', user.id);
      }

      if (searchQuery && searchQuery.trim()) {
        console.log('🔍 Applying search filter:', searchQuery);
        query = query.ilike('title', `%${searchQuery}%`);
      }

      query = query.order('createdAt', { ascending: false });

      const from = (activePage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      console.log('🔍 Executing query...');
      const { data, error, count } = await query;

      if (error) {
        console.error('🚨 Query error:', error);
        throw error;
      }

      const articlesWithAuthors = await Promise.all(
        (data || []).map(async (article) => {
          if (article.userId) {
            const { data: userData } = await supabase.from('User').select('id, name, email, role, group, nim, avatar_url').eq('id', article.userId).single();
            return { ...article, author: userData };
          }
          return { ...article, author: null };
        }),
      );

      setArticles(articlesWithAuthors);
      setTotal(count || 0);

      console.log('✅ Articles loaded successfully:', articlesWithAuthors.length, 'total:', count);
    } catch (error: any) {
      console.error('🚨 Error fetching articles:', error);
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

  const handleDelete = async (article: any) => {
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
          const { error } = await supabase.from('Article').delete().eq('id', article.id);
          if (error) throw error;
          notifications.show({
            title: 'Berhasil',
            message: 'Artikel berhasil dihapus',
            color: 'green',
          });
          fetchArticles();
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: `Gagal menghapus artikel: ${error.message}`,
            color: 'red',
          });
        }
      },
    });
  };

  const handleEdit = (article: any) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleView = (article: any) => {
    if (!article.filePath) {
      notifications.show({
        title: 'File Tidak Tersedia',
        message: 'File untuk artikel ini tidak ditemukan',
        color: 'orange',
      });
      return;
    }

    if (article.filePath.startsWith('http')) {
      window.open(article.filePath, '_blank');
    } else {
      notifications.show({
        title: 'File Path',
        message: `File location: ${article.filePath}`,
        color: 'blue',
      });
    }
  };

  const handleDownload = async (article: any) => {
    if (!article.filePath) {
      notifications.show({
        title: 'File Tidak Tersedia',
        message: 'File untuk artikel ini tidak ditemukan',
        color: 'orange',
      });
      return;
    }

    try {
      if (article.filePath.startsWith('http')) {
        const link = document.createElement('a');
        link.href = article.filePath;
        link.download = article.title + '.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notifications.show({
          title: 'Download',
          message: 'File sedang didownload...',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error Download',
        message: 'Gagal mendownload file',
        color: 'red',
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingArticle(null);
    fetchArticles();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Stack gap="md">
      <Card withBorder shadow="sm" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={3}>Manajemen Artikel</Title>
          {isAdmin() && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setShowForm(true)}>
              Tambah Artikel
            </Button>
          )}
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')} mb="md">
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<IconFileText size={16} />}>
              Semua Artikel
            </Tabs.Tab>
            <Tabs.Tab value="my-articles" leftSection={<IconUsers size={16} />}>
              Artikel Saya
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Group mb="md">
          <TextInput placeholder="Cari judul artikel..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
        </Group>

        <Paper withBorder radius="md" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Artikel</Table.Th>
                  <Table.Th>Penulis</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Dibuat</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr key={article.id} style={{ cursor: onArticleSelect ? 'pointer' : 'default' }} onClick={() => onArticleSelect?.(article)}>
                    <Table.Td>
                      <Group gap="sm">
                        <IconFileText size={20} color="var(--mantine-color-red-6)" />
                        <Box>
                          <Text size="sm" fw={500} lineClamp={2}>
                            {article.title}
                          </Text>
                          <Text size="xs" c="gray.6" lineClamp={1}>
                            {article.filePath ? article.filePath.split('/').pop() : 'No file'}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={article.author?.avatar_url} size="sm" color="blue">
                          {article.author?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Text size="sm" fw={500}>
                            {article.author?.name || 'Unknown'}
                          </Text>
                          <Text size="xs" c="gray.6">
                            {article.author?.email || '-'}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={article.author?.role === 'ADMIN' ? 'red' : 'blue'} variant="light">
                        {article.author?.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <IconCalendar size={14} />
                        <Text size="sm" c="gray.7">
                          {new Date(article.createdAt).toLocaleDateString('id-ID')}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleView(article)} size="sm" title="View file">
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green" onClick={() => handleDownload(article)} size="sm" title="Download file">
                          <IconDownload size={16} />
                        </ActionIcon>
                        {(isAdmin() || article.userId === user?.id) && (
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" size="sm">
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
              <Text c="gray.5">{activeTab === 'my-articles' ? 'Anda belum memiliki artikel' : 'Tidak ada artikel ditemukan'}</Text>
            </Box>
          )}
        </Paper>

        {totalPages > 1 && (
          <Flex justify="center" mt="md">
            <Pagination value={activePage} onChange={setActivePage} total={totalPages} size="sm" />
          </Flex>
        )}

        <Group justify="space-between" mt="md">
          <Text size="sm" c="gray.6">
            Menampilkan {articles.length} dari {total} artikel
          </Text>
        </Group>
      </Card>

      {showForm && (
        <Modal
          opened={showForm}
          onClose={handleFormClose}
          title={
            <Text size="lg" fw={600}>
              {editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
            </Text>
          }
          size="md"
          closeOnClickOutside={false}
        >
          <SimpleArticleForm article={editingArticle} onClose={handleFormClose} onSuccess={fetchArticles} />
        </Modal>
      )}
    </Stack>
  );
}
