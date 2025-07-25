// src/components/layout/dashboard-layout.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell, Group, Text, UnstyledButton, Burger, Image, Stack, Avatar, Menu, ActionIcon, Tooltip, Badge, Divider, Box, ScrollArea } from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconFileText,
  IconPencil,
  IconBulb,
  IconReportAnalytics,
  IconReceipt,
  IconCoin,
  IconChevronRight,
  IconBell,
  IconLogout,
  IconUser,
  IconCurrencyDollar,
  IconClipboardList,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';

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
        // Hapus color override di sini, biarkan CSS global yang handle
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
  const { colorScheme, toggleColorScheme } = useTheme();
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
      label: 'Artikel',
      href: '/dashboard/articles',
    },
    {
      icon: <IconClipboardList size={20} />,
      label: 'Assignment',
      href: '/dashboard/assignments',
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
      label: 'Analitik Pembelajaran',
      href: '/dashboard/analytics',
    },
    {
      icon: <IconReceipt size={20} />,
      label: 'Billing & Tokens',
      href: '/dashboard/billing',
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            {!isAdmin() && user && (
              <Tooltip label="Token Balance">
                <ActionIcon variant="light" size="lg" color="green">
                  <Group gap="xs">
                    <IconCoin size={16} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{user.token_balance?.toLocaleString() || '0'}</span>
                  </Group>
                </ActionIcon>
              </Tooltip>
            )}

            {/* Dark Mode Toggle Button */}
            <Tooltip label={colorScheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
              <ActionIcon variant="light" size="lg" onClick={toggleColorScheme} color={colorScheme === 'dark' ? 'yellow' : 'blue'}>
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Notifikasi">
              <ActionIcon variant="light" size="lg">
                <IconBell size={20} />
              </ActionIcon>
            </Tooltip>

            {/* Dropdown Profile dengan Profile dan Dark Mode Toggle */}
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
                        {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Akun</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />} onClick={() => router.push('/dashboard/profile')}>
                  Profil Saya
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                  Keluar
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* Tambahkan ScrollArea untuk mengatasi masalah scroll di sidebar */}
        <ScrollArea style={{ height: 'calc(100vh - 140px)' }}>
          <Stack gap="xs">
            <Text size="xs" fw={700} c="gray.6" tt="uppercase" mb="sm">
              Menu Utama
            </Text>

            {navLinks.map((link) => (
              <NavLink key={link.href} icon={link.icon} label={link.label} href={link.href} active={pathname === link.href} onClick={() => handleNavClick(link.href)} />
            ))}

            <Divider my="md" />

            <Text size="xs" fw={700} c="gray.6" tt="uppercase" mb="sm">
              System Info
            </Text>

            <Box
              p="sm"
              style={{
                borderRadius: '8px',
                backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-5))',
              }}
            >
              <Text size="xs" c="gray.6" mb="xs">
                Status Server
              </Text>
              <Group gap="xs">
                <Box w={8} h={8} bg="green" style={{ borderRadius: '50%' }} />
                <Text size="xs" fw={500}>
                  Online
                </Text>
              </Group>
            </Box>
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
