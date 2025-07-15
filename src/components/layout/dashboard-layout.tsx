'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell, Group, Text, UnstyledButton, Burger, Image, Stack, Avatar, Menu, ActionIcon, Tooltip, Badge, Divider, Box } from '@mantine/core';
import { IconDashboard, IconUsers, IconFileText, IconPencil, IconBulb, IconReportAnalytics, IconReceipt, IconCoin, IconChevronRight, IconBell, IconLogout, IconSettings, IconUser, IconCurrencyDollar } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  badgeColor?: string;
}

function NavLink({ icon, label, href, active, onClick, badge, badgeColor = 'blue' }: NavLinkProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        backgroundColor: active ? 'var(--mantine-color-blue-0)' : 'transparent',
        color: active ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-gray-7)',
        '&:hover': {
          backgroundColor: active ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-gray-0)',
        },
      }}
    >
      <Group gap="sm" style={{ flex: 1 }}>
        {icon}
        <Text size="sm" fw={active ? 600 : 400}>
          {label}
        </Text>
        {badge && (
          <Badge size="xs" color={badgeColor} variant="filled" ml="auto">
            {badge}
          </Badge>
        )}
      </Group>
      <IconChevronRight size={16} opacity={0.6} />
    </UnstyledButton>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, signOut, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    {
      icon: <IconDashboard size={20} />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <IconUsers size={20} />,
      label: 'Pengguna',
      href: '/dashboard/users',
    },
    {
      icon: <IconFileText size={20} />,
      label: 'List Artikel',
      href: '/dashboard/articles',
    },
    {
      icon: <IconPencil size={20} />,
      label: 'Project Writer',
      href: '/dashboard/project-writer',
    },
    {
      icon: <IconBulb size={20} />,
      label: 'Project Brainstorm',
      href: '/dashboard/project-brainstorm',
    },
    {
      icon: <IconReportAnalytics size={20} />,
      label: 'Learning Analytics',
      href: '/dashboard/analytics',
    },
    // NEW: Billing tab
    {
      icon: <IconReceipt size={20} />,
      label: 'Billing & Tokens',
      href: '/dashboard/billing',
      badge: 'NEW',
      badgeColor: 'green',
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    close();
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="sm" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/LogoSRE_Fix.png" alt="MySRE Logo" height={45} width="auto" fit="contain" fallbackSrc="/logo-mysre-fallback.png" />
              
            </Group>
          </Group>

          <Group>
            {/* Token Balance Indicator (untuk user) */}
            {!isAdmin && user && (
              <Tooltip label="Token Balance">
                <ActionIcon variant="light" size="lg" color="green">
                  <Group gap="xl">
                    <IconCoin size={16} />
                    <Text size="xs" fw={600}>
                      {user.token_balance?.toLocaleString() || '0'}
                    </Text>
                  </Group>
                </ActionIcon>
              </Tooltip>
            )}

            {/* Revenue Indicator (untuk admin) */}
            {isAdmin() && (
              <Tooltip label="Monthly Revenue">
                <ActionIcon variant="light" size="lg" color="green">
                  <Group gap="xs">
                    <IconCurrencyDollar size={16} />
                    <Text size="xs" fw={600}>
                      $2.4K
                    </Text>
                  </Group>
                </ActionIcon>
              </Tooltip>
            )}

            <Tooltip label="Notifikasi">
              <ActionIcon variant="light" size="lg">
                <IconBell size={20} />
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Avatar src={user?.avatar_url} alt={user?.name} size="sm" color="blue">
                      {user?.name?.charAt(0)}
                    </Avatar>
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {user?.name}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {user?.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={14} />} onClick={() => router.push('/dashboard/profile')}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                {!isAdmin && (
                  <Menu.Item leftSection={<IconCoin size={14} />} onClick={() => router.push('/dashboard/billing')}>
                    My Billing
                  </Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {/* Navigation Title */}
          <Box mb="md">
            <Text size="xs" fw={600} tt="uppercase" c="gray.6" mb="xs">
              Navigation
            </Text>
            <Divider />
          </Box>

          {/* Main Navigation Links */}
          {navLinks.map((link) => (
            <NavLink key={link.href} icon={link.icon} label={link.label} href={link.href} active={pathname === link.href} onClick={() => handleNavClick(link.href)} badge={link.badge} badgeColor={link.badgeColor} />
          ))}

          {/* User Tier Info */}
          {!isAdmin && user && (
            <Box
              mt="auto"
              p="md"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white',
              }}
            >
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={600}>
                  Current Plan
                </Text>
                <Badge color={user.tier === 'enterprise' ? 'grape' : user.tier === 'pro' ? 'blue' : 'gray'} variant="white" size="sm">
                  {user.tier?.toUpperCase() || 'BASIC'}
                </Badge>
              </Group>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" opacity={0.9}>
                    Token Balance
                  </Text>
                  <Text size="xs" fw={600}>
                    {user.token_balance?.toLocaleString() || '0'}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" opacity={0.9}>
                    Monthly Limit
                  </Text>
                  <Text size="xs" fw={600}>
                    {user.monthly_token_limit?.toLocaleString() || '1,000'}
                  </Text>
                </Group>

                {user.token_balance && user.monthly_token_limit && (
                  <Box mt="xs">
                    <Text size="xs" opacity={0.9} mb="xs">
                      Usage: {((user.token_balance / user.monthly_token_limit) * 100).toFixed(1)}%
                    </Text>
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: 'white',
                          width: `${(user.token_balance / user.monthly_token_limit) * 100}%`,
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Admin Stats */}
          {isAdmin() && (
            <Box
              mt="auto"
              p="md"
              style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                borderRadius: '12px',
                color: 'white',
              }}
            >
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={600}>
                  Admin Dashboard
                </Text>
              </Group>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" opacity={0.9}>
                    Active Users
                  </Text>
                  <Text size="xs" fw={600}>
                    156
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" opacity={0.9}>
                    Monthly Revenue
                  </Text>
                  <Text size="xs" fw={600}>
                    $2,450
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="xs" opacity={0.9}>
                    Token Usage
                  </Text>
                  <Text size="xs" fw={600}>
                    2.1M
                  </Text>
                </Group>
              </Stack>
            </Box>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
