// src/components/articles/article-form.tsx - UPDATED FOR PRISMA SCHEMA
'use client';

import { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Stack, Group, FileInput, Text, Progress, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { supabase, Article } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ✅ UPDATED: FormValues sesuai Prisma schema dengan field tambahan
interface FormValues {
  title: string;
  abstract?: string;
  author?: string;
  doi?: string;
  keywords?: string;
  year?: string;
  file?: File | null;
}

export function ArticleForm({ article, onClose, onSuccess }: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const isEditing = !!article;

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
      author: (value) => (value && value.length < 2 ? 'Nama penulis minimal 2 karakter' : null),
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
        if (value && value.size > 10 * 1024 * 1024) {
          // 10MB limit
          return 'Ukuran file maksimal 10MB';
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

      // Simulate upload progress
      setUploadProgress(25);

      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(100);

      // Small delay to show progress
      setTimeout(() => setUploadProgress(0), 1000);

      return filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      let filePath = article?.filePath;

      // Upload file jika ada file baru
      if (values.file) {
        filePath = await uploadFileToStorage(values.file);
      }

      // ✅ UPDATED: Prepare data sesuai Prisma schema
      const articleData: any = {
        title: values.title,
        filePath: filePath!,
        abstract: values.abstract || null,
        author: values.author || null,
        doi: values.doi || null,
        keywords: values.keywords || null,
        year: values.year || null,
        updateAt: new Date().toISOString(), // ✅ FIXED: updateAt sesuai Prisma
        userId: user?.id || null,
      };

      let result;
      if (isEditing) {
        // Update existing article
        result = await supabase
          .from('Article')
          .update(articleData)
          .eq('id', article!.id)
          .select(
            `
            *,
            user:User(id, name, email, role, group, nim, avatar_url)
          `,
          )
          .single();
      } else {
        // Create new article
        articleData.createdAt = new Date().toISOString(); // ✅ FIXED: createdAt

        result = await supabase
          .from('Article')
          .insert(articleData)
          .select(
            `
            *,
            user:User(id, name, email, role, group, nim, avatar_url)
          `,
          )
          .single();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      notifications.show({
        title: 'Berhasil!',
        message: `Artikel berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving article:', error);
      notifications.show({
        title: 'Error!',
        message: error.message || 'Terjadi kesalahan saat menyimpan artikel',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal opened={true} onClose={onClose} title={`${isEditing ? 'Edit' : 'Tambah'} Artikel`} size="lg" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Basic Info */}
          <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

          <Textarea label="Abstrak" placeholder="Ringkasan atau abstrak artikel (opsional)" minRows={3} maxRows={6} {...form.getInputProps('abstract')} />

          {/* Author Info */}
          <Group grow>
            <TextInput label="Penulis" placeholder="Nama penulis artikel" {...form.getInputProps('author')} />
            <TextInput label="Tahun Publikasi" placeholder="2024" {...form.getInputProps('year')} />
          </Group>

          {/* Academic Info */}
          <Group grow>
            <TextInput label="DOI" placeholder="10.1000/182 (opsional)" {...form.getInputProps('doi')} />
            <TextInput label="Kata Kunci" placeholder="machine learning, AI, data science" {...form.getInputProps('keywords')} />
          </Group>

          {/* File Upload */}
          <FileInput label="File Dokumen" placeholder="Pilih file PDF, DOC, atau DOCX" accept=".pdf,.doc,.docx,.txt" leftSection={<IconUpload size={16} />} required={!isEditing} {...form.getInputProps('file')} />

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && <Progress value={uploadProgress} size="sm" animated />}

          <Text size="xs" c="dimmed">
            <strong>Format yang didukung:</strong> PDF, DOC, DOCX, TXT (Maksimal 10MB)
          </Text>

          {/* File Info */}
          {isEditing && article?.filePath && (
            <Text size="sm" c="blue">
              📄 File saat ini: {article.filePath.split('/').pop()}
            </Text>
          )}

          {/* Actions */}
          <Group justify="flex-end" mt="lg">
            <Button variant="light" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" loading={loading} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Simpan Perubahan' : 'Tambah Artikel'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
