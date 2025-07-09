// src/app/dashboard/profile/page.tsx
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
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  role: 'admin' | 'user';
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
  joinedAt: string;
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [passwordOpened, { open: openPassword, close: closePassword }] = useDisclosure(false);

  // Form states
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
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual Supabase call
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@university.ac.id',
        phone: '+62 812-3456-7890',
        avatar_url: user?.avatar_url || undefined,
        bio: 'Mahasiswa Sistem Informasi yang tertarik dengan pengembangan teknologi pendidikan dan penelitian UX/UI. Aktif dalam berbagai proyek penelitian dan pengembangan aplikasi.',
        role: user?.role || 'user',
        group: 'A',
        nim: '20210001',
        university: 'Universitas Indonesia',
        faculty: 'Fakultas Ilmu Komputer',
        major: 'Sistem Informasi',
        semester: 6,
        address: 'Jakarta Selatan, DKI Jakarta',
        birthDate: '2002-05-15',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.dev',
        joinedAt: '2021-09-01T00:00:00Z',
        lastActive: new Date().toISOString(),
        isEmailVerified: true,
        isPhoneVerified: false,
        settings: {
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
      };

      const mockStats: UserStats = {
        totalProjects: 8,
        completedProjects: 5,
        totalArticles: 12,
        totalIdeas: 15,
        totalLikes: 89,
        joinDays: Math.floor((new Date().getTime() - new Date(mockProfile.joinedAt).getTime()) / (1000 * 60 * 60 * 24)),
        averageProgress: 73,
        recentActivities: [
          {
            id: '1',
            type: 'project_completed',
            title: 'Proyek Selesai',
            description: 'Menyelesaikan "Analisis UX Website E-Learning"',
            date: '2024-01-20T10:00:00Z',
            icon: <IconCheck size={16} />,
            color: 'green',
          },
          {
            id: '2',
            type: 'idea_shared',
            title: 'Ide Baru',
            description: 'Membagikan ide "VR untuk Pembelajaran Sejarah"',
            date: '2024-01-18T14:30:00Z',
            icon: <IconBulb size={16} />,
            color: 'yellow',
          },
          {
            id: '3',
            type: 'article_published',
            title: 'Artikel Dipublikasi',
            description: 'Menerbitkan "Evaluasi Sistem LMS"',
            date: '2024-01-15T09:15:00Z',
            icon: <IconFileText size={16} />,
            color: 'blue',
          },
          {
            id: '4',
            type: 'project_created',
            title: 'Proyek Baru',
            description: 'Memulai "Penelitian Chatbot AI"',
            date: '2024-01-12T16:45:00Z',
            icon: <IconPencil size={16} />,
            color: 'violet',
          },
        ],
      };

      setProfile(mockProfile);
      setStats(mockStats);

      // Initialize form data
      setProfileForm({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio || '',
        university: mockProfile.university || '',
        faculty: mockProfile.faculty || '',
        major: mockProfile.major || '',
        semester: mockProfile.semester || 1,
        address: mockProfile.address || '',
        birthDate: mockProfile.birthDate || '',
        linkedin: mockProfile.linkedin || '',
        github: mockProfile.github || '',
        website: mockProfile.website || '',
      });

      setSettingsForm(mockProfile.settings);
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

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Simulate API call
      const updatedProfile = {
        ...profile!,
        ...profileForm,
      };

      setProfile(updatedProfile);
      setEditMode(false);

      notifications.show({
        title: 'Berhasil',
        message: 'Profil berhasil diperbarui',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memperbarui profil',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;

    try {
      // Simulate file upload
      const fakeUrl = URL.createObjectURL(file);

      const updatedProfile = {
        ...profile!,
        avatar_url: fakeUrl,
      };

      setProfile(updatedProfile);

      notifications.show({
        title: 'Berhasil',
        message: 'Foto profil berhasil diperbarui',
        color: 'green',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal mengupload foto profil',
        color: 'red',
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        notifications.show({
          title: 'Error',
          message: 'Password baru dan konfirmasi tidak sama',
          color: 'red',
        });
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        notifications.show({
          title: 'Error',
          message: 'Password minimal 8 karakter',
          color: 'red',
        });
        return;
      }

      // Simulate API call
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
      console.error('Error changing password:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal mengubah password',
        color: 'red',
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updatedProfile = {
        ...profile!,
        settings: settingsForm,
      };

      setProfile(updatedProfile);

      notifications.show({
        title: 'Berhasil',
        message: 'Pengaturan berhasil disimpan',
        color: 'green',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan pengaturan',
        color: 'red',
      });
    }
  };

  const handleVerifyEmail = async () => {
    try {
      notifications.show({
        title: 'Email Verifikasi Terkirim',
        message: 'Silakan cek email Anda untuk verifikasi',
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengirim email verifikasi',
        color: 'red',
      });
    }
  };

  const handleVerifyPhone = async () => {
    try {
      notifications.show({
        title: 'SMS Verifikasi Terkirim',
        message: 'Silakan cek SMS untuk kode verifikasi',
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal mengirim SMS verifikasi',
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

  const completionRate = (stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100;

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Profil Saya</Title>
          <Text c="gray.6">Kelola informasi profil dan pengaturan akun Anda</Text>
        </div>
        <Button leftSection={editMode ? <IconCheck size={16} /> : <IconEdit size={16} />} onClick={editMode ? handleSaveProfile : () => setEditMode(true)} loading={loading}>
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
                      >
                        <IconCamera size={16} />
                      </ActionIcon>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
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
                      <Badge color={profile.role === 'admin' ? 'red' : 'blue'} variant="light" leftSection={<IconUserCheck size={12} />}>
                        {profile.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
                      </Badge>
                      {profile.group && (
                        <Badge variant="outline" size="sm">
                          Group {profile.group}
                        </Badge>
                      )}
                    </Group>
                  </div>

                  <div style={{ width: '100%' }}>
                    <Text size="sm" fw={500} mb="xs">
                      Completion Rate
                    </Text>
                    <RingProgress
                      size={80}
                      thickness={8}
                      sections={[{ value: completionRate, color: 'blue' }]}
                      label={
                        <Text c="blue" fw={700} ta="center" size="sm">
                          {completionRate.toFixed(0)}%
                        </Text>
                      }
                    />
                  </div>

                  <Group justify="center" gap="lg" w="100%">
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={700} size="lg" c="blue">
                        {stats.totalProjects}
                      </Text>
                      <Text size="xs" c="gray.6">
                        Proyek
                      </Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={700} size="lg" c="green">
                        {stats.totalArticles}
                      </Text>
                      <Text size="xs" c="gray.6">
                        Artikel
                      </Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={700} size="lg" c="red">
                        {stats.totalLikes}
                      </Text>
                      <Text size="xs" c="gray.6">
                        Likes
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {/* Bio */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg">
                      Bio
                    </Text>
                  </Group>
                  <Text size="sm" style={{ lineHeight: 1.6 }}>
                    {profile.bio || 'Belum ada bio.'}
                  </Text>
                </Card>

                {/* Quick Stats */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <Card withBorder shadow="sm" radius="md" p="md" ta="center">
                    <ThemeIcon color="blue" variant="light" size="lg" mx="auto" mb="xs">
                      <IconCalendar size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.joinDays}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Hari Bergabung
                    </Text>
                  </Card>

                  <Card withBorder shadow="sm" radius="md" p="md" ta="center">
                    <ThemeIcon color="green" variant="light" size="lg" mx="auto" mb="xs">
                      <IconCheck size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.completedProjects}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Selesai
                    </Text>
                  </Card>

                  <Card withBorder shadow="sm" radius="md" p="md" ta="center">
                    <ThemeIcon color="yellow" variant="light" size="lg" mx="auto" mb="xs">
                      <IconBulb size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.totalIdeas}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Ide
                    </Text>
                  </Card>

                  <Card withBorder shadow="sm" radius="md" p="md" ta="center">
                    <ThemeIcon color="violet" variant="light" size="lg" mx="auto" mb="xs">
                      <IconTrendingUp size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      {stats.averageProgress}%
                    </Text>
                    <Text size="xs" c="gray.6">
                      Progress
                    </Text>
                  </Card>
                </SimpleGrid>

                {/* Recent Activities */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Text fw={600} size="lg" mb="md">
                    Aktivitas Terbaru
                  </Text>
                  <Timeline active={stats.recentActivities.length} bulletSize={24} lineWidth={2}>
                    {stats.recentActivities.map((activity) => (
                      <Timeline.Item
                        key={activity.id}
                        bullet={
                          <ThemeIcon size={24} color={activity.color} variant="light">
                            {activity.icon}
                          </ThemeIcon>
                        }
                        title={activity.title}
                      >
                        <Text c="gray.6" size="sm">
                          {activity.description}
                        </Text>
                        <Text size="xs" c="gray.5" mt={4}>
                          {new Date(activity.date).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
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
                <TextInput label="Nama Lengkap" value={editMode ? profileForm.name : profile.name} onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))} disabled={!editMode} leftSection={<IconUser size={16} />} />

                <Group grow>
                  <TextInput label="Email" value={editMode ? profileForm.email : profile.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} disabled={!editMode} leftSection={<IconMail size={16} />} />
                  {!profile.isEmailVerified && (
                    <Button size="xs" variant="light" onClick={handleVerifyEmail} mt={24}>
                      Verifikasi
                    </Button>
                  )}
                </Group>

                <Group grow>
                  <TextInput
                    label="Nomor Telepon"
                    value={editMode ? profileForm.phone : profile.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!editMode}
                    leftSection={<IconPhone size={16} />}
                  />
                  {profile.phone && !profile.isPhoneVerified && (
                    <Button size="xs" variant="light" onClick={handleVerifyPhone} mt={24}>
                      Verifikasi
                    </Button>
                  )}
                </Group>

                <TextInput
                  label="Tanggal Lahir"
                  type="date"
                  value={editMode ? profileForm.birthDate : profile.birthDate}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconCalendar size={16} />}
                />
              </SimpleGrid>

              <Textarea
                label="Bio"
                placeholder="Ceritakan tentang diri Anda..."
                value={editMode ? profileForm.bio : profile.bio}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!editMode}
                minRows={3}
              />

              <TextInput
                label="Alamat"
                value={editMode ? profileForm.address : profile.address}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                disabled={!editMode}
                leftSection={<IconMapPin size={16} />}
              />

              <Text fw={600} size="md" mt="lg">
                Social Media & Website
              </Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <TextInput
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  value={editMode ? profileForm.linkedin : profile.linkedin}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                  disabled={!editMode}
                />

                <TextInput
                  label="GitHub"
                  placeholder="https://github.com/username"
                  value={editMode ? profileForm.github : profile.github}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, github: e.target.value }))}
                  disabled={!editMode}
                />

                <TextInput
                  label="Website"
                  placeholder="https://yourwebsite.com"
                  value={editMode ? profileForm.website : profile.website}
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
                <TextInput label="NIM" value={profile.nim} disabled leftSection={<IconSchool size={16} />} />

                <Badge variant="light" size="lg" w="fit-content">
                  Group {profile.group}
                </Badge>

                <TextInput label="Universitas" value={editMode ? profileForm.university : profile.university} onChange={(e) => setProfileForm((prev) => ({ ...prev, university: e.target.value }))} disabled={!editMode} />

                <TextInput label="Fakultas" value={editMode ? profileForm.faculty : profile.faculty} onChange={(e) => setProfileForm((prev) => ({ ...prev, faculty: e.target.value }))} disabled={!editMode} />

                <TextInput label="Program Studi" value={editMode ? profileForm.major : profile.major} onChange={(e) => setProfileForm((prev) => ({ ...prev, major: e.target.value }))} disabled={!editMode} />

                <NumberInput label="Semester" value={editMode ? profileForm.semester : profile.semester} onChange={(value) => setProfileForm((prev) => ({ ...prev, semester: Number(value) }))} disabled={!editMode} min={1} max={14} />
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
                <Grid.Col span={6}>
                  <Text size="sm" mb="xs">
                    Tingkat Penyelesaian Proyek
                  </Text>
                  <Progress value={completionRate} size="lg" color="blue" />
                  <Text size="xs" c="gray.6" mt="xs">
                    {stats.completedProjects} dari {stats.totalProjects} proyek selesai
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" mb="xs">
                    Progress Rata-rata
                  </Text>
                  <Progress value={stats.averageProgress} size="lg" color="green" />
                  <Text size="xs" c="gray.6" mt="xs">
                    {stats.averageProgress}% progress keseluruhan
                  </Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="lg">
          <Stack gap="lg">
            {/* Notification Settings */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={600} size="lg">
                    Pengaturan Notifikasi
                  </Text>
                  <Button variant="light" onClick={handleSaveSettings}>
                    Simpan Pengaturan
                  </Button>
                </Group>

                <Stack gap="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Email Notifications</Text>
                      <Text size="sm" c="gray.6">
                        Terima notifikasi melalui email
                      </Text>
                    </div>
                    <Switch
                      checked={settingsForm.emailNotifications}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          emailNotifications: e.currentTarget.checked,
                        }))
                      }
                    />
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Push Notifications</Text>
                      <Text size="sm" c="gray.6">
                        Terima notifikasi push di browser
                      </Text>
                    </div>
                    <Switch
                      checked={settingsForm.pushNotifications}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          pushNotifications: e.currentTarget.checked,
                        }))
                      }
                    />
                  </Group>
                </Stack>
              </Stack>
            </Card>

            {/* Privacy Settings */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="lg">
                  Pengaturan Privasi
                </Text>

                <Stack gap="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Tampilkan Email</Text>
                      <Text size="sm" c="gray.6">
                        Izinkan orang lain melihat email Anda
                      </Text>
                    </div>
                    <Switch
                      checked={settingsForm.privacy.showEmail}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            showEmail: e.currentTarget.checked,
                          },
                        }))
                      }
                    />
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Tampilkan Nomor Telepon</Text>
                      <Text size="sm" c="gray.6">
                        Izinkan orang lain melihat nomor telepon Anda
                      </Text>
                    </div>
                    <Switch
                      checked={settingsForm.privacy.showPhone}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            showPhone: e.currentTarget.checked,
                          },
                        }))
                      }
                    />
                  </Group>

                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Profil Publik</Text>
                      <Text size="sm" c="gray.6">
                        Izinkan profil Anda dilihat oleh orang lain
                      </Text>
                    </div>
                    <Switch
                      checked={settingsForm.privacy.showProfile}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            showProfile: e.currentTarget.checked,
                          },
                        }))
                      }
                    />
                  </Group>
                </Stack>
              </Stack>
            </Card>

            {/* Display Settings */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="lg">
                  Pengaturan Tampilan
                </Text>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Select
                    label="Bahasa"
                    value={settingsForm.language}
                    onChange={(value) => setSettingsForm((prev) => ({ ...prev, language: value || 'id' }))}
                    data={[
                      { value: 'id', label: 'Bahasa Indonesia' },
                      { value: 'en', label: 'English' },
                    ]}
                    leftSection={<IconLanguage size={16} />}
                  />

                  <Select
                    label="Zona Waktu"
                    value={settingsForm.timezone}
                    onChange={(value) => setSettingsForm((prev) => ({ ...prev, timezone: value || 'Asia/Jakarta' }))}
                    data={[
                      { value: 'Asia/Jakarta', label: 'WIB (UTC+7)' },
                      { value: 'Asia/Makassar', label: 'WITA (UTC+8)' },
                      { value: 'Asia/Jayapura', label: 'WIT (UTC+9)' },
                    ]}
                    leftSection={<IconClock size={16} />}
                  />
                </SimpleGrid>

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Dark Mode</Text>
                    <Text size="sm" c="gray.6">
                      Gunakan tema gelap
                    </Text>
                  </div>
                  <Switch
                    checked={settingsForm.darkMode}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        darkMode: e.currentTarget.checked,
                      }))
                    }
                    onLabel={<IconMoon size={16} />}
                    offLabel={<IconSun size={16} />}
                  />
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Security Tab */}
        <Tabs.Panel value="security" pt="lg">
          <Stack gap="lg">
            {/* Password Security */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={600} size="lg">
                      Keamanan Password
                    </Text>
                    <Text size="sm" c="gray.6">
                      Kelola password dan keamanan akun Anda
                    </Text>
                  </div>
                  <Button leftSection={<IconLock size={16} />} onClick={openPassword}>
                    Ubah Password
                  </Button>
                </Group>

                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  Password terakhir diubah: {new Date().toLocaleDateString('id-ID')}
                </Alert>
              </Stack>
            </Card>

            {/* Account Verification */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="lg">
                  Verifikasi Akun
                </Text>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Paper withBorder p="md">
                    <Group justify="space-between">
                      <div>
                        <Group gap="xs" mb="xs">
                          <IconMail size={16} />
                          <Text fw={500}>Email</Text>
                          {profile.isEmailVerified ? (
                            <Badge color="green" size="xs">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge color="red" size="xs">
                              Belum Verifikasi
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" c="gray.6">
                          {profile.email}
                        </Text>
                      </div>
                      {!profile.isEmailVerified && (
                        <Button size="xs" variant="light" onClick={handleVerifyEmail}>
                          Verifikasi
                        </Button>
                      )}
                    </Group>
                  </Paper>

                  <Paper withBorder p="md">
                    <Group justify="space-between">
                      <div>
                        <Group gap="xs" mb="xs">
                          <IconPhone size={16} />
                          <Text fw={500}>Nomor Telepon</Text>
                          {profile.isPhoneVerified ? (
                            <Badge color="green" size="xs">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge color="red" size="xs">
                              Belum Verifikasi
                            </Badge>
                          )}
                        </Group>
                        <Text size="sm" c="gray.6">
                          {profile.phone || 'Belum diatur'}
                        </Text>
                      </div>
                      {profile.phone && !profile.isPhoneVerified && (
                        <Button size="xs" variant="light" onClick={handleVerifyPhone}>
                          Verifikasi
                        </Button>
                      )}
                    </Group>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Card>

            {/* Login Activity */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <Text fw={600} size="lg">
                  Aktivitas Login
                </Text>

                <Timeline active={1} bulletSize={16} lineWidth={2}>
                  <Timeline.Item bullet={<IconDeviceDesktop size={12} />} title="Login saat ini">
                    <Text c="gray.6" size="sm">
                      Desktop • Chrome • Jakarta, Indonesia
                    </Text>
                    <Text size="xs" c="gray.5">
                      {new Date().toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Timeline.Item>
                </Timeline>

                <Alert icon={<IconShield size={16} />} color="green">
                  Tidak ada aktivitas login yang mencurigakan terdeteksi.
                </Alert>
              </Stack>
            </Card>

            {/* Data Export */}
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack gap="md">
                <div>
                  <Text fw={600} size="lg">
                    Export Data
                  </Text>
                  <Text size="sm" c="gray.6">
                    Download semua data Anda dalam format JSON
                  </Text>
                </div>

                <Group>
                  <Button variant="light" leftSection={<IconDownload size={16} />}>
                    Download Data Saya
                  </Button>
                  <Button variant="light" color="red" leftSection={<IconTrash size={16} />}>
                    Hapus Akun
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Change Password Modal */}
      <Modal opened={passwordOpened} onClose={closePassword} title="Ubah Password" size="md">
        <Stack gap="md">
          <PasswordInput label="Password Saat Ini" placeholder="Masukkan password saat ini" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} required />

          <PasswordInput label="Password Baru" placeholder="Masukkan password baru" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} required />

          <PasswordInput label="Konfirmasi Password Baru" placeholder="Konfirmasi password baru" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} required />

          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            Password harus minimal 8 karakter dan mengandung kombinasi huruf, angka, dan simbol.
          </Alert>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closePassword}>
              Batal
            </Button>
            <Button onClick={handleChangePassword}>Ubah Password</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
