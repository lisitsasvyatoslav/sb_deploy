'use client';

import { useEffect } from 'react';
import AuthModal from '@/features/auth/components/AuthModal';
import { useAuthModalStore } from '@/stores/authModalStore';

export default function LoginPage() {
  const { setMode } = useAuthModalStore();

  useEffect(() => {
    setMode('login');
  }, [setMode]);

  return <AuthModal />;
}
