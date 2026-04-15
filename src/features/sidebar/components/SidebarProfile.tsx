'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsNavStore } from '@/stores/settingsNavStore';
import Avatar from '@/shared/ui/Avatar';
import { SidebarNavItem } from '@/shared/ui/SidebarNav';
import ProfileDropdown from '@/features/profile/components/ProfileDropdown';
import { useTranslation } from '@/shared/i18n/client';
import { useSidebarContext } from './SidebarContext';

const SidebarProfile: React.FC = () => {
  const { isCollapsed } = useSidebarContext();
  const currentUser = useAuthStore((state) => state.currentUser);
  const avatarUrl = useAuthStore((state) => state.avatarUrl);
  const router = useRouter();
  const { t } = useTranslation('common');
  const saveReferrer = useSettingsNavStore((state) => state.saveReferrer);

  const goToProfile = useCallback(() => {
    saveReferrer();
    router.push('/profile');
  }, [router, saveReferrer]);
  const userDisplayName = useMemo(() => {
    if (!currentUser) return t('sidebar.profile');
    const namePart = currentUser.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }, [currentUser, t]);

  const userInitials = useMemo(() => {
    if (!currentUser) return 'U';
    return currentUser.charAt(0).toUpperCase();
  }, [currentUser]);

  const avatarNode = useMemo(
    () => <Avatar size={20} initials={userInitials} src={avatarUrl} />,
    [userInitials, avatarUrl]
  );

  return (
    <ProfileDropdown
      onSettingsClick={goToProfile}
      trigger={({ onClick, triggerRef }) => (
        <div ref={triggerRef}>
          <SidebarNavItem
            icon={avatarNode}
            label={isCollapsed ? t('sidebar.settings') : userDisplayName}
            isCollapsed={isCollapsed}
            tooltip={t('sidebar.settings')}
            onClick={onClick}
          />
        </div>
      )}
    />
  );
};

export default React.memo(SidebarProfile);
