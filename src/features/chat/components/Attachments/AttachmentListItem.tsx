import TickerIcon, { getTickerColor } from '@/shared/ui/TickerIcon';
import Image from 'next/image';
import React, { useState } from 'react';
import { IconContainer } from './IconContainers';
import { useTranslation } from '@/shared/i18n/client';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import type { TranslateFn } from '@/shared/i18n/settings';

export type AttachmentType = 'image' | 'document' | 'ticker' | 'link' | 'note';

export interface AttachmentListItemData {
  id: string | number;
  type: AttachmentType;
  name: string;
  createdAt: string; // ISO date
  attachedAt?: string; // ISO date
  // Type-specific fields
  imageUrl?: string; // For images
  fileSize?: number; // For images/documents (bytes)
  price?: number; // For tickers
  priceChange?: number; // For tickers (percentage)
  securityId?: number; // For tickers (icon)
  ticker?: string; // For tickers
  siteName?: string; // For web links
  url?: string; // For web links
  noteContent?: string; // For notes (first 50 chars preview)
}

interface AttachmentListItemProps {
  attachment: AttachmentListItemData;
  /** Whether delete is enabled (input/editing mode) */
  canDelete?: boolean;
  /** Callback when delete is clicked */
  onDelete?: (id: string | number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format file size to human readable format
 */
const formatFileSize = (bytes: number | undefined, t: TranslateFn): string => {
  if (!bytes) return '';
  if (bytes < 1024) return t('fileSize.bytes', { size: bytes });
  if (bytes < 1024 * 1024)
    return t('fileSize.kilobytes', { size: (bytes / 1024).toFixed(0) });
  return t('fileSize.megabytes', { size: (bytes / (1024 * 1024)).toFixed(0) });
};

/**
 * Format date using current locale (e.g., "19 сентября" / "September 19")
 */
const formatDate = (isoDate: string | undefined, locale: string): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  } catch {
    return '';
  }
};

/**
 * Format time using current locale (e.g., "10:30")
 */
const formatTime = (isoDate: string | undefined, locale: string): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * Format price change percentage
 */
const formatPriceChange = (change?: number): string => {
  if (change === undefined || change === null) return '';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

const AttachmentListItem: React.FC<AttachmentListItemProps> = ({
  attachment,
  canDelete = false,
  onDelete,
  className = '',
}) => {
  const { t, i18n } = useTranslation('common');
  const locale = getDateLocaleTag(i18n.language);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(attachment.id);
  };

  const renderIcon = () => {
    if (isHovered && canDelete) {
      return (
        <button
          type="button"
          onClick={handleDelete}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 bg-whiteinverse-a8 hover:bg-whiteinverse-a12 transition-colors"
          aria-label={t('attachment.delete')}
        >
          <Image
            src="/images/close.svg"
            alt=""
            width={16}
            height={16}
            className="w-[16px] h-[16px] opacity-60 invert dark:invert-0"
          />
        </button>
      );
    }

    switch (attachment.type) {
      case 'image':
        return (
          <div className="w-[32px] h-[32px] rounded-[2px] overflow-hidden flex-shrink-0 bg-whiteinverse-a8">
            {attachment.imageUrl ? (
              <Image
                src={attachment.imageUrl}
                alt={attachment.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src="/images/chart.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-[20px] h-[20px] opacity-60 invert dark:invert-0"
                />
              </div>
            )}
          </div>
        );

      case 'document':
        return (
          <IconContainer colorClassName="bg-icon-document">
            <Image
              src="/images/document.svg"
              alt=""
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
            />
          </IconContainer>
        );

      case 'note':
        return (
          <IconContainer colorClassName="bg-icon-note">
            <Image
              src="/images/note.svg"
              alt=""
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
            />
          </IconContainer>
        );

      case 'ticker': {
        const tickerSymbol = attachment.ticker || attachment.name;
        const tickerColor = getTickerColor(tickerSymbol);
        return (
          <IconContainer color={tickerColor}>
            <TickerIcon
              symbol={tickerSymbol}
              securityId={attachment.securityId}
              size={24}
            />
          </IconContainer>
        );
      }

      case 'link':
        return (
          <IconContainer colorClassName="bg-icon-link">
            <Image
              src="/images/link.svg"
              alt=""
              width={16}
              height={16}
              className="w-[16px] h-[16px]"
            />
          </IconContainer>
        );

      default:
        return (
          <IconContainer colorClassName="bg-icon-document">
            <Image
              src="/images/document.svg"
              alt=""
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
            />
          </IconContainer>
        );
    }
  };

  const renderAdditionalInfo = () => {
    switch (attachment.type) {
      case 'image':
      case 'document':
        return formatFileSize(attachment.fileSize, t as TranslateFn);

      case 'note':
        if (attachment.noteContent) {
          const preview = attachment.noteContent.slice(0, 50);
          return preview.length < attachment.noteContent.length
            ? `${preview}...`
            : preview;
        }
        return formatFileSize(attachment.fileSize, t as TranslateFn);

      case 'ticker':
        const priceText = attachment.price
          ? `${attachment.price.toFixed(2)}`
          : '';
        const changeText = formatPriceChange(attachment.priceChange);
        const changeColor =
          attachment.priceChange && attachment.priceChange >= 0
            ? 'text-green-500'
            : 'text-red-500';

        return (
          <span>
            {priceText}
            {priceText && changeText && ' · '}
            {changeText && (
              <span className={changeColor}>
                {t('attachment.growth')}
                {changeText}
              </span>
            )}
          </span>
        );

      case 'link':
        return attachment.siteName || '';

      default:
        return '';
    }
  };

  const dateToShow = attachment.attachedAt || attachment.createdAt;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 cursor-pointer
        py-[10px]
        transition-colors duration-150
        border-b border-gray-900
        ${isHovered ? 'bg-whiteinverse-a4' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon section */}
      {renderIcon()}

      {/* Content section */}
      <div className="flex-1 w-full flex flex-col justify-center h-[40px] gap-[4px]">
        {/* Row 1: Name and Date */}
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-14 font-medium text-text-primary truncate">
            {attachment.name}
          </span>
          <span className="text-12 text-text-secondary flex-shrink-0">
            {formatDate(dateToShow, locale)}
          </span>
        </div>

        {/* Row 2: Additional info and Time */}
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="text-12 text-text-secondary truncate">
            {renderAdditionalInfo()}
          </span>
          <span className="text-12 text-text-secondary flex-shrink-0">
            {formatTime(dateToShow, locale)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AttachmentListItem;
