'use client';

/**
 * TechnicalContent — inline board card for technical analysis
 *
 * Figma node: 1592:52726
 */

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import {
  translateDescription,
  translateTrendClass,
  translateTrendPower,
  translatePattern,
} from '@/features/ticker/utils/techAnalysisTranslations';
import {
  getTrendIcon,
  getTrendPowerIcon,
  getSignalIcon,
} from '@/features/ticker/utils/techAnalysisIcons';

interface TechnicalIndicator {
  label: string;
  signal: string;
}

interface TechnicalContentMeta {
  trendClass?: string;
  trendPower?: string;
  pattern?: string;
  indicators?: TechnicalIndicator[];
}

interface TechnicalContentProps {
  meta?: TechnicalContentMeta;
}

const ROW_CLASS =
  'flex items-center justify-between h-spacing-56 border-b theme-border last:border-b-0 w-full';

export const TechnicalContent: React.FC<TechnicalContentProps> = ({ meta }) => {
  const { t } = useTranslation('ticker');
  const tFn = t as TranslateFn;

  const trendClass = meta?.trendClass;
  const trendPower = meta?.trendPower;
  const pattern = meta?.pattern;
  const indicators = meta?.indicators || [];

  const hasTrend = trendClass || trendPower || pattern;

  return (
    <div className="flex flex-col h-full px-spacing-16 w-full">
      {/* Trend rows */}
      {trendClass && (
        <div className={ROW_CLASS}>
          <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 truncate">
            {tFn('techAnalysis.trendType')}
          </p>
          <div className="flex items-center gap-spacing-8 shrink-0">
            <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 whitespace-nowrap">
              {translateTrendClass(tFn, trendClass)}
            </p>
            {getTrendIcon(trendClass)}
          </div>
        </div>
      )}

      {trendPower && (
        <div className={ROW_CLASS}>
          <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 truncate">
            {tFn('techAnalysis.power')}
          </p>
          <div className="flex items-center gap-spacing-8 shrink-0">
            <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 whitespace-nowrap">
              {translateTrendPower(tFn, trendPower)}
            </p>
            {getTrendPowerIcon(trendPower)}
          </div>
        </div>
      )}

      {pattern && (
        <div className={ROW_CLASS}>
          <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 truncate">
            {tFn('techAnalysis.trendPattern')}
          </p>
          <div className="flex items-center gap-spacing-8 shrink-0">
            <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 whitespace-nowrap">
              {translatePattern(tFn, pattern)}
            </p>
            {getSignalIcon(pattern)}
          </div>
        </div>
      )}

      {/* Indicator rows */}
      {!hasTrend && indicators.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-14 text-[var(--text-muted)]">
            {tFn('techAnalysis.selectTickers')}
          </p>
        </div>
      )}

      {indicators.map((indicator, index) => (
        <div key={index} className={ROW_CLASS}>
          <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 truncate">
            {indicator.label}
          </p>
          <div className="flex items-center gap-spacing-8 shrink-0">
            <p className="font-normal theme-text-primary text-14 leading-20 tracking-tight-1 whitespace-nowrap">
              {translateDescription(tFn, indicator.signal)}
            </p>
            {getSignalIcon(indicator.signal)}
          </div>
        </div>
      ))}
    </div>
  );
};
