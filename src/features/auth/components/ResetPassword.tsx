'use client';

import { Link } from '@/shared/ui/Navigation';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { apiClient } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import PasswordValidationPanel, {
  createPasswordSchema,
} from './PasswordValidationPanel';

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const params = useSearchParams();
  const token = params?.get('token') ?? '';
  const [error, setError] = useState<string | null>(null);

  const resetSchema = z.object({
    password: createPasswordSchema(t),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<{ password: string }>({
    resolver: zodResolver(resetSchema),
  });

  const currentPassword = watch('password', '');

  const onSubmit = async (data: { password: string }) => {
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      router.push('/login');
    } catch (err) {
      setError(t('resetPassword.error'));
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h1 className="text-2xl font-bold mb-2">
            {t('resetPassword.title')}
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 relative">
              <label className="block text-sm mb-2">
                {t('resetPassword.newPasswordLabel')}
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <PasswordValidationPanel password={currentPassword} />
            </div>
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full h-[42px]"
              disabled={isSubmitting}
            >
              {t('resetPassword.submitButton')}
            </Button>
          </form>
          <div className="mt-3">
            <Link to="/login" className="text-accent hover:text-accent-hover">
              {t('resetPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1 auth-intro-bg bg-[url(/intro.png)] bg-center bg-cover bg-no-repeat" />
    </div>
  );
};

export default ResetPassword;
