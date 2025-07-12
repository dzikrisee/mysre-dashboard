'use client';

import { useState, useEffect } from 'react';
import { Table, Avatar, Badge, Group, Text, ActionIcon, Menu, Button, Paper, TextInput, Select, Stack, Flex, Box, ScrollArea, Pagination, Card, Title, LoadingOverlay, Tabs } from '@mantine/core';
import { IconDots, IconEdit, IconTrash, IconPlus, IconSearch, IconFilter, IconUserCheck, IconUserX, IconUsers, IconSchool, IconId } from '@tabler/icons-react';
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
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const { isAdmin } = useAuth();
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [activePage, searchQuery, roleFilter, groupFilter, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);

    let query = supabase
      .from('User') // Updated ke tabel User
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false }); // Updated dari created_at ke createdAt

    // Filter berdasarkan tab aktif
    if (activeTab === 'ADMIN') {
      query = query.eq('role', 'ADMIN');
    } else if (activeTab === 'students') {
      query = query.eq('role', 'user');
    } else if (activeTab === 'group-a') {
      query = query.eq('group', 'A');
    } else if (activeTab === 'group-b') {
      query = query.eq('group', 'B');
    }

    // Filter pencarian
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,nim.ilike.%${searchQuery}%`); // Updated dari full_name ke name, tambah nim
    }

    // Filter role (jika tidak menggunakan tab)
    if (roleFilter && activeTab === 'all') {
      query = query.eq('role', roleFilter);
    }

    // Filter group (jika tidak menggunakan tab)
    if (groupFilter && activeTab === 'all') {
      query = query.eq('group', groupFilter);
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
      console.error('Error fetching users:', error);
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
          Apakah Anda yakin ingin menghapus pengguna <strong>{user.name}</strong>? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: 'Hapus', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const { error } = await supabase
          .from('User') // Updated ke tabel User
          .delete()
          .eq('id', user.id);

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

        {/* Tabs untuk filter cepat */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')} mb="md">
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<IconUsers size={16} />}>
              Semua ({total})
            </Tabs.Tab>
            <Tabs.Tab value="ADMIN" leftSection={<IconUserCheck size={16} />}>
              Administrator
            </Tabs.Tab>
            <Tabs.Tab value="students" leftSection={<IconSchool size={16} />}>
              Mahasiswa
            </Tabs.Tab>
            <Tabs.Tab value="group-a" leftSection={<IconId size={16} />}>
              Grup A
            </Tabs.Tab>
            <Tabs.Tab value="group-b" leftSection={<IconId size={16} />}>
              Grup B
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Filters - Hanya tampil di tab 'all' */}
        {activeTab === 'all' && (
          <Group mb="md">
            <TextInput placeholder="Cari nama, email, atau NIM..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
            <Select
              placeholder="Filter Role"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: '', label: 'Semua Role' },
                { value: 'ADMIN', label: 'Administrator' },
                { value: 'user', label: 'Mahasiswa' },
              ]}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value || '')}
              clearable
              w={200}
            />
            <Select
              placeholder="Filter Group"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: '', label: 'Semua Group' },
                { value: 'A', label: 'Group A' },
                { value: 'B', label: 'Group B' },
              ]}
              value={groupFilter}
              onChange={(value) => setGroupFilter(value || '')}
              clearable
              w={200}
            />
          </Group>
        )}

        {/* Pencarian untuk tab selain 'all' */}
        {activeTab !== 'all' && (
          <Group mb="md">
            <TextInput placeholder="Cari nama, email, atau NIM..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
          </Group>
        )}

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
                  <Table.Th>Group</Table.Th>
                  <Table.Th>NIM</Table.Th>
                  <Table.Th>Bergabung</Table.Th>
                  {isAdmin() && <Table.Th>Aksi</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user.id} style={{ cursor: onUserSelect ? 'pointer' : 'default' }} onClick={() => onUserSelect?.(user)}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={user.avatar_url} alt={user.name} size="sm" color="blue">
                          {user.name.charAt(0)} {/* Updated dari full_name ke name */}
                        </Avatar>
                        <Text size="sm" fw={500}>
                          {user.name} {/* Updated dari full_name ke name */}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.7">
                        {user.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={user.role === 'ADMIN' ? 'red' : 'blue'} variant="light" leftSection={user.role === 'ADMIN' ? <IconUserCheck size={12} /> : <IconUserX size={12} />}>
                        {user.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {user.group ? (
                        <Badge color={user.group === 'A' ? 'green' : 'orange'} variant="outline">
                          Group {user.group}
                        </Badge>
                      ) : (
                        <Text size="sm" c="gray.5">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.7" ff="monospace">
                        {user.nim || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="gray.7">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')} {/* Updated dari created_at ke createdAt */}
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
              <Text c="gray.5">
                {activeTab === 'all' ? 'Tidak ada data pengguna' : `Tidak ada data untuk ${activeTab === 'ADMIN' ? 'administrator' : activeTab === 'students' ? 'mahasiswa' : activeTab === 'group-a' ? 'Group A' : 'Group B'}`}
              </Text>
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
            {activeTab !== 'all' && <> • Filter: {activeTab === 'ADMIN' ? 'Administrator' : activeTab === 'students' ? 'Mahasiswa' : activeTab === 'group-a' ? 'Group A' : 'Group B'}</>}
          </Text>
        </Group>
      </Card>

      {/* User Form Modal */}
      {showForm && <UserForm user={editingUser} onClose={handleFormClose} />}
    </Stack>
  );
}
