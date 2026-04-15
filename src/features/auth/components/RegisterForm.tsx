'use client';

import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Checkbox from '@/shared/ui/Checkbox';
import { Link } from '@/shared/ui/Navigation';
import { EyeIcon, EyeOffIcon } from '@/features/auth/components/EyeIcon';
import { useTranslation } from '@/shared/i18n/client';
import { auth } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { logger } from '@/shared/utils/logger';
import { REGION } from '@/shared/config/region';
import PasswordValidationPanel, {
  createPasswordSchema,
} from './PasswordValidationPanel';

/**
 * RegisterForm - registration form for AuthModal
 *
 * Uses React Hook Form + Zod validation, PasswordValidationPanel for password requirements,
 * auth.register() for sending the request, and Checkbox for consents (RU region only).
 *
 * Simplified according to Figma mockup: only Email + Password (without firstName/lastName)
 */
const RegisterForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showConsentCheckboxes = REGION === 'ru';

  const registerSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .check(z.email({ error: t('validation.invalidEmail') })),
        password: createPasswordSchema(t),
        acceptedPrivacyPolicy: showConsentCheckboxes
          ? z.boolean().refine((val) => val === true, {
              message: t('validation.privacyRequired'),
            })
          : z.boolean().optional(),
        acceptedMarketing: z.boolean().optional(),
      }),
    [t, showConsentCheckboxes]
  );

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      acceptedPrivacyPolicy: false,
      acceptedMarketing: false,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);

    try {
      // Backend may require firstName/lastName, pass default values
      await auth.register({
        email: data.email,
        password: data.password,
        firstName: 'User',
        lastName: '',
        acceptedPrivacyPolicy: showConsentCheckboxes
          ? (data.acceptedPrivacyPolicy ?? false)
          : true,
        acceptedMarketing: data.acceptedMarketing || false,
      });
    } catch (err: unknown) {
      logger.error('RegisterForm', 'Registration failed', err);
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 409) {
        setError(t('register.emailExists'));
      } else {
        setError(t('register.registrationErrorRetry'));
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* Input Group */}
      <div className="flex flex-col gap-4">
        {/* Email Input */}
        <Input
          {...register('email')}
          type="email"
          placeholder={t('register.emailPlaceholder')}
          error={errors.email?.message}
          className="bg-blackinverse-a6 border-none rounded-[2px]"
          autoFocus
        />

        {/* Password Input with Validation Panel */}
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('register.passwordPlaceholder')}
            error={errors.password?.message}
            className="bg-blackinverse-a6 border-none rounded-[2px]"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-blackinverse-a56 hover:text-blackinverse-a100 transition-colors"
                aria-label={
                  showPassword
                    ? t('register.hidePassword')
                    : t('register.showPassword')
                }
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
          {/* Password Validation Panel */}
          <PasswordValidationPanel password={passwordValue} />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-color-error -mt-4">{error}</p>}

      {/* Button + Checkboxes */}
      <div className="flex flex-col gap-6">
        {/* Submit Button */}
        <Button
          type="submit"
          variant="accent"
          size="md"
          disabled={!isValid || loading}
          loading={loading}
          className="w-full"
        >
          {loading ? t('register.submitting') : t('register.submit')}
        </Button>

        {/* Checkboxes (RU region only) */}
        {showConsentCheckboxes && (
          <div className="flex flex-col gap-3">
            <Controller
              name="acceptedPrivacyPolicy"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  error={!!errors.acceptedPrivacyPolicy}
                  size="sm"
                  label={
                    <span className="text-xs leading-4 tracking-[-0.2px] text-blackinverse-a56">
                      {t('register.privacyConsent')}{' '}
                      <Link
                        to="/privacy-policy"
                        className="text-color-accent underline hover:text-mind-accent"
                      >
                        {t('register.privacyPolicy')}
                      </Link>
                    </span>
                  }
                />
              )}
            />
            {errors.acceptedPrivacyPolicy && (
              <p className="text-xs text-color-error -mt-2">
                {errors.acceptedPrivacyPolicy.message}
              </p>
            )}

            <Controller
              name="acceptedMarketing"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  size="sm"
                  label={
                    <span className="text-xs leading-4 tracking-[-0.2px] text-blackinverse-a56">
                      {t('register.marketingConsent')}
                    </span>
                  }
                />
              )}
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default RegisterForm;
