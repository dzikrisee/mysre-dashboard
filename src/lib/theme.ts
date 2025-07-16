// FILE: src/lib/theme.ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#e6f3ff',
      '#cce7ff',
      '#99d5ff',
      '#66c2ff',
      '#33afff',
      '#0096ff', // Primary blue berdasarkan referensi UI
      '#0077cc',
      '#005999',
      '#003d66',
      '#002133',
    ],
    gray: ['#f8f9fa', '#f1f3f4', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529'],
    // Dark mode colors
    dark: ['#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40', '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113'],
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
  },
  components: {
    Button: {
      styles: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    Card: {
      styles: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          borderRadius: '8px',
          border: '1px solid var(--mantine-color-gray-3)',
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
          },
        },
      },
    },
    PasswordInput: {
      styles: {
        input: {
          borderRadius: '8px',
          border: '1px solid var(--mantine-color-gray-3)',
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
          },
        },
      },
    },
    Select: {
      styles: {
        input: {
          borderRadius: '8px',
          border: '1px solid var(--mantine-color-gray-3)',
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
          },
        },
      },
    },
    Modal: {
      styles: {
        content: {
          borderRadius: '12px',
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          backgroundColor: 'var(--mantine-color-default)',
        },
      },
    },
  },
});
