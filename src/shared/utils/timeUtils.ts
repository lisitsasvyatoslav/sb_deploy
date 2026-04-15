import { differenceInHours, format, isToday, isYesterday } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import type { TranslateFn } from '@/shared/i18n/settings';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';

export const formatTime = (
  timestamp: string,
  t?: TranslateFn,
  locale = 'en'
): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return t ? t('time.justNow') : 'Just now';
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return t ? t('time.hoursAgo', { count: hours }) : `${hours}h ago`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return t ? t('time.daysAgo', { count: days }) : `${days}d ago`;
  } else {
    return date.toLocaleDateString(getDateLocaleTag(locale));
  }
};

/**
 * Formats board update date for display.
 * Used in MainGridView, IdeasGridView, BoardFlowNode.
 */
export const formatBoardDate = (
  dateString?: string,
  type: 'created' | 'updated' = 'updated',
  t?: TranslateFn,
  locale = 'ru'
): string => {
  const actionText = t
    ? t(`boardDate.${type}`)
    : type === 'created'
      ? 'Created'
      : 'Updated';

  if (!dateString)
    return `${actionText} ${t ? t('boardDate.recently') : 'recently'}`;

  const date = new Date(dateString);
  const diffInHours = differenceInHours(new Date(), date);
  const justNow = t ? t('boardDate.justNow') : 'just now';
  const today = t ? t('boardDate.today') : 'today';
  const yesterday = t ? t('boardDate.yesterday') : 'yesterday';

  if (diffInHours < 1) return `${actionText} ${justNow}`;
  if (diffInHours < 24) return `${actionText} ${today}`;
  if (isToday(date)) return `${actionText} ${today}`;
  if (isYesterday(date)) return `${actionText} ${yesterday}`;
  if (diffInHours < 48) return `${actionText} ${yesterday}`;

  const dateFnsLocale = locale === 'ru' ? ru : enUS;
  return `${actionText} ` + format(date, 'd MMMM', { locale: dateFnsLocale });
};
