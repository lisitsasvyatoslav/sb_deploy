'use client';

import React from 'react';
import { SidebarNavItem } from '@/shared/ui/SidebarNav';
import { useTranslation } from '@/shared/i18n/client';
import { getClientRegion } from '@/shared/config/region';
import { type IconVariant } from '@/shared/ui/Icon';
import { useSidebarContext } from './SidebarContext';

type CommunityLabelKey = 'sidebar.telegramChannel' | 'sidebar.discordServer';

const COMMUNITY_CONFIG: Record<
  string,
  { icon: IconVariant; labelKey: CommunityLabelKey; url: string }
> = {
  ru: {
    icon: 'telegram',
    labelKey: 'sidebar.telegramChannel',
    url: 'https://t.me/+sT39l5GVcGljOTdi',
  },
  us: { icon: 'discord', labelKey: 'sidebar.discordServer', url: '#' }, // TODO: add Discord URL
};

const SidebarCommunityLink: React.FC = () => {
  const { isCollapsed } = useSidebarContext();
  const { t } = useTranslation('common');

  const region = getClientRegion();
  const config = COMMUNITY_CONFIG[region] ?? COMMUNITY_CONFIG.ru;
  const label = t(config.labelKey);

  const handleClick = () => {
    if (config.url !== '#') {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <SidebarNavItem
      icon={config.icon}
      label={label}
      isCollapsed={isCollapsed}
      tooltip={label}
      onClick={handleClick}
    />
  );
};

export default React.memo(SidebarCommunityLink);
