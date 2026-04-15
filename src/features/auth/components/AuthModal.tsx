'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SegmentedControl from '@/shared/ui/SegmentedControl';
import { useTranslation } from '@/shared/i18n/client';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuthStore } from '@/stores/authStore';
import { useAuthModalStore } from '@/stores/authModalStore';
import Logo from '@/shared/ui/Logo/Logo';
/**
 * AuthModal - unified authentication component from Figma Design System
 *
 * Combines login and registration with SegmentedControl for switching between tabs.
 *
 * Structure (according to Figma mockup):
 * - Horizontal layout: left panel (640px) + right background
 * - Left panel: transparent background with backdrop-blur, contains the login form
 * - Right part: background image intro.png (light/dark variant)
 * - Logo "Finam Diary" + title + SegmentedControl
 * - LoginForm or RegisterForm depending on activeTab
 *
 * Automatic redirect to '/' upon successful authentication
 */
const AuthModal: React.FC = () => {
  const { t } = useTranslation('auth');
  const { mode } = useAuthModalStore();
  const initialTab = mode === 'login' || mode === 'register' ? mode : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Synchronization of activeTab with mode from the store when the modal is opened
  useEffect(() => {
    if (mode === 'login' || mode === 'register') {
      setActiveTab(mode);
    }
  }, [mode]);

  // Automatic redirect upon successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="relative h-screen">
      {/* DESKTOP BACKGROUND: full-screen base color + image shifted right so it centers in the
          visible right portion while still extending under the left panel —
          required for backdrop-blur on the left panel to work.
          320px = half of left panel width (w-[640px]) */}
      <div
        className="
          hidden md:block
          absolute inset-0
          bg-background-auth-page auth-intro-bg
          bg-[url(/intro-light.svg)] dark:bg-[url(/intro-dark.svg)]
          bg-cover bg-[position:calc(50%_+_320px)_center]
        "
        aria-hidden="true"
      />

      {/* DESKTOP LEFT: Login Panel (640px fixed width, on top of the background) */}
      <div
        className="
          hidden md:flex
          absolute inset-y-0 left-0
          w-[640px]
          backdrop-blur-[40px]
          bg-[var(--surface-white-low)]
          after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px
          after:bg-gradient-to-b after:from-transparent after:via-[var(--Black-Inverse-A6)] after:to-transparent
          shadow-modal
          flex-col items-center justify-center
          px-[160px] pb-[110px]
          z-10
        "
      >
        {/* Inner content container */}
        <div className="w-full max-w-[432px]">
          {/* Logo */}
          <div className="flex flex-col items-start pt-[8px] pb-[24px] w-full">
            <div className="flex items-center h-[48px] py-[8px] w-full">
              <Logo />
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <h1
              id="auth-modal-title"
              className="
                text-2xl font-semibold leading-8 tracking-[-0.4px]
                text-blackinverse-a100
                mb-1.5
              "
            >
              {t('modal.welcome')}
            </h1>
            <p
              id="auth-modal-description"
              className="
                text-base leading-6 tracking-[-0.2px]
                text-blackinverse-a32
              "
            >
              {t('modal.enterCredentials')}
            </p>
          </div>

          {/* Segmented Control (tab switcher) */}
          <SegmentedControl
            segments={[
              { label: t('modal.loginTab'), value: 'login' },
              { label: t('modal.registerTab'), value: 'register' },
            ]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as 'login' | 'register')}
            className="mb-8"
            variant="surface"
            size="L"
          />

          {/* Form (LoginForm or RegisterForm) */}
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>

      {/* MOBILE: full-screen layout */}
      <div className="md:hidden absolute inset-0 overflow-y-auto flex flex-col bg-[var(--mobile-auth-bg)] pt-0 px-spacing-16 pb-spacing-12">
        <div className="flex flex-col flex-1 w-full max-w-[432px] mx-auto">
          {/* Logo */}
          <div className="pt-spacing-24 mb-8">
            <Logo />
          </div>

          {/* Title + subtitle */}
          <h1 className="overflow-hidden text-ellipsis text-24 font-semibold leading-8 tracking-[-0.4px] text-blackinverse-a100 mb-1.5">
            {t('modal.welcome')}
          </h1>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-12 font-normal leading-4 tracking-[-0.2px] text-blackinverse-a56 mb-spacing-12">
            {t('modal.enterCredentials')}
          </p>

          {/* Segmented Control */}
          <SegmentedControl
            segments={[
              { label: t('modal.loginTab'), value: 'login' },
              { label: t('modal.registerTab'), value: 'register' },
            ]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as 'login' | 'register')}
            className="mb-8"
            variant="surface"
            size="L"
          />

          {/* Form */}
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}

          {/* Spacer pushes footer to bottom */}
          <div className="flex-1 min-h-8" />

          {/* Support footer */}
          <div className="mt-8 text-center">
            <p className="text-12 font-normal leading-4 tracking-[-0.2px] text-blackinverse-a56">
              {t('modal.mobileFooterContact')}{' '}
              <a
                href={`mailto:${t('modal.mobileFooterEmail')}`}
                className="text-[var(--brand-primary)] text-12 font-normal leading-4 tracking-[-0.2px]"
              >
                {t('modal.mobileFooterEmail')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
