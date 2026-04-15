import { cn } from '@/shared/utils/cn';
import React, { type ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n/client';

import { Icon } from '@/shared/ui/Icon/Icon';
import TickerIcon from '@/shared/ui/TickerIcon';
import { InputBadge, InputBadgeEditable } from '@/shared/ui/InputBadge';
import type { EditableTitleConfig } from '@/shared/ui/Modal/Modal.types';

/* ───────── Types ───────── */

export type CardControlsMode = 'card' | 'modal' | 'fullscreen';

export interface CardControlsProps {
  /** Display mode */
  mode?: CardControlsMode;

  /* ── Left side ── */
  /** Static label text (used in card mode) */
  label?: string;
  /** Label background color (CSS hex) */
  labelColor?: string;
  /** Editable label config (used in modal/fullscreen) */
  editableLabel?: EditableTitleConfig;
  /** Color picker widget rendered next to editable label */
  colorWidget?: ReactNode;
  /** Content rendered before label (e.g. back button) */
  leftContent?: ReactNode;
  /** Content rendered right after the label badge (e.g. portfolio name + value) */
  afterLabelContent?: ReactNode;

  /* ── Right side: tag slot ── */
  /** Ticker symbol logo URL (for tag slot) */
  tickerLogo?: string;
  /** Ticker symbol text (for tag slot) */
  ticker?: string;
  /** Ticker security ID (for TickerIcon fallback) */
  tickerSecurityId?: number;
  /** Card type — used to determine tag slot content */
  cardType?: string;

  /* ── Right side: time ── */
  /** Time string (e.g. "14:23") */
  time?: string;

  /* ── Right side: ticker click ── */
  /** Click handler for the ticker tag slot (icon + name) */
  onTickerClick?: (ticker: string) => void;

  /* ── Right side: custom content ── */
  /** Custom content rendered as first element in the right-side group */
  rightContent?: React.ReactNode;

  /* ── Right side: action buttons (modal/fullscreen only) ── */
  /** More button click handler (noop placeholder OK) */
  onMore?: (e: React.MouseEvent) => void;
  /** Expand/collapse button click handler */
  onExpand?: () => void;
  /** Close button click handler */
  onClose?: (e: React.MouseEvent) => void;
  /** Tooltip text shown on the close button (e.g. "Save and close") */
  closeTooltip?: string;

  /** Additional CSS classes */
  className?: string;
}

/* ───────── Re-export InputBadge for backwards compat ───────── */

export { InputBadge, InputBadge as LabelBadge } from '@/shared/ui/InputBadge';

/* ───────── Sub-components ───────── */

function TagSlot({
  tickerLogo,
  ticker,
  tickerSecurityId,
  cardType,
  onTickerClick,
}: {
  tickerLogo?: string;
  ticker?: string;
  tickerSecurityId?: number;
  cardType?: string;
  onTickerClick?: (ticker: string) => void;
}) {
  const { t } = useTranslation('board');

  // AI Response badge
  if (cardType === 'ai_response') {
    return (
      <div className="flex items-center gap-spacing-4 h-spacing-24">
        <Icon variant="ai" size={20} />
        <span className="font-normal text-14 leading-20 tracking-tight-1 text-blackinverse-a56 whitespace-nowrap">
          {t('cardControls.aiResponse')}
        </span>
      </div>
    );
  }

  // Ticker tag (for ticker-bound cards)
  if (!tickerLogo && !ticker) return null;

  const isClickable = !!(onTickerClick && ticker);

  return (
    <div
      className={cn('flex items-center gap-spacing-4 h-spacing-24', {
        'cursor-pointer': isClickable,
      })}
      {...(isClickable
        ? {
            role: 'button',
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onTickerClick(ticker);
            },
          }
        : {})}
    >
      {ticker && (
        <TickerIcon symbol={ticker} securityId={tickerSecurityId} size={20} />
      )}
      {ticker && (
        <span className="font-semibold text-14 leading-20 tracking-tight-1 text-blackinverse-a56 whitespace-nowrap overflow-hidden text-ellipsis">
          {ticker}
        </span>
      )}
    </div>
  );
}

function ActionButtons({
  mode,
  onMore,
  onExpand,
  onClose,
  closeTooltip,
}: {
  mode: CardControlsMode;
  onMore?: (e: React.MouseEvent) => void;
  onExpand?: () => void;
  onClose?: (e: React.MouseEvent) => void;
  closeTooltip?: string;
}) {
  if (mode === 'card') return null;

  const expandIcon = mode === 'modal' ? 'expand' : 'collapse';

  return (
    <div className="flex items-center gap-spacing-2 h-spacing-24">
      {/* More button (···) */}
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          className="flex items-center justify-center w-spacing-24 h-spacing-24 rotate-90 text-blackinverse-a56 hover:text-blackinverse-a88 transition-colors"
          aria-label="More actions"
        >
          <Icon variant="more" size={16} />
        </button>
      )}

      {/* Expand / Collapse */}
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          className="flex items-center justify-center w-spacing-24 h-spacing-24 text-blackinverse-a56 hover:text-blackinverse-a88 transition-colors"
          aria-label={mode === 'modal' ? 'Expand' : 'Collapse'}
        >
          <Icon variant={expandIcon} size={16} />
        </button>
      )}

      {/* Close */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-spacing-24 h-spacing-24 text-blackinverse-a56 hover:text-blackinverse-a88 transition-colors"
          aria-label={closeTooltip || 'Close'}
          title={closeTooltip}
        >
          <Icon variant="close" size={16} />
        </button>
      )}
    </div>
  );
}

/* ───────── Main component ───────── */

/**
 * CardControls — Unified header controls bar for all card display modes.
 *
 * Structure: [leftContent?] [Label] ... [tag slot?] [time] [action buttons?]
 *
 * - mode='card': static label, no action buttons
 * - mode='modal': editable label + colorWidget, more/expand/close buttons
 * - mode='fullscreen': editable label + colorWidget, more/collapse/close buttons
 */
const CardControls: React.FC<CardControlsProps> = ({
  mode = 'card',
  label,
  labelColor,
  editableLabel,
  colorWidget,
  leftContent,
  afterLabelContent,
  rightContent,
  tickerLogo,
  ticker,
  tickerSecurityId,
  onTickerClick,
  cardType,
  time,
  onMore,
  onExpand,
  onClose,
  closeTooltip,
  className,
}) => {
  return (
    <div
      className={cn('flex items-center gap-spacing-14 justify-end', className)}
    >
      {/* Left: Label area */}
      <div className="flex flex-1 min-w-0 items-center gap-spacing-4 h-spacing-24">
        {leftContent}
        {editableLabel ? (
          <InputBadgeEditable
            config={editableLabel}
            colorWidget={colorWidget}
          />
        ) : (
          <InputBadge label={label} labelColor={labelColor} />
        )}
        {afterLabelContent}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-spacing-16 shrink-0">
        {rightContent}
        <TagSlot
          tickerLogo={tickerLogo}
          ticker={ticker}
          tickerSecurityId={tickerSecurityId}
          cardType={cardType}
          onTickerClick={onTickerClick}
        />

        {/* Time */}
        {time && (
          <div className="flex items-center self-stretch">
            <span className="font-normal text-14 leading-20 tracking-tight-1 text-blackinverse-a56 whitespace-nowrap overflow-hidden text-ellipsis">
              {time}
            </span>
          </div>
        )}

        <ActionButtons
          mode={mode}
          onMore={onMore}
          onExpand={onExpand}
          onClose={onClose}
          closeTooltip={closeTooltip}
        />
      </div>
    </div>
  );
};

export default CardControls;
