import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';

interface ChipInfoProps {
  /** Title text (e.g., instrument name) */
  title: string;
  /** Date string (e.g., "12 мар 2026") */
  date: string;
  /** Price or size info */
  info?: string;
  /** Time string */
  time?: string;
  /** Symbol logo element (32x32) */
  logo?: React.ReactNode;
  /** Callback when close icon is clicked */
  onRemove?: () => void;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChipInfo — Chips info
 *
 * Expanded attachment card in conversation area showing details:
 * logo (32px), title, date, price/size.
 * On hover: background darkens, logo replaced by close icon.
 *
 * Figma node: 56218:6611
 */
const ChipInfo: React.FC<ChipInfoProps> = ({
  title,
  date,
  info,
  time,
  logo,
  onRemove,
  onClick,
  className = '',
}) => {
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove?.();
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(
        'group/info flex items-center gap-2.5 py-2.5 pl-3.5 pr-5 w-full',
        'border-b border-blackinverse-a4 transition-colors duration-150 hover:bg-blackinverse-a4',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Logo / Close icon container */}
      <span className="relative flex items-center justify-center w-8 h-8 shrink-0">
        {/* Logo — hidden on hover when removable */}
        <span
          className={
            onRemove
              ? 'group-hover/info:opacity-0 transition-opacity duration-150'
              : ''
          }
        >
          {logo || <div className="w-8 h-8 rounded-full bg-blackinverse-a6" />}
        </span>

        {/* Close icon — shown on hover */}
        {onRemove && (
          <span
            role="button"
            tabIndex={-1}
            onClick={handleRemoveClick}
            onMouseDown={(e) => e.preventDefault()}
            className="
              absolute inset-0
              flex items-center justify-center
              opacity-0 group-hover/info:opacity-100
              transition-opacity duration-150
              cursor-pointer
            "
            aria-label="Remove"
          >
            <Icon variant="closeMedium" size={32} />
          </span>
        )}
      </span>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Header row: title + date */}
        <div className="flex items-center gap-1">
          <span className="text-14 font-semibold leading-5 text-blackinverse-a100 truncate">
            {title}
          </span>
          <span className="text-12 leading-4 text-blackinverse-a56 whitespace-nowrap shrink-0">
            {date}
          </span>
        </div>

        {/* Info row: price + time */}
        {(info || time) && (
          <div className="flex items-center gap-1">
            {info && (
              <span className="text-12 leading-4 text-blackinverse-a56">
                {info}
              </span>
            )}
            {time && (
              <span className="text-12 leading-4 text-blackinverse-a56">
                {time}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChipInfo;
