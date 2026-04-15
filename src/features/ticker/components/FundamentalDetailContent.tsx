import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { FundamentalData, FundamentalMetric } from '@/types/ticker';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { InfoOutlined } from '@mui/icons-material';
import type { TranslateFn } from '@/shared/i18n/settings';

interface MetricRowProps {
  label: string;
  value?: string | null;
  tooltip?: string;
  /** 0–100 position of the value needle (50 = neutral center) */
  indicatorPosition?: number;
  colorClass?: string;
}

/**
 * Indicator bar matching Figma "Multi/preview" component.
 * Fixed bar: red (left) + green (right), 64px wide, 4px tall.
 * Two downward-pointing triangles: one at 50% (median ref), one at `position`.
 */
const ValueIndicator: React.FC<{ position: number }> = ({ position }) => {
  const needle = Math.max(5, Math.min(95, position));
  const triangle = (left: string, color: string) => (
    <div
      className="absolute w-0 h-0"
      style={{
        left,
        top: '-5px',
        transform: 'translateX(-50%)',
        borderLeft: '3.5px solid transparent',
        borderRight: '3.5px solid transparent',
        borderTop: `5px solid ${color}`,
      }}
    />
  );
  return (
    <div className="flex flex-col items-start justify-center w-24 px-4 py-2 shrink-0">
      <div className="relative flex w-16 h-1 rounded-[4px]">
        <div className="bg-[var(--status-negative)] rounded-l-[4px] h-full w-[48%]" />
        <div className="bg-[var(--status-success)] rounded-r-[4px] h-full flex-1" />
        {triangle('50%', 'var(--blackinverse-a32)')}
        {triangle(`${needle}%`, 'var(--blackinverse-a100)')}
      </div>
    </div>
  );
};

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  tooltip,
  indicatorPosition,
  colorClass = 'text-blackinverse-a56',
}) => (
  <div className="border-b border-wrapper-a8 flex items-center justify-between w-full">
    <div className="flex items-center gap-1 w-[140px] shrink-0 py-3">
      <span className="text-sm font-normal text-blackinverse-a56 tracking-tight leading-5 truncate">
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
    <div className="flex items-center">
      {indicatorPosition !== undefined && value && value !== '—' && (
        <ValueIndicator position={indicatorPosition} />
      )}
      <div className="flex items-center justify-end w-[68px] py-3 shrink-0">
        <span
          className={`text-sm font-normal ${colorClass} tracking-tight leading-5 text-right`}
        >
          {value || '—'}
        </span>
      </div>
    </div>
  </div>
);

interface SectionHeaderProps {
  title: string;
  marginTop?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  marginTop = false,
}) => (
  <div
    className={`border-b border-wrapper-a8 pb-3 ${marginTop ? 'pt-6' : 'pt-0'}`}
  >
    <h4 className="text-sm font-semibold text-blackinverse-a100 tracking-tight leading-5">
      {title}
    </h4>
  </div>
);

export interface FundamentalDetailContentProps {
  fundamentalData: FundamentalData;
  locale: string;
  t: TranslateFn;
}

/**
 * Determine text color for a metric value using design-system CSS variables.
 * - Positive → success (green)
 * - Negative → negative (red)
 * - Null / missing → primary (neutral)
 */
const getValueColor = (
  metric: FundamentalMetric | null | undefined
): string => {
  if (!metric || metric.value === null || metric.value === undefined)
    return 'text-[var(--text-primary)]';
  return metric.value >= 0
    ? 'text-[var(--status-success)]'
    : 'text-[var(--status-negative)]';
};

/**
 * Compute needle position (0–100) for the range indicator bar.
 * For valuation multiples a LOWER value is "better" (greener), so we invert.
 * For debt ratios a LOWER value is also better.
 * For profitability metrics a HIGHER value is better.
 *
 * Without benchmark data we use a simple sign-based heuristic scaled to
 * typical ranges:
 *   - value > 0 → position in 40–80 range (varies by magnitude)
 *   - value < 0 → position in 20–40 range
 *   - null → no bar
 */
