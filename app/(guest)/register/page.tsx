'use client';

import { useEffect } from 'react';
import AuthModal from '@/features/auth/components/AuthModal';
import { useAuthModalStore } from '@/stores/authModalStore';

export default function RegisterPage() {
  const { setMode } = useAuthModalStore();

  useEffect(() => {
    setMode('register');
  }, [setMode]);

  return <AuthModal />;
}
