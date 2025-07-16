'use client';

import { useTheme } from '@/providers/theme-provider';
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
  IconBrandLinkedin,
  IconBrandGithub,
  IconWorld,
  IconId,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';
import { getUserProfile, updateUserProfile, updateUserSettings, verifyUserEmail, verifyUserPhone, uploadUserAvatar, updateLastActive, supabase } from '@/lib/supabase';

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
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [passwordOpened, { open: openPassword, close: closePassword }] = useDisclosure(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { colorScheme, setColorScheme } = useTheme();

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

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const { data: profileData, error } = await getUserProfile(user.id);

      if (error) throw error;

      if (profileData) {
        setProfile(profileData);
        // Populate form with existing data
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

        // FIXED: Pastikan settings selalu memiliki nilai default yang benar
        setSettingsForm({
          emailNotifications: profileData.settings?.emailNotifications ?? true,
          pushNotifications: profileData.settings?.pushNotifications ?? true,
          darkMode: profileData.settings?.darkMode ?? false,
          language: profileData.settings?.language ?? 'id',
          timezone: profileData.settings?.timezone ?? 'Asia/Jakarta',
          privacy: {
            showEmail: profileData.settings?.privacy?.showEmail ?? false,
            showPhone: profileData.settings?.privacy?.showPhone ?? false,
            showProfile: profileData.settings?.privacy?.showProfile ?? true,
          },
        });
      }
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

  const loadStats = async () => {
    // Mock stats data
    const mockStats: UserStats = {
      totalProjects: 12,
      completedProjects: 8,
      totalArticles: 24,
      totalIdeas: 35,
      totalLikes: 142,
      joinDays: 45,
      averageProgress: 67,
      recentActivities: [
        {
          id: '1',
          type: 'article_published',
          title: 'Artikel Baru Dipublikasi',
          description: 'Machine Learning in Healthcare',
          date: '2025-01-15',
          icon: <IconFileText size={16} />,
          color: 'blue',
        },
      ],
    };

    setStats(mockStats);
  };

  // FIXED: Change Password Function
  const handlePasswordChange = async () => {
    // Validasi konfirmasi password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Password baru dan konfirmasi password tidak sama',
        color: 'red',
      });
      return;
    }

    // Validasi panjang password
    if (passwordForm.newPassword.length < 6) {
      notifications.show({
        title: 'Error',
        message: 'Password minimal 6 karakter',
        color: 'red',
      });
      return;
    }

    setSaving(true);
    try {
      // Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      closePassword();

      notifications.show({
        title: 'Berhasil',
        message: 'Password berhasil diubah',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal mengubah password',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await updateUserProfile(user.id, profileForm);
      await loadProfile();
      setEditMode(false);

      notifications.show({
        title: 'Berhasil',
        message: 'Profil berhasil diperbarui',
        color: 'green',
      });
    } catch (error: any) {
      let errorMessage = 'Gagal memperbarui profil';

      if (error.message?.includes('birthDate')) {
        errorMessage = 'Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD atau kosongkan field.';
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

  const saveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await updateUserSettings(user.id, settingsForm);

      notifications.show({
        title: 'Berhasil',
        message: 'Pengaturan berhasil disimpan',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal menyimpan pengaturan',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      notifications.show({
        title: 'Error',
        message: 'File harus berupa gambar (JPG, PNG, GIF)',
        color: 'red',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'Error',
        message: 'Ukuran file maksimal 5MB',
        color: 'red',
      });
      return;
    }

    setSaving(true);
    try {
      // FIXED: Show preview immediately while uploading
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const result = e.target?.result as string;
        // Update profile state with preview
        setProfile((prev) => (prev ? { ...prev, avatar_url: result } : null));
      };
      fileReader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file
      const { data, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update user profile in database
      const { error: updateError } = await updateUserProfile(user.id, {
        avatar_url: avatarUrl,
      });

      if (updateError) {
        throw updateError;
      }

      // Update local state with real URL
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));

      // Refresh auth context to update navbar
      await refreshUser();

      notifications.show({
        title: 'Berhasil',
        message: 'Foto profil berhasil diperbarui',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);

      // Revert preview on error
      await loadProfile();

      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal mengupload foto profil',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.id) return;

    try {
      await verifyUserEmail(user.id);
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

  const handleVerifyPhone = async () => {
    if (!user?.id) return;

    try {
      await verifyUserPhone(user.id);
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
        missing: ['name', 'email', 'phone', 'bio', 'university', 'faculty', 'major', 'semester', 'address', 'birthDate', 'linkedin', 'github', 'website'],
      };
    }

    const requiredFields = ['name', 'email', 'phone', 'bio', 'university', 'faculty', 'major', 'semester', 'address', 'birthDate', 'linkedin', 'github', 'website'];

    const filledFields = requiredFields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '' && value !== 0;
    });

    const missingFields = requiredFields.filter((field) => {
      const value = profile[field as keyof UserProfile];
      return value === null || value === undefined || value === '' || value === 0;
    });

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);

    return {
      percentage,
      filled: filledFields.length,
      total: requiredFields.length,
      missing: missingFields,
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
          {editMode ? 'Simpan Perubahan' : 'Edit Profil'}
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="personal" leftSection={<IconEdit size={16} />}>
            Personal
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
              <Card withBorder shadow="sm" radius="md" p="lg" style={{ height: 'fit-content' }}>
                <Stack gap="md" align="center">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar src={profile.avatar_url} alt={profile.name} size={120} color="blue">
                      {profile.name?.charAt(0)}
                    </Avatar>
                    <ActionIcon
                      size="sm"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'var(--mantine-color-blue-6)',
                        color: 'white',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <IconCamera size={14} />
                    </ActionIcon>
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
                        <ActionIcon variant="light" color="blue" size="lg">
                          <IconBrandLinkedin size={20} />
                        </ActionIcon>
                      </Anchor>
                    )}
                    {profile.github && (
                      <Anchor href={profile.github} target="_blank">
                        <ActionIcon variant="light" color="dark" size="lg">
                          <IconBrandGithub size={20} />
                        </ActionIcon>
                      </Anchor>
                    )}
                    {profile.website && (
                      <Anchor href={profile.website} target="_blank">
                        <ActionIcon variant="light" color="teal" size="lg">
                          <IconWorld size={20} />
                        </ActionIcon>
                      </Anchor>
                    )}
                  </Group>
                </Stack>

                {/* FIXED: Informasi Profil dalam card yang sama */}
                <Divider my="lg" />
                <Stack gap="md">
                  <Text fw={600} size="md">
                    Informasi Profil
                  </Text>

                  {profile.university && (
                    <div>
                      <Text fw={600} size="sm" c="blue">
                        {profile.university}
                      </Text>
                      <Text size="sm" c="gray.6">
                        {profile.faculty} - {profile.major}
                      </Text>
                    </div>
                  )}

                  {profile.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <Text size="sm">{profile.phone}</Text>
                    </Group>
                  )}

                  {profile.address && (
                    <Group gap="xs">
                      <IconMapPin size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <Text size="sm">{profile.address}</Text>
                    </Group>
                  )}

                  {profile.birthDate && (
                    <Group gap="xs">
                      <IconCalendar size={16} style={{ color: 'var(--mantine-color-gray-6)' }} />
                      <Text size="sm">
                        {new Date(profile.birthDate).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                {/* Profile Completion */}
                {/* Profile Completion */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="md">
                      Kelengkapan Profil
                    </Text>
                    <Badge color={profileCompletion.percentage === 100 ? 'green' : 'orange'} variant="light">
                      {profileCompletion.percentage}%
                    </Badge>
                  </Group>

                  <Progress value={profileCompletion.percentage} color={profileCompletion.percentage === 100 ? 'green' : 'orange'} size="lg" radius="xl" mb="sm" />

                  <Text size="sm" c="gray.6">
                    {profileCompletion.filled} dari {profileCompletion.total} field terisi
                  </Text>

                  {/* Smart Actions untuk Profile Completion */}
                  {profileCompletion.percentage < 100 && (
                    <Box mt="md" p="md" bg="orange.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-orange-2)' }}>
                      <Group gap="xs" mb="xs">
                        <IconAlertCircle size={16} color="var(--mantine-color-orange-6)" />
                        <Text size="sm" fw={500} c="orange.7">
                          Field yang belum lengkap:
                        </Text>
                      </Group>

                      <Text size="sm" c="gray.7" mb="md">
                        {profileCompletion.missing
                          .map((field: string) => {
                            const fieldLabels: Record<string, string> = {
                              name: 'Nama',
                              email: 'Email',
                              phone: 'Telepon',
                              bio: 'Bio',
                              university: 'Universitas',
                              faculty: 'Fakultas',
                              major: 'Jurusan',
                              semester: 'Semester',
                              address: 'Alamat',
                              birthDate: 'Tanggal Lahir',
                              linkedin: 'LinkedIn',
                              github: 'GitHub',
                              website: 'Website',
                            };
                            return fieldLabels[field] || field;
                          })
                          .join(', ')}
                      </Text>

                      <Group gap="sm">
                        <Button
                          size="sm"
                          variant="light"
                          color="orange"
                          leftSection={<IconEdit size={14} />}
                          onClick={() => {
                            setEditMode(true);
                            // Smart redirect ke tab yang tepat
                            const academicFields = ['university', 'faculty', 'major', 'semester'];
                            const socialFields = ['linkedin', 'github', 'website'];
                            const personalFields = ['name', 'email', 'phone', 'bio', 'address', 'birthDate'];

                            const hasAcademicMissing = profileCompletion.missing.some((field: string) => academicFields.includes(field));
                            const hasSocialMissing = profileCompletion.missing.some((field: string) => socialFields.includes(field));
                            const hasPersonalMissing = profileCompletion.missing.some((field: string) => personalFields.includes(field));

                            if (hasAcademicMissing && user?.role === 'USER') {
                              setActiveTab('academic');
                            } else if (hasPersonalMissing) {
                              setActiveTab('personal');
                            } else {
                              setActiveTab('personal'); // default
                            }

                            // Scroll ke form setelah tab change
                            setTimeout(() => {
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }, 100);
                          }}
                        >
                          Lengkapi Sekarang
                        </Button>

                        {profileCompletion.percentage >= 80 && (
                          <Button
                            size="sm"
                            variant="outline"
                            color="blue"
                            leftSection={<IconCheck size={14} />}
                            onClick={() => {
                              notifications.show({
                                title: 'Tips Profil',
                                message: 'Profil yang lengkap membantu meningkatkan kredibilitas dan networking Anda!',
                                color: 'blue',
                                autoClose: 4000,
                              });
                            }}
                          >
                            Tips Profil
                          </Button>
                        )}
                      </Group>
                    </Box>
                  )}

                  {/* Success message untuk profile 100% */}
                  {profileCompletion.percentage === 100 && (
                    <Box mt="md" p="md" bg="green.0" style={{ borderRadius: '8px', border: '1px solid var(--mantine-color-green-2)' }}>
                      <Group gap="xs">
                        <IconCheck size={16} color="var(--mantine-color-green-6)" />
                        <Text size="sm" fw={500} c="green.7">
                          Profil Anda sudah lengkap!
                        </Text>
                      </Group>
                      <Text size="sm" c="gray.7" mt="xs">
                        Terima kasih telah melengkapi profil. Ini membantu meningkatkan pengalaman Anda di MySRE.
                      </Text>
                    </Box>
                  )}
                </Card>

                {/* Statistics Card */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Text fw={600} size="md" mb="md">
                    Statistik Aktivitas
                  </Text>

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Stack gap="sm">
                        <Group justify="space-between">
                          <Text fw={500}>Total Proyek</Text>
                          <Badge color="blue">{stats.totalProjects}</Badge>
                        </Group>
                        <Group justify="space-between">
                          <Text fw={500}>Bergabung</Text>
                          <Badge color="gray">{stats.joinDays} hari</Badge>
                        </Group>
                        <Group justify="space-between">
                          <Text fw={500}>Rata-rata Progress</Text>
                          <Badge color="violet">{stats.averageProgress}%</Badge>
                        </Group>
                        <Group justify="space-between">
                          <Text fw={500}>Total Likes</Text>
                          <Badge color="red">{stats.totalLikes}</Badge>
                        </Group>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
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
                          <Text fw={500}>Total Ide</Text>
                          <Badge color="yellow">{stats.totalIdeas}</Badge>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Personal Information Tab */}
        <Tabs.Panel value="personal" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Informasi Personal
              </Text>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Nama Lengkap"
                  name="name"
                  value={editMode ? profileForm.name : profile.name || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconUser size={16} />}
                  placeholder="Masukkan nama lengkap"
                  required
                />

                <TextInput
                  label="Email"
                  name="email"
                  value={editMode ? profileForm.email : profile.email || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconMail size={16} />}
                  placeholder="Masukkan email"
                  required
                />

                <Group>
                  <TextInput
                    label="Nomor Telepon"
                    name="phone"
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
                  name="birthDate"
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
                  leftSection={<IconBrandLinkedin size={16} />}
                />

                <TextInput
                  label="GitHub"
                  placeholder="https://github.com/username"
                  value={editMode ? profileForm.github : profile.github || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, github: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconBrandGithub size={16} />}
                />

                <TextInput
                  label="Website"
                  placeholder="https://yourwebsite.com"
                  value={editMode ? profileForm.website : profile.website || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconWorld size={16} />}
                />
              </SimpleGrid>

              {user?.role === 'USER' && (
                <>
                  <Text fw={600} size="md" mt="lg">
                    Informasi Akademik
                  </Text>
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <TextInput label="NIM" value={profile.nim || ''} disabled leftSection={<IconUser size={16} />} placeholder="Nomor Induk Mahasiswa" />

                    <TextInput
                      label="Universitas"
                      name="university"
                      value={editMode ? profileForm.university : profile.university || ''}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, university: e.target.value }))}
                      disabled={!editMode}
                      leftSection={<IconSchool size={16} />}
                      placeholder="Masukkan nama universitas"
                      required={user?.role === 'USER'}
                    />

                    <TextInput
                      label="Fakultas"
                      name="faculty"
                      value={editMode ? profileForm.faculty : profile.faculty || ''}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, faculty: e.target.value }))}
                      disabled={!editMode}
                      leftSection={<IconSchool size={16} />}
                      placeholder="Masukkan nama fakultas"
                      required={user?.role === 'USER'}
                    />

                    <TextInput
                      label="Jurusan"
                      name="major"
                      value={editMode ? profileForm.major : profile.major || ''}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, major: e.target.value }))}
                      disabled={!editMode}
                      leftSection={<IconBook size={16} />}
                      placeholder="Masukkan nama jurusan"
                      required={user?.role === 'USER'}
                    />

                    <NumberInput
                      label="Semester"
                      name="semester"
                      value={editMode ? profileForm.semester : profile.semester || 1}
                      onChange={(value: string | number) => setProfileForm((prev) => ({ ...prev, semester: typeof value === 'number' ? value : 1 }))}
                      disabled={!editMode}
                      min={1}
                      max={14}
                      placeholder="Pilih semester"
                      required={user?.role === 'USER'}
                    />
                  </SimpleGrid>
                </>
              )}

              {editMode && (
                <Group justify="flex-end" mt="lg">
                  <Button variant="light" onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSaveProfile} loading={saving}>
                    Simpan Perubahan
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Academic Information Tab */}
        <Tabs.Panel value="academic" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Informasi Akademik
              </Text>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Universitas"
                  name="university"
                  value={editMode ? profileForm.university : profile.university || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, university: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconSchool size={16} />}
                  placeholder="Masukkan nama universitas"
                  required={user?.role === 'USER'}
                />

                <TextInput
                  label="Fakultas"
                  name="faculty"
                  value={editMode ? profileForm.faculty : profile.faculty || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, faculty: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconSchool size={16} />}
                  placeholder="Masukkan nama fakultas"
                  required={user?.role === 'USER'}
                />

                <TextInput
                  label="Jurusan"
                  name="major"
                  value={editMode ? profileForm.major : profile.major || ''}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, major: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconBook size={16} />}
                  placeholder="Masukkan nama jurusan"
                  required={user?.role === 'USER'}
                />

                <NumberInput
                  label="Semester"
                  name="semester"
                  value={editMode ? profileForm.semester : profile.semester || 1}
                  onChange={(value: string | number) => setProfileForm((prev) => ({ ...prev, semester: typeof value === 'number' ? value : 1 }))}
                  disabled={!editMode}
                  min={1}
                  max={14}
                  placeholder="Pilih semester"
                  required={user?.role === 'USER'}
                />
              </SimpleGrid>

              {editMode && (
                <Group justify="flex-end" mt="lg">
                  <Button variant="light" onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSaveProfile} loading={saving}>
                    Simpan Perubahan
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="lg">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Pengaturan
                </Text>
                <Button onClick={saveSettings} loading={saving}>
                  Simpan Pengaturan
                </Button>
              </Group>

              <Stack gap="md">
                <Text fw={600} size="md">
                  Notifikasi
                </Text>
                <Switch
                  label="Email Notifications"
                  description="Terima notifikasi melalui email"
                  checked={Boolean(settingsForm.emailNotifications)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      emailNotifications: event?.currentTarget?.checked ?? false,
                    }))
                  }
                />
                <Switch
                  label="Push Notifications"
                  description="Terima notifikasi push dari browser"
                  checked={Boolean(settingsForm.pushNotifications)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      pushNotifications: event?.currentTarget?.checked ?? false,
                    }))
                  }
                />

                <Divider />

                <Text fw={600} size="md">
                  Tampilan
                </Text>

                <Switch
                  label="Dark Mode"
                  description="Menggunakan tema gelap"
                  checked={colorScheme === 'dark'}
                  onChange={(event) => {
                    try {
                      const isChecked = event?.currentTarget?.checked ?? false;
                      const newScheme = isChecked ? 'dark' : 'light';

                      // Set theme immediately
                      setColorScheme(newScheme);

                      // Update settings form for database sync
                      setSettingsForm((prev) => ({
                        ...prev,
                        darkMode: isChecked,
                      }));
                    } catch (error) {
                      console.error('Dark mode toggle error:', error);
                      // Fallback toggle
                      const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
                      setColorScheme(newScheme);
                      setSettingsForm((prev) => ({
                        ...prev,
                        darkMode: newScheme === 'dark',
                      }));
                    }
                  }}
                />

                <Select
                  label="Bahasa"
                  value={settingsForm.language || 'id'}
                  onChange={(value) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      language: value || 'id',
                    }))
                  }
                  data={[
                    { value: 'id', label: 'Bahasa Indonesia' },
                    { value: 'en', label: 'English' },
                  ]}
                />
                <Select
                  label="Zona Waktu"
                  value={settingsForm.timezone || 'Asia/Jakarta'}
                  onChange={(value) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      timezone: value || 'Asia/Jakarta',
                    }))
                  }
                  data={[
                    { value: 'Asia/Jakarta', label: 'WIB (UTC+7)' },
                    { value: 'Asia/Makassar', label: 'WITA (UTC+8)' },
                    { value: 'Asia/Jayapura', label: 'WIT (UTC+9)' },
                  ]}
                />

                <Divider />

                <Text fw={600} size="md">
                  Privasi
                </Text>
                <Switch
                  label="Tampilkan Email"
                  description="Email Anda akan terlihat oleh pengguna lain"
                  checked={Boolean(settingsForm.privacy?.showEmail)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showEmail: event?.currentTarget?.checked ?? false,
                      },
                    }))
                  }
                />
                <Switch
                  label="Tampilkan Telepon"
                  description="Nomor telepon Anda akan terlihat oleh pengguna lain"
                  checked={Boolean(settingsForm.privacy?.showPhone)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showPhone: event?.currentTarget?.checked ?? false,
                      },
                    }))
                  }
                />
                <Switch
                  label="Profil Publik"
                  description="Profil Anda akan terlihat oleh pengguna lain"
                  checked={Boolean(settingsForm.privacy?.showProfile)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showProfile: event?.currentTarget?.checked ?? false,
                      },
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
            <Stack gap="lg">
              <Text fw={600} size="lg">
                Keamanan Akun
              </Text>

              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Password</Text>
                    <Text size="sm" c="gray.6">
                      Terakhir diubah: -
                    </Text>
                  </div>
                  <Button variant="light" onClick={openPassword}>
                    Ubah Password
                  </Button>
                </Group>

                <Divider />

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
