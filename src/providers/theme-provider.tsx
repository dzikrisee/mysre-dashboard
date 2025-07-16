// FILE: src/providers/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { MantineColorScheme, useMantineColorScheme } from '@mantine/core';

interface ThemeContextType {
  colorScheme: MantineColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: MantineColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme: setMantineColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedScheme = localStorage.getItem('color-scheme') as MantineColorScheme;
    if (savedScheme && (savedScheme === 'dark' || savedScheme === 'light')) {
      setMantineColorScheme(savedScheme);
    }
  }, [setMantineColorScheme]);

  const toggleColorScheme = () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setMantineColorScheme(newScheme);
    localStorage.setItem('color-scheme', newScheme);
  };

  const setColorScheme = (scheme: MantineColorScheme) => {
    setMantineColorScheme(scheme);
    localStorage.setItem('color-scheme', scheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return <ThemeContext.Provider value={{ colorScheme, toggleColorScheme, setColorScheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
