'use client';

/**
 * FundamentalContent — inline board card for fundamental analysis
 *
 * Figma node: 1592:52726
 */

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface FundamentalMetric {
  label: string;
  value: string;
  color?: 'positive' | 'negative' | 'default';
}

interface FundamentalContentProps {
  meta?: { metrics?: FundamentalMetric[] };
}

const ROW_CLASS =
  'flex items-center justify-between h-spacing-56 border-b theme-border last:border-b-0 w-full';

const getValueColor = (color?: string) => {
  if (color === 'positive') return 'text-[var(--status-success)]';
  if (color === 'negative') return 'text-[var(--status-negative)]';
  return 'theme-text-primary';
};

export const FundamentalContent: React.FC<FundamentalContentProps> = ({
  meta,
}) => {
  const { t } = useTranslation('ticker');
  const metrics = meta?.metrics || [];

  if (metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-14 text-[var(--text-muted)]">
          {t('techAnalysis.selectTickers')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-spacing-16 w-full">
      {metrics.map((metric, index) => (
        <div key={index} className={ROW_CLASS}>
          <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 truncate">
            {metric.label}
          </p>
          <p
            className={`font-normal text-14 leading-20 tracking-tight-1 whitespace-nowrap shrink-0 ${getValueColor(metric.color)}`}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};
