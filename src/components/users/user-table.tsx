'use client';

import { useState, useEffect } from 'react';
import { Table, Avatar, Badge, Group, Text, ActionIcon, Menu, Button, Paper, TextInput, Select, Stack, Flex, Box, ScrollArea, Pagination, Card, Title, LoadingOverlay } from '@mantine/core';
import { IconDots, IconEdit, IconTrash, IconPlus, IconSearch, IconFilter, IconUserCheck, IconUserX } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { supabase, User } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { UserForm } from './user-form';

interface UserTableProps {
  onUserSelect?: (user: User) => void;
}

export function UserTable({ onUserSelect }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { isAdmin } = useAuth();
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [activePage, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);

    let query = supabase.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    const from = (activePage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data pengguna',
        color: 'red',
      });
    } else {
      setUsers(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const handleDelete = async (user: User) => {
    modals.openConfirmModal({
      title: 'Hapus Pengguna',
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus pengguna <strong>{user.full_name}</strong>? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const { error } = await supabase.from('users').delete().eq('id', user.id);

        if (error) {
          notifications.show({
            title: 'Error',
            message: 'Gagal menghapus pengguna',
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Berhasil',
            message: 'Pengguna berhasil dihapus',
            color: 'green',
          });
          fetchUsers();
        }
      },
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Stack gap="md">
      <Card withBorder shadow="sm" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={3}>Manajemen Pengguna</Title>
          {isAdmin() && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setShowForm(true)}>
              Tambah Pengguna
            </Button>
          )}
        </Group>

        {/* Filters */}
        <Group mb="md">
          <TextInput placeholder="Cari nama atau email..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
          <Select
            placeholder="Filter Role"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: '', label: 'Semua Role' },
              { value: 'admin', label: 'Administrator' },
              { value: 'user', label: 'Pengguna' },
            ]}
            value={roleFilter}
            onChange={(value) => setRoleFilter(value || '')}
            clearable
          />
        </Group>

        {/* Table */}
        <Paper withBorder radius="md" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pengguna</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Bergabung</Table.Th>
                  {isAdmin() && <Table.Th>Aksi</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user.id} style={{ cursor: 'pointer' }}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={user.avatar_url} alt={user.full_name} size="sm" color="blue">
                          {user.full_name.charAt(0)}
                        </Avatar>
                        <Text size="sm" fw={500}>
                          {user.full_name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.7">
                        {user.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={user.role === 'admin' ? 'red' : 'blue'} variant="light" leftSection={user.role === 'admin' ? <IconUserCheck size={12} /> : <IconUserX size={12} />}>
                        {user.role === 'admin' ? 'Administrator' : 'Pengguna'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.7">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </Text>
                    </Table.Td>
                    {isAdmin() && (
                      <Table.Td>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => handleEdit(user)}>
                              Edit
                            </Menu.Item>
                            <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => handleDelete(user)}>
                              Hapus
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {users.length === 0 && !loading && (
            <Box p="xl" ta="center">
              <Text c="gray.5">Tidak ada data pengguna</Text>
            </Box>
          )}
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" mt="md">
            <Pagination value={activePage} onChange={setActivePage} total={totalPages} size="sm" />
          </Flex>
        )}

        {/* Stats */}
        <Group justify="space-between" mt="md">
          <Text size="sm" c="gray.6">
            Menampilkan {users.length} dari {total} pengguna
          </Text>
        </Group>
      </Card>

      {/* User Form Modal */}
      {showForm && <UserForm user={editingUser} onClose={handleFormClose} />}
    </Stack>
  );
}
