'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Button,
  Badge,
  SimpleGrid,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Menu,
  Table,
  ThemeIcon,
  NumberInput,
  Alert,
  Tabs,
  Pagination,
  LoadingOverlay,
  Tooltip,
  Container,
  ScrollArea,
  Progress,
} from '@mantine/core';
import {
  IconCoin,
  IconTrendingUp,
  IconUsers,
  IconRefresh,
  IconDownload,
  IconEdit,
  IconCurrencyDollar,
  IconChartBar,
  IconFilter,
  IconSearch,
  IconAlertTriangle,
  IconDots,
  IconGift,
  IconShield,
  IconCrown,
  IconRocket,
  IconArrowUpRight,
  IconArrowDownRight,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { BillingService } from '@/lib/services/billing-service';
import type { BillingStats, UserBillingAnalytics } from '@/lib/types/billing';
import { useAuth } from '@/providers/auth-provider';

export default function BillingPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [usersBilling, setUsersBilling] = useState<UserBillingAnalytics[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [topUpModal, { open: openTopUp, close: closeTopUp }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<UserBillingAnalytics | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);

  const pageSize = 10;

  useEffect(() => {
    if (isAdmin()) {
      loadBillingData();
    }
  }, [isAdmin]);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [stats, users] = await Promise.all([BillingService.getBillingStats(), BillingService.getAllUsersBilling()]);

      setBillingStats(stats);
      setUsersBilling(users);
    } catch (error) {
      console.error('Error loading billing data:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal memuat data billing',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpTokens = async () => {
    if (!selectedUser || topUpAmount <= 0) return;

    try {
      const result = await BillingService.topUpTokens(selectedUser.user.id, topUpAmount);

      if (result.success) {
        notifications.show({
          title: 'Berhasil',
          message: `Token berhasil ditambahkan ke akun ${selectedUser.user.name}`,
          color: 'green',
        });
        closeTopUp();
        setSelectedUser(null);
        setTopUpAmount(100);
        loadBillingData();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Gagal menambah token',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error topping up tokens:', error);
      notifications.show({
        title: 'Error',
        message: 'Terjadi kesalahan saat menambah token',
        color: 'red',
      });
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <IconShield size={16} />;
      case 'pro':
        return <IconCrown size={16} />;
      case 'enterprise':
        return <IconRocket size={16} />;
      default:
        return <IconShield size={16} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'gray';
      case 'pro':
        return 'blue';
      case 'enterprise':
        return 'grape';
      default:
        return 'gray';
    }
  };

  const filteredUsers = usersBilling
    .filter((item) => {
      const matchesSearch =
        !searchQuery || item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.user.email.toLowerCase().includes(searchQuery.toLowerCase()) || item.user.nim?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = !tierFilter || item.user.tier === tierFilter;

      return matchesSearch && matchesTier;
    })
    .sort((a, b) => b.currentMonthUsage.total_cost - a.currentMonthUsage.total_cost);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  if (!isAdmin) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertTriangle size={16} />} title="Akses Ditolak" color="red">
          Anda tidak memiliki akses ke halaman billing. Hanya administrator yang dapat mengakses halaman ini.
        </Alert>
      </Container>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Billing & Token Management</Title>
          <Text c="gray.6">Monitor penggunaan token AI dan statistik billing pengguna</Text>
        </div>
        <Group>
          <Button leftSection={<IconRefresh size={16} />} variant="light" onClick={loadBillingData} loading={loading}>
            Refresh Data
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            variant="filled"
            onClick={() => {
              notifications.show({
                title: 'Coming Soon',
                message: 'Fitur export akan segera hadir',
                color: 'blue',
              });
            }}
          >
            Export Report
          </Button>
        </Group>
      </Group>

      <LoadingOverlay visible={loading} />

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
            User Analytics
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          {billingStats && (
            <Stack gap="lg">
              {/* Stats Cards */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between">
                    <div>
                      <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                        Total Revenue
                      </Text>
                      <Text fw={700} size="xl">
                        ${billingStats.totalRevenue.toFixed(2)}
                      </Text>
                      <Text size="xs" c="gray.6" mt="xs">
                        All time revenue
                      </Text>
                    </div>
                    <ThemeIcon color="green" variant="light" size="xl" radius="md">
                      <IconCurrencyDollar size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between">
                    <div>
                      <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                        Monthly Revenue
                      </Text>
                      <Text fw={700} size="xl">
                        ${billingStats.monthlyRevenue.toFixed(2)}
                      </Text>
                      <Group gap={4} mt="xs">
                        <IconArrowUpRight size={16} color="var(--mantine-color-green-6)" />
                        <Text c="green" size="xs" fw={500}>
                          +12.5%
                        </Text>
                      </Group>
                    </div>
                    <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                      <IconTrendingUp size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between">
                    <div>
                      <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                        Active Users
                      </Text>
                      <Text fw={700} size="xl">
                        {billingStats.totalUsers}
                      </Text>
                      <Text size="xs" c="gray.6" mt="xs">
                        Total registered users
                      </Text>
                    </div>
                    <ThemeIcon color="cyan" variant="light" size="xl" radius="md">
                      <IconUsers size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>

                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between">
                    <div>
                      <Text c="gray.6" size="sm" fw={500} tt="uppercase">
                        Avg Tokens/User
                      </Text>
                      <Text fw={700} size="xl">
                        {billingStats.averageTokensPerUser.toFixed(0)}
                      </Text>
                      <Text size="xs" c="gray.6" mt="xs">
                        This month average
                      </Text>
                    </div>
                    <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                      <IconCoin size={28} />
                    </ThemeIcon>
                  </Group>
                </Card>
              </SimpleGrid>

              {/* Top Spending Users */}
              <Card withBorder shadow="sm" radius="md" p="lg">
                <Text size="lg" fw={600} mb="md">
                  Top Spending Users
                </Text>
                <Stack gap="xs">
                  {billingStats.topSpendingUsers.slice(0, 5).map((item, index) => (
                    <Group key={item.user.id} justify="space-between">
                      <Group gap="sm">
                        <ThemeIcon size="sm" color={index < 3 ? 'yellow' : 'gray'} variant="light">
                          <Text size="xs" fw={600}>
                            {index + 1}
                          </Text>
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={500}>
                            {item.user.name}
                          </Text>
                          <Text size="xs" c="gray.6">
                            {item.tokens_used} tokens
                          </Text>
                        </div>
                      </Group>
                      <Text size="sm" fw={600} c="green">
                        ${item.monthly_cost.toFixed(2)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <Stack gap="md">
            {/* Filters */}
            <Card withBorder p="md">
              <Group gap="md">
                <TextInput placeholder="Cari pengguna..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
                <Select
                  placeholder="Filter Tier"
                  leftSection={<IconFilter size={16} />}
                  data={[
                    { value: '', label: 'Semua Tier' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'pro', label: 'Pro' },
                    { value: 'enterprise', label: 'Enterprise' },
                  ]}
                  value={tierFilter}
                  onChange={(value) => setTierFilter(value || '')}
                  clearable
                />
              </Group>
            </Card>

            {/* Users Table */}
            <Card withBorder>
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Pengguna</Table.Th>
                      <Table.Th>Tier</Table.Th>
                      <Table.Th>Token Balance</Table.Th>
                      <Table.Th>Usage (Bulan Ini)</Table.Th>
                      <Table.Th>Cost</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {paginatedUsers.map((item) => (
                      <Table.Tr key={item.user.id}>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {item.user.name}
                            </Text>
                            <Text size="xs" c="gray.6">
                              {item.user.email}
                            </Text>
                            {item.user.nim && (
                              <Badge size="xs" variant="outline" color="gray">
                                {item.user.nim}
                              </Badge>
                            )}
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge leftSection={getTierIcon(item.user.tier || 'basic')} color={getTierColor(item.user.tier || 'basic')} variant="light">
                            {item.user.tier || 'basic'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Text size="sm" fw={500}>
                              {item.user.token_balance?.toLocaleString() || '0'}
                            </Text>
                            <Text size="xs" c="gray.6">
                              / {item.user.monthly_token_limit?.toLocaleString() || '0'}
                            </Text>
                          </Group>
                          <Progress value={((item.user.token_balance || 0) / (item.user.monthly_token_limit || 1)) * 100} size="xs" color="green" />
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {item.currentMonthUsage.total_tokens.toLocaleString()}
                          </Text>
                          <Text size="xs" c="gray.6">
                            tokens
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500} c="green">
                            ${item.currentMonthUsage.total_cost.toFixed(4)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="light" size="sm">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconGift size={14} />}
                                onClick={() => {
                                  setSelectedUser(item);
                                  openTopUp();
                                }}
                              >
                                Top Up Token
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => {
                                  notifications.show({
                                    title: 'Coming Soon',
                                    message: 'Fitur ubah tier akan segera hadir',
                                    color: 'blue',
                                  });
                                }}
                              >
                                Ubah Tier
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="sm" />
                </Group>
              )}
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Top Up Modal */}
      <Modal
        opened={topUpModal}
        onClose={() => {
          closeTopUp();
          setSelectedUser(null);
          setTopUpAmount(100);
        }}
        title={`Top Up Token - ${selectedUser?.user.name}`}
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<IconCoin size={16} />} color="blue">
            Saldo token saat ini: <strong>{selectedUser?.user.token_balance?.toLocaleString() || '0'}</strong> tokens
          </Alert>

          <NumberInput label="Jumlah Token" placeholder="Masukkan jumlah token" value={topUpAmount} onChange={(value) => setTopUpAmount(Number(value) || 0)} min={1} max={10000} leftSection={<IconCoin size={16} />} />

          <Text size="sm" c="gray.6">
            Estimasi biaya: ${((topUpAmount || 0) * 0.000002).toFixed(4)}
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={() => {
                closeTopUp();
                setSelectedUser(null);
                setTopUpAmount(100);
              }}
            >
              Batal
            </Button>
            <Button onClick={handleTopUpTokens} disabled={!topUpAmount || topUpAmount <= 0}>
              Top Up
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
