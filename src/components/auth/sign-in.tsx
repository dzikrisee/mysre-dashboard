// src/components/auth/sign-in.tsx
// FIXED: Dark mode compatibility

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, TextInput, PasswordInput, Button, Title, Text, Container, Stack, Box, Alert, Group, Divider, Card, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconInfoCircle, IconLogin, IconMail, IconId } from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      identifier: '',
      password: '',
    },
    validate: {
      identifier: (value) => (value.length < 1 ? 'Email atau NIM harus diisi' : null),
      password: (value) => (value.length < 6 ? 'Password minimal 6 karakter' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn(values.identifier, values.password);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Terjadi kesalahan saat masuk');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk');
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormat = (input: string) => input.includes('@');

  return (
    <Container size={480} my={40}>
      {/* Header */}
      <Box ta="center" mb={20}>
        <Title
          order={1}
          size={36}
          fw={700}
          // FIXED: Responsive color untuk dark mode
          c="light-dark(var(--mantine-color-blue-6), var(--mantine-color-blue-4))"
          mb={8}
          style={{
            background: 'linear-gradient(45deg, #0096ff, #667eea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          MySRE
        </Title>
        <Text
          size="lg"
          // FIXED: Responsive color
          c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-3))"
          fw={500}
          mb="sm"
        >
          Dashboard Administrator
        </Text>
      </Box>

      {/* Login Card */}
      <Card
        withBorder
        shadow="lg"
        p={40}
        radius="lg"
        style={{
          // FIXED: Responsive background
          background: 'light-dark(#ffffff, var(--mantine-color-dark-6))',
          border: 'light-dark(1px solid #e9ecef, 1px solid var(--mantine-color-dark-4))',
        }}
      >
        <Stack gap="lg">
          <Box ta="center">
            <Title
              order={2}
              size={24}
              fw={600}
              // FIXED: Responsive text color
              c="light-dark(var(--mantine-color-gray-8), var(--mantine-color-gray-1))"
              mb="xs"
            >
              Masuk ke Dashboard
            </Title>
            <Text size="sm" c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-4))">
              Akses khusus untuk administrator sistem
            </Text>
          </Box>

          <Divider label="Masukkan kredensial Anda" labelPosition="center" color="light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))" />

          {error && (
            <Alert icon={<IconInfoCircle size={16} />} title="Login Gagal" color="red" variant="light">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email atau NIM"
                placeholder="admin@mysre.com atau 2021001001"
                leftSection={isEmailFormat(form.values.identifier) ? <IconMail size={18} /> : <IconId size={18} />}
                size="md"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    // FIXED: Responsive label color
                    color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-2))',
                  },
                  input: {
                    // FIXED: Responsive input styling
                    border: 'light-dark(2px solid var(--mantine-color-gray-2), 2px solid var(--mantine-color-dark-4))',
                    background: 'light-dark(#ffffff, var(--mantine-color-dark-5))',
                    color: 'light-dark(var(--mantine-color-gray-8), var(--mantine-color-gray-1))',
                    '&:focus': {
                      borderColor: 'var(--mantine-color-blue-5)',
                      boxShadow: '0 0 0 3px rgba(0, 150, 255, 0.1)',
                    },
                    '&::placeholder': {
                      color: 'light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))',
                    },
                  },
                }}
                {...form.getInputProps('identifier')}
              />

              <PasswordInput
                label="Password"
                placeholder="Masukkan password Anda"
                leftSection={<IconLock size={18} />}
                size="md"
                radius="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-2))',
                  },
                  input: {
                    border: 'light-dark(2px solid var(--mantine-color-gray-2), 2px solid var(--mantine-color-dark-4))',
                    background: 'light-dark(#ffffff, var(--mantine-color-dark-5))',
                    color: 'light-dark(var(--mantine-color-gray-8), var(--mantine-color-gray-1))',
                    '&:focus': {
                      borderColor: 'var(--mantine-color-blue-5)',
                      boxShadow: '0 0 0 3px rgba(0, 150, 255, 0.1)',
                    },
                    '&::placeholder': {
                      color: 'light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))',
                    },
                  },
                }}
                {...form.getInputProps('password')}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
                radius="md"
                mt="md"
                gradient={{ from: 'blue.6', to: 'cyan.5' }}
                variant="gradient"
                leftSection={<IconLogin size={18} />}
                styles={{
                  root: {
                    height: '50px',
                    fontWeight: 600,
                    fontSize: '16px',
                    boxShadow: '0 4px 14px rgba(0, 150, 255, 0.25)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(0, 150, 255, 0.35)',
                    },
                  },
                }}
              >
                Masuk ke Dashboard
              </Button>
            </Stack>
          </form>

          <Divider color="light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-3))" />

          {/* Login Info */}
          <Box>
            <Alert icon={<IconInfoCircle size={16} />} title="Informasi Login" color="blue" variant="light">
              <Stack gap="xs">
                <Text size="sm">
                  • <strong>Administrator:</strong> Gunakan email admin
                </Text>
                <Text size="sm">
                  • <strong>Mahasiswa:</strong> Gunakan NIM (hanya untuk testing)
                </Text>
                <Text size="sm" c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-4))">
                  Hanya administrator yang dapat mengakses dashboard ini.
                </Text>
              </Stack>
            </Alert>
          </Box>

          <Box ta="center">
            <Text size="xs" c="light-dark(var(--mantine-color-gray-4), var(--mantine-color-gray-5))">
              Hubungi IT Support jika mengalami kendala login.
            </Text>
          </Box>
        </Stack>
      </Card>

      {/* Footer Info */}
      <Box ta="center" mt="xl">
        <Group justify="center" gap="xs" mb="sm">
          <Text size="xs" c="light-dark(var(--mantine-color-gray-4), var(--mantine-color-gray-5))">
            Powered by
          </Text>
          <Badge size="xs" variant="outline" color="gray">
            Next.js
          </Badge>
          <Badge size="xs" variant="outline" color="gray">
            Supabase
          </Badge>
          <Badge size="xs" variant="outline" color="gray">
            Mantine
          </Badge>
        </Group>
        <Text size="xs" c="light-dark(var(--mantine-color-gray-4), var(--mantine-color-gray-5))">
          © 2025 MySRE. Platform Manajemen Naskah Akademik.
        </Text>
      </Box>
    </Container>
  );
}
