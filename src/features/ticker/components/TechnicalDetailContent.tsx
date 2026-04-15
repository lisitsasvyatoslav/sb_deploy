import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import {
  translateDescription,
  translateIndicatorName,
  translateTrendClass,
  translateTrendPower,
  translatePattern,
} from '@/features/ticker/utils/techAnalysisTranslations';
import type { TranslateFn } from '@/shared/i18n/settings';
import { TechnicalAnalysisData, TechnicalIndicator } from '@/types/ticker';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { InfoOutlined } from '@mui/icons-material';
import {
  getTrendIcon,
  getTrendPowerIcon,
  getSignalIcon,
} from '@/features/ticker/utils/techAnalysisIcons';

interface TechnicalDetailContentProps {
  techData: TechnicalAnalysisData;
  locale: string;
  t: TranslateFn;
}

/* ── Formatting helpers ── */

const formatValue = (
  indicator: TechnicalIndicator,
  locale: string,
  currencySymbol: string
): string => {
  if (indicator.value === undefined || indicator.value === null) return '—';

  if (indicator.format === 'text') {
    return indicator.value.toString();
  }

  const numValue =
    typeof indicator.value === 'number'
      ? indicator.value
      : parseFloat(indicator.value);

  if (isNaN(numValue)) {
    return indicator.value.toString();
  }

  switch (indicator.format) {
    case 'price':
      return `${numValue.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
    case 'percent':
      return `${numValue.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
    case 'number':
      return numValue.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    default:
      return numValue.toString();
  }
};

/* ── Row renderer ── */

interface IndicatorRowOptions {
  label: string;
  value: string;
  icon: React.ReactNode | null;
  tooltip?: string;
  rowKey?: string | number;
  description?: string;
}

/**
 * Renders a single indicator row.
 * If `description` is provided it is shown as a second line below the signal row.
 * `tooltip` adds an info icon that shows on hover (for additional context).
 */
const renderIndicatorRow = ({
  label,
  value,
  icon,
  tooltip,
  rowKey,
  description,
}: IndicatorRowOptions) => (
  <div
    key={rowKey}
    className={`border-b border-wrapper-a8 flex flex-col w-full ${description ? 'pb-3' : ''}`}
  >
    <div className="flex items-center justify-between h-[44px]">
      <div className="flex items-center gap-1">
        <span className="text-sm font-normal text-blackinverse-a100 tracking-tight leading-5">
          {label}
        </span>
        {tooltip && (
          <Tooltip title={tooltip} placement="top" arrow>
            <InfoOutlined
              sx={{ fontSize: 14 }}
              className="text-blackinverse-a56 cursor-help shrink-0"
            />
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-normal text-blackinverse-a100 tracking-tight leading-5">
          {value}
        </span>
        {icon}
      </div>
    </div>
    {description && (
      <p className="text-sm font-normal text-stroke-a72 tracking-tight leading-5">
        {description}
      </p>
    )}
  </div>
);

/* ── Component ── */

const TechnicalDetailContent: React.FC<TechnicalDetailContentProps> = ({
  techData,
  locale,
  t,
}) => {
  const currencySymbol = getCurrencySymbol(undefined);

  const getIndicatorTooltip = (name: string): string | undefined => {
    const key = `techAnalysis.indicatorTooltips.${name}`;
    const translated = t(key);
    return translated !== key ? translated : undefined;
  };

  return (
    <div className="flex flex-col gap-4 px-6 pb-8 pt-4">
      {/* Title */}
      <h3 className="text-xl font-semibold text-blackinverse-a100 tracking-[-0.28px] px-2">
        {t('techAnalysis.title')}
      </h3>

      {/* Two-column table */}
      <div className="flex gap-8 px-2">
        {/* Left column */}
        <div className="flex-1 flex flex-col">
          {renderIndicatorRow({
            label: t('techAnalysis.trendType'),
            value: translateTrendClass(t, techData.trendClass),
            icon: getTrendIcon(techData.trendClass),
          })}

          {renderIndicatorRow({
            label: t('techAnalysis.power'),
            value: translateTrendPower(t, techData.trendPower),
            icon: getTrendPowerIcon(techData.trendPower),
          })}

          {techData.pattern &&
            renderIndicatorRow({
              label: t('techAnalysis.trendPattern'),
              value: translatePattern(t, techData.pattern),
              icon: getSignalIcon(techData.pattern),
            })}

          {techData.indicators
            .slice(0, Math.ceil(techData.indicators.length / 2))
            .map((indicator, idx) =>
              renderIndicatorRow({
                label: translateIndicatorName(t, indicator.name),
                value: translateDescription(
                  t,
                  indicator.description ||
                    formatValue(indicator, locale, currencySymbol)
                ),
                icon: getSignalIcon(
                  indicator.description || indicator.signal?.toString()
                ),
                rowKey: `left-${idx}`,
                description: getIndicatorTooltip(indicator.name),
              })
            )}
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col">
          {techData.indicators
            .slice(Math.ceil(techData.indicators.length / 2))
            .map((indicator, idx) =>
              renderIndicatorRow({
                label: translateIndicatorName(t, indicator.name),
                value: translateDescription(
                  t,
                  indicator.description ||
                    formatValue(indicator, locale, currencySymbol)
                ),
                icon: getSignalIcon(
                  indicator.description || indicator.signal?.toString()
                ),
                rowKey: `right-${idx}`,
                description: getIndicatorTooltip(indicator.name),
              })
            )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalDetailContent;
