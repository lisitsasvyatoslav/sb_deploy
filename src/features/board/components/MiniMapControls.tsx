import Button from '@/shared/ui/Button';
import { LAYOUT_CONSTANTS } from '@/shared/constants/layout';
import Image from 'next/image';
import { useChatStore } from '@/stores/chatStore';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { m } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

interface MiniMapControlsProps {
  showMiniMap?: boolean;
  onMiniMapClick?: () => void;
}

const MiniMapControls: React.FC<MiniMapControlsProps> = ({
  showMiniMap = false,
  onMiniMapClick,
}) => {
  const { getZoom, zoomIn, zoomOut } = useReactFlow();

  // Get sidebar states to calculate left offset
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isExploreOpen = useNewsSidebarStore((state) => state.isOpen);
  const { isChatSidebarOpen, activeChatId, chatWidth } = useChatStore();
  const isChatOpen = isChatSidebarOpen || activeChatId !== null;
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);
  const zoomCheckRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Проверяем пределы зума
  const checkZoomLimits = useCallback(() => {
    const currentZoom = getZoom();
    const maxZoom = 2; // Максимальный зум
    const minZoom = 0.025; // Минимальный зум (увеличен в 4 раза для большего zoom out)

    setCanZoomIn(currentZoom < maxZoom);
    setCanZoomOut(currentZoom > minZoom);
  }, [getZoom]);

  useEffect(() => {
    checkZoomLimits();

    // Проверяем пределы при изменении зума (более эффективно через события)
    const interval = setInterval(checkZoomLimits, 200); // Увеличили интервал

    return () => clearInterval(interval);
  }, [checkZoomLimits]);

  const handleZoomIn = useCallback(() => {
    if (canZoomIn) {
      zoomIn();
      clearTimeout(zoomCheckRef.current);
      zoomCheckRef.current = setTimeout(checkZoomLimits, 50);
    }
  }, [canZoomIn, zoomIn, checkZoomLimits]);

  const handleZoomOut = useCallback(() => {
    if (canZoomOut) {
      zoomOut();
      clearTimeout(zoomCheckRef.current);
      zoomCheckRef.current = setTimeout(checkZoomLimits, 50);
    }
  }, [canZoomOut, zoomOut, checkZoomLimits]);

  // Cleanup zoom check timer on unmount
  useEffect(() => {
    return () => clearTimeout(zoomCheckRef.current);
  }, []);

  // Calculate left offset based on open panels
  const sidebarWidth = isCollapsed
    ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH
    : LAYOUT_CONSTANTS.SIDEBAR_EXPANDED_WIDTH;

  const exploreWidth = isExploreOpen
    ? LAYOUT_CONSTANTS.SIDEBAR_CONTENT_WIDTH + LAYOUT_CONSTANTS.SIDEBAR_MARGIN
    : 0;

  const chatPanelWidth = isChatOpen ? chatWidth : 0;

  const leftOffset = sidebarWidth + exploreWidth + chatPanelWidth + 24; // 24px base margin

  return (
    <m.div
      className="fixed bottom-6 z-[1200] flex items-center gap-3"
      animate={{ left: leftOffset }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      {/* Mini Map Button */}
      <div className="flex items-center gap-2 theme-surface theme-border rounded-[20px] px-1 py-2 h-10">
        <Button
          onClick={onMiniMapClick}
          variant="ghost"
          size="sm"
          icon={
            <Image
              src="/images/map-outline.svg"
              alt="Mini Map"
              className="w-4 h-4 theme-icon-invert"
              width={16}
              height={16}
            />
          }
          className={`!p-2 !rounded-[10px] !w-8 !h-8 ${
            showMiniMap ? '!bg-blue-500/10 hover:!bg-blue-500/20' : ''
          }`}
          aria-label="Mini Map"
        />
      </div>

      {/* Zoom Controls Container */}
      <div className="flex items-center gap-2 theme-surface theme-border rounded-[20px] px-1 py-2 h-10">
        {/* Zoom Out Button */}
        <Button
          onClick={handleZoomOut}
          disabled={!canZoomOut}
          variant="ghost"
          size="sm"
          icon={
            <Image
              src="/images/minus.svg"
              alt="Zoom Out"
              className={`w-4 h-4 theme-icon-invert ${!canZoomOut ? 'grayscale brightness-50' : ''}`}
              width={16}
              height={16}
            />
          }
          className="!p-2 !rounded-[10px] !w-8 !h-8"
          aria-label="Zoom Out"
        />

        {/* Vertical Divider */}
        <div className="w-px h-4 bg-[var(--border-light)] self-center" />

        {/* Zoom In Button */}
        <Button
          onClick={handleZoomIn}
          disabled={!canZoomIn}
          variant="ghost"
          size="sm"
          icon={
            <Image
              src="/images/plus.svg"
              alt="Zoom In"
              className={`w-4 h-4 theme-icon-invert ${!canZoomIn ? 'grayscale brightness-50' : ''}`}
              width={16}
              height={16}
            />
          }
          className="!p-2 !rounded-[10px] !w-8 !h-8"
          aria-label="Zoom In"
        />
      </div>
    </m.div>
  );
};

export default MiniMapControls;
