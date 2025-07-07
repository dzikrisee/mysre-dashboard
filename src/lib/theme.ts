import { createTheme } from '@mantine/core'

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
      '#002133'
    ],
    gray: [
      '#f8f9fa',
      '#f1f3f4',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529'
    ]
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
        }
      }
    },
    Card: {
      styles: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }
      }
    },
    TextInput: {
      styles: {
        input: {
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          '&:focus': {
            borderColor: '#0096ff',
          }
        }
      }
    },
    PasswordInput: {
      styles: {
        input: {
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          '&:focus': {
            borderColor: '#0096ff',
          }
        }
      }
    },
    Select: {
      styles: {
        input: {
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          '&:focus': {
            borderColor: '#0096ff',
          }
        }
      }
    },
    Modal: {
      styles: {
        content: {
          borderRadius: '12px',
        }
      }
    }
  }
})