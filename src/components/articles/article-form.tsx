// src/components/articles/article-form.tsx - FIXED VERSION
'use client';

import { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Stack, Group, FileInput, Text, Progress, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
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
}

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

  // ✅ FIXED: Upload file ke bucket 'uploads'
  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `document-${timestamp}-${randomStr}.${fileExt}`;

      setUploadProgress(10);

      // ✅ FIXED: Upload ke bucket 'uploads'
      const { data, error } = await supabase.storage.from('uploads').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      setUploadProgress(90);

      if (error) {
        throw new Error(`Upload error: ${error.message}`);
      }

      setUploadProgress(100);
      return fileName; // ✅ Return hanya filename, bukan full path
    } catch (error: any) {
      setUploadProgress(0);
      throw error;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      let filePath = article?.filePath || '';

      // Upload new file if provided
      if (values.file) {
        filePath = await uploadFileToStorage(values.file);
      }

      const articleData = {
        title: values.title,
        filePath,
        userId: user?.id || null,
        abstract: values.abstract || null,
        author: values.author || null,
        doi: values.doi || null,
        keywords: values.keywords || null,
        year: values.year || null,
      };

      const url = '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { id: article?.id, ...articleData } : articleData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan artikel');
      }

      const result = await response.json();

      notifications.show({
        title: 'Berhasil!',
        message: isEditing ? 'Artikel berhasil diperbarui' : 'Artikel berhasil dibuat',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving article:', error);
      notifications.show({
        title: 'Error',
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

        <Textarea label="Abstract" placeholder="Ringkasan atau abstrak artikel (opsional)" rows={4} {...form.getInputProps('abstract')} />

        <Group grow>
          <TextInput label="Penulis" placeholder="Nama penulis artikel" {...form.getInputProps('author')} />
          <TextInput label="Tahun Publikasi" placeholder="2024" {...form.getInputProps('year')} />
        </Group>

        <TextInput label="DOI" placeholder="10.xxxx/xxxx (opsional)" {...form.getInputProps('doi')} />

        <TextInput label="Keywords" placeholder="kata kunci, dipisah, dengan, koma" {...form.getInputProps('keywords')} />

        <FileInput label={isEditing ? 'File Baru (Opsional)' : 'File PDF Artikel'} placeholder="Pilih file PDF" accept="application/pdf" required={!isEditing} leftSection={<IconUpload size={16} />} {...form.getInputProps('file')} />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <Text size="sm" mb="xs">
              Uploading file... {uploadProgress}%
            </Text>
            <Progress value={uploadProgress} color="blue" />
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} leftSection={<IconCheck size={16} />}>
            {isEditing ? 'Simpan Perubahan' : 'Buat Artikel'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
