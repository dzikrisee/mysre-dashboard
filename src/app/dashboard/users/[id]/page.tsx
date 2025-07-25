// src/app/dashboard/users/[id]/page.tsx - USER DETAIL PAGE
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Container, Card, Group, Avatar, Text, Badge, Button, Stack, Grid, Paper, Title, Divider, ActionIcon, Tooltip, LoadingOverlay, Alert, Tabs, SimpleGrid, ThemeIcon, Progress, Timeline, Anchor } from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconUserCheck,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconSchool,
  IconBriefcase,
  IconLink,
  IconShield,
  IconClock,
  IconActivity,
  IconSettings,
  IconTrash,
  IconBrandLinkedin,
  IconBrandGithub,
  IconWorld,
  IconCheckbox,
  IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { supabase, User } from '@/lib/supabase';
import { UserFormInline } from '@/components/users/user-form-inline';

export default function UserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  useEffect(() => {
    setShowEditForm(isEditMode);
  }, [isEditMode]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('User').select('*').eq('id', userId).single();

      if (error) throw error;
      setUser(data);
    } catch (error: any) {
      console.error('Error loading user:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data user',
        color: 'red',
      });
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    loadUser();
    router.replace(`/dashboard/users/${userId}`);
  };

  const handleDeleteUser = () => {
    if (!user) return;

    modals.openConfirmModal({
      title: 'Hapus User',
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus user <strong>{user.name || user.email}</strong>? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('User').delete().eq('id', userId);

          if (error) throw error;

          notifications.show({
            title: 'Berhasil',
            message: 'User berhasil dihapus',
            color: 'green',
          });

          router.push('/dashboard/users');
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error.message || 'Gagal menghapus user',
            color: 'red',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (!user) {
    return (
      <Container size="lg">
        <Alert color="red" title="User Tidak Ditemukan">
          User dengan ID tersebut tidak ditemukan.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="light" size="lg" onClick={() => router.push('/dashboard/users')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2}>Detail User</Title>
          </Group>

          <Group>
            {!showEditForm && (
              <Button leftSection={<IconEdit size={16} />} onClick={() => setShowEditForm(true)}>
                Edit User
              </Button>
            )}
            <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={handleDeleteUser}>
              Hapus User
            </Button>
          </Group>
        </Group>

        <Grid>
          {/* Profile Card */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Stack align="center" gap="md">
                <Avatar src={user.avatar_url} size={120} radius="md" color="blue">
                  {user.name?.charAt(0)}
                </Avatar>

                <Stack align="center" gap="xs">
                  <Text fw={600} size="xl">
                    {user.name || 'Nama tidak diatur'}
                  </Text>

                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {user.email}
                    </Text>
                    {user.isEmailVerified && (
                      <Tooltip label="Email Terverifikasi">
                        <IconMail size={16} color="green" />
                      </Tooltip>
                    )}
                  </Group>

                  <Badge color={user.role === 'ADMIN' ? 'red' : 'blue'} variant="light" size="lg" leftSection={<IconUserCheck size={14} />}>
                    {user.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                  </Badge>

                  {user.group && (
                    <Badge color="green" variant="outline">
                      Kelompok {user.group}
                    </Badge>
                  )}
                </Stack>

                <Divider w="100%" />

                {/* Quick Stats */}
                <SimpleGrid cols={2} w="100%">
                  <Stack align="center" gap="xs">
                    <ThemeIcon color="blue" variant="light" size="lg">
                      <IconClock size={18} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed" ta="center">
                      Bergabung
                    </Text>
                    <Text size="sm" fw={500} ta="center">
                      {formatDate(user.createdAt)}
                    </Text>
                  </Stack>

                  <Stack align="center" gap="xs">
                    <ThemeIcon color="green" variant="light" size="lg">
                      <IconActivity size={18} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed" ta="center">
                      Aktif Terakhir
                    </Text>
                    <Text size="sm" fw={500} ta="center">
                      {user.lastActive ? formatDate(user.lastActive) : 'Belum pernah'}
                    </Text>
                  </Stack>
                </SimpleGrid>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Detail Content */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder shadow="sm" radius="md" p="lg">
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
                <Tabs.List>
                  <Tabs.Tab value="overview" leftSection={<IconUserCheck size={16} />}>
                    Overview
                  </Tabs.Tab>
                  <Tabs.Tab value="academic" leftSection={<IconSchool size={16} />}>
                    Akademik
                  </Tabs.Tab>
                  <Tabs.Tab value="contact" leftSection={<IconMail size={16} />}>
                    Kontak
                  </Tabs.Tab>
                  <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
                    Pengaturan
                  </Tabs.Tab>
                </Tabs.List>

                {/* Overview Tab */}
                <Tabs.Panel value="overview" pt="lg">
                  <Stack gap="md">
                    <Title order={4}>Informasi Umum</Title>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Paper p="md" withBorder>
                        <Group>
                          <ThemeIcon color="blue" variant="light">
                            <IconUserCheck size={18} />
                          </ThemeIcon>
                          <div>
                            <Text size="xs" c="dimmed">
                              ID User
                            </Text>
                            <Text size="sm" fw={500}>
                              {user.id}
                            </Text>
                          </div>
                        </Group>
                      </Paper>

                      {user.nim && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="green" variant="light">
                              <IconSchool size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                NIM
                              </Text>
                              <Text size="sm" fw={500}>
                                {user.nim}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}

                      <Paper p="md" withBorder>
                        <Group>
                          <ThemeIcon color="orange" variant="light">
                            <IconShield size={18} />
                          </ThemeIcon>
                          <div>
                            <Text size="xs" c="dimmed">
                              Token Balance
                            </Text>
                            <Text size="sm" fw={500}>
                              {user.token_balance?.toLocaleString() || '0'}
                            </Text>
                          </div>
                        </Group>
                      </Paper>

                      <Paper p="md" withBorder>
                        <Group>
                          <ThemeIcon color="purple" variant="light">
                            <IconCalendar size={18} />
                          </ThemeIcon>
                          <div>
                            <Text size="xs" c="dimmed">
                              Terakhir Update
                            </Text>
                            <Text size="sm" fw={500}>
                              {formatDate(user.updateAt)}
                            </Text>
                          </div>
                        </Group>
                      </Paper>
                    </SimpleGrid>

                    {user.bio && (
                      <>
                        <Title order={5} mt="md">
                          Bio
                        </Title>
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                          {user.bio}
                        </Text>
                      </>
                    )}
                  </Stack>
                </Tabs.Panel>

                {/* Academic Tab */}
                <Tabs.Panel value="academic" pt="lg">
                  <Stack gap="md">
                    <Title order={4}>Informasi Akademik</Title>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {user.university && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="blue" variant="light">
                              <IconSchool size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Universitas
                              </Text>
                              <Text size="sm" fw={500}>
                                {user.university}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}

                      {user.faculty && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="green" variant="light">
                              <IconBriefcase size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Fakultas
                              </Text>
                              <Text size="sm" fw={500}>
                                {user.faculty}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}

                      {user.major && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="orange" variant="light">
                              <IconBriefcase size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Program Studi
                              </Text>
                              <Text size="sm" fw={500}>
                                {user.major}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}

                      {user.semester && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="purple" variant="light">
                              <IconCalendar size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Semester
                              </Text>
                              <Text size="sm" fw={500}>
                                Semester {user.semester}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}
                    </SimpleGrid>
                  </Stack>
                </Tabs.Panel>

                {/* Contact Tab */}
                <Tabs.Panel value="contact" pt="lg">
                  <Stack gap="md">
                    <Title order={4}>Informasi Kontak</Title>

                    <SimpleGrid cols={1} spacing="md">
                      {user.phone && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="blue" variant="light">
                              <IconPhone size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Nomor Telepon
                              </Text>
                              <Group gap="xs">
                                <Text size="sm" fw={500}>
                                  {user.phone}
                                </Text>
                                {user.isPhoneVerified && (
                                  <Badge color="green" size="xs">
                                    Terverifikasi
                                  </Badge>
                                )}
                              </Group>
                            </div>
                          </Group>
                        </Paper>
                      )}

                      {user.address && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="green" variant="light">
                              <IconMapPin size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Alamat
                              </Text>
                              <Text size="sm" fw={500}>
                                {user.address}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}

                      {user.birthDate && (
                        <Paper p="md" withBorder>
                          <Group>
                            <ThemeIcon color="orange" variant="light">
                              <IconCalendar size={18} />
                            </ThemeIcon>
                            <div>
                              <Text size="xs" c="dimmed">
                                Tanggal Lahir
                              </Text>
                              <Text size="sm" fw={500}>
                                {formatDate(user.birthDate)}
                              </Text>
                            </div>
                          </Group>
                        </Paper>
                      )}
                    </SimpleGrid>

                    {/* Social Links */}
                    {(user.linkedin || user.github || user.website) && (
                      <>
                        <Title order={5} mt="md">
                          Media Sosial
                        </Title>
                        <Group>
                          {user.linkedin && (
                            <Anchor href={user.linkedin} target="_blank">
                              <Button variant="light" leftSection={<IconBrandLinkedin size={16} />}>
                                LinkedIn
                              </Button>
                            </Anchor>
                          )}
                          {user.github && (
                            <Anchor href={user.github} target="_blank">
                              <Button variant="light" leftSection={<IconBrandGithub size={16} />}>
                                GitHub
                              </Button>
                            </Anchor>
                          )}
                          {user.website && (
                            <Anchor href={user.website} target="_blank">
                              <Button variant="light" leftSection={<IconWorld size={16} />}>
                                Website
                              </Button>
                            </Anchor>
                          )}
                        </Group>
                      </>
                    )}
                  </Stack>
                </Tabs.Panel>

                {/* Settings Tab */}
                <Tabs.Panel value="settings" pt="lg">
                  <Stack gap="md">
                    <Title order={4}>Pengaturan Akun</Title>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Paper p="md" withBorder>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>
                              Email Verified
                            </Text>
                            <Text size="xs" c="dimmed">
                              Status verifikasi email
                            </Text>
                          </div>
                          {user.isEmailVerified ? <IconCheckbox color="green" size={20} /> : <IconX color="red" size={20} />}
                        </Group>
                      </Paper>

                      <Paper p="md" withBorder>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>
                              Phone Verified
                            </Text>
                            <Text size="xs" c="dimmed">
                              Status verifikasi telepon
                            </Text>
                          </div>
                          {user.isPhoneVerified ? <IconCheckbox color="green" size={20} /> : <IconX color="red" size={20} />}
                        </Group>
                      </Paper>
                    </SimpleGrid>

                    {user.settings && (
                      <>
                        <Title order={5} mt="md">
                          Preferensi
                        </Title>
                        <Paper p="md" withBorder>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(user.settings, null, 2)}
                          </Text>
                        </Paper>
                      </>
                    )}
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Edit Form */}
        {showEditForm && (
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="lg">
              <Group justify="space-between">
                <Title order={3}>Edit User</Title>
                <Button
                  variant="light"
                  onClick={() => {
                    setShowEditForm(false);
                    router.replace(`/dashboard/users/${userId}`);
                  }}
                >
                  Batal
                </Button>
              </Group>

              <UserFormInline
                user={user}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setShowEditForm(false);
                  router.replace(`/dashboard/users/${userId}`);
                }}
              />
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
