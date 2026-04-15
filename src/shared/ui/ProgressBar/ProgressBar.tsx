'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/i18n/client';
import { formatNumber, getLocaleTag } from '@/shared/utils/formatLocale';

export interface ProgressBarProps {
  /** Current value */
  current: number;
  /** Maximum value */
  total: number;
  /** Unit label shown after the counter, e.g. "токенов" */
  title: string;
  /** Optional left header text, e.g. tariff name */
  label?: string;
  /** Optional secondary left header text, e.g. cost */
  sublabel?: string;
  /** Optional right header text, e.g. renewal date */
  description?: string;
  /** Custom value formatter. Defaults to locale-aware number formatting via i18n. */
  formatValue?: (value: number) => string;
  /** When true, renders only the progress bar line without counter or header text. */
  barOnly?: boolean;
  className?: string;
  'data-testid'?: string;
}

const TEXT_BASE = 'text-14 leading-20 font-normal tracking-tight-1';
const TEXT_PRIMARY = `${TEXT_BASE} text-blackinverse-a100`;
const TEXT_SECONDARY = `${TEXT_BASE} text-blackinverse-a32`;

/**
 * ProgressBar — progressBar / tariffBar
 *
 * Figma node: 61238:46202
 *
 * With `label` / `sublabel` / `description` props renders an optional
 * header row above the counter+bar (tariffBar variant).
 * The bar fill animates to its target width on mount.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  title,
  label,
  sublabel,
  description,
  formatValue,
  barOnly,
  className,
  'data-testid': dataTestId,
}) => {
  const { i18n } = useTranslation();
  const locale = getLocaleTag(i18n.language);
  const fmt = useMemo(
    () => formatValue ?? ((n: number) => formatNumber(n, locale)),
    [formatValue, locale]
  );

  const percentage =
    total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;

  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setAnimatedWidth(percentage), 50);
    return () => clearTimeout(id);
  }, [percentage]);

  const hasHeader = Boolean(label || sublabel || description);

  const barElement = (
    <div
      className="relative w-full h-spacing-4 bg-wrapper-a8 rounded-radius-1 overflow-hidden"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${fmt(current)} / ${fmt(total)} ${title}`}
    >
      <div
        className="absolute inset-y-0 left-0 h-full bg-brand-base rounded-radius-1 transition-[width] duration-500 ease-out"
        style={{ width: `${animatedWidth}%` }}
      />
    </div>
  );

  if (barOnly) {
    return (
      <div className={cn('w-full', className)} data-testid={dataTestId}>
        {barElement}
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col w-full gap-spacing-12', className)}
      data-testid={dataTestId}
    >
      {hasHeader && (
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-spacing-12">
            {label && <span className={TEXT_PRIMARY}>{label}</span>}
            {sublabel && <span className={TEXT_PRIMARY}>{sublabel}</span>}
          </div>
          {description && <span className={TEXT_PRIMARY}>{description}</span>}
        </div>
      )}

      <div className="flex flex-col w-full gap-spacing-8">
        <div className="flex flex-row items-center gap-spacing-4">
          <div className="flex flex-row items-center gap-base-1">
            <span className={TEXT_PRIMARY}>{fmt(current)}</span>
            <span className={TEXT_SECONDARY}>/</span>
            <span className={TEXT_SECONDARY}>{fmt(total)}</span>
          </div>
          <span className={TEXT_PRIMARY}>{title}</span>
        </div>

        {barElement}
      </div>
    </div>
  );
};

export default ProgressBar;
