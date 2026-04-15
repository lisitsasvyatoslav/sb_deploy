import Image from 'next/image';
import React from 'react';

export type InlineChipType = 'link' | 'card' | 'ticker' | 'file';

export interface InlineChipData {
  id: string;
  type: InlineChipType;
  label: string;
  url?: string;
  tickerSymbol?: string;
  fileId?: string;
}

interface InlineChipProps {
  type: InlineChipType;
  label: string;
  onRemove?: () => void;
  className?: string;
  /** Data attributes for serialization in contentEditable */
  'data-chip-id'?: string;
  'data-chip-type'?: string;
  'data-chip-label'?: string;
  'data-chip-url'?: string;
  'data-chip-ticker'?: string;
  'data-chip-file-id'?: string;
}

/**
 * Icon for link chips
 */
const LinkChipIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.5 9.5L9.5 6.5M7 5.5L8.08579 4.41421C9.64805 2.85195 12.1807 2.85195 13.743 4.41421C15.3052 5.97647 15.3052 8.50911 13.743 10.0714L12.5 11.3142M3.5 4.68579L2.25706 5.92873C0.694796 7.49099 0.694796 10.0236 2.25706 11.5859C3.81932 13.1481 6.35195 13.1481 7.91421 11.5859L9 10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Icon for card/note chips
 */
const CardChipIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.18164 11.6484L6.13574 12.084C5.98131 12.1202 5.84468 12.08 5.72656 11.9619C5.60851 11.8438 5.56816 11.7072 5.60449 11.5527L6.02734 9.49316L8.18164 11.6484ZM3.96777 4.99316C4.9041 5.06589 5.59309 5.25486 6.03418 5.55957C6.47517 5.86423 6.69558 6.30282 6.69531 6.875C6.69531 7.35662 6.52043 7.73413 6.1709 8.00684C5.82108 8.27956 5.30425 8.4435 4.62207 8.49805C4.04063 8.54351 3.60432 8.65012 3.31348 8.81836C3.02269 8.98665 2.87707 9.21646 2.87695 9.50684C2.87695 9.82502 3.00424 10.0552 3.25879 10.1963C3.51334 10.3374 3.94103 10.4213 4.54102 10.4482L4.48633 11.5391C3.57724 11.4936 2.89956 11.3022 2.4541 10.9658C2.00889 10.6295 1.78613 10.143 1.78613 9.50684C1.78623 8.91609 2.02918 8.43629 2.51562 8.06836C3.00217 7.70037 3.67775 7.48032 4.54102 7.40723C4.89539 7.37994 5.16147 7.32346 5.33887 7.2373C5.5163 7.15112 5.60486 7.0299 5.60449 6.875C5.60435 6.63882 5.47001 6.46187 5.20215 6.34375C4.93414 6.22558 4.49056 6.13853 3.87207 6.08398L3.96777 4.99316ZM11.9111 3.90234C12.1613 3.90234 12.3771 3.99396 12.5586 4.17578L13.5137 5.12988C13.6954 5.31168 13.7861 5.52819 13.7861 5.77832C13.786 6.02833 13.6954 6.24442 13.5137 6.42578L8.80859 11.1299L6.55859 8.87988L11.2637 4.17578C11.4454 3.99403 11.6611 3.90241 11.9111 3.90234Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Icon for ticker chips
 */
const TickerChipIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 11L5.5 7.5L8 10L14 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 4H14V7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Icon for file/document chips
 */
const FileChipIcon: React.FC = () => (
  <Image src="/images/document.svg" alt="" width={16} height={16} />
);

/**
 * Get the appropriate icon component for a chip type
 */
const getChipIcon = (type: InlineChipType): React.FC => {
  switch (type) {
    case 'link':
      return LinkChipIcon;
    case 'card':
      return CardChipIcon;
    case 'ticker':
      return TickerChipIcon;
    case 'file':
      return FileChipIcon;
    default:
      return LinkChipIcon;
  }
};

/**
 * InlineChip - A chip component that can be embedded in contentEditable text input.
 * Uses contentEditable="false" to act as an atomic, non-editable unit within the text.
 *
 * Figma specs:
 * - Height: 24px
 * - Padding: 8px left, 12px right
 * - Border radius: 2px
 * - Gap: 3px
 * - Font: 12px medium, line-height 16px, letter-spacing -0.2px
 * - Icon: 16x16
 */
const InlineChip: React.FC<InlineChipProps> = ({
  type,
  label,
  onRemove,
  className = '',
  'data-chip-id': dataChipId,
  'data-chip-type': dataChipType,
  'data-chip-label': dataChipLabel,
  'data-chip-url': dataChipUrl,
  'data-chip-ticker': dataChipTicker,
  'data-chip-file-id': dataChipFileId,
}) => {
  const Icon = getChipIcon(type);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      contentEditable={false}
      data-chip-id={dataChipId}
      data-chip-type={dataChipType}
      data-chip-label={dataChipLabel}
      data-chip-url={dataChipUrl}
      data-chip-ticker={dataChipTicker}
      data-chip-file-id={dataChipFileId}
      className={`
        inline-chip-wrapper
        inline-flex items-center gap-[3px]
        h-6 pl-2 pr-3
        rounded-[2px]
        bg-overlay-light
        text-text-secondary
        text-[12px] font-medium leading-4 tracking-[-0.2px]
        whitespace-nowrap select-none align-middle
        group
        ${className}
      `}
    >
      {/* Icon container - shows type icon, or close icon on hover if removable */}
      <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
        {/* Type icon - hidden on hover when removable */}
        {type === 'link' ? (
          <Image
            src="/images/link.svg"
            alt=""
            width={16}
            height={16}
            className={
              onRemove
                ? 'group-hover:opacity-0 transition-opacity duration-150'
                : ''
            }
          />
        ) : type === 'file' ? (
          <Image
            src="/images/document.svg"
            alt=""
            width={16}
            height={16}
            className={
              onRemove
                ? 'group-hover:opacity-0 transition-opacity duration-150'
                : ''
            }
          />
        ) : (
          <span
            className={
              onRemove
                ? 'group-hover:opacity-0 transition-opacity duration-150'
                : ''
            }
          >
            <Icon />
          </span>
        )}
        {/* Close icon - shown on hover, replaces the type icon */}
        {onRemove && (
          <button
            type="button"
            onClick={handleRemoveClick}
            onMouseDown={(e) => e.preventDefault()}
            className="
              absolute inset-0
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              cursor-pointer
            "
            aria-label="Remove"
          >
            <Image
              src="/images/close.svg"
              alt="Remove"
              width={10}
              height={10}
            />
          </button>
        )}
      </span>
      <span className="max-w-[100px] truncate">{label}</span>
    </span>
  );
};

export default InlineChip;
