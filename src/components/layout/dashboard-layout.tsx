// src/components/layout/dashboard-layout.tsx - Updated dengan tab List PDF
'use client';

import { useState } from 'react';
import { AppShell, Text, UnstyledButton, Group, Avatar, Box, Burger, ScrollArea, Menu, Title, Badge, Divider, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUsers, IconFileText, IconLogout, IconUser, IconSettings, IconChevronRight, IconDashboard, IconBell } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

function NavLink({ icon, label, href, active, onClick }: NavLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
    onClick?.();
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      p="md"
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderRadius: '8px',
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
      icon: <IconFileText size={20} />, // Ganti dari IconCategory ke IconFileText
      label: 'List Artikel', // Ganti dari 'Kategori' ke 'List PDF'
      href: '/dashboard/articles', // Ganti href ke /articles
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="sm">
              <Title order={3} c="blue.6">
                MySRE
              </Title>
              <Badge variant="light" size="sm">
                Dashboard
              </Badge>
            </Group>
          </Group>

          <Group>
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
                        {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={16} />}>Profil</Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />}>Pengaturan</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={handleLogout}>
                  Keluar
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap="xs">
            <Text size="xs" tt="uppercase" fw={700} c="gray.6" px="md">
              Menu Utama
            </Text>

            {navLinks.map((link) => (
              <NavLink key={link.href} icon={link.icon} label={link.label} href={link.href} active={pathname === link.href} onClick={close} />
            ))}

            <Divider my="sm" />

            <Text size="xs" tt="uppercase" fw={700} c="gray.6" px="md">
              Pengaturan
            </Text>

            <NavLink icon={<IconSettings size={20} />} label="Konfigurasi" href="/dashboard/settings" active={pathname === '/dashboard/settings'} onClick={close} />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Box
            p="md"
            style={{
              borderTop: '1px solid var(--mantine-color-gray-2)',
              backgroundColor: 'var(--mantine-color-gray-0)',
              borderRadius: '8px',
              margin: '8px 0',
            }}
          >
            <Group gap="sm">
              <Avatar src={user?.avatar_url} alt={user?.name} size="sm" color="blue">
                {user?.name?.charAt(0)}
              </Avatar>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text size="sm" fw={500} truncate>
                  {user?.name}
                </Text>
                <Badge size="xs" variant="light" color={user?.role === 'admin' ? 'red' : 'blue'}>
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </Stack>
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