const getIndicatorPosition = (
  metric: FundamentalMetric | null | undefined,
  /**
   * 'lower-better': P/E, P/BV, P/S, Debt ratio, etc.
   * 'higher-better': ROE, ROA, Net Margin, etc.
   * 'neutral': large absolute numbers (net income, etc.) — use sign only
   */
  direction: 'lower-better' | 'higher-better' | 'neutral'
): number | undefined => {
  if (!metric || metric.value === null || metric.value === undefined)
    return undefined;

  const v = metric.value;

  if (direction === 'neutral') {
    // Positive value → slightly green, negative → slightly red
    return v >= 0 ? 35 : 65;
  }

  if (direction === 'lower-better') {
    // Typical "fair" value reference: P/E~15, P/BV~2, P/S~2, debt ratio~0.5
    // Very low value → greener (position closer to 100)
    // Very high value → redder (position closer to 0)
    if (v < 0) return 60; // negative multiples are generally concerning
    // Cap at 20 ("very expensive" heuristic for most ratios).
    // Note: P/E > 50 is normal for high-growth stocks — this is a visual
    // approximation, not a strict valuation signal.
    const normalised = Math.min(v / 20, 1);
    return Math.round(90 - normalised * 80);
  }

  // higher-better (profitability)
  if (v < 0) return 70; // loss-making → red
  // Cap at 30% ("excellent" heuristic for ROE/ROA/Net Margin).
  // High-margin businesses may exceed this; bar will saturate at the green end.
  const normalised = Math.min(v / 30, 1);
  return Math.round(10 + normalised * 80);
};

