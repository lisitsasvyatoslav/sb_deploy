'use client';

import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import LogoFinamDiary from '@/features/auth/components/LogoFinamDiary';
import { useTranslation } from '@/shared/i18n/client';
import { apiClient } from '@/services/api';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmailValid =
    email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(t('forgotPassword.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen">
      {/* BACKGROUND: full-screen image shifted right to center within the visible right portion.
          320px = half of left panel width (w-[640px]) */}
      <div
        className="absolute inset-0 bg-background-auth-page auth-intro-bg bg-[url(/intro-light.svg)] dark:bg-[url(/intro-dark.svg)] bg-cover bg-[position:calc(50%_+_320px)_center]"
        aria-hidden="true"
      />

      {/* LEFT: Login Panel (640px, as in AuthModal) */}
      <div
        className="
          absolute inset-y-0 left-0
          w-[640px]
          backdrop-blur-[40px]
          bg-[var(--surface-white-low)]
          after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px
          after:bg-gradient-to-b after:from-transparent after:via-[var(--Black-Inverse-A6)] after:to-transparent
          shadow-modal
          flex flex-col items-center justify-center
          px-[160px] pb-[110px]
          z-10
        "
      >
        <div className="w-full max-w-[432px]">
          {/* Logo */}
          <div className="flex flex-col items-start justify-center pt-[8px] pb-[24px] w-full">
            <div className="flex items-center h-[48px] py-[8px] w-full">
              <LogoFinamDiary />
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-[32px] items-start w-full">
            {/* Title + subtitle */}
            <div className="flex flex-col gap-[6px] items-start w-full">
              <h1 className="text-2xl font-semibold leading-8 tracking-[-0.4px] text-blackinverse-a100">
                {t('forgotPassword.title')}
              </h1>
              <p className="text-base leading-6 tracking-[-0.2px] text-blackinverse-a32">
                {sent
                  ? t('forgotPassword.successMessage')
                  : t('forgotPassword.instruction')}
              </p>
            </div>

            {/* Form (hidden after sending) */}
            {!sent && (
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-[32px] items-start w-full"
              >
                {/* Email field */}
                <div className="flex flex-col gap-[16px] items-start w-full">
                  <Input
                    type="email"
                    placeholder="you@example.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-blackinverse-a6 border-none rounded-[2px]"
                    containerClassName="w-full"
                    autoFocus
                  />
                  {error && <p className="text-sm text-color-error">{error}</p>}
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-[12px] items-start w-full">
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    disabled={!isEmailValid || loading}
                    loading={loading}
                    className="w-full"
                  >
                    {t('forgotPassword.submitButton')}
                  </Button>
                  <button
                    type="button"
                    className="w-full py-[10px] px-[14px] text-sm font-semibold leading-5 tracking-[-0.2px] text-blackinverse-a56 hover:text-blackinverse-a100 transition-colors cursor-pointer bg-transparent border-none"
                    onClick={() => router.push('/login')}
                  >
                    {t('forgotPassword.backToLogin')}
                  </button>
                </div>
              </form>
            )}

            {/* Back button after sending */}
            {sent && (
              <button
                type="button"
                className="w-full py-[10px] px-[14px] text-sm font-semibold leading-5 tracking-[-0.2px] text-blackinverse-a56 hover:text-blackinverse-a100 transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => router.push('/login')}
              >
                {t('forgotPassword.backToLogin')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
