'use client';

import React, { useEffect, useState } from 'react';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import ProfileNav from '@/features/profile/components/ProfileNav';
import type { ProfileSection } from '@/features/profile/components/ProfileNav';
import MyProfileSection from '@/features/profile/components/sections/MyProfileSection';
import GeneralSection from '@/features/profile/components/sections/GeneralSection';
import PortfoliosSection from '@/features/profile/components/sections/PortfoliosSection';
import TariffSection from '@/features/profile/components/sections/TariffSection';
import PaymentsSection from '@/features/profile/components/sections/PaymentsSection';
import LegalSection from '@/features/profile/components/sections/LegalSection';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';

const SECTION_MAP: Record<ProfileSection, React.ReactNode> = {
  'my-profile': <MyProfileSection />,
  general: <GeneralSection />,
  portfolios: <PortfoliosSection />,
  tariff: <TariffSection />,
  payments: <PaymentsSection />,
  legal: <LegalSection />,
};

interface Props {
  section: ProfileSection;
}

const ProfilePageNew: React.FC<Props> = ({ section }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { t } = useTranslation('profile');

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpen]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProfileHeader />

      <div className="flex-1 relative overflow-hidden top-[74px] bg-background-base">
        <ProfileNav
          activeSection={section}
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
        />

        <main className="h-full overflow-y-auto flex flex-col lg:items-center items-end pr-spacing-32 pt-spacing-64">
          <button
            type="button"
            className="self-start md:hidden mb-spacing-16 flex items-center gap-spacing-8 text-text-secondary"
            onClick={() => setIsNavOpen(true)}
            aria-label={t('nav.openMenu')}
          >
            <Icon variant="more" size={20} />
          </button>

          {SECTION_MAP[section]}
        </main>
      </div>
    </div>
  );
};

export default ProfilePageNew;
