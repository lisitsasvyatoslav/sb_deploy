import TickerIcon from '@/shared/ui/TickerIcon';
import Button from '@/shared/ui/Button';
import React from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

export interface TradeAttachment {
  ticker: string;
  securityId?: number; // Optional: If present, display icon from CDN; if absent, show fallback
}

interface AttachmentTradesChipProps {
  trades: TradeAttachment[];
  /** Show close button for removable chips */
  removable?: boolean;
  /** Callback when close button is clicked */
  onRemove?: () => void;
  /** Optional click handler for the chip */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const AttachmentTradesChip: React.FC<AttachmentTradesChipProps> = ({
  trades,
  removable = false,
  onRemove,
  onClick,
  className = '',
}) => {
  const { t } = useTranslation('chat');

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div
      className={`
        inline-flex items-center gap-0.5 h-6 rounded-full
        bg-[var(--brand-primary-light)] border border-dashed border-[var(--brand-bg)]
        transition-colors duration-150
        ${onClick ? 'cursor-pointer hover:bg-[var(--brand-primary-hover-bg)]' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Content wrapper with padding */}
      <div className="flex items-center gap-0.5 pl-3 pr-1">
        <Icon
          variant="global"
          size={22}
          className="text-texticon-black_inverse_a56"
        />
        <div className="flex items-center ml-1">
          {trades.map((trade, i) => (
            <div
              key={trade.ticker}
              className={`${i > 0 ? '-ml-2 ' : ''}`}
              style={{ zIndex: trades.length + i }}
            >
              <TickerIcon
                symbol={trade.ticker}
                securityId={trade.securityId}
                size={18}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Close button */}
      {removable && (
        <Button
          type="button"
          onClick={handleRemoveClick}
          variant="ghost"
          size="sm"
          icon={<Icon variant="closeSmall" size={16} />}
          className="!w-5 !h-5 !p-0  !rounded-full -ml-1"
          aria-label={t('attachments.deleteAlt')}
        />
      )}

      {/* Right padding for non-removable chips */}
      {!removable && <div className="w-2" />}
    </div>
  );
};

export default AttachmentTradesChip;
