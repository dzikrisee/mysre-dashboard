// src/components/users/user-table.tsx - UPDATE EXISTING FILE
// Update hanya bagian interface User dan fungsi terkait

'use client';

import { useState, useEffect } from 'react';
import { Table, ScrollArea, Text, Group, Avatar, Badge, ActionIcon, Paper, LoadingOverlay, TextInput, Select, Pagination, Tabs, Button, Menu, Modal, Stack, NumberInput } from '@mantine/core';
import { IconSearch, IconEdit, IconTrash, IconUserCheck, IconUserX, IconDots, IconEye, IconMail, IconPhone, IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { supabase } from '@/lib/supabase';

// UPDATED: Extended User interface to match database
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  group: string | null;
  nim: string | null;
  avatar_url: string | null;
  createdAt: string;
  // NEW FIELDS
  phone?: string | null;
  bio?: string | null;
  university?: string | null;
  faculty?: string | null;
  major?: string | null;
  semester?: number | null;
  address?: string | null;
  birthDate?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastActive: string;
  settings?: {
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

    let query = supabase.from('User').select('*', { count: 'exact' }).order('createdAt', { ascending: false });

    // Filter berdasarkan tab aktif
    if (activeTab === 'ADMIN') {
      query = query.eq('role', 'ADMIN');
    } else if (activeTab === 'students') {
      query = query.eq('role', 'USER');
    } else if (activeTab === 'group-a') {
      query = query.eq('group', 'A');
    } else if (activeTab === 'group-b') {
      query = query.eq('group', 'B');
    }

    // Filter pencarian - UPDATED to include new fields
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,nim.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%,major.ilike.%${searchQuery}%`);
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
        const { error } = await supabase.from('User').delete().eq('id', user.id);

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

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('User')
          .update({
            ...userData,
            updateAt: new Date().toISOString(),
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        notifications.show({
          title: 'Berhasil',
          message: 'Data pengguna berhasil diperbarui',
          color: 'green',
        });
      } else {
        // Create new user
        const { error } = await supabase.from('User').insert({
          ...userData,
          createdAt: new Date().toISOString(),
          updateAt: new Date().toISOString(),
          isEmailVerified: false,
          isPhoneVerified: false,
          lastActive: new Date().toISOString(),
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
        });

        if (error) throw error;

        notifications.show({
          title: 'Berhasil',
          message: 'Pengguna baru berhasil ditambahkan',
          color: 'green',
        });
      }

      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Gagal menyimpan data pengguna',
        color: 'red',
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Stack gap="md">
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value="all">Semua ({total})</Tabs.Tab>
          <Tabs.Tab value="ADMIN">Administrator</Tabs.Tab>
          <Tabs.Tab value="students">Mahasiswa</Tabs.Tab>
          <Tabs.Tab value="group-a">Group A</Tabs.Tab>
          <Tabs.Tab value="group-b">Group B</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Header dengan pencarian dan filter */}
      {activeTab === 'all' && (
        <Group justify="space-between">
          <Group>
            <TextInput placeholder="Cari nama, email, atau NIM..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} w={300} />
            <Select
              placeholder="Filter Role"
              data={[
                { value: '', label: 'Semua Role' },
                { value: 'ADMIN', label: 'Administrator' },
                { value: 'USER', label: 'Mahasiswa' },
              ]}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value || '')}
              clearable
              w={150}
            />
            <Select
              placeholder="Filter Group"
              data={[
                { value: '', label: 'Semua Group' },
                { value: 'A', label: 'Group A' },
                { value: 'B', label: 'Group B' },
              ]}
              value={groupFilter}
              onChange={(value) => setGroupFilter(value || '')}
              clearable
              w={150}
            />
          </Group>
          {isAdmin() && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setShowForm(true)}>
              Tambah Pengguna
            </Button>
          )}
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
                <Table.Th>Universitas</Table.Th>
                <Table.Th>Status</Table.Th>
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
                        {user.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {user.name}
                        </Text>
                        {user.phone && (
                          <Text size="xs" c="gray.6">
                            {user.phone}
                          </Text>
                        )}
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="gray.7">
                      {user.email}
                    </Text>
                    <Group gap={4}>
                      {user.isEmailVerified && (
                        <Badge size="xs" color="green" variant="dot">
                          Email Verified
                        </Badge>
                      )}
                      {user.phone && user.isPhoneVerified && (
                        <Badge size="xs" color="blue" variant="dot">
                          Phone Verified
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.role === 'ADMIN' ? 'red' : 'blue'} variant="light" leftSection={user.role === 'ADMIN' ? <IconUserCheck size={12} /> : <IconUserX size={12} />}>
                      {user.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {user.group ? (
                      <Badge color={user.group === 'A' ? 'green' : 'orange'} variant="light">
                        Group {user.group}
                      </Badge>
                    ) : (
                      <Text size="sm" c="gray.5">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{user.nim || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text size="sm">{user.university || '-'}</Text>
                      {user.major && (
                        <Text size="xs" c="gray.6">
                          {user.major}
                        </Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="gray.6">
                      Aktif: {new Date(user.lastActive).toLocaleDateString('id-ID')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{new Date(user.createdAt).toLocaleDateString('id-ID')}</Text>
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
                          <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onUserSelect?.(user)}>
                            Lihat Detail
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(user)}>
                            Edit
                          </Menu.Item>
                          <Menu.Item leftSection={<IconMail size={14} />}>Kirim Email</Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => handleDelete(user)}>
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

        {totalPages > 1 && (
          <Group justify="center" p="md">
            <Pagination value={activePage} onChange={setActivePage} total={totalPages} />
          </Group>
        )}
      </Paper>

      {/* User Form Modal */}
      <Modal
        opened={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        size="lg"
      >
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
        />
      </Modal>
    </Stack>
  );
}

// UPDATED: User Form Component with new fields
interface UserFormProps {
  user?: User | null;
  onSave: (userData: Partial<User>) => void;
  onCancel: () => void;
}

function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    role: user?.role || 'USER',
    group: user?.group || '',
    nim: user?.nim || '',
    university: user?.university || '',
    faculty: user?.faculty || '',
    major: user?.major || '',
    semester: user?.semester || 1,
    address: user?.address || '',
    birthDate: user?.birthDate || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    website: user?.website || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Group grow>
          <TextInput label="Nama Lengkap" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
          <TextInput label="Email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
        </Group>

        <Group grow>
          <Select
            label="Role"
            data={[
              { value: 'USER', label: 'Mahasiswa' },
              { value: 'ADMIN', label: 'Administrator' },
            ]}
            value={formData.role}
            onChange={(value) => setFormData((prev) => ({ ...prev, role: value as 'USER' | 'ADMIN' }))}
            required
          />
          <Select
            label="Group"
            data={[
              { value: '', label: 'Pilih Group' },
              { value: 'A', label: 'Group A' },
              { value: 'B', label: 'Group B' },
            ]}
            value={formData.group}
            onChange={(value) => setFormData((prev) => ({ ...prev, group: value || '' }))}
          />
        </Group>

        <Group grow>
          <TextInput label="NIM" value={formData.nim} onChange={(e) => setFormData((prev) => ({ ...prev, nim: e.target.value }))} />
          <TextInput label="No. Telepon" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
        </Group>

        <Group grow>
          <TextInput label="Universitas" value={formData.university} onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))} />
          <TextInput label="Fakultas" value={formData.faculty} onChange={(e) => setFormData((prev) => ({ ...prev, faculty: e.target.value }))} />
        </Group>

        <Group grow>
          <TextInput label="Program Studi" value={formData.major} onChange={(e) => setFormData((prev) => ({ ...prev, major: e.target.value }))} />
          <NumberInput label="Semester" value={formData.semester} onChange={(value) => setFormData((prev) => ({ ...prev, semester: Number(value) }))} min={1} max={14} />
        </Group>

        <TextInput label="Alamat" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />

        <TextInput label="Tanggal Lahir" type="date" value={formData.birthDate} onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))} />

        <Group grow>
          <TextInput label="LinkedIn" value={formData.linkedin} onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/username" />
          <TextInput label="GitHub" value={formData.github} onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))} placeholder="https://github.com/username" />
        </Group>

        <TextInput label="Website" value={formData.website} onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://yourwebsite.com" />

        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">{user ? 'Update' : 'Simpan'}</Button>
        </Group>
      </Stack>
    </form>
  );
}
