// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { theme } from '@/lib/theme';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
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
        {/* DEFAULT: Ubah dari "auto" ke "light" untuk default light mode */}
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
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
