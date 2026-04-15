import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import { IconVariant } from '@/shared/ui/Icon/Icon.types';

export type ChipLinkType =
  | 'chart'
  | 'document'
  | 'ai_answer'
  | 'note'
  | 'link'
  | 'group'
  | 'image'
  | 'attachment';

interface ChipLinkProps {
  /** Type of attachment determines the icon */
  type: ChipLinkType;
  /** Label to display (e.g., "YDEX", "2 тикера") */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Callback when close icon is clicked (enables hover close behavior) */
  onRemove?: () => void;
  /** Optional custom icon element (e.g., SymbolLogo for chart type) */
  customIcon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChipLink — Chips/Link
 *
 * Small chip with icon + text showing attachment type.
 * On hover: icon swaps to close icon, background darkens, text becomes full opacity.
 *
 * Figma node: 56218:6592
 */

const iconVariantMap: Record<ChipLinkType, IconVariant> = {
  chart: 'chart',
  document: 'doc',
  ai_answer: 'ai',
  note: 'editNote',
  link: 'global',
  group: 'attachement',
  image: 'attachement',
  attachment: 'attachement',
};

const ChipLink: React.FC<ChipLinkProps> = ({
  type,
  label,
  onClick,
  onRemove,
  customIcon,
  className = '',
}) => {
  const iconVariant = iconVariantMap[type];

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove?.();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group/chip inline-flex items-center gap-spacing-4 py-spacing-4 pl-spacing-6 pr-spacing-8 rounded-radius-2',
        'bg-blackinverse-a4 text-blackinverse-a56 text-12 font-medium leading-16 tracking-tight-1',
        'transition-colors duration-150 hover:bg-blackinverse-a6 hover:text-blackinverse-a100',
        (onClick || onRemove) && 'cursor-pointer',
        className
      )}
    >
      {/* Icon container — type icon swaps to close on hover when removable */}
      <span className="relative flex items-center justify-center w-spacing-16 h-spacing-16 shrink-0">
        {/* Type icon */}
        <span
          className={
            onRemove
              ? 'group-hover/chip:opacity-0 transition-opacity duration-150'
              : ''
          }
        >
          {customIcon || <Icon variant={iconVariant} size={16} />}
        </span>

        {/* Close icon — shown on hover, replaces type icon */}
        {onRemove && (
          <span
            role="button"
            tabIndex={-1}
            onClick={handleRemoveClick}
            onMouseDown={(e) => e.preventDefault()}
            className="
              absolute inset-0
              flex items-center justify-center
              opacity-0 group-hover/chip:opacity-100
              transition-opacity duration-150
              cursor-pointer
            "
            aria-label="Remove"
          >
            <Icon variant="closeMedium" size={16} />
          </span>
        )}
      </span>

      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

export default ChipLink;
