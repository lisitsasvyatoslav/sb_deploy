import { useCallback, useEffect, useRef, useState } from 'react';

interface UseChatExpandedLayoutParams {
  isChatExpanded: boolean;
  setChatExpanded: (expanded: boolean) => void;
  showChatWindow: boolean;
  sidebarWidth: number;
}

export function useChatExpandedLayout({
  isChatExpanded,
  setChatExpanded,
  showChatWindow,
  sidebarWidth,
}: UseChatExpandedLayoutParams) {
  // Keep fixed position during collapse animation to avoid layout shift
  const [isCollapsing, setIsCollapsing] = useState(false);
  const prevExpandedRef = useRef(isChatExpanded);

  const [expandedViewportWidth, setExpandedViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth - sidebarWidth : 1024
  );

  useEffect(() => {
    if (!isChatExpanded) return;
    const update = () =>
      setExpandedViewportWidth(window.innerWidth - sidebarWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isChatExpanded, sidebarWidth]);

  // Reset expanded when chat closed; track expanded->collapsed so we keep fixed until width animation completes
  useEffect(() => {
    if (!showChatWindow) {
      setChatExpanded(false);
      setIsCollapsing(false);
      prevExpandedRef.current = false; // reset so selecting next chat doesn't trigger spurious collapse
    } else {
      if (prevExpandedRef.current && !isChatExpanded) {
        setIsCollapsing(true);
      } else if (isChatExpanded) {
        setIsCollapsing(false);
      }
      prevExpandedRef.current = isChatExpanded;
    }
  }, [isChatExpanded, showChatWindow, setChatExpanded]);

  // Reset expanded state on unmount
  useEffect(() => {
    return () => setChatExpanded(false);
  }, [setChatExpanded]);

  const handleCollapseAnimationComplete = useCallback(() => {
    if (!isChatExpanded) setIsCollapsing(false);
  }, [isChatExpanded]);

  const handleToggleExpand = useCallback(() => {
    setChatExpanded(!isChatExpanded);
  }, [setChatExpanded, isChatExpanded]);

  return {
    isCollapsing,
    expandedViewportWidth,
    handleCollapseAnimationComplete,
    handleToggleExpand,
  };
}
