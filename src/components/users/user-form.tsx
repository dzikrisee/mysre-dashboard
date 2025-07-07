'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, Select, Button, Stack, Group, PasswordInput, Avatar, FileInput, Text, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUser, IconMail, IconLock, IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import { supabase, User } from '@/lib/supabase';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

interface FormValues {
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  password?: string;
  avatar?: File | null;
}

export function UserForm({ user, onClose }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isEditing = !!user;

  const form = useForm<FormValues>({
    initialValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      role: user?.role || 'user',
      password: '',
      avatar: null,
    },
    validate: {
      full_name: (value) => (value.length < 2 ? 'Nama minimal 2 karakter' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email tidak valid'),
      password: (value) => {
        if (!isEditing && (!value || value.length < 6)) {
          return 'Password minimal 6 karakter';
        }
        if (isEditing && value && value.length < 6) {
          return 'Password minimal 6 karakter';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user]);

  const handleAvatarChange = (file: File | null) => {
    form.setFieldValue('avatar', file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user?.avatar_url || null);
    }
  };

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
        const updateData: Partial<User> = {
          full_name: values.full_name,
          email: values.email,
          role: values.role,
          updated_at: new Date().toISOString(),
        };

        // Upload avatar if provided
        if (values.avatar) {
          const avatarUrl = await uploadAvatar(values.avatar, user.id);
          if (avatarUrl) {
            updateData.avatar_url = avatarUrl;
          }
        }

        const { error } = await supabase.from('users').update(updateData).eq('id', user.id);

        if (error) throw error;

        // Update password if provided
        if (values.password) {
          const { error: authError } = await supabase.auth.admin.updateUserById(user.id, { password: values.password });

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
        // Create new user - Method alternatif tanpa admin API

        // 1. Coba buat dengan signUp biasa dulu
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password!,
          options: {
            data: {
              full_name: values.full_name,
            },
          },
        });

        if (authError) {
          throw new Error('Gagal membuat akun: ' + authError.message);
        }

        // 2. Jika berhasil, langsung confirm user (via SQL function)
        if (authData.user) {
          // Confirm user via SQL
          const { error: confirmError } = await supabase.rpc('confirm_user', {
            user_id: authData.user.id,
          });

          if (confirmError) {
            console.log('Auto confirm failed, user perlu konfirmasi email');
          }

          let avatarUrl = null;

          // Upload avatar if provided
          if (values.avatar) {
            try {
              avatarUrl = await uploadAvatar(values.avatar, authData.user.id);
            } catch (error) {
              console.log('Avatar upload skipped:', error);
            }
          }

          // Insert ke tabel users
          const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            email: values.email,
            full_name: values.full_name,
            role: values.role,
            avatar_url: avatarUrl,
            username: values.role === 'admin' ? values.email.split('@')[0] : null,
          });

          if (profileError) {
            throw new Error('Gagal membuat profil: ' + profileError.message);
          }
        }

        notifications.show({
          title: 'Berhasil',
          message: `${values.role === 'admin' ? 'Administrator' : 'Pengguna'} baru berhasil dibuat`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      onClose();
    } catch (error) {
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
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Avatar Section */}
          <Stack gap="xs" align="center">
            <Avatar src={avatarPreview} alt={form.values.full_name} size="xl" color="blue">
              {form.values.full_name.charAt(0)}
            </Avatar>
            <FileInput placeholder="Upload foto profil" accept="image/*" leftSection={<IconUpload size={16} />} onChange={handleAvatarChange} clearable />
          </Stack>

          <Divider />

          {/* Form Fields */}
          <TextInput required label="Nama Lengkap" placeholder="Masukkan nama lengkap" leftSection={<IconUser size={16} />} {...form.getInputProps('full_name')} />

          <TextInput required label="Email" placeholder="nama@email.com" leftSection={<IconMail size={16} />} {...form.getInputProps('email')} />

          <Select
            required
            label="Role"
            placeholder="Pilih role"
            data={[
              { value: 'user', label: 'Pengguna' },
              { value: 'admin', label: 'Administrator' },
            ]}
            {...form.getInputProps('role')}
          />

          <PasswordInput
            required={!isEditing}
            label={isEditing ? 'Password Baru (Opsional)' : 'Password'}
            placeholder={isEditing ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              {isEditing ? 'Perbarui' : 'Tambah'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
