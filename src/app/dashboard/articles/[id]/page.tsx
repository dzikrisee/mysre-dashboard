// src/app/dashboard/articles/[id]/page.tsx - HALAMAN DETAIL ARTIKEL
'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Group, Button, Paper, Stack, Breadcrumbs, Anchor, Badge, Avatar, Divider, Box, ActionIcon, Tooltip, Alert, LoadingOverlay, Card } from '@mantine/core';
import { IconArrowLeft, IconDownload, IconEye, IconEdit, IconTrash, IconExternalLink, IconCalendar, IconUser, IconFile, IconDots } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

// Article Interface sesuai Prisma Schema
interface Article {
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

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articleId = params.id as string;

  // Fetch article details
  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch article with user data
        const { data: articleData, error: articleError } = await supabase
          .from('Article')
          .select(
            `
            id,
            title,
            filePath,
            createdAt,
            updateAt,
            userId,
            abstract,
            author,
            doi,
            keywords,
            year,
            user:userId(id, name, email, role, avatar_url)
          `,
          )
          .eq('id', articleId)
          .single();

        if (articleError) {
          throw new Error(articleError.message);
        }

        if (!articleData) {
          throw new Error('Artikel tidak ditemukan');
        }

        setArticle(articleData);
      } catch (error: any) {
        setError(error.message);
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // ✅ FIXED: Download function yang benar - perbaiki URL double encoding
  const handleDownload = async () => {
    if (!article?.filePath) {
      notifications.show({
        title: 'Error',
        message: 'File tidak tersedia untuk didownload',
        color: 'red',
      });
      return;
    }

    try {
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
    } catch (error: any) {
      console.error('Download failed:', error);
      notifications.show({
        title: 'Error',
        message: `Gagal download file: ${error.message}`,
        color: 'red',
      });
    }
  };

  // ✅ FIXED: View PDF function yang benar - perbaiki URL double encoding
  const handleViewPdf = () => {
    if (!article?.filePath) {
      notifications.show({
        title: 'Error',
        message: 'File tidak tersedia',
        color: 'red',
      });
      return;
    }

    try {
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
      const { data } = supabase.storage.from('uploads').getPublicUrl(cleanFilePath);

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

  const handleEdit = () => {
    router.push(`/dashboard/articles/${articleId}/edit`);
  };

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Hapus Artikel',
      children: `Apakah Anda yakin ingin menghapus artikel "${article?.title}"?`,
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/articles?id=${articleId}`, {
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

          router.push('/dashboard/articles');
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

  const canEdit = article && (isAdmin || article.userId === user?.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container size="lg">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container size="lg">
        <Alert color="red" title="Error">
          {error || 'Artikel tidak ditemukan'}
        </Alert>
        <Button variant="light" leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/dashboard/articles')} mt="md">
          Kembali ke Daftar Artikel
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => router.push('/dashboard/articles')}>
            Kembali
          </Button>

          <Group gap="sm">
            <Button variant="filled" leftSection={<IconDownload size={16} />} onClick={handleDownload}>
              Download
            </Button>
            {canEdit && (
              <>
                <Button variant="light" color="blue" leftSection={<IconEdit size={16} />} onClick={handleEdit}>
                  Edit
                </Button>
                <Button variant="light" color="red" leftSection={<IconTrash size={16} />} onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
          </Group>
        </Group>

        {/* Article Content */}
        <Paper p="xl" withBorder>
          <Stack gap="xl">
            {/* Article Type & Status */}
            <Group gap="xs">
              <Badge color="blue" variant="light" size="md">
                Research Article
              </Badge>
              <Badge color="green" variant="light" size="md" leftSection="●">
                Open Access
              </Badge>
              {article.year && (
                <Badge color="gray" variant="light" size="md">
                  {article.year}
                </Badge>
              )}
            </Group>

            {/* Title */}
            <Title order={1} style={{ lineHeight: 1.3 }}>
              {article.title}
            </Title>

            {/* Authors */}
            {article.author && (
              <Text size="lg" c="blue.7" fw={500}>
                {article.author}
              </Text>
            )}

            <Divider />

            {/* Metadata */}
            <Group grow>
              {/* Upload Info */}
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm" fw={500}>
                      Upload Date
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {formatDate(article.createdAt)}
                  </Text>
                  {article.updateAt && article.updateAt !== article.createdAt && (
                    <>
                      <Text size="xs" fw={500} mt="xs">
                        Last Updated:
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(article.updateAt)}
                      </Text>
                    </>
                  )}
                </Stack>
              </Card>

              {/* DOI */}
              {article.doi && (
                <Card withBorder p="md">
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconExternalLink size={16} />
                      <Text size="sm" fw={500}>
                        DOI
                      </Text>
                    </Group>
                    <Text size="sm" c="blue" component="a" href={`https://doi.org/${article.doi}`} target="_blank" style={{ textDecoration: 'none' }}>
                      {article.doi}
                    </Text>
                  </Stack>
                </Card>
              )}

              {/* File Info */}
              <Card withBorder p="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconFile size={16} />
                    <Text size="sm" fw={500}>
                      File
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    PDF Document
                  </Text>
                  <Button size="xs" variant="light" leftSection={<IconEye size={14} />} onClick={handleViewPdf}>
                    Preview
                  </Button>
                </Stack>
              </Card>
            </Group>

            <Divider />

            {/* Abstract */}
            {article.abstract && (
              <Box>
                <Title order={3} mb="md">
                  Abstract
                </Title>
                <Text size="md" style={{ lineHeight: 1.7 }}>
                  {article.abstract}
                </Text>
              </Box>
            )}

            {/* Keywords */}
            {article.keywords && (
              <Box>
                <Title order={3} mb="md">
                  Keywords
                </Title>
                <Group gap="xs">
                  {article.keywords.split(',').map((keyword, index) => (
                    <Badge key={index} variant="light" color="gray" size="md">
                      {keyword.trim()}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            <Divider />

            {/* Uploaded by */}
            {article.user && (
              <Box>
                <Title order={3} mb="md">
                  Uploaded by
                </Title>
                <Card withBorder p="md">
                  <Group>
                    <Avatar src={article.user.avatar_url} size="lg" radius="md" />
                    <div style={{ flex: 1 }}>
                      <Text fw={500} size="lg">
                        {article.user.name || 'Unknown User'}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {article.user.email}
                      </Text>
                      <Badge size="sm" color={article.user.role === 'ADMIN' ? 'red' : 'blue'} mt="xs">
                        {article.user.role === 'ADMIN' ? 'Administrator' : 'User'}
                      </Badge>
                    </div>
                  </Group>
                </Card>
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
