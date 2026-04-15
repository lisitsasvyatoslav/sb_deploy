'use client';

import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { EyeIcon, EyeOffIcon } from '@/features/auth/components/EyeIcon';
import { Link } from '@/shared/ui/Navigation';
import { useTranslation } from '@/shared/i18n/client';
import { auth } from '@/services/api';
import React, { useEffect, useRef, useState } from 'react';
import DevLoginPanel from './DevLoginPanel';

/**
 * LoginForm - login form for AuthModal
 *
 * Reuses logic from LoginSplit.tsx:
 * - Simple validation through useState (without React Hook Form)
 * - auth.login() for sending the request
 * - Button disabled until fields are filled and email is valid
 */
const LoginForm: React.FC = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Detection of browser autofill through CSS :autofill pseudo-class.
  // onChange is not called when autofill occurs, and .value is protected until interaction,
  // but matches(':autofill') works — we use it to unlock the button.
  useEffect(() => {
    const checkAutofill = () => {
      try {
        const emailFilled = emailRef.current?.matches(':autofill') ?? false;
        const passwordFilled =
          passwordRef.current?.matches(':autofill') ?? false;
        if (emailFilled && passwordFilled) {
          setIsAutofilled(true);
        }
      } catch {
        // :autofill is not supported — try vendor prefix
        try {
          const emailFilled =
            emailRef.current?.matches(':-webkit-autofill') ?? false;
          const passwordFilled =
            passwordRef.current?.matches(':-webkit-autofill') ?? false;
          if (emailFilled && passwordFilled) {
            setIsAutofilled(true);
          }
        } catch {
          // Browser does not support any variant — nothing to do
        }
      }
    };

    const interval = setInterval(checkAutofill, 200);
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const isFormValid =
    email.trim() !== '' &&
    password.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const submitEmail = email || emailRef.current?.value || '';
    const submitPassword = password || passwordRef.current?.value || '';

    try {
      await auth.login(submitEmail, submitPassword);
    } catch {
      setError(t('login.invalidCredentials'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Email Input */}
      <Input
        ref={emailRef}
        type="email"
        placeholder={t('login.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-blackinverse-a6 border-none rounded-[2px]"
        autoFocus
      />

      {/* Password Input */}
      <Input
        ref={passwordRef}
        type={showPassword ? 'text' : 'password'}
        placeholder={t('login.passwordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-blackinverse-a6 border-none rounded-[2px]"
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-blackinverse-a56 hover:text-blackinverse-a100 transition-colors"
            aria-label={
              showPassword ? t('login.hidePassword') : t('login.showPassword')
            }
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
      />

      {/* Forgot Password Link — hidden on mobile (footer handles it there) */}
      <Link
        to="/forgot-password"
        className="hidden md:inline text-xs text-blackinverse-a32 hover:text-blackinverse-a56 transition-colors self-start -mt-3"
      >
        {t('login.forgotPassword')}
      </Link>

      {/* Error Message */}
      {error && <p className="text-sm text-color-error -mt-3">{error}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="accent"
        size="md"
        disabled={!(isFormValid || isAutofilled) || loading}
        loading={loading}
        className="w-full mt-4"
      >
        {loading ? t('login.submitting') : t('login.submit')}
      </Button>

      <DevLoginPanel onError={setError} />
    </form>
  );
};

export default LoginForm;
