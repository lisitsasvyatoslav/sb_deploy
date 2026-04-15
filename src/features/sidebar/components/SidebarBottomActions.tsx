'use client';

import React from 'react';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import { SidebarNavItem } from '@/shared/ui/SidebarNav';
import Switch from '@/shared/ui/Switch';
import { useTranslation } from '@/shared/i18n/client';
import { type IconVariant } from '@/shared/ui/Icon';
import { useSidebarContext } from './SidebarContext';

/* ── Helpers ── */

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface ActionItemProps {
  icon: IconVariant | React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  rightArea?: React.ReactNode;
}

/**
 * ActionItem — itemSwitchSidebar
 *
 * Figma node: 65691:17935
 */
const ActionItem: React.FC<ActionItemProps> = React.memo(
  ({ icon, label, isActive, onClick, rightArea }) => {
    const { isCollapsed } = useSidebarContext();

    return (
      <SidebarNavItem
        icon={icon}
        label={label}
        isActive={isActive}
        isCollapsed={isCollapsed}
        tooltip={label}
        onClick={onClick}
        rightArea={
          rightArea ? (
            <div className="flex flex-col justify-center items-end py-spacing-2 pr-spacing-2 pl-spacing-10">
              {rightArea}
            </div>
          ) : undefined
        }
      />
    );
  }
);
ActionItem.displayName = 'ActionItem';

/* ── Component ── */

interface SidebarBottomActionsProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenSupport: () => void;
}

const SidebarBottomActions: React.FC<SidebarBottomActionsProps> = ({
  isChatOpen,
  onToggleChat,
  onOpenSupport,
}) => {
  const { isDemo } = useSidebarContext();
  const { t } = useTranslation('common');
  const { isOpen: isExploreOpen, toggle: toggleExplore } =
    useNewsSidebarStore();

  return (
    <div className="flex flex-col gap-spacing-2">
      {!isDemo && (
        <ActionItem
          icon="megaphone"
          label={t('sidebar.explore')}
          isActive={isExploreOpen}
          onClick={toggleExplore}
          rightArea={
            <Switch
              checked={isExploreOpen}
              onChange={toggleExplore}
              onClick={stopPropagation}
            />
          }
        />
      )}

      <ActionItem
        icon="ai"
        label={t('sidebar.aiChat')}
        isActive={isChatOpen}
        onClick={onToggleChat}
        rightArea={
          <Switch
            checked={isChatOpen}
            onChange={onToggleChat}
            onClick={stopPropagation}
          />
        }
      />

      {!isDemo && (
        <ActionItem
          icon="questionMarkCircle"
          label={t('sidebar.support')}
          onClick={onOpenSupport}
        />
      )}
    </div>
  );
};

export default React.memo(SidebarBottomActions);
