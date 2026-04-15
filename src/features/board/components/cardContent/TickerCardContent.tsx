import TickerIcon from '@/shared/ui/TickerIcon';
import { lazy, Suspense } from 'react';

const SparklineChart = lazy(
  () => import('@/features/ticker/components/SparklineChart')
);
import { useTickerChartData } from '@/features/ticker/hooks/useTickerChartData';
import { useTranslation } from '@/shared/i18n/client';
import { REGION } from '@/shared/config/region';
import React from 'react';

interface TickerCardContentProps {
  securityId?: number;
  symbol?: string;
  tickerName?: string;
}

const formatPrice = (val: number) => val.toFixed(2);
const formatChange = (val: number) => (val >= 0 ? '+' : '') + val.toFixed(2);
const formatPercent = (val: number) =>
  (val >= 0 ? '+' : '') + val.toFixed(2) + '%';

const TickerCardContent: React.FC<TickerCardContentProps> = ({
  securityId,
  symbol,
  tickerName,
}) => {
  const { t } = useTranslation('board');
  const { data, isLoading } = useTickerChartData({
    security_id: securityId,
    period: 'all',
    enabled: !!securityId,
  });

  const price = data?.price ?? 0;
  const priceChange = data?.priceChange ?? 0;
  const priceChangePercent = data?.priceChangePercent ?? 0;
  const sparkline = data?.sparkline ?? [];
  // On US deployment show only the ticker symbol — never the company name (which may be
  // in Russian even on the English stand, or stored from pre-REGION-fix card meta).
  const displayName =
    REGION === 'us' ? symbol || '' : data?.name || tickerName || symbol || '';
  const isPositive = priceChange >= 0;

  const changeColor = isPositive
    ? 'text-status-success'
    : 'text-status-negative';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={`text-[11px] leading-none ${changeColor}`}>
            {isPositive ? '▲' : '▼'}
          </span>
          <span className="text-[13px] font-semibold text-text-primary tracking-[-0.1px]">
            {symbol}
          </span>
        </div>
        <span
          className={`text-[13px] font-semibold ${changeColor} tracking-[-0.1px]`}
        >
          {formatChange(priceChange)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-text-secondary">
          {displayName}
        </span>
        <span className={`text-[11px] font-semibold ${changeColor}`}>
          {formatPercent(priceChangePercent)}
        </span>
      </div>

      {sparkline.length > 0 && (
        <div className="w-full flex-1 min-h-[50px]">
          <Suspense fallback={null}>
            <SparklineChart
              data={sparkline}
              height={80}
              period="all"
              customColor="var(--mind-brand)"
            />
          </Suspense>
        </div>
      )}

      <div className="text-[28px] font-bold text-text-primary leading-tight">
        {formatPrice(price)}
      </div>

      <div className="flex items-center gap-1.5 mt-auto">
        <TickerIcon securityId={securityId} symbol={symbol || ''} size={20} />
        <span className="text-[11px] font-medium text-text-primary">
          {symbol}
        </span>
        <span className="text-[11px] text-text-secondary ml-auto uppercase">
          {t('cardContent.justNow')}
        </span>
      </div>
    </div>
  );
};

export default TickerCardContent;
