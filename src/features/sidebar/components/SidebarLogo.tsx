'use client';

/**
 * SidebarLogo — sidebarTop/Default + sidebarTop/Mini
 *
 * Figma node: 65719:32267
 */

import React, { useState, useRef } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { cn } from '@/shared/utils/cn';
import { useSidebarContext } from './SidebarContext';
import Tooltip from '@/shared/ui/Tooltip';
import { Logo } from '@/shared/ui/Logo';
import SidebarItemBase from '@/shared/ui/SidebarNav/SidebarItemBase';

const SidebarLogo: React.FC = () => {
  const { isCollapsed, toggleCollapsed } = useSidebarContext();
  const { t } = useTranslation('common');
  // isHovered is only used to control Tooltip visibility in collapsed mode
  const [isHovered, setIsHovered] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const renderContent = () => {
    if (isCollapsed) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <span className="group-hover:hidden">
            <Logo isCollapsed={true} />
          </span>
          <span className="hidden group-hover:flex items-center">
            <Icon variant="sidebarPanel" size={20} className="text-current" />
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between w-full h-full py-spacing-12 px-spacing-14">
        <Logo isCollapsed={false} />
        <Icon
          variant="sidebarPanel"
          size={20}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-current"
        />
      </div>
    );
  };

  return (
    <SidebarItemBase
      ref={anchorRef}
      onClick={toggleCollapsed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={
        isCollapsed ? t('sidebar.showPanel') : t('sidebar.collapsePanel')
      }
      className={cn(
        'relative flex items-center cursor-pointer shrink-0 h-spacing-48',
        'text-texticon-black_inverse_a100 hover:text-texticon-black_inverse_a100'
      )}
    >
      {renderContent()}
      {isCollapsed && isHovered && (
        <Tooltip
          content={t('sidebar.showPanel')}
          show={true}
          portal
          anchorRef={anchorRef}
          position="right"
        />
      )}
    </SidebarItemBase>
  );
};

export default React.memo(SidebarLogo);
