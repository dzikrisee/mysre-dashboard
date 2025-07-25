// src/components/users/user-form-inline.tsx - FORM BIASA TANPA MODAL
'use client';
import { useState } from 'react';
import { TextInput, Select, Button, Stack, Group, FileInput, Avatar, Box, Text, PasswordInput, NumberInput, Textarea, ScrollArea, SimpleGrid, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload, IconDeviceFloppy } from '@tabler/icons-react';
import { supabase, User } from '@/lib/supabase';

interface UserFormInlineProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

// FormValues sesuai Prisma schema
interface FormValues {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
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

export function UserFormInline({ user, onSuccess, onCancel }: UserFormInlineProps) {
  const [loading, setLoading] = useState(false);

  // Initial values sesuai Prisma schema
  const form = useForm<FormValues>({
    initialValues: {
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'USER',
      group: (user.group as '' | 'A' | 'B') || '',
      nim: user.nim || '',
      phone: user.phone || '',
      bio: user.bio || '',
      university: user.university || '',
      faculty: user.faculty || '',
      major: user.major || '',
      semester: user.semester || undefined,
      address: user.address || '',
      birthDate: user.birthDate || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      website: user.website || '',
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
        if (value && value.length < 6) {
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP');
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Ukuran file maksimal 2MB');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading file:', { fileName, fileType: file.type, fileSize: file.size });

      // Upload with proper options
      const { error: uploadError, data } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload gagal: ${uploadError.message}`);
      }

      console.log('Upload success:', data);

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      notifications.show({
        title: 'Error Upload',
        message: error.message || 'Gagal upload avatar',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return null;
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      let avatar_url = user.avatar_url;

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
        updateAt: new Date().toISOString(),
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        token_balance: user.token_balance || 0,
      };

      // Tambahkan password hanya jika ada
      if (values.password) {
        userData.password = values.password;
      }

      // Update existing user
      const result = await supabase.from('User').update(userData).eq('id', user.id).select().single();

      if (result.error) throw result.error;

      notifications.show({
        title: 'Berhasil!',
        message: 'User berhasil diperbarui',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      onSuccess();
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Avatar Section */}
        <Box>
          <Text fw={600} size="sm" mb="md">
            Foto Profil
          </Text>
          <Group>
            <Avatar src={user.avatar_url} size={80} radius="md" />
            <Box flex={1}>
              <FileInput label="Upload Avatar Baru" placeholder="Pilih file gambar" accept="image/*" leftSection={<IconUpload size={16} />} {...form.getInputProps('avatar')} />
              <Text size="xs" c="dimmed" mt={4}>
                Format: JPG, PNG, WebP (Max 2MB)
              </Text>
            </Box>
          </Group>
        </Box>

        <Divider />

        {/* Basic Info */}
        <Box>
          <Text fw={600} size="sm" mb="md">
            Informasi Dasar
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput label="Nama Lengkap" placeholder="Masukkan nama lengkap" required {...form.getInputProps('name')} />
            <TextInput label="Email" placeholder="example@email.com" required {...form.getInputProps('email')} />
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
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Academic Info */}
        <Box>
          <Text fw={600} size="sm" mb="md">
            Informasi Akademik
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput label="NIM" placeholder="Nomor Induk Mahasiswa" {...form.getInputProps('nim')} />
            <TextInput label="Nomor Telepon" placeholder="+62 812 3456 7890" {...form.getInputProps('phone')} />
            <TextInput label="Universitas" placeholder="Nama universitas" {...form.getInputProps('university')} />
            <TextInput label="Fakultas" placeholder="Nama fakultas" {...form.getInputProps('faculty')} />
            <TextInput label="Program Studi" placeholder="Nama program studi" {...form.getInputProps('major')} />
            <NumberInput label="Semester" placeholder="1-14" min={1} max={14} {...form.getInputProps('semester')} />
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Personal Info */}
        <Box>
          <Text fw={600} size="sm" mb="md">
            Informasi Personal
          </Text>
          <Stack gap="md">
            <Textarea label="Bio" placeholder="Deskripsi singkat tentang diri" minRows={3} maxRows={5} {...form.getInputProps('bio')} />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="Alamat" placeholder="Alamat lengkap" {...form.getInputProps('address')} />
              <TextInput label="Tanggal Lahir" placeholder="YYYY-MM-DD" type="date" {...form.getInputProps('birthDate')} />
            </SimpleGrid>
          </Stack>
        </Box>

        <Divider />

        {/* Social Links */}
        <Box>
          <Text fw={600} size="sm" mb="md">
            Media Sosial & Website
          </Text>
          <Stack gap="md">
            <TextInput label="LinkedIn" placeholder="https://linkedin.com/in/username" {...form.getInputProps('linkedin')} />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="GitHub" placeholder="https://github.com/username" {...form.getInputProps('github')} />
              <TextInput label="Website" placeholder="https://yourwebsite.com" {...form.getInputProps('website')} />
            </SimpleGrid>
          </Stack>
        </Box>

        <Divider />

        {/* Security */}
        <Box>
          <Text fw={600} size="sm" mb="md">
            Keamanan
          </Text>
          <PasswordInput label="Password Baru (opsional)" placeholder="Minimal 6 karakter" description="Kosongkan jika tidak ingin mengubah password" {...form.getInputProps('password')} />
        </Box>

        {/* Actions */}
        <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} leftSection={<IconDeviceFloppy size={16} />} size="md">
            Simpan Perubahan
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
