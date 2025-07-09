// src/components/articles/article-form.tsx
'use client';

import { useState } from 'react';
import { Modal, TextInput, Button, Stack, Group, FileInput, Box, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconFileText, IconUpload } from '@tabler/icons-react';
import { supabase, Article } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
}

interface FormValues {
  title: string;
  description?: string;
  file?: File | null;
}

export function ArticleForm({ article, onClose }: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEditing = !!article;
  const { user } = useAuth();

  const form = useForm<FormValues>({
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
        if (value && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(value.type)) {
          return 'Hanya file PDF, DOC, atau DOCX yang diperbolehkan';
        }
        return null;
      },
    },
  });

  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      console.log('📤 Uploading file to:', filePath);
      setUploadProgress(10);

      // Check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const documentsExists = buckets?.some((bucket) => bucket.name === 'documents');

      if (!documentsExists) {
        // Create bucket if doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('documents', {
          public: true,
          allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760, // 10MB
        });

        if (bucketError) {
          console.log('Bucket might already exist:', bucketError);
        }
      }

      setUploadProgress(30);

      // Upload file
      const { data, error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

      setUploadProgress(100);
      console.log('✅ Upload successful:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error('💥 File upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      let filePath = article?.filePath || '';

      // Upload file if provided
      if (values.file) {
        try {
          filePath = await uploadFileToStorage(values.file);
        } catch (uploadError) {
          notifications.show({
            title: 'Error Upload',
            message: uploadError instanceof Error ? uploadError.message : 'Gagal upload file',
            color: 'red',
            icon: <IconX size={16} />,
          });
          setLoading(false);
          return;
        }
      }

      // Generate session ID automatically
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      if (isEditing && article) {
        // Update existing article
        const updateData = {
          title: values.title,
          filePath: filePath,
          sessionId: article.sessionId || sessionId, // Keep existing or generate new
          updatedAt: new Date().toISOString(),
        };

        const { error } = await supabase.from('Article').update(updateData).eq('id', article.id);

        if (error) throw error;

        notifications.show({
          title: 'Berhasil',
          message: 'Artikel berhasil diperbarui',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        // Create new article
        const articleId = `article-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const insertData = {
          id: articleId,
          title: values.title,
          filePath: filePath,
          sessionId: sessionId,
          userId: user?.id || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { error } = await supabase.from('Article').insert(insertData);

        if (error) throw error;

        notifications.show({
          title: 'Berhasil',
          message: 'Artikel baru berhasil dibuat dan file telah diupload!',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      onClose();
    } catch (error) {
      console.error('❌ Submit error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan artikel',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text size="lg" fw={600}>
          {isEditing ? 'Edit Artikel' : 'Tambah Artikel Baru'}
        </Text>
      }
      size="md"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Title */}
          <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

          {/* Description (optional) */}
          <Textarea label="Deskripsi (Opsional)" placeholder="Deskripsi singkat tentang artikel" rows={3} {...form.getInputProps('description')} />

          {/* File Upload */}
          <FileInput
            label={isEditing ? 'Upload File Baru (Opsional)' : 'Upload File PDF/Document'}
            placeholder="Pilih file PDF, DOC, atau DOCX"
            leftSection={<IconUpload size={16} />}
            accept=".pdf,.doc,.docx"
            required={!isEditing}
            {...form.getInputProps('file')}
          />

          {/* Upload Progress */}
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

          {/* Current File Info (for editing) */}
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

          {/* Author Info */}
          <Box p="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '8px' }}>
            <Text size="sm" fw={500} mb="xs">
              Informasi Penulis:
            </Text>
            <Group gap="sm">
              <Text size="sm">
                <strong>{user?.name}</strong> ({user?.role === 'admin' ? 'Administrator' : 'Mahasiswa'})
              </Text>
              {user?.group && (
                <Text size="sm" c="gray.7">
                  • Group {user.group}
                </Text>
              )}
            </Group>
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
    </Modal>
  );
}
