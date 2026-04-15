'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalBody } from '@/shared/ui/Modal';
import SegmentedControl from '@/shared/ui/SegmentedControl';
import LogoFinamDiary from '@/features/auth/components/LogoFinamDiary';
import { useTranslation } from '@/shared/i18n/client';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuthModalStore } from '@/stores/authModalStore';

/**
 * WelcomeAuthModal - compact centered modal for auth on the welcome page.
 * Uses the shared Modal component (portal, backdrop, escape, scroll lock).
 */
const WelcomeAuthModal: React.FC = () => {
  const { t } = useTranslation('auth');
  const { isOpen, mode, closeModal } = useAuthModalStore();
  const initialTab = mode === 'login' || mode === 'register' ? mode : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Sync activeTab with mode from store when modal opens
  useEffect(() => {
    if (mode === 'login' || mode === 'register') {
      setActiveTab(mode);
    }
  }, [mode]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
      maxWidth="sm"
      showCloseButton
    >
      <ModalBody padding="none">
        <div className="px-8 py-6">
          {/* Logo */}
          <div className="flex items-center h-[48px] py-[8px] mb-4">
            <LogoFinamDiary />
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.4px] text-text-primary mb-1.5">
              {t('modal.welcome')}
            </h1>
            <p className="text-base leading-6 tracking-[-0.2px] text-text-secondary">
              {t('modal.enterCredentials')}
            </p>
          </div>

          {/* Segmented Control */}
          <SegmentedControl
            segments={[
              { label: t('modal.loginTab'), value: 'login' },
              { label: t('modal.registerTab'), value: 'register' },
            ]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as 'login' | 'register')}
            className="mb-8"
          />

          {/* Form */}
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default WelcomeAuthModal;
