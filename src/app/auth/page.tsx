'use client';

import { SignIn } from '@/components/auth/sign-in';

export default function AuthPage() {
  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: '#ffffff',
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
