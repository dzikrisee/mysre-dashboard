// src/app/auth/page.tsx
// FIXED: Dark mode background issue

'use client';

import { SignIn } from '@/components/auth/sign-in';

export default function AuthPage() {
  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        // FIXED: Responsive background untuk light dan dark mode
        background: 'light-dark(#ffffff, var(--mantine-color-dark-7))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <SignIn />
    </div>
  );
}
