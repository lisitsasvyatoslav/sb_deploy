import TickerIcon from '@/shared/ui/TickerIcon';
import { useTranslation } from '@/shared/i18n/client';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { getDateLocaleTag, getLocaleTag } from '@/shared/utils/formatLocale';
import type { ScreenerResult } from '@/services/api/tickers';
import type { TFunction } from 'i18next';
import React, { useCallback, useMemo } from 'react';

interface AiScreenerResultsTableProps {
  results: ScreenerResult[];
  onBack: () => void;
}

function formatPrice(
  value: number | null | undefined,
  currency?: string | null,
  locale = 'en-US'
): string {
  if (value == null) return '—';
  const symbol = getCurrencySymbol(currency ?? undefined);
  return `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

function formatPercent(
  value: number | null | undefined,
  locale = 'en-US'
): string {
  if (value == null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

function formatNumber(
  value: number | null | undefined,
  decimals = 1,
  locale = 'en-US'
): string {
  if (value == null) return '—';
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatDate(
  isoString: string | null | undefined,
  locale = 'en-US'
): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatTimestamp(
  isoString: string | null | undefined,
  locale = 'en-US'
): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const time = d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const date = d.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
    return `${time} • ${date}`;
  } catch {
    return '';
  }
}

function getColumns(t: TFunction<'board'>) {
  return [
    {
      key: 'instrument',
      label: t('screener.columns.instrument'),
      className: 'text-left pl-4',
    },
    {
      key: 'horizon',
      label: t('screener.columns.horizon'),
      className: 'text-left',
    },
    {
      key: 'price',
      label: t('screener.columns.currentPrice'),
      className: 'text-right',
    },
    {
      key: 'target',
      label: t('screener.columns.target'),
      className: 'text-right',
    },
    {
      key: 'drawdown',
      label: t('screener.columns.drawdown'),
      className: 'text-right',
    },
    {
      key: 'volatility',
      label: t('screener.columns.volatility'),
      className: 'text-right',
    },
    {
      key: 'sharpe',
      label: t('screener.columns.sharpe'),
      className: 'text-right pr-4',
    },
  ] as const;
}

const SignalRow: React.FC<{
  item: ScreenerResult;
  locale: string;
  dateLocale: string;
}> = ({ item, locale, dateLocale }) => {
  const targetPrice = item.forecast_step_target ?? null;
  const forecastChangePct =
    item.forecast_step_change != null ? item.forecast_step_change * 100 : null;

  const changeColor =
    (item.quote_change_percent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
  const targetColor =
    (forecastChangePct ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
  const drawdownColor = 'text-red-400';

  return (
    <tr className="border-b border-whiteinverse-a4 last:border-b-0 hover:bg-whiteinverse-a2 transition-colors">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2.5">
          <TickerIcon
            symbol={item.ticker}
            securityId={item.security_id}
            size={32}
          />
          <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-wide">
            {item.ticker}
          </span>
        </div>
      </td>
      <td className="py-3 px-2">
        <span className="text-[13px] text-[var(--text-primary)]">
          {formatDate(item.updated_at, dateLocale)}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {formatPrice(item.quote_last, item.currency, locale)}
          </span>
          <span className={`text-[11px] ${changeColor}`}>
            {formatPercent(item.quote_change_percent, locale)}
          </span>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {formatPrice(targetPrice, item.currency, locale)}
          </span>
          <span className={`text-[11px] ${targetColor}`}>
            {formatPercent(forecastChangePct, locale)}
          </span>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <span className={`text-[13px] ${drawdownColor}`}>
          {item.max_drawdown != null
            ? `${formatNumber(item.max_drawdown, 1, locale)} %`
            : '—'}
        </span>
      </td>
      <td className="py-3 px-2 text-right">
        <span className="text-[13px] text-[var(--text-primary)] font-semibold">
          {item.volatility_score != null
            ? formatNumber(item.volatility_score, 0, locale)
            : '—'}
        </span>
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <span className="text-[13px] text-[var(--text-primary)] font-semibold">
          {item.sharpe_ratio != null
            ? formatNumber(item.sharpe_ratio, 1, locale)
            : '—'}
        </span>
      </td>
    </tr>
  );
};

export const AiScreenerResultsTable: React.FC<AiScreenerResultsTableProps> = ({
  results,
  onBack,
}) => {
  const { t, i18n } = useTranslation('board');
  const locale = getLocaleTag(i18n.language);
  const dateLocale = getDateLocaleTag(i18n.language);
  const columns = useMemo(() => getColumns(t), [t]);

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const lastUpdated = results.length > 0 ? results[0].updated_at : null;

  return (
    <div
      className="flex flex-col h-full nowheel"
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-whiteinverse-a8">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 px-2 text-[10px] font-medium tracking-widest text-[var(--text-secondary)] uppercase whitespace-nowrap ${col.className}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-[13px] text-[var(--text-secondary)]"
                >
                  {t('screener.noSignals')}
                </td>
              </tr>
            ) : (
              results.map((item) => (
                <SignalRow
                  key={item.security_id}
                  item={item}
                  locale={locale}
                  dateLocale={dateLocale}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-whiteinverse-a6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="opacity-60"
          >
            <path
              d="M7 2L7 12M3.5 8.5L7 12L10.5 8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{t('screener.change')}</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className="opacity-40"
          >
            <path
              d="M2.5 4L5 6.5L7.5 4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {lastUpdated && (
          <span className="text-[11px] text-[var(--text-secondary)] opacity-60">
            {formatTimestamp(lastUpdated, dateLocale)}
          </span>
        )}
      </div>
    </div>
  );
};

export default AiScreenerResultsTable;
