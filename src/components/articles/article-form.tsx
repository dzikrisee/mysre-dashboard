// src/components/articles/article-form.tsx
'use client';

import { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Stack, Group, FileInput, Text, Progress } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export interface Article {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updateAt: string; // FIXED: sesuai database schema
  userId: string | null;
  sessionId: string | null;
  // Relations
  author?: {
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
  article?: Article | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  description?: string;
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
      description: '',
      file: null as File | null,
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
        console.error('🚨 Upload error:', uploadError);
        throw new Error(uploadError.message || 'Gagal upload file');
      }

      setUploadProgress(100);
      console.log('✅ File uploaded successfully:', data.path);
      return data.path;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      let filePath = article?.filePath || '';

      // Upload file if provided
      if (values.file) {
        try {
          filePath = await uploadFileToStorage(values.file);
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Gagal upload file',
            color: 'red',
          });
          setLoading(false);
          return;
        }
      }

      if (isEditing && article) {
        // FIXED: Update with correct field name
        const updateData = {
          title: values.title,
          filePath: filePath,
          updateAt: new Date().toISOString(), // FIXED: updateAt bukan updated_at
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

        // FIXED: Insert with correct field names
        const insertData = {
          id: articleId, // Required manual ID
          title: values.title,
          filePath: filePath,
          userId: user?.id || null,
          sessionId: null, // Optional brainstorming session ID
          // createdAt and updateAt will use database defaults
        };

        console.log('📝 Inserting article data:', insertData);

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
          <TextInput label="Judul Artikel" placeholder="Masukkan judul artikel" required {...form.getInputProps('title')} />

          <Textarea label="Deskripsi (Opsional)" placeholder="Deskripsi singkat tentang artikel" rows={3} {...form.getInputProps('description')} />

          <FileInput
            label={isEditing ? 'File Baru (Opsional)' : 'File PDF/Document'}
            placeholder="Pilih file PDF/Document"
            leftSection={<IconUpload size={16} />}
            accept=".pdf,.doc,.docx,.txt"
            required={!isEditing}
            {...form.getInputProps('file')}
          />

          {uploadProgress > 0 && uploadProgress < 100 && <Progress value={uploadProgress} size="sm" />}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Simpan Perubahan' : 'Buat Artikel'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
