import { Icon } from '@/shared/ui/Icon';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useTranslation } from '@/shared/i18n/client';
import { showInfoToast } from '@/shared/utils/toast';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChartExport, type ExportFormat } from '../hooks/useChartExport';

interface CardContextMenuProps {
  cardId: number;
  cardType: string;
  anchorPosition: { x: number; y: number };
  onClose: () => void;
  onAskAI?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const MENU_WIDTH = 220;
const MENU_HEIGHT_ESTIMATE = 220;
const SUBMENU_WIDTH = 200;

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  cardId,
  cardType,
  anchorPosition,
  onClose,
  onAskAI,
  onDelete,
  onDuplicate,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('board');
  const { exportChart } = useChartExport(cardId);
  const [showDownloadSub, setShowDownloadSub] = useState(false);

  const isChart = cardType === 'chart';

  useClickOutside(menuRef, onClose);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(
    anchorPosition.x + 8,
    window.innerWidth - MENU_WIDTH - 8
  );
  const adjustedY = Math.min(
    anchorPosition.y + 8,
    window.innerHeight - MENU_HEIGHT_ESTIMATE
  );

  const handleAskAI = useCallback(() => {
    onAskAI?.();
    onClose();
  }, [onAskAI, onClose]);

  const handleDelete = useCallback(() => {
    onDelete?.();
    onClose();
  }, [onDelete, onClose]);

  const handleDuplicate = useCallback(() => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      showInfoToast(t('toast.comingSoon'));
    }
    onClose();
  }, [onDuplicate, t, onClose]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      onClose();
      await exportChart(format);
    },
    [exportChart, onClose]
  );

  // Determine submenu position (right or left of main menu)
  const subMenuOnRight =
    adjustedX + MENU_WIDTH + SUBMENU_WIDTH < window.innerWidth;

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[1600] flex flex-col gap-0 px-0 py-[6px] rounded-[4px] bg-[var(--surfacemedium-surfacemedium)] border border-blackinverse-a4 shadow-modal "
      style={{ left: adjustedX, top: adjustedY, width: MENU_WIDTH }}
    >
      {/* Дублировать */}
      <MenuButton
        icon="copy"
        label={t('cardContextMenu.duplicate')}
        onClick={handleDuplicate}
      />

      {/* Спросить AI */}
      {onAskAI && (
        <MenuButton
          icon="ai"
          label={t('cardContextMenu.askAI')}
          onClick={handleAskAI}
        />
      )}

      {/* Скачать (only for chart cards) */}
      {isChart && (
        <div
          className="relative"
          onMouseEnter={() => setShowDownloadSub(true)}
          onMouseLeave={() => setShowDownloadSub(false)}
        >
          <button
            type="button"
            className="flex items-center gap-[12px] py-[6px] px-[6px] rounded-[2px] hover:bg-white/[0.08] transition-colors text-left w-full"
          >
            <Icon
              variant="download"
              size={20}
              className="text-[var(--blackinverse-a72)] shrink-0"
            />
            <span className="font-inter font-normal text-[13px] leading-[20px] text-[var(--blackinverse-a72)] flex-1 whitespace-nowrap">
              {t('cardContextMenu.download')}
            </span>
            <Icon
              variant="chevronRight"
              size={16}
              className="text-blackinverse-a72 shrink-0"
            />
          </button>

          {/* Submenu */}
          {showDownloadSub && (
            <div
              className="absolute top-0 flex flex-col gap-[4px] p-[8px] rounded-[4px] bg-[var(--surfacemedium-surfacemedium)] border border-blackinverse-a4 shadow-modal "
              style={{
                [subMenuOnRight ? 'left' : 'right']: '100%',
                width: 'fit-content',
              }}
            >
              <MenuButton
                label={t('export.png')}
                onClick={() => handleExport('png')}
                compact
              />
              <MenuButton
                label={t('export.json')}
                onClick={() => handleExport('json')}
                compact
              />
              <MenuButton
                label={t('export.csv')}
                onClick={() => handleExport('csv')}
                compact
              />
            </div>
          )}
        </div>
      )}

      {/* Удалить */}
      {onDelete && (
        <MenuButton
          icon="trash"
          label={t('cardContextMenu.delete')}
          onClick={handleDelete}
        />
      )}
    </div>
  );

  // Portal to document.body so the menu escapes ReactFlow's CSS transform
  return createPortal(menu, document.body);
};

interface MenuButtonProps {
  icon?: string;
  label: string;
  onClick: () => void;
  compact?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  compact = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[12px] py-[6px] px-[6px] rounded-[2px] hover:bg-white/[0.08] transition-colors text-left w-full"
    >
      {icon && (
        <Icon
          variant={icon as Parameters<typeof Icon>[0]['variant']}
          size={20}
          className="text-[var(--blackinverse-a72)] shrink-0"
        />
      )}
      <span
        className={[
          'font-inter font-normal text-[13px] leading-[20px] text-[var(--blackinverse-a72)] whitespace-nowrap',
          !icon && !compact ? 'ml-[32px]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </span>
    </button>
  );
};
