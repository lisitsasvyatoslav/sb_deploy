import type { TranslateFn } from '@/shared/i18n';

export function getTradingIdeaColumns(t: TranslateFn) {
  return [
    {
      key: 'instrument',
      label: t('tradingIdea.columns.instrument'),
      className: 'text-left pl-4',
    },
    {
      key: 'entry',
      label: t('tradingIdea.columns.entry'),
      className: 'text-right',
    },
    {
      key: 'target',
      label: t('tradingIdea.columns.target'),
      className: 'text-right',
    },
    {
      key: 'stop',
      label: t('tradingIdea.columns.stop'),
      className: 'text-right',
    },
    {
      key: 'lots',
      label: t('tradingIdea.columns.lots'),
      className: 'text-right',
    },
    { key: 'rr', label: 'R:R', className: 'text-right' },
    {
      key: 'confidence',
      label: t('tradingIdea.columns.confidence'),
      className: 'text-right',
    },
    { key: 'action', label: '', className: 'text-right pr-4' },
  ];
}

/**
 * Format a numeric price for display.
 * Returns 'N/A' for null/undefined values.
 */
export const formatPrice = (
  value: number | undefined | null,
  locale?: string
): string => {
  if (value == null) return 'N/A';
  return value.toLocaleString(locale || 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
