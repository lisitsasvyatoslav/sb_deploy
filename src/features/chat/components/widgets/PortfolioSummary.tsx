import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { PortfolioSummaryProps } from '@/features/chat/types/widget';

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalValue,
  change,
  changePercent,
  positions,
}) => {
  const { t, i18n } = useTranslation('chat');
  const locale = getLocaleTag(i18n.language);
  const isPositive = change >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-background-card border border-border-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">
          {t('portfolio.value')}
        </span>
        <div className="flex items-center gap-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-secondary"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-text-primary">
          {formatCurrency(totalValue)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(change)}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {isPositive ? '+' : ''}
            {changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-border-light">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {t('portfolio.positions')}
          </span>
          <span className="font-medium text-text-primary">{positions}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