const FundamentalDetailContent: React.FC<FundamentalDetailContentProps> = ({
  fundamentalData,
  locale,
  t,
}) => {
  const currencySymbol = getCurrencySymbol(fundamentalData.currency);

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—';
    return value.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatMetric = (
    metric: FundamentalMetric | null | undefined
  ): string => {
    if (!metric || metric.value === null || metric.value === undefined)
      return '—';
    return formatNumber(metric.value);
  };

  const formatLargeNumber = (
    metric: FundamentalMetric | null | undefined,
    includeCurrency = true
  ): string => {
    if (!metric || metric.value === null || metric.value === undefined)
      return '—';

    const value = metric.value;
    const absValue = Math.abs(value);
    const suffix = includeCurrency ? ` ${currencySymbol}` : '';

    if (absValue >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('scale.billion')}${suffix}`;
    } else if (absValue >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('scale.million')}${suffix}`;
    } else {
      return `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
    }
  };

  /** Resolve tooltip from i18n key, falling back to undefined if key is missing */
  const tip = (metricKey: string): string | undefined => {
    const key = `fundamental.metricTooltips.${metricKey}`;
    const translated = t(key);
    return translated !== key ? translated : undefined;
  };

  return (
    <div className="flex flex-col gap-4 px-6 pb-8 pt-4">
      {/* Title */}
      <h3 className="text-xl font-semibold text-blackinverse-a100 tracking-[-0.28px] px-2">
        {t('fundamental.title')}
      </h3>

      {/* Two Column Layout */}
      <div className="flex gap-8 px-2">
        {/* Left Column */}
        <div className="flex-1 flex flex-col">
          {/* Valuation */}
          <SectionHeader title={t('fundamental.sections.valuation')} />
          <MetricRow
            label={t('fundamental.metrics.pe')}
            value={formatMetric(fundamentalData.peRatio)}
            tooltip={tip('pe')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.peRatio,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.peRatio)}
          />
          <MetricRow
            label={t('fundamental.metrics.pbv')}
            value={formatMetric(fundamentalData.priceBook)}
            tooltip={tip('pbv')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.priceBook,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.priceBook)}
          />
          <MetricRow
            label={t('fundamental.metrics.ps')}
            value={formatMetric(fundamentalData.priceSales)}
            tooltip={tip('ps')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.priceSales,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.priceSales)}
          />
          <MetricRow
            label={t('fundamental.metrics.pcf')}
            value={formatMetric(fundamentalData.priceCf)}
            tooltip={tip('pcf')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.priceCf,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.priceCf)}
          />
          <MetricRow
            label={t('fundamental.metrics.pfcf')}
            value={formatMetric(fundamentalData.priceFcf)}
            tooltip={tip('pfcf')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.priceFcf,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.priceFcf)}
          />

          {/* Debt Load */}
          <SectionHeader title={t('fundamental.sections.debtLoad')} marginTop />
          <MetricRow
            label={t('fundamental.metrics.debtRatio')}
            value={formatMetric(fundamentalData.debtRatio)}
            tooltip={tip('debtRatio')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.debtRatio,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.debtRatio)}
          />
          <MetricRow
            label={t('fundamental.metrics.debtEquity')}
            value={formatMetric(fundamentalData.debtEquity)}
            tooltip={tip('debtEquity')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.debtEquity,
              'lower-better'
            )}
            colorClass={getValueColor(fundamentalData.debtEquity)}
          />
          <MetricRow
            label={t('fundamental.metrics.capexRevenue')}
            value={formatMetric(fundamentalData.capexRevenue)}
            tooltip={tip('capexRevenue')}
            colorClass="text-blackinverse-a56"
          />

          {/* Profitability */}
          <SectionHeader
            title={t('fundamental.sections.profitability')}
            marginTop
          />
          <MetricRow
            label={t('fundamental.metrics.roe')}
            value={formatMetric(fundamentalData.roe)}
            tooltip={tip('roe')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.roe,
              'higher-better'
            )}
            colorClass={getValueColor(fundamentalData.roe)}
          />
          <MetricRow
            label={t('fundamental.metrics.roa')}
            value={formatMetric(fundamentalData.roa)}
            tooltip={tip('roa')}
            colorClass="text-blackinverse-a56"
          />
          <MetricRow
            label={t('fundamental.metrics.roi')}
            value={formatMetric(fundamentalData.roi)}
            tooltip={tip('roi')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.roi,
              'higher-better'
            )}
            colorClass={getValueColor(fundamentalData.roi)}
          />
          <MetricRow
            label={t('fundamental.metrics.netMargin')}
            value={formatMetric(fundamentalData.netMargin)}
            tooltip={tip('netMargin')}
            indicatorPosition={getIndicatorPosition(
              fundamentalData.netMargin,
              'higher-better'
            )}
            colorClass={getValueColor(fundamentalData.netMargin)}
          />
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col">
          {/* Profit and Loss */}
          <SectionHeader title={t('fundamental.sections.profitAndLoss')} />
          <MetricRow
            label={t('fundamental.dividends')}
            value={formatLargeNumber(fundamentalData.dividends)}
            tooltip={tip('dividends')}
            colorClass="text-blackinverse-a56"
          />
          <MetricRow
            label={t('fundamental.metrics.netIncome')}
            value={formatLargeNumber(fundamentalData.netIncome)}
            tooltip={tip('netIncome')}
            colorClass={getValueColor(fundamentalData.netIncome)}
          />
          <MetricRow
            label={t('fundamental.metrics.ebitda')}
            value={formatLargeNumber(fundamentalData.ebitda)}
            tooltip={tip('ebitda')}
            colorClass={getValueColor(fundamentalData.ebitda)}
          />
          <MetricRow
            label={t('fundamental.metrics.operatingIncome')}
            value={formatLargeNumber(fundamentalData.operatingIncome)}
            tooltip={tip('operatingIncome')}
            colorClass={getValueColor(fundamentalData.operatingIncome)}
          />
          <MetricRow
            label={t('fundamental.metrics.grossProfit')}
            value={formatLargeNumber(fundamentalData.grossProfit)}
            tooltip={tip('grossProfit')}
            colorClass={getValueColor(fundamentalData.grossProfit)}
          />
          <MetricRow
            label={t('fundamental.metrics.sharesOutstanding')}
            value={formatLargeNumber(fundamentalData.sharesOutstanding, false)}
            tooltip={tip('sharesOutstanding')}
            colorClass="text-blackinverse-a56"
          />
          <MetricRow
            label={t('fundamental.metrics.totalAssets')}
            value={formatLargeNumber(fundamentalData.totalAssets)}
            tooltip={tip('totalAssets')}
            colorClass="text-blackinverse-a56"
          />
          <MetricRow
            label={t('fundamental.metrics.cashOnHand')}
            value={formatLargeNumber(fundamentalData.cashOnHand)}
            tooltip={tip('cashOnHand')}
            colorClass="text-blackinverse-a56"
          />

          {/* Balance Assets */}
          <SectionHeader
            title={t('fundamental.sections.balanceAssets')}
            marginTop
          />
          <MetricRow
            label={t('fundamental.metrics.longTermDebt')}
            value={formatLargeNumber(fundamentalData.longTermDebt)}
            tooltip={tip('longTermDebt')}
            colorClass="text-blackinverse-a56"
          />
          <MetricRow
            label={t('fundamental.metrics.totalLiabilities')}
            value={formatLargeNumber(fundamentalData.totalLiabilities)}
            tooltip={tip('totalLiabilities')}
            colorClass="text-blackinverse-a56"
          />
          <MetricRow
            label={t('fundamental.metrics.totalEquity')}
            value={formatLargeNumber(fundamentalData.totalShareholderEquity)}
            tooltip={tip('totalEquity')}
            colorClass="text-blackinverse-a56"
          />

          {/* Cash Flows */}
          <SectionHeader
            title={t('fundamental.sections.cashFlows')}
            marginTop
          />
          <MetricRow
            label={t('fundamental.metrics.operatingCashFlow')}
            value={formatLargeNumber(fundamentalData.operatingCashFlow)}
            tooltip={tip('operatingCashFlow')}
            colorClass={getValueColor(fundamentalData.operatingCashFlow)}
          />
          <MetricRow
            label={t('fundamental.metrics.freeCashFlow')}
            value={formatLargeNumber(fundamentalData.freeCashFlow)}
            tooltip={tip('freeCashFlow')}
            colorClass={getValueColor(fundamentalData.freeCashFlow)}
          />
          <MetricRow
            label={t('fundamental.metrics.capex')}
            value={formatLargeNumber(fundamentalData.capex)}
            tooltip={tip('capex')}
            colorClass="text-blackinverse-a56"
          />
        </div>
      </div>
    </div>
  );
};

export default FundamentalDetailContent;
