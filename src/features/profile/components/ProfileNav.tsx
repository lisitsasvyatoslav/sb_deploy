'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { type IconVariant } from '@/shared/ui/Icon';
import { SidebarNavItem } from '@/shared/ui/SidebarNav';
import { useTranslation } from '@/shared/i18n/client';
import { useSettingsNavStore } from '@/stores/settingsNavStore';
import { cn } from '@/shared/utils/cn';

export type ProfileSection =
  | 'my-profile'
  | 'general'
  | 'portfolios'
  | 'tariff'
  | 'payments'
  | 'legal';

interface NavItemConfig {
  id: ProfileSection;
  iconVariant: IconVariant;
}

const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  { id: 'my-profile', iconVariant: 'userRound' },
  { id: 'general', iconVariant: 'settings' },
  { id: 'portfolios', iconVariant: 'folder' },
  // TODO: replace chartPie with briefcase once briefcase is added to IconVariant
  { id: 'tariff', iconVariant: 'chartPie' },
  { id: 'payments', iconVariant: 'wallet' },
  { id: 'legal', iconVariant: 'docOutline' },
];

// Explicit label key map — avoids runtime string manipulation and keeps TypeScript narrowing
const NAV_LABEL_KEYS = {
  'my-profile': 'nav.myProfile',
  general: 'nav.general',
  portfolios: 'nav.portfolios',
  tariff: 'nav.tariff',
  payments: 'nav.payments',
  legal: 'nav.legal',
} as const;

interface ProfileNavProps {
  activeSection: ProfileSection;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const ProfileNav: React.FC<ProfileNavProps> = ({
  activeSection,
  isOpen,
  onClose,
  className,
}) => {
  const router = useRouter();
  const { t } = useTranslation('profile');
  const consumeReferrer = useSettingsNavStore((state) => state.consumeReferrer);

  const handleSelect = (id: ProfileSection) => {
    router.push(`/profile/${id}`);
    onClose?.();
  };

  return (
    <>
      <nav
        className={cn(
          'flex flex-col gap-[2px] shrink-0',
          'md:absolute md:left-[60px] md:translate-x-0 md:w-[212px]',
          'fixed inset-y-0 left-0 z-50 w-[212px]',
          'transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        {/* Back button */}
        <Button
          size="md"
          variant="ghost"
          icon="chevronLeft"
          onClick={() => {
            onClose?.();
            router.push(consumeReferrer());
          }}
          className="mb-4 self-start"
        >
          {t('nav.back')}
        </Button>

        {/* Nav items */}
        {NAV_ITEMS_CONFIG.map((item) => (
          <SidebarNavItem
            key={item.id}
            icon={item.iconVariant}
            label={t(NAV_LABEL_KEYS[item.id])}
            isActive={activeSection === item.id}
            onClick={() => handleSelect(item.id)}
          />
        ))}
      </nav>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
    </>
  );
};

export default ProfileNav;
