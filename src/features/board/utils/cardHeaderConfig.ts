import { getSourceConfig } from '@/features/board/utils/signalHelpers';
import type { TranslateFn } from '@/shared/i18n/settings';
import { Card } from '@/types';

export interface SimpleHeaderConfig {
  variant: 'simple';
  title?: string;
  backgroundColor: string;
  editable?: boolean;
  onTitleChange?: (newTitle: string) => void;
  baseTitle?: string; // Original title without formatting (for editing)
}

export type CardHeaderConfig = SimpleHeaderConfig;

/**
 * Format ISO date string to DD.MM.YYYY format
 */
const formatUploadDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
};

export const getCardHeaderConfig = (
  card: Card,
  defaultColor: string,
  onTitleChange?: (newTitle: string) => void,
  t: TranslateFn = (key: string) => key
): CardHeaderConfig => {
  if (card.type === 'signal' && card.meta?.sourceType) {
    const sourceConfig = getSourceConfig(
      card.meta.sourceType as 'tradingview' | 'telegram',
      card.title
    );

    return {
      variant: 'simple',
      title: sourceConfig.name,
      backgroundColor: card.color || sourceConfig.headerBg,
      editable: false,
    };
  }

  // Strategy cards: editable title
  if (card.type === 'strategy') {
    return {
      variant: 'simple',
      title: card.title || t('fallback.newStrategy'),
      backgroundColor: card.color || defaultColor,
      editable: true,
      onTitleChange,
    };
  }

  // Trading idea cards: editable title
  if (card.type === 'trading_idea') {
    return {
      variant: 'simple',
      title: card.title || t('fallback.tradingIdea'),
      backgroundColor: card.color || defaultColor,
      editable: true,
      onTitleChange,
    };
  }

  // Widget cards: ai_screener is editable, others are not
  if (card.type === 'widget') {
    const isAiScreener = card.meta?.widgetType === 'ai_screener';
    const widgetTitle =
      card.meta?.widgetType === 'news_feed'
        ? t('fallback.newsFeed')
        : isAiScreener
          ? card.title || t('fallback.newSignals')
          : card.title || t('fallback.widget');
    return {
      variant: 'simple',
      title: widgetTitle,
      backgroundColor: card.color || defaultColor,
      editable: isAiScreener,
      onTitleChange: isAiScreener ? onTitleChange : undefined,
    };
  }

  // File cards: add upload date to title
  if (card.type === 'file') {
    const baseTitle = card.title || t('fallback.file');

    // Use createdAt as the upload date
    const uploadDate = card.createdAt;
    const titleWithDate = uploadDate
      ? `${baseTitle} - ${formatUploadDate(uploadDate)}`
      : baseTitle;

    return {
      variant: 'simple',
      title: titleWithDate, // Displayed title with date
      backgroundColor: card.color || defaultColor,
      editable: true,
      onTitleChange,
      baseTitle: card.title, // Original title WITHOUT date for editing
    };
  }

  // Default: simple text-based header (editable)
  return {
    variant: 'simple',
    title:
      card.title ||
      (card.type === 'note' ? t('fallback.note') : t('fallback.untitled')),
    backgroundColor: card.color || defaultColor,
    editable: true,
    onTitleChange,
  };
};
