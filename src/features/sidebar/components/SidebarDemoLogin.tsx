'use client';

import React from 'react';
import { useAuthModalStore } from '@/stores/authModalStore';
import { SidebarNavItem } from '@/shared/ui/SidebarNav';
import { useTranslation } from '@/shared/i18n/client';
import { useSidebarContext } from './SidebarContext';

const SidebarDemoLogin: React.FC = () => {
  const { isCollapsed } = useSidebarContext();
  const { openModal } = useAuthModalStore();
  const { t } = useTranslation('common');

  return (
    <SidebarNavItem
      icon="userRound"
      label={t('sidebar.login')}
      onClick={() => openModal('login')}
      isCollapsed={isCollapsed}
      tooltip={t('sidebar.login')}
    />
  );
};

export default React.memo(SidebarDemoLogin);
