'use client';
import { useState } from 'react';
import { Modal, TextInput, Select, Button, Stack, Group, FileInput, Avatar, Box, Text, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';

// FIXED: Define User interface sesuai dengan database schema AKTUAL
interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  role: 'ADMIN' | 'USER'; // FIXED: Database menggunakan 'USER', bukan 'STUDENT'
  createdAt: string; // FIXED: camelCase di database
  updated_at: string; // FIXED: snake_case di database
  group?: string | null;
  nim?: string | null;
  tier?: string | null;
  token_balance?: number | null;
  monthly_token_limit?: number | null;
  phone?: string | null;
  bio?: string | null;
  address?: string | null;
  birth_date?: string | null; // FIXED: snake_case
  university?: string | null;
  faculty?: string | null;
  major?: string | null;
  semester?: number | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  is_email_verified?: boolean | null; // FIXED: snake_case
  is_phone_verified?: boolean | null; // FIXED: snake_case
  settings?: any;
  last_active?: string | null; // FIXED: snake_case
  birthDate?: string | null; // FIXED: Duplicate camelCase field
  isEmailVerified?: boolean | null; // FIXED: Duplicate camelCase field
  isPhoneVerified?: boolean | null; // FIXED: Duplicate camelCase field
  lastActive?: string | null; // FIXED: Duplicate camelCase field
  avatar_url?: string | null;
}

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

// FIXED: FormValues sesuai database schema
interface FormValues {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER'; // FIXED: Database default adalah 'USER'
  group?: '' | 'A' | 'B';
  nim?: string;
  avatar?: File | null;
}

