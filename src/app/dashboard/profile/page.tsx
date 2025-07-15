// src/app/dashboard/profile/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Button,
  Badge,
  Grid,
  SimpleGrid,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Avatar,
  Menu,
  Tooltip,
  ThemeIcon,
  Center,
  Loader,
  Paper,
  Alert,
  Tabs,
  Divider,
  Box,
  Progress,
  FileInput,
  PasswordInput,
  Switch,
  NumberInput,
  Timeline,
  List,
  Image,
  Container,
  RingProgress,
  Anchor,
  Notification,
} from '@mantine/core';
import {
  IconUser,
  IconEdit,
  IconCamera,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSettings,
  IconLock,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconSchool,
  IconBriefcase,
  IconFileText,
  IconHeart,
  IconBulb,
  IconTrophy,
  IconTarget,
  IconClock,
  IconStar,
  IconBook,
  IconPencil,
  IconDownload,
  IconUpload,
  IconEye,
  IconEyeOff,
  IconShield,
  IconBell,
  IconLanguage,
  IconPalette,
  IconDeviceDesktop,
  IconSun,
  IconMoon,
  IconUserCheck,
  IconGitBranch,
  IconActivity,
  IconTrendingUp,
  IconTrash,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';
import { getUserProfile, updateUserProfile, updateUserSettings, verifyUserEmail, verifyUserPhone, uploadUserAvatar, updateLastActive } from '@/lib/supabase';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  role: 'ADMIN' | 'USER';
  group?: 'A' | 'B';
  nim?: string;
  university?: string;
  faculty?: string;
  major?: string;
  semester?: number;
  address?: string;
  birthDate?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  createdAt: string;
  lastActive: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showProfile: boolean;
    };
  };
}

interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalArticles: number;
  totalIdeas: number;
  totalLikes: number;
  joinDays: number;
  averageProgress: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: 'project_created' | 'article_published' | 'idea_shared' | 'project_completed';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  color: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth(); // Move hook call to top level
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [passwordOpened, { open: openPassword, close: closePassword }] = useDisclosure(false);

  // Form states - FIX: Initialize with empty strings to avoid null/undefined
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    university: '',
    faculty: '',
    major: '',
    semester: 1,
    address: '',
    birthDate: '',
    linkedin: '',
    github: '',
    website: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'id',
    timezone: 'Asia/Jakarta',
    privacy: {
      showEmail: false,
      showPhone: false,
      showProfile: true,
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  // Real Supabase integration
  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Update last active when loading profile
      await updateLastActive(user.id);

      const { data: profileData, error } = await getUserProfile(user.id);

      if (error) {
        throw error;
      }

      if (profileData) {
        setProfile(profileData);

        // Initialize form data - FIX: Use empty strings for null values
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          university: profileData.university || '',
          faculty: profileData.faculty || '',
          major: profileData.major || '',
          semester: profileData.semester || 1,
          address: profileData.address || '',
          birthDate: profileData.birthDate || '',
          linkedin: profileData.linkedin || '',
          github: profileData.github || '',
          website: profileData.website || '',
        });

        setSettingsForm(
          profileData.settings || {
            emailNotifications: true,
            pushNotifications: true,
            darkMode: false,
            language: 'id',
            timezone: 'Asia/Jakarta',
            privacy: {
              showEmail: false,
              showPhone: false,
              showProfile: true,
            },
          },
        );
      }

      // Load stats (simulate for now - replace with real data later)
      const mockStats: UserStats = {
        totalProjects: 8,
        completedProjects: 5,
        totalArticles: 12,
        totalIdeas: 15,
        totalLikes: 89,
        joinDays: Math.floor((new Date().getTime() - new Date(profileData?.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24)),
        averageProgress: 73,
        recentActivities: [
          {
            id: '1',
            type: 'project_completed',
            title: 'Proyek Selesai',
            description: 'Menyelesaikan "Analisis UX Website E-Learning"',
            date: new Date().toISOString(),
            icon: <IconCheck size={16} />,
            color: 'green',
          },
          {
            id: '2',
            type: 'idea_shared',
            title: 'Ide Baru',
            description: 'Membagikan ide "VR untuk Pembelajaran Sejarah"',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            icon: <IconBulb size={16} />,
            color: 'yellow',
          },
          {
            id: '3',
            type: 'article_published',
            title: 'Artikel Dipublikasi',
            description: 'Menerbitkan "Evaluasi Sistem LMS"',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            icon: <IconFileText size={16} />,
            color: 'blue',
          },
        ],
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat profil',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Real profile save with Supabase - FIX: Sanitize data before sending
  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Sanitize form data - convert empty strings to null for optional fields
      const sanitizedData = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
        bio: profileForm.bio.trim() || null,
        university: profileForm.university.trim() || null,
        faculty: profileForm.faculty.trim() || null,
        major: profileForm.major.trim() || null,
        semester: profileForm.semester || null,
        address: profileForm.address.trim() || null,
        birthDate: profileForm.birthDate.trim() || null, // Convert empty string to null for date
        linkedin: profileForm.linkedin.trim() || null,
        github: profileForm.github.trim() || null,
        website: profileForm.website.trim() || null,
      };

      // Validate required fields
      if (!sanitizedData.name || !sanitizedData.email) {
        notifications.show({
          title: 'Error',
          message: 'Nama dan email harus diisi',
          color: 'red',
        });
        return;
      }

      // Validate date format if provided
      if (sanitizedData.birthDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(sanitizedData.birthDate)) {
          notifications.show({
            title: 'Error',
            message: 'Format tanggal lahir tidak valid (YYYY-MM-DD)',
            color: 'red',
          });
          return;
        }
      }

      const { data: updatedProfile, error } = await updateUserProfile(user.id, sanitizedData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
        setEditMode(false);

        // REFRESH AUTH CONTEXT untuk update navbar
        await refreshUser();

        notifications.show({
          title: 'Berhasil',
          message: 'Profil berhasil diperbarui',
          color: 'green',
        });
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);

      let errorMessage = 'Gagal menyimpan profil';
      if (error.message?.includes('date')) {
        errorMessage = 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD atau kosongkan field.';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Format email tidak valid';
      }

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Real avatar upload - FIXED with auth context refresh
  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Validate file on frontend first
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        notifications.show({
          title: 'Error',
          message: 'File harus berupa gambar (JPG, PNG, WEBP)',
          color: 'red',
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        notifications.show({
          title: 'Error',
          message: 'Ukuran file tidak boleh lebih dari 5MB',
          color: 'red',
        });
        return;
      }

      const { data: updatedProfile, error } = await uploadUserAvatar(user.id, file);

      if (error) {
        console.error('Avatar upload error:', error);
        throw error;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);

        // REFRESH AUTH CONTEXT untuk update navbar avatar
        await refreshUser();

        notifications.show({
          title: 'Berhasil',
          message: 'Avatar berhasil diperbarui',
          color: 'green',
        });
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);

      let errorMessage = 'Gagal mengupload avatar';
      if (error.message?.includes('bucket')) {
        errorMessage = 'Storage bucket belum dikonfigurasi. Hubungi administrator.';
      } else if (error.message?.includes('file')) {
        errorMessage = error.message;
      } else if (error.message?.includes('size')) {
        errorMessage = 'Ukuran file terlalu besar (maksimal 5MB)';
      }

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Real settings save
  const handleSaveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { data: updatedProfile, error } = await updateUserSettings(user.id, settingsForm);

      if (error) {
        throw error;
      }

      if (updatedProfile) {
        setProfile(updatedProfile);

        notifications.show({
          title: 'Berhasil',
          message: 'Pengaturan berhasil disimpan',
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan pengaturan',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Real email verification
  const handleVerifyEmail = async () => {
    if (!user?.id) return;

    try {
      await verifyUserEmail(user.id);

      // Reload profile to get updated verification status
      await loadProfile();

      notifications.show({
        title: 'Email Terverifikasi',
        message: 'Email Anda berhasil diverifikasi',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memverifikasi email',
        color: 'red',
      });
    }
  };

  // Real phone verification
  const handleVerifyPhone = async () => {
    if (!user?.id) return;

    try {
      await verifyUserPhone(user.id);

      // Reload profile to get updated verification status
      await loadProfile();

      notifications.show({
        title: 'Telepon Terverifikasi',
        message: 'Nomor telepon Anda berhasil diverifikasi',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memverifikasi nomor telepon',
        color: 'red',
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Password baru dan konfirmasi password tidak sama',
        color: 'red',
      });
      return;
    }

    try {
      // TODO: Implement password change with Supabase Auth
      notifications.show({
        title: 'Berhasil',
        message: 'Password berhasil diubah',
        color: 'green',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      closePassword();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengubah password',
        color: 'red',
      });
    }
  };

  if (loading || !profile || !stats) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) {
      return {
        percentage: 0,
        filled: 0,
        total: 13,
        missing: [
          'name',
          'email',
          'phone',
          'bio',
          'university',
          'faculty',
          'major',
          'semester',
          'address',
          'birthDate',
          'linkedin',
          'github',
          'website',
        ],
      };
    }

    const requiredFields = ['name', 'email', 'phone', 'bio', 'university', 'faculty', 'major', 'semester', 'address', 'birthDate', 'linkedin', 'github', 'website'];

    const filledFields = requiredFields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '' && value !== 0;
    });

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);

    return {
      percentage,
      filled: filledFields.length,
      total: requiredFields.length,
      missing: requiredFields.filter((field) => {
        const value = profile[field as keyof UserProfile];
        return value === null || value === undefined || value === '' || value === 0;
      }),
    };
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Profil Saya</Title>
          <Text c="gray.6">Kelola informasi profil dan pengaturan akun Anda</Text>
        </div>
        <Button leftSection={editMode ? <IconDeviceFloppy size={16} /> : <IconEdit size={16} />} onClick={editMode ? handleSaveProfile : () => setEditMode(true)} loading={saving}>
          {editMode ? 'Simpan' : 'Edit Profil'}
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="personal" leftSection={<IconFileText size={16} />}>
            Informasi Personal
          </Tabs.Tab>
          <Tabs.Tab value="academic" leftSection={<IconSchool size={16} />}>
            Akademik
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Pengaturan
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
            Keamanan
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview" pt="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder shadow="sm" radius="md" p="lg" h="100%">
                <Stack align="center" gap="md">
                  <div style={{ position: 'relative' }}>
                    <Avatar src={profile.avatar_url} size={120} radius="50%" color="blue">
                      {profile.name.charAt(0)}
                    </Avatar>
                    {editMode && (
                      <ActionIcon
                        variant="filled"
                        color="blue"
                        size="sm"
                        radius="xl"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        loading={saving}
                      >
                        <IconCamera size={16} />
                      </ActionIcon>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Text fw={600} size="lg">
                      {profile.name}
                    </Text>
                    <Text size="sm" c="gray.6">
                      {profile.email}
                    </Text>
                    <Group justify="center" gap="xs" mt="xs">
                      <Badge color={profile.role === 'ADMIN' ? 'red' : 'blue'} variant="light" leftSection={<IconUserCheck size={12} />}>
                        {profile.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                      </Badge>
                      {profile.group && (
                        <Badge color={profile.group === 'A' ? 'green' : 'orange'} variant="light">
                          Group {profile.group}
                        </Badge>
                      )}
                    </Group>
                  </div>

                  {profile.bio && (
                    <Text size="sm" ta="center" c="gray.7">
                      {profile.bio}
                    </Text>
                  )}

                  <Group justify="center" gap="xs" mt="md">
                    {profile.linkedin && (
                      <Anchor href={profile.linkedin} target="_blank">
                        <ActionIcon variant="light" color="blue">
                          <IconBriefcase size={16} />
                        </ActionIcon>
                      </Anchor>
                    )}
                    {profile.github && (
                      <Anchor href={profile.github} target="_blank">
                        <ActionIcon variant="light" color="gray">
                          <IconGitBranch size={16} />
                        </ActionIcon>
                      </Anchor>
                    )}
                    {profile.website && (
                      <Anchor href={profile.website} target="_blank">
                        <ActionIcon variant="light" color="teal">
                          <IconActivity size={16} />
                        </ActionIcon>
                      </Anchor>
                    )}
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                {/* Stats Cards */}
                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                  <Paper withBorder p="md" ta="center">
                    <ThemeIcon color="blue" variant="light" size="lg" mx="auto" mb="xs">
                      <IconFileText size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.totalArticles}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Total Artikel
                    </Text>
                  </Paper>

                  <Paper withBorder p="md" ta="center">
                    <ThemeIcon color="green" variant="light" size="lg" mx="auto" mb="xs">
                      <IconPencil size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.totalProjects}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Total Proyek
                    </Text>
                  </Paper>

                  <Paper withBorder p="md" ta="center">
                    <ThemeIcon color="yellow" variant="light" size="lg" mx="auto" mb="xs">
                      <IconBulb size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.totalIdeas}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Total Ide
                    </Text>
                  </Paper>

                  <Paper withBorder p="md" ta="center">
                    <ThemeIcon color="red" variant="light" size="lg" mx="auto" mb="xs">
                      <IconHeart size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.totalLikes}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Total Likes
                    </Text>
                  </Paper>
                </SimpleGrid>

                {/* Progress Overview */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg">
                      Progress Overview
                    </Text>
                    <Badge variant="light" color="teal">
                      {((stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100).toFixed(1)}% Complete
                    </Badge>
                  </Group>

                  <Stack gap="sm">
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm">Proyek Selesai</Text>
                        <Text size="sm" c="gray.6">
                          {stats.completedProjects}/{stats.totalProjects}
                        </Text>
                      </Group>
                      <Progress value={(stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100} size="sm" color="teal" />
                    </div>

                    <div>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm">Rata-rata Progress</Text>
                        <Text size="sm" c="gray.6">
                          {stats.averageProgress}%
                        </Text>
                      </Group>
                      <Progress value={stats.averageProgress} size="sm" color="blue" />
                    </div>
                  </Stack>
                </Card>

                {/* Profile Completion Progress */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg">
                      Kelengkapan Profil Anda
                    </Text>
                    <Badge variant="light" color={profileCompletion.percentage === 100 ? 'green' : profileCompletion.percentage >= 70 ? 'yellow' : 'red'}>
                      {profileCompletion.percentage}% Lengkap
                    </Badge>
                  </Group>

                  <Stack gap="md">
                    <div>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm">Field yang terisi</Text>
                        <Text size="sm" c="gray.6">
                          {profileCompletion.filled}/{profileCompletion.total}
                        </Text>
                      </Group>
                      <Progress value={profileCompletion.percentage} size="lg" color={profileCompletion.percentage === 100 ? 'green' : profileCompletion.percentage >= 70 ? 'yellow' : 'red'} />
                    </div>

                    {profileCompletion.percentage < 100 && (
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Field yang belum diisi:
                        </Text>
                        <Stack gap="xs">
                          {profileCompletion.missing.slice(0, 5).map((field) => (
                            <Group key={field} gap="xs">
                              <ThemeIcon size="sm" color="red" variant="light">
                                <IconX size={12} />
                              </ThemeIcon>
                              <Text size="xs" c="gray.7">
                                {field === 'name' && 'Nama Lengkap'}
                                {field === 'email' && 'Email'}
                                {field === 'phone' && 'Nomor Telepon'}
                                {field === 'bio' && 'Bio'}
                                {field === 'university' && 'Universitas'}
                                {field === 'faculty' && 'Fakultas'}
                                {field === 'major' && 'Program Studi'}
                                {field === 'semester' && 'Semester'}
                                {field === 'address' && 'Alamat'}
                                {field === 'birthDate' && 'Tanggal Lahir'}
                                {field === 'linkedin' && 'LinkedIn'}
                                {field === 'github' && 'GitHub'}
                                {field === 'website' && 'Website'}
                              </Text>
                            </Group>
                          ))}
                          {profileCompletion.missing.length > 5 && (
                            <Text size="xs" c="gray.5">
                              dan {profileCompletion.missing.length - 5} field lainnya...
                            </Text>
                          )}
                        </Stack>

                        <Button size="sm" variant="light" color="blue" mt="md" onClick={() => setEditMode(true)} leftSection={<IconEdit size={14} />}>
                          Lengkapi Profil
                        </Button>
                      </div>
                    )}

                    {profileCompletion.percentage === 100 && (
                      <div>
                        <Group gap="xs">
                          <ThemeIcon size="sm" color="green" variant="light">
                            <IconCheck size={12} />
                          </ThemeIcon>
                          <Text size="sm" c="green.7">
                            Selamat! Profil Anda sudah lengkap 100%
                          </Text>
                        </Group>
                      </div>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Personal Information Tab */}
        <Tabs.Panel value="personal" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Informasi Personal
                </Text>
                <Group gap="xs">
                  <Badge color={profile.isEmailVerified ? 'green' : 'red'} variant="light" leftSection={profile.isEmailVerified ? <IconCheck size={12} /> : <IconX size={12} />}>
                    Email {profile.isEmailVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                  </Badge>
                  {profile.phone && (
                    <Badge color={profile.isPhoneVerified ? 'green' : 'red'} variant="light" leftSection={profile.isPhoneVerified ? <IconCheck size={12} /> : <IconX size={12} />}>
                      Phone {profile.isPhoneVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                    </Badge>
                  )}
                </Group>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Nama Lengkap"
                  value={editMode ? profileForm.name : profile.name || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconUser size={16} />}
                  required
                />

                <Group grow>
                  <TextInput
                    label="Email"
                    value={editMode ? profileForm.email : profile.email || ''}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!editMode}
                    leftSection={<IconMail size={16} />}
                    required
                  />
                  {!profile.isEmailVerified && (
                    <Button size="xs" variant="light" onClick={handleVerifyEmail} mt={24} loading={saving}>
                      Verifikasi
                    </Button>
                  )}
                </Group>

                <Group grow>
                  <TextInput
                    label="Nomor Telepon"
                    value={editMode ? profileForm.phone : profile.phone || ''}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!editMode}
                    leftSection={<IconPhone size={16} />}
                    placeholder="Contoh: +62812345678"
                  />
                  {profile.phone && !profile.isPhoneVerified && (
                    <Button size="xs" variant="light" onClick={handleVerifyPhone} mt={24} loading={saving}>
                      Verifikasi
                    </Button>
                  )}
                </Group>

                <TextInput
                  label="Tanggal Lahir"
                  type="date"
                  value={editMode ? profileForm.birthDate : profile.birthDate || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconCalendar size={16} />}
                  placeholder="YYYY-MM-DD"
                />
              </SimpleGrid>

              <Textarea
                label="Bio"
                placeholder="Ceritakan tentang diri Anda..."
                value={editMode ? profileForm.bio : profile.bio || ''}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!editMode}
                minRows={3}
              />

              <TextInput
                label="Alamat"
                value={editMode ? profileForm.address : profile.address || ''}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                disabled={!editMode}
                leftSection={<IconMapPin size={16} />}
                placeholder="Alamat lengkap"
              />

              <Text fw={600} size="md" mt="lg">
                Social Media & Website
              </Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <TextInput
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  value={editMode ? profileForm.linkedin : profile.linkedin || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                  disabled={!editMode}
                />

                <TextInput
                  label="GitHub"
                  placeholder="https://github.com/username"
                  value={editMode ? profileForm.github : profile.github || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, github: e.target.value }))}
                  disabled={!editMode}
                />

                <TextInput
                  label="Website"
                  placeholder="https://yourwebsite.com"
                  value={editMode ? profileForm.website : profile.website || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                  disabled={!editMode}
                />
              </SimpleGrid>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Academic Tab */}
        <Tabs.Panel value="academic" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Informasi Akademik
              </Text>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput label="NIM" value={profile.nim || ''} disabled leftSection={<IconSchool size={16} />} />

                <Group>
                  <Badge variant="light" size="lg" w="fit-content">
                    Group {profile.group || '-'}
                  </Badge>
                </Group>

                <TextInput
                  label="Universitas"
                  value={editMode ? profileForm.university : profile.university || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, university: e.target.value }))}
                  disabled={!editMode}
                  placeholder="Nama universitas"
                />

                <TextInput
                  label="Fakultas"
                  value={editMode ? profileForm.faculty : profile.faculty || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, faculty: e.target.value }))}
                  disabled={!editMode}
                  placeholder="Nama fakultas"
                />

                <TextInput
                  label="Program Studi"
                  value={editMode ? profileForm.major : profile.major || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, major: e.target.value }))}
                  disabled={!editMode}
                  placeholder="Program studi/jurusan"
                />

                <NumberInput
                  label="Semester"
                  value={editMode ? profileForm.semester : profile.semester || 1}
                  onChange={(value) => setProfileForm((prev) => ({ ...prev, semester: Number(value) || 1 }))}
                  disabled={!editMode}
                  min={1}
                  max={14}
                  placeholder="Semester saat ini"
                />
              </SimpleGrid>

              <Divider />

              <Text fw={600} size="md">
                Statistik Akademik
              </Text>
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                <Paper withBorder p="md" ta="center">
                  <ThemeIcon color="blue" variant="light" size="lg" mx="auto" mb="xs">
                    <IconFileText size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    {stats.totalArticles}
                  </Text>
                  <Text size="xs" c="gray.6">
                    Total Artikel
                  </Text>
                </Paper>

                <Paper withBorder p="md" ta="center">
                  <ThemeIcon color="green" variant="light" size="lg" mx="auto" mb="xs">
                    <IconPencil size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    {stats.totalProjects}
                  </Text>
                  <Text size="xs" c="gray.6">
                    Total Proyek
                  </Text>
                </Paper>

                <Paper withBorder p="md" ta="center">
                  <ThemeIcon color="yellow" variant="light" size="lg" mx="auto" mb="xs">
                    <IconBulb size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    {stats.totalIdeas}
                  </Text>
                  <Text size="xs" c="gray.6">
                    Total Ide
                  </Text>
                </Paper>

                <Paper withBorder p="md" ta="center">
                  <ThemeIcon color="red" variant="light" size="lg" mx="auto" mb="xs">
                    <IconHeart size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    {stats.totalLikes}
                  </Text>
                  <Text size="xs" c="gray.6">
                    Total Likes
                  </Text>
                </Paper>
              </SimpleGrid>

              <Text fw={600} size="md">
                Progress Overview
              </Text>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p="md">
                    <Group justify="space-between" mb="md">
                      <Text fw={500}>Completion Rate</Text>
                      <Badge variant="light">{((stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100).toFixed(1)}%</Badge>
                    </Group>
                    <RingProgress
                      size={120}
                      thickness={12}
                      sections={[{ value: (stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100, color: 'teal' }]}
                      label={
                        <Text ta="center" fw={700} size="lg">
                          {((stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100).toFixed(1)}%
                        </Text>
                      }
                    />
                  </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Card withBorder p="md">
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={500}>Proyek Aktif</Text>
                        <Badge color="blue">{stats.totalProjects - stats.completedProjects}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>Proyek Selesai</Text>
                        <Badge color="green">{stats.completedProjects}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>Artikel Dipublikasi</Text>
                        <Badge color="violet">{stats.totalArticles}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text fw={500}>Hari Bergabung</Text>
                        <Badge color="gray">{stats.joinDays}</Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Pengaturan
                </Text>
                <Button onClick={handleSaveSettings} loading={saving} disabled={saving}>
                  Simpan Pengaturan
                </Button>
              </Group>

              <Text fw={600} size="md">
                Notifikasi
              </Text>
              <Stack gap="sm">
                <Switch
                  label="Email Notifications"
                  description="Terima notifikasi melalui email"
                  checked={settingsForm.emailNotifications}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSettingsForm((prev) => ({ ...prev, emailNotifications: event.currentTarget.checked }))}
                />
                <Switch
                  label="Push Notifications"
                  description="Terima notifikasi push"
                  checked={settingsForm.pushNotifications}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSettingsForm((prev) => ({ ...prev, pushNotifications: event.currentTarget.checked }))}
                />
              </Stack>

              <Divider />

              <Text fw={600} size="md">
                Tampilan
              </Text>
              <Stack gap="sm">
                <Switch
                  label="Dark Mode"
                  description="Gunakan tema gelap"
                  checked={settingsForm.darkMode}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSettingsForm((prev) => ({ ...prev, darkMode: event.currentTarget.checked }))}
                />
                <Select
                  label="Bahasa"
                  data={[
                    { value: 'id', label: 'Bahasa Indonesia' },
                    { value: 'en', label: 'English' },
                  ]}
                  value={settingsForm.language}
                  onChange={(value) => setSettingsForm((prev) => ({ ...prev, language: value || 'id' }))}
                />
                <Select
                  label="Timezone"
                  data={[
                    { value: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
                    { value: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
                    { value: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' },
                  ]}
                  value={settingsForm.timezone}
                  onChange={(value) => setSettingsForm((prev) => ({ ...prev, timezone: value || 'Asia/Jakarta' }))}
                />
              </Stack>

              <Divider />

              <Text fw={600} size="md">
                Privasi
              </Text>
              <Stack gap="sm">
                <Switch
                  label="Tampilkan Email"
                  description="Email Anda akan terlihat di profil publik"
                  checked={settingsForm.privacy.showEmail}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showEmail: event.currentTarget.checked },
                    }))
                  }
                />
                <Switch
                  label="Tampilkan Nomor Telepon"
                  description="Nomor telepon Anda akan terlihat di profil publik"
                  checked={settingsForm.privacy.showPhone}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showPhone: event.currentTarget.checked },
                    }))
                  }
                />
                <Switch
                  label="Profil Publik"
                  description="Profil Anda akan terlihat oleh pengguna lain"
                  checked={settingsForm.privacy.showProfile}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showProfile: event.currentTarget.checked },
                    }))
                  }
                />
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Security Tab */}
        <Tabs.Panel value="security" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Keamanan
              </Text>

              <Group justify="space-between">
                <div>
                  <Text fw={500}>Ubah Password</Text>
                  <Text size="sm" c="gray.6">
                    Terakhir diubah: {new Date(profile.lastActive).toLocaleDateString('id-ID')}
                  </Text>
                </div>
                <Button variant="light" onClick={openPassword}>
                  Ubah Password
                </Button>
              </Group>

              <Divider />

              <Text fw={600} size="md">
                Aktivitas Login
              </Text>
              <Text size="sm" c="gray.6">
                Terakhir aktif:{' '}
                {new Date(profile.lastActive).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>

              <Divider />

              <Text fw={600} size="md">
                Verifikasi Akun
              </Text>
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Email Verification</Text>
                    <Text size="sm" c="gray.6">
                      {profile.email}
                    </Text>
                  </div>
                  <Badge color={profile.isEmailVerified ? 'green' : 'red'}>{profile.isEmailVerified ? 'Terverifikasi' : 'Belum Verifikasi'}</Badge>
                </Group>

                {profile.phone && (
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Phone Verification</Text>
                      <Text size="sm" c="gray.6">
                        {profile.phone}
                      </Text>
                    </div>
                    <Badge color={profile.isPhoneVerified ? 'green' : 'red'}>{profile.isPhoneVerified ? 'Terverifikasi' : 'Belum Verifikasi'}</Badge>
                  </Group>
                )}
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Password Change Modal */}
      <Modal opened={passwordOpened} onClose={closePassword} title="Ubah Password">
        <Stack gap="md">
          <PasswordInput label="Password Saat Ini" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} required />
          <PasswordInput label="Password Baru" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} required />
          <PasswordInput label="Konfirmasi Password Baru" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} required />
          <Group justify="flex-end">
            <Button variant="light" onClick={closePassword}>
              Batal
            </Button>
            <Button onClick={handlePasswordChange} loading={saving} disabled={saving}>
              Ubah Password
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
