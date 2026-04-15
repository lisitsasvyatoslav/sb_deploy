import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import React, { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import type { ExportFormat } from '@/features/board/hooks/useChartExport';
import { GlowBorder, useGlowTarget } from '@/features/onboarding';

/* db-persisted: no-theme — these hex values are stored in the cards.color database column */
export const CARD_COLORS = {
  gray: { background: '#F2F2F7', border: 'rgba(0,0,0,0.1)', dot: '#BCBCC0' },
  yellow: { background: '#FEFDE0', border: '#FFEB3B', dot: '#EBD727' },
  pink: { background: '#FEE0E1', border: '#F7B6E5', dot: '#D998C7' },
  purple: { background: '#EFE0FE', border: '#D1BEFB', dot: '#B3A0DD' },
  blue: { background: '#E0F2FE', border: '#A0DBF6', dot: '#8CC7E2' },
  green: { background: '#E0FEE8', border: '#A7E8BF', dot: '#93D4AB' },
} as const;

export type CardColorId = keyof typeof CARD_COLORS;

export const DEFAULT_CARD_COLOR = CARD_COLORS.gray.background;

// Helper to get color config by background value
export const getCardColorConfig = (background?: string) => {
  const entry = Object.entries(CARD_COLORS).find(
    ([_, config]) => config.background === background
  );
  return entry
    ? { id: entry[0] as CardColorId, ...entry[1] }
    : { id: 'gray' as CardColorId, ...CARD_COLORS.gray };
};

interface CardSelectionToolbarProps {
  visible: boolean;
  x: number;
  y: number;
  selectedCount: number;
  selectedCardType?: string;
  onRename?: () => void;
  onAskAI: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onChangeFilters?: () => void;
  onExport?: (format: ExportFormat) => void;
}

/** Vertical 1px divider matching Figma `Divider` (16px tall, blackinverse-a6) */
const ToolbarDivider: React.FC = () => (
  <div className="w-px h-4 bg-blackinverse-a6 shrink-0" />
);

/**
 * CardSelectionToolbar — floating toolbar for selected cards on the board.
 *
 * Figma node: 1437:1448 (controls component inside card active state)
 * Container: bg-background-gray_high, backdrop-blur-effects-panel, shadow-effects-panel,
 *            border 1px blackinverse-a4, padding 2px, border-radius radius-2
 * Buttons: ghost/SM from Button DS component
 * Delete: icon-only xs negative button (32x32)
 */
export const CardSelectionToolbar: React.FC<CardSelectionToolbarProps> = ({
  visible,
  x,
  y,
  selectedCount,
  selectedCardType,
  onRename,
  onAskAI,
  onOpen,
  onDelete,
  onChangeFilters,
  onExport,
}) => {
  const { t } = useTranslation('board');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const toolbarGlow = useGlowTarget('board-toolbar');

  useClickOutside(downloadRef, () => setShowDownloadMenu(false));

  // Close download menu when toolbar becomes hidden
  useEffect(() => {
    if (!visible) setShowDownloadMenu(false);
  }, [visible]);

  if (!visible) return null;

  const labelSuffix = selectedCount > 1 ? ` (${selectedCount})` : '';

  const showOpen =
    selectedCardType !== 'strategy' &&
    selectedCardType !== 'news_feed' &&
    selectedCardType !== 'ai_screener' &&
    selectedCardType !== 'screener_forecast' &&
    selectedCardType !== 'trading_idea';
  const isChartExport = selectedCardType === 'chart' && onExport;

  return (
    <div
      className="fixed z-40"
      style={{
        left: x,
        top: y,
        transform: 'translateX(-50%)',
      }}
    >
      <GlowBorder active={toolbarGlow} borderRadius={8} borderWidth={3}>
        <div className="flex items-center p-[2px] rounded-radius-2 bg-background-gray_high backdrop-blur-effects-panel shadow-effects-panel border border-blackinverse-a4">
          {/* Rename — only for single card selection */}
          {onRename && selectedCount === 1 && (
            <Button
              type="button"
              onClick={onRename}
              variant="ghost"
              size="sm"
              icon="edit"
            >
              {t('toolbar.rename')}
            </Button>
          )}

          {/* Change filters — only for news_feed widget */}
          {onChangeFilters && (
            <Button
              type="button"
              onClick={onChangeFilters}
              variant="ghost"
              size="sm"
              icon="edit"
            >
              {t('toolbar.changeFilters')}
            </Button>
          )}

          {/* Ask AI */}
          <Button
            type="button"
            onClick={onAskAI}
            variant="ghost"
            size="sm"
            icon="ai"
          >
            {t('toolbar.askAI')}
            {labelSuffix}
          </Button>

          {/* Download dropdown — chart cards with PNG/JSON/CSV */}
          {isChartExport && (
            <div className="relative" ref={downloadRef}>
              <Button
                type="button"
                onClick={() => setShowDownloadMenu((v) => !v)}
                variant="ghost"
                size="sm"
                icon="download"
              >
                <span className="flex items-center gap-1">
                  {t('toolbar.download')}
                  <Icon
                    variant="chevronDown"
                    size={14}
                    className="text-[var(--text-primary)]"
                  />
                </span>
              </Button>

              {showDownloadMenu && (
                <div className="absolute top-full left-0 mt-1 flex flex-col gap-[4px] p-[8px] rounded-[4px] bg-background-gray_high border border-blackinverse-a4 shadow-modal backdrop-blur-effects-modal z-50 w-fit">
                  {(['png', 'json', 'csv'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setShowDownloadMenu(false);
                        onExport!(fmt);
                      }}
                      className="flex items-center py-[6px] px-[8px] rounded-[2px] hover:bg-white/[0.08] transition-colors text-left w-full whitespace-nowrap"
                    >
                      <span className="font-inter font-normal text-[13px] leading-[20px] text-[var(--blackinverse-a72)]">
                        {t(`export.${fmt}`)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Open (not shown for strategy or news_feed widget) */}
          {showOpen && (
            <Button
              type="button"
              onClick={onOpen}
              variant="ghost"
              size="sm"
              icon="expand"
            >
              {t('toolbar.open')}
            </Button>
          )}

          {/* Divider before delete */}
          <ToolbarDivider />

          {/* Delete — icon-only negative xs */}
          <Button
            type="button"
            onClick={onDelete}
            variant="ghost"
            size="xs"
            icon="trash"
            aria-label={t('toolbar.delete')}
          />
        </div>
      </GlowBorder>
    </div>
  );
};

export default CardSelectionToolbar;