export function UserForm({ user, onClose }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  const form = useForm<FormValues>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'USER', // FIXED: Default 'USER' sesuai database
      group: (user?.group as '' | 'A' | 'B') || '',
      nim: user?.nim || '',
      avatar: null,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nama minimal 2 karakter' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Format email tidak valid'),
      password: (value) => {
        if (!isEditing && (!value || value.length < 6)) {
          return 'Password minimal 6 karakter';
        }
        if (isEditing && value && value.length < 6) {
          return 'Password minimal 6 karakter';
        }
        return null;
      },
      nim: (value) => {
        // Validasi NIM hanya untuk role USER (mahasiswa)
        if (form.values.role === 'USER' && value) {
          if (!/^\d{10}$/.test(value)) {
            return 'NIM harus 10 digit angka';
          }
        }
        return null;
      },
    },
  });

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      // Hapus file lama jika ada
      const { data: existingFiles } = await supabase.storage.from('avatars').list('', {
        search: userId,
      });

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => f.name);
        await supabase.storage.from('avatars').remove(filesToDelete);
      }

      // Upload file baru
      const { data, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      notifications.show({
        title: 'Warning',
        message: 'Gagal upload foto profil, tetapi user berhasil dibuat',
        color: 'yellow',
      });
      return null;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isEditing && user) {
        // Update existing user
        const updateData: any = {
          name: values.name,
          email: values.email,
          role: values.role,
          // updated_at akan otomatis di-update oleh trigger
        };

        // Tambah group dan nim hanya jika role adalah USER (mahasiswa)
        if (values.role === 'USER') {
          updateData.group = values.group || null;
          updateData.nim = values.nim || null;
        } else {
          updateData.group = null;
          updateData.nim = null;
        }

        // Upload avatar if provided
        if (values.avatar) {
          const avatarUrl = await uploadAvatar(values.avatar, user.id);
          if (avatarUrl) {
            updateData.avatar_url = avatarUrl;
          }
        }

        const { error } = await supabase.from('User').update(updateData).eq('id', user.id);
        if (error) throw error;

        // Update password if provided (via Supabase Auth)
        if (values.password) {
          const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
            password: values.password,
          });
          if (authError) {
            console.error('Password update error:', authError);
          }
        }

        notifications.show({
          title: 'Berhasil',
          message: 'Data pengguna berhasil diperbarui',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password!,
          options: {
            data: {
              name: values.name,
            },
          },
        });

        if (authError) {
          throw new Error('Gagal membuat akun: ' + authError.message);
        }

        if (authData.user) {
          let avatarUrl = null;
          // Upload avatar if provided
          if (values.avatar) {
            try {
              avatarUrl = await uploadAvatar(values.avatar, authData.user.id);
            } catch (error) {
              console.log('Avatar upload skipped:', error);
            }
          }

          // FIXED: Insert ke tabel User sesuai schema database AKTUAL
          const insertData: any = {
            id: authData.user.id,
            email: values.email,
            password: values.password!, // Required field
            name: values.name,
            role: values.role,
            avatar_url: avatarUrl,
            // Field berikut akan menggunakan DEFAULT values dari database:
            // tier: 'basic' (default)
            // token_balance: 100 (default)
            // monthly_token_limit: 1000 (default)
            // is_email_verified: false (default)
            // is_phone_verified: false (default)
            // isEmailVerified: false (default)
            // isPhoneVerified: false (default)
            // createdAt: CURRENT_TIMESTAMP (default)
            // updated_at: CURRENT_TIMESTAMP (default)
            // last_active: now() (default)
            // lastActive: now() (default)
            // settings: default JSON (default)
          };

          // Tambah group dan nim hanya jika role adalah USER (mahasiswa)
          if (values.role === 'USER') {
            insertData.group = values.group || null;
            insertData.nim = values.nim || null;
          }

          console.log('🔍 Inserting user data:', insertData);

          const { error: profileError, data: profileData } = await supabase.from('User').insert(insertData).select();

          if (profileError) {
            console.error('🚨 Profile insert error:', profileError);
            throw new Error('Gagal membuat profil: ' + profileError.message);
          }

          console.log('✅ User profile created:', profileData);
        }

        notifications.show({
          title: 'Berhasil',
          message: `${values.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'} baru berhasil dibuat`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }
      onClose();
    } catch (error) {
      console.error('🚨 Error in handleSubmit:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
    setLoading(false);
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text size="lg" fw={600}>
          {isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        </Text>
      }
      size="md"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Avatar Upload */}
          <Box ta="center">
            <Avatar src={user?.avatar_url} alt={form.values.name} size={80} mx="auto" mb="sm" color="blue">
              {form.values.name.charAt(0)}
            </Avatar>
            <FileInput placeholder="Pilih foto profil" leftSection={<IconUpload size={16} />} accept="image/*" {...form.getInputProps('avatar')} />
          </Box>

          {/* Basic Info */}
          <TextInput label="Nama Lengkap" placeholder="Masukkan nama lengkap" required {...form.getInputProps('name')} />

          <TextInput label="Email" placeholder="Masukkan email" required {...form.getInputProps('email')} />

          <PasswordInput label="Password" placeholder={isEditing ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'} required={!isEditing} {...form.getInputProps('password')} />

          <Select
            label="Role"
            placeholder="Pilih role"
            required
            data={[
              { value: 'ADMIN', label: 'Administrator' },
              { value: 'USER', label: 'Mahasiswa' }, // FIXED: Menggunakan 'USER' sesuai database
            ]}
            {...form.getInputProps('role')}
          />

          {/* Fields khusus untuk mahasiswa */}
          {form.values.role === 'USER' && (
            <>
              <Select
                label="Group"
                placeholder="Pilih group"
                data={[
                  { value: '', label: 'Tidak ada group' },
                  { value: 'A', label: 'Group A' },
                  { value: 'B', label: 'Group B' },
                ]}
                {...form.getInputProps('group')}
              />
              <TextInput label="NIM" placeholder="Masukkan NIM (10 digit)" {...form.getInputProps('nim')} />
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Simpan Perubahan' : 'Buat Pengguna'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
