// src/components/users/user-form.tsx - SESUAI PRISMA SCHEMA TANPA UBAH UI
'use client';
import { useState } from 'react';
import { Modal, TextInput, Select, Button, Stack, Group, FileInput, Avatar, Box, Text, PasswordInput, NumberInput, Textarea, ScrollArea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { supabase, User } from '@/lib/supabase';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

// FormValues sesuai Prisma schema
interface FormValues {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER'; // Sesuai Prisma enum
  group?: '' | 'A' | 'B';
  nim?: string;
  phone?: string;
  bio?: string;
  university?: string;
  faculty?: string;
  major?: string;
  semester?: number;
  address?: string;
  birthDate?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  avatar?: File | null;
}

export function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  // Initial values sesuai Prisma schema
  const form = useForm<FormValues>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'USER', // Default 'USER' sesuai Prisma
      group: (user?.group as '' | 'A' | 'B') || '',
      nim: user?.nim || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      university: user?.university || '',
      faculty: user?.faculty || '',
      major: user?.major || '',
      semester: user?.semester || undefined,
      address: user?.address || '',
      birthDate: user?.birthDate || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
      website: user?.website || '',
      avatar: null,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nama minimal 2 karakter' : null),
      email: (value) => {
        if (!/^\S+@\S+\.\S+$/.test(value)) {
          return 'Format email tidak valid';
        }
        return null;
      },
      password: (value) => {
        if (!isEditing && (!value || value.length < 6)) {
          return 'Password minimal 6 karakter';
        }
        if (isEditing && value && value.length < 6) {
          return 'Password minimal 6 karakter';
        }
        return null;
      },
      nim: (value, values) => {
        if (values.role === 'USER' && (!value || value.length < 8)) {
          return 'NIM minimal 8 karakter untuk mahasiswa';
        }
        return null;
      },
      semester: (value) => {
        if (value && (value < 1 || value > 14)) {
          return 'Semester harus antara 1-14';
        }
        return null;
      },
      linkedin: (value) => {
        if (value && !value.startsWith('https://')) {
          return 'URL LinkedIn harus diawali dengan https://';
        }
        return null;
      },
      github: (value) => {
        if (value && !value.startsWith('https://')) {
          return 'URL GitHub harus diawali dengan https://';
        }
        return null;
      },
      website: (value) => {
        if (value && !value.startsWith('https://')) {
          return 'URL Website harus diawali dengan https://';
        }
        return null;
      },
    },
  });

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      let avatar_url = user?.avatar_url;

      // Upload avatar jika ada file baru
      if (values.avatar) {
        const uploadedUrl = await uploadAvatar(values.avatar);
        if (uploadedUrl) {
          avatar_url = uploadedUrl;
        }
      }

      // Prepare data sesuai Prisma schema
      const userData: any = {
        name: values.name,
        email: values.email,
        role: values.role,
        group: values.group || null,
        nim: values.nim || null,
        phone: values.phone || null,
        bio: values.bio || null,
        university: values.university || null,
        faculty: values.faculty || null,
        major: values.major || null,
        semester: values.semester || null,
        address: values.address || null,
        birthDate: values.birthDate || null,
        linkedin: values.linkedin || null,
        github: values.github || null,
        website: values.website || null,
        avatar_url,
        updateAt: new Date().toISOString(), // Sesuai Prisma: updateAt
        isEmailVerified: user?.isEmailVerified || false,
        isPhoneVerified: user?.isPhoneVerified || false,
        token_balance: user?.token_balance || 0,
      };

      // Tambahkan password hanya jika ada
      if (values.password) {
        userData.password = values.password;
      }

      let result;
      if (isEditing) {
        // Update existing user
        result = await supabase.from('User').update(userData).eq('id', user!.id).select().single();
      } else {
        // Create new user
        userData.createdAt = new Date().toISOString(); // Sesuai Prisma: createdAt
        userData.password = values.password; // Required for new users
        userData.lastActive = new Date().toISOString();

        result = await supabase.from('User').insert(userData).select().single();
      }

      if (result.error) throw result.error;

      notifications.show({
        title: 'Berhasil!',
        message: `User berhasil ${isEditing ? 'diperbarui' : 'dibuat'}`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      notifications.show({
        title: 'Error!',
        message: error.message || 'Terjadi kesalahan saat menyimpan user',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  // UI TETAP SAMA - TIDAK DIUBAH
  return (
    <Modal opened={true} onClose={onClose} title={`${isEditing ? 'Edit' : 'Tambah'} User`} size="xl" centered scrollAreaComponent={ScrollArea.Autosize}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Avatar Upload */}
          <Group>
            <Avatar src={user?.avatar_url} size={80} radius="md" />
            <Box flex={1}>
              <FileInput label="Upload Avatar" placeholder="Pilih file gambar" accept="image/*" leftSection={<IconUpload size={16} />} {...form.getInputProps('avatar')} />
              <Text size="xs" c="dimmed" mt={4}>
                Format: JPG, PNG, WebP (Max 2MB)
              </Text>
            </Box>
          </Group>

          {/* Basic Info */}
          <Group grow>
            <TextInput label="Nama Lengkap" placeholder="Masukkan nama lengkap" required {...form.getInputProps('name')} />
            <TextInput label="Email" placeholder="example@email.com" required {...form.getInputProps('email')} />
          </Group>

          <Group grow>
            <Select
              label="Role"
              placeholder="Pilih role"
              required
              data={[
                { value: 'USER', label: 'Mahasiswa' },
                { value: 'ADMIN', label: 'Administrator' },
              ]}
              {...form.getInputProps('role')}
            />
            <Select
              label="Kelompok"
              placeholder="Pilih kelompok"
              data={[
                { value: '', label: 'Tidak ada' },
                { value: 'A', label: 'Kelompok A' },
                { value: 'B', label: 'Kelompok B' },
              ]}
              {...form.getInputProps('group')}
            />
          </Group>

          {/* Academic Info */}
          <Text fw={600} size="sm" mt="md">
            Informasi Akademik
          </Text>

          <Group grow>
            <TextInput label="NIM" placeholder="Nomor Induk Mahasiswa" {...form.getInputProps('nim')} />
            <TextInput label="Nomor Telepon" placeholder="+62 812 3456 7890" {...form.getInputProps('phone')} />
          </Group>

          <Group grow>
            <TextInput label="Universitas" placeholder="Nama universitas" {...form.getInputProps('university')} />
            <TextInput label="Fakultas" placeholder="Nama fakultas" {...form.getInputProps('faculty')} />
          </Group>

          <Group grow>
            <TextInput label="Program Studi" placeholder="Nama program studi" {...form.getInputProps('major')} />
            <NumberInput label="Semester" placeholder="1-14" min={1} max={14} {...form.getInputProps('semester')} />
          </Group>

          {/* Personal Info */}
          <Text fw={600} size="sm" mt="md">
            Informasi Personal
          </Text>

          <Textarea label="Bio" placeholder="Deskripsi singkat tentang diri" minRows={3} maxRows={5} {...form.getInputProps('bio')} />

          <Group grow>
            <TextInput label="Alamat" placeholder="Alamat lengkap" {...form.getInputProps('address')} />
            <TextInput label="Tanggal Lahir" placeholder="YYYY-MM-DD" {...form.getInputProps('birthDate')} />
          </Group>

          {/* Social Links */}
          <Text fw={600} size="sm" mt="md">
            Media Sosial & Website
          </Text>

          <TextInput label="LinkedIn" placeholder="https://linkedin.com/in/username" {...form.getInputProps('linkedin')} />

          <Group grow>
            <TextInput label="GitHub" placeholder="https://github.com/username" {...form.getInputProps('github')} />
            <TextInput label="Website" placeholder="https://yourwebsite.com" {...form.getInputProps('website')} />
          </Group>

          {/* Password */}
          <Text fw={600} size="sm" mt="md">
            Keamanan
          </Text>

          <PasswordInput
            label={isEditing ? 'Password Baru (opsional)' : 'Password'}
            placeholder="Minimal 6 karakter"
            required={!isEditing}
            description={isEditing ? 'Kosongkan jika tidak ingin mengubah password' : 'Password akan digunakan untuk login'}
            {...form.getInputProps('password')}
          />

          {/* Status Info untuk Edit */}
          {isEditing && (
            <>
              <Text fw={600} size="sm" mt="md">
                Status Akun
              </Text>
              <Group grow>
                <Text size="sm">
                  <strong>Email Verified:</strong> {user?.isEmailVerified ? '✅ Ya' : '❌ Belum'}
                </Text>
                <Text size="sm">
                  <strong>Phone Verified:</strong> {user?.isPhoneVerified ? '✅ Ya' : '❌ Belum'}
                </Text>
              </Group>
              <Text size="sm">
                <strong>Token Balance:</strong> {user?.token_balance || 0} tokens
              </Text>
              <Text size="sm">
                <strong>Last Active:</strong> {user?.lastActive ? new Date(user.lastActive).toLocaleDateString('id-ID') : 'Belum pernah'}
              </Text>
            </>
          )}

          {/* Actions */}
          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" loading={loading} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Simpan Perubahan' : 'Buat User'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
