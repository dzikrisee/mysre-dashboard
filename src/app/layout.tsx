// src/app/layout.tsx
// FIXED: Add ModalsProvider for modal functionality

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals'; // ADDED: Import ModalsProvider
import { Notifications } from '@mantine/notifications';
import { theme } from '@/lib/theme';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css'; // ADDED: Import dates styles
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MySRE Dashboard',
  description: 'Dashboard untuk mengelola MySRE - Platform Menulis Naskah Akademik',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {/* ADDED: ModalsProvider wrapper */}
          <ModalsProvider>
            <ThemeProvider>
              <Notifications />
              <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
