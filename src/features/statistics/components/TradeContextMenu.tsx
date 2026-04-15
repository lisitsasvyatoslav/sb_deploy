'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTradeDataFetcher } from '../hooks/useTradeDataFetcher';
import {
  DropdownCompound,
  useDropdownContext,
  DropdownItemButton,
  DROPDOWN_CONTAINER_CLASSES,
} from '@/shared/ui/Dropdown';
import Snackbar from '@/shared/ui/Snackbar';
import { useTranslation } from '@/shared/i18n/client';
import { logger } from '@/shared/utils/logger';
import type { ChildSelection } from '../hooks/useTradeContextMenu';
import type { ChatTradesLabelType } from '@/stores/chatStore';

export type { ChildSelection };

interface TradeContextMenuProps {
  /** Anchor position: clickX for horizontal, rowRect for vertical; null = hidden */
  anchor: { clickX: number; rowBottom: number } | null;
  tradeIds?: number[];
  tickerSecurityIds: Record<string, number | null>;
  /** When tradeIds is empty, fetch all trades for these symbols on demand */
  symbols?: string[];
  /** Account-level selections (child rows); trades fetched with accountId filter */
  childSelections?: ChildSelection[];
  /** Label type for the chat chip: 'positions' | 'tickers' | 'trades' */
  labelType?: ChatTradesLabelType;
  onClose: () => void;
  /** Ref to the table container — clicks inside it should not close the menu */
  tableRef?: React.RefObject<HTMLElement | null>;
}

/** Menu width per Figma spec (node 55089:9408) */
const MENU_WIDTH = 168;

/** Approximate menu height for vertical clamping */
const MENU_HEIGHT_ESTIMATE = 48;

function VirtualTrigger({
  clickX,
  rowBottom,
}: {
  clickX: number;
  rowBottom: number;
}) {
  const { triggerRef } = useDropdownContext();
  const left = Math.max(
    8,
    Math.min(clickX - MENU_WIDTH / 2, window.innerWidth - MENU_WIDTH - 8)
  );
  const top = Math.min(
    rowBottom,
    window.innerHeight - MENU_HEIGHT_ESTIMATE - 8
  );
  logger.debug('TradeContextMenu', 'VirtualTrigger render', {
    left,
    top,
    clickX,
    rowBottom,
  });
  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      style={{
        position: 'fixed',
        left,
        top,
        width: MENU_WIDTH,
        height: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

const TradeContextMenu: React.FC<TradeContextMenuProps> = ({
  anchor,
  tradeIds = [],
  tickerSecurityIds,
  symbols = [],
  childSelections = [],
  labelType = 'tickers',
  onClose,
  tableRef,
}) => {
  const { t } = useTranslation('statistics');
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Remember last anchor so the exit animation renders at the correct position
  const lastAnchorRef = useRef(anchor);
  useEffect(() => {
    if (anchor) lastAnchorRef.current = anchor;
  }, [anchor]);

  const isOpen = !!anchor;
  const displayAnchor = anchor || lastAnchorRef.current;

  const { isLoading, errorMessage, dismissError, handleAskAI } =
    useTradeDataFetcher({
      tradeIds,
      symbols,
      childSelections,
      tickerSecurityIds,
      labelType,
      onClose,
    });

  logger.debug('TradeContextMenu', 'render', {
    isOpen,
    anchorClickX: anchor?.clickX,
    anchorRowBottom: anchor?.rowBottom,
    symbols,
    tradeIds,
    tickerSecurityIds,
  });

  // Close on click-outside, scroll, wheel, resize, Escape, and sidebar resize.
  // We do NOT rely on DropdownCompound's onOpenChange — we manage close entirely ourselves.
  useEffect(() => {
    if (!isOpen) return;

    logger.debug('TradeContextMenu', 'useEffect: registering close listeners');

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideMenu = menuContentRef.current?.contains(target);
      const insideTable = tableRef?.current?.contains(target);
      logger.debug('TradeContextMenu', 'handleClickOutside', {
        insideMenu,
        insideTable,
      });
      if (insideMenu) return;
      if (insideTable) return;
      logger.debug('TradeContextMenu', 'closing: click outside');
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        logger.debug('TradeContextMenu', 'closing: Escape key');
        onClose();
      }
    };

    const handleScrollClose = () => {
      logger.debug('TradeContextMenu', 'closing: scroll/wheel');
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', handleScrollClose, true);
    document.addEventListener('wheel', handleScrollClose, true);
    window.addEventListener('resize', onClose);

    // Close when main content area resizes (e.g. sidebar open/close via Framer Motion).
    const mainContent = document.querySelector('[data-main-content]');
    let baseWidth: number | undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (baseWidth === undefined) {
        baseWidth = w;
        return;
      }
      if (w !== baseWidth) {
        logger.debug('TradeContextMenu', 'closing: main content resize');
        onClose();
      }
    });
    if (mainContent) ro.observe(mainContent);

    return () => {
      logger.debug(
        'TradeContextMenu',
        'useEffect cleanup: removing close listeners'
      );
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScrollClose, true);
      document.removeEventListener('wheel', handleScrollClose, true);
      window.removeEventListener('resize', onClose);
      ro.disconnect();
    };
  }, [isOpen, onClose, tableRef]);

  // Prevent board's context menu from opening via React synthetic event bubbling
  const stopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  if (!displayAnchor) return null;

  // Use key based on anchor position to force DropdownCompound remount on reposition.
  // This ensures the dropdown menu recalculates its position when anchor moves.
  const anchorKey = `${displayAnchor.clickX}-${displayAnchor.rowBottom}`;

  logger.debug('TradeContextMenu', 'rendering portal', { anchorKey, isOpen });

  return (
    <>
      {errorMessage && (
        <Snackbar
          type="danger"
          message={errorMessage}
          autoHideDuration={4000}
          onClose={dismissError}
        />
      )}
      {createPortal(
        <div
          role="presentation"
          onContextMenu={stopContextMenu}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          {/* onOpenChange is intentionally a no-op: close is managed entirely via
              the useEffect listeners above (click-outside, Escape, scroll, resize).
              Delegating close to DropdownCompound would cause it to fire on table-row
              clicks and clear the selection before the row click handler runs. */}
          <DropdownCompound
            key={anchorKey}
            open={isOpen}
            onOpenChange={() => {}}
          >
            <VirtualTrigger
              clickX={displayAnchor.clickX}
              rowBottom={displayAnchor.rowBottom}
            />
            <DropdownCompound.Menu
              placement="bottom"
              offset={2}
              zIndex={1000}
              usePortal={false}
              className={DROPDOWN_CONTAINER_CLASSES}
              style={{ width: MENU_WIDTH }}
            >
              <div ref={menuContentRef} className="py-spacing-6">
                <DropdownItemButton
                  item={{
                    label: isLoading ? t('trades.loading') : t('askAI'),
                    value: 'askAI',
                    rightIcon: 'aiBold',
                  }}
                  onClick={handleAskAI}
                />
              </div>
            </DropdownCompound.Menu>
          </DropdownCompound>
        </div>,
        document.body
      )}
    </>
  );
};

export default TradeContextMenu;
