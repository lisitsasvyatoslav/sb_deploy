'use client';

import { useCallback } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useChatStore } from '@/stores/chatStore';

interface SidebarProps {
  mode?: 'default' | 'demo';
  isChatOpen?: boolean;
  onToggleChat?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export function useSidebarEffectiveState(props: SidebarProps) {
  const {
    mode = 'default',
    isChatOpen: isChatOpenProp,
    onToggleChat: onToggleChatProp,
    isCollapsed: isCollapsedProp,
    onToggleCollapsed: onToggleCollapsedProp,
  } = props;

  const isDemo = mode === 'demo';

  // Store state (always called for hooks rules)
  const {
    isCollapsed: storeIsCollapsed,
    toggleCollapsed: storeToggleCollapsed,
  } = useSidebarStore();

  const { isChatSidebarOpen, activeChatId } = useChatStore();

  const storeChatOpen = isChatSidebarOpen || activeChatId !== null;

  // Effective state: use props in demo mode, stores in default mode
  const isCollapsed = isDemo ? (isCollapsedProp ?? false) : storeIsCollapsed;

  const toggleCollapsed = isDemo
    ? (onToggleCollapsedProp ?? noop)
    : storeToggleCollapsed;

  const isChatOpen = isDemo ? (isChatOpenProp ?? false) : storeChatOpen;

  const handleToggleChat = useCallback(() => {
    if (isDemo) {
      onToggleChatProp?.();
      return;
    }
    const { isChatSidebarOpen, activeChatId, closeAll, openSidebar } =
      useChatStore.getState();
    const isCurrentlyOpen = isChatSidebarOpen || activeChatId !== null;

    if (isCurrentlyOpen) {
      closeAll();
    } else {
      openSidebar();
    }
  }, [isDemo, onToggleChatProp]);

  return {
    isDemo,
    isCollapsed,
    toggleCollapsed,
    isChatOpen,
    handleToggleChat,
  };
}
