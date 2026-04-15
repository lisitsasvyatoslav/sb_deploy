'use client';

import React, { useCallback, useState } from 'react';
import { LAYOUT_CONSTANTS } from '@/shared/constants/layout';
import { m } from 'framer-motion';
import { useOnboardingUIStore } from '@/features/onboarding/stores/onboardingUIStore';
import { SidebarProvider } from './SidebarContext';
import { useSidebarEffectiveState } from '@/features/sidebar/hooks/useSidebarEffectiveState';
import { useSidebarNavItems } from '@/features/sidebar/hooks/useSidebarNavItems';
import SidebarLogo from './SidebarLogo';
import SidebarNavSection from './SidebarNavSection';
import SidebarBottomActions from './SidebarBottomActions';
import SidebarProfile from './SidebarProfile';
import SidebarDemoLogin from './SidebarDemoLogin';
import SidebarCreateBoardDialog from './SidebarCreateBoardDialog';
import { SupportModal } from '@/features/support';

interface SidebarProps {
  mode?: 'default' | 'demo';
  isChatOpen?: boolean;
  onToggleChat?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { isDemo, isCollapsed, toggleCollapsed, isChatOpen, handleToggleChat } =
    useSidebarEffectiveState(props);
  const { navItems, submenuItemsMap, hasBrokerConnections } =
    useSidebarNavItems(isDemo);
  const isGuideOpen = useOnboardingUIStore((s) => s.isGuideOpen);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const closeCreateDialog = useCallback(() => setShowCreateDialog(false), []);

  const sidebarWidth = isCollapsed
    ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH
    : LAYOUT_CONSTANTS.SIDEBAR_EXPANDED_WIDTH;

  return (
    <SidebarProvider
      value={{
        isDemo,
        isCollapsed,
        toggleCollapsed,
      }}
    >
      <m.div
        data-glow-container
        data-glow-active={isGuideOpen || undefined}
        className="flex flex-col h-full flex-shrink-0 overflow-hidden bg-sidebar-bg backdrop-blur-ultra relative z-[51]"
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        {/* Gradient right border */}
        <div className="sidebar-border-gradient absolute top-0 right-0 w-px h-full pointer-events-none z-10" />

        {/* Top section */}
        <div className="flex flex-col gap-spacing-24 min-h-0 overflow-hidden">
          <SidebarLogo />
          <SidebarNavSection
            navItems={navItems}
            submenuItemsMap={submenuItemsMap}
            hasBrokerConnections={hasBrokerConnections}
            onCreateBoard={() => setShowCreateDialog(true)}
          />
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-spacing-16 pb-spacing-8 flex-shrink-0 mt-auto">
          <SidebarBottomActions
            isChatOpen={isChatOpen}
            onToggleChat={handleToggleChat}
            onOpenSupport={() => setShowSupportModal(true)}
          />
          {isDemo ? <SidebarDemoLogin /> : <SidebarProfile />}
        </div>
      </m.div>

      <SidebarCreateBoardDialog
        open={showCreateDialog}
        onClose={closeCreateDialog}
      />

      <SupportModal
        open={showSupportModal}
        onOpenChange={setShowSupportModal}
      />
    </SidebarProvider>
  );
};

export default Sidebar;
