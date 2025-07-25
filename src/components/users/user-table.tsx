// src/components/users/user-table.tsx - SESUAI PRISMA SCHEMA (TIDAK UBAH UI)
'use client';

import { useState, useEffect } from 'react';
import { Table, ScrollArea, Text, Group, Avatar, Badge, ActionIcon, Paper, LoadingOverlay, TextInput, Select, Pagination, Tabs, Button, Menu, Modal, Stack, NumberInput, Tooltip } from '@mantine/core';
import { IconSearch, IconEdit, IconTrash, IconUserCheck, IconUserX, IconDots, IconEye, IconMail, IconPhone, IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// User interface sesuai Prisma schema
interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER'; // Sesuai Prisma enum
  group: string | null;
  nim: string | null;
  avatar_url: string | null;
  createdAt: string;
  // Semua field tambahan sesuai Prisma
  phone: string | null;
  bio: string | null;
  university: string | null;
  faculty: string | null;
  major: string | null;
  semester: number | null;
  address: string | null;
  birthDate: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  isEmailVerified: boolean | null;
  isPhoneVerified: boolean | null;
  lastActive: string | null;
  updateAt: string; // Sesuai Prisma: updateAt
  token_balance: number | null;
  settings: any | null;
}

interface UserTableProps {
  onUserSelect?: (user: User) => void;
}

export function UserTable({ onUserSelect }: UserTableProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage, search, roleFilter, groupFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (groupFilter !== 'all') params.append('group', groupFilter);

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data users',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    modals.openConfirmModal({
      title: 'Hapus User',
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus user <strong>{user.name || user.email}</strong>? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUser(user.id),
    });
  };

  const handleViewUser = (user: User) => {
    router.push(`/dashboard/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    router.push(`/dashboard/users/${user.id}?edit=true`);
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Berhasil',
          message: data.message,
          color: 'green',
        });
        loadUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menghapus user',
        color: 'red',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' ? 'red' : 'blue';
  };

  const getGroupBadgeColor = (group: string | null) => {
    if (!group) return 'gray';
    return group === 'A' ? 'green' : 'orange';
  };

  // UI TETAP SAMA - TIDAK DIUBAH
  return (
    <Paper shadow="sm" radius="md" p="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Text size="lg" fw={600}>
            Manajemen Users ({total})
          </Text>
        </Group>

        {/* Filters */}
        <Group gap="md">
          <TextInput placeholder="Cari nama, email, atau NIM..." leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <Select
            placeholder="Semua Role"
            value={roleFilter}
            onChange={(value) => setRoleFilter(value || 'all')}
            data={[
              { value: 'all', label: 'Semua Role' },
              { value: 'ADMIN', label: 'Administrator' },
              { value: 'USER', label: 'Mahasiswa' },
            ]}
            w={150}
          />
          <Select
            placeholder="Semua Grup"
            value={groupFilter}
            onChange={(value) => setGroupFilter(value || 'all')}
            data={[
              { value: 'all', label: 'Semua Grup' },
              { value: 'A', label: 'Kelompok A' },
              { value: 'B', label: 'Kelompok B' },
            ]}
            w={150}
          />
        </Group>

        {/* Table */}
        <ScrollArea>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Grup</Table.Th>
                <Table.Th>NIM</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Bergabung</Table.Th>
                <Table.Th>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar src={user.avatar_url} size={40} radius="md" />
                      <div>
                        <Text fw={500} size="sm">
                          {user.name || 'Tidak ada nama'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {user.email}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getRoleBadgeColor(user.role)} variant="light" size="sm">
                      {user.role === 'ADMIN' ? 'Admin' : 'Mahasiswa'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {user.group ? (
                      <Badge color={getGroupBadgeColor(user.group)} variant="outline" size="sm">
                        Grup {user.group}
                      </Badge>
                    ) : (
                      <Text size="sm" c="dimmed">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{user.nim || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm">{user.email}</Text>
                      {user.isEmailVerified && (
                        <Tooltip label="Email Terverifikasi">
                          <IconMail size={16} color="green" />
                        </Tooltip>
                      )}
                      {!user.isEmailVerified && (
                        <Tooltip label="Email Belum Diverifikasi">
                          <IconMail size={16} color="gray" />
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(user.createdAt)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon size="sm" variant="subtle" onClick={() => handleViewUser(user)}>
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon size="sm" variant="subtle" onClick={() => handleEditUser(user)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDeleteUser(user)} disabled={user.id === currentUser?.id}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {users.length === 0 && !loading && (
            <Text ta="center" py="xl" c="dimmed">
              Tidak ada data user ditemukan
            </Text>
          )}

          <LoadingOverlay visible={loading} />
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="sm" />
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
