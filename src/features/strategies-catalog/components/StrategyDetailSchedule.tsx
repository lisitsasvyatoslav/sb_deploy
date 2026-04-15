'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { PeriodTab } from '../mock/strategyDetail';

interface StrategyDetailScheduleProps {
  activePeriod: PeriodTab;
  onPeriodChange: (period: PeriodTab) => void;
  currentReturn: number;
  chartData: number[];
  chartDates: string[];
  portfolioData: number[];
  isLoading?: boolean;
}

interface ChartPoint {
  index: number;
  date: string;
  strategy: number;
  portfolio: number;
}

const STRATEGY_COLOR = 'var(--mind-accent)';
const PORTFOLIO_COLOR = 'var(--blackinverse-a72)';
const STRATEGY_GRADIENT_ID = 'strategyDetailGradient';
const PORTFOLIO_GRADIENT_ID = 'portfolioDetailGradient';
const PORTFOLIO_SHADOW_ID = 'portfolioLineShadow';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  hidePortfolio: boolean;
}

const ChartTooltipContent: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  hidePortfolio,
}) => {
  const { t } = useTranslation('common');

  if (!active || !payload?.length) return null;

  const data = payload[0].payload as ChartPoint;

  const strategyRow = (
    <div className="flex items-end justify-between">
      <span className="text-[10px] leading-3 tracking-[-0.2px] font-medium text-blackinverse-a100">
        {t('strategiesCatalog.detail.strategy')}
      </span>
      <span className="text-[10px] leading-3 tracking-[-0.2px] font-medium text-blackinverse-a100">
        {Math.round(data.strategy)}%
      </span>
    </div>
  );

  const portfolioRow = !hidePortfolio && (
    <div className="flex items-end justify-between">
      <span className="text-[10px] leading-3 tracking-[-0.2px] text-blackinverse-a56">
        {t('strategiesCatalog.detail.myPortfolio')}
      </span>
      <span className="text-[10px] leading-3 tracking-[-0.2px] text-blackinverse-a56">
        {Math.round(data.portfolio)}%
      </span>
    </div>
  );

  const strategyFirst = hidePortfolio || data.strategy >= data.portfolio;

  return (
    <div className="bg-background-card rounded p-2 shadow-[0px_0px_0.5px_0px_rgba(57,57,66,0.06),0px_5px_10px_0px_rgba(57,57,66,0.06),0px_15px_30px_0px_rgba(57,57,66,0.06)]">
      <div className="flex flex-col gap-0.5 w-[120px]">
        {strategyFirst ? (
          <>
            {strategyRow}
            {portfolioRow}
          </>
        ) : (
          <>
            {portfolioRow}
            {strategyRow}
          </>
        )}
      </div>
    </div>
  );
};

const ChartSkeleton: React.FC = () => (
  <div className="w-full h-[328px] flex animate-pulse">
    <div className="flex-1 flex items-center justify-center">
      <svg
        width="100%"
        height="140"
        viewBox="0 0 600 140"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120 L50 110 L100 100 L150 90 L200 70 L250 50 L300 40 L350 60 L400 80 L450 70 L500 90 L550 100 L600 110"
          className="stroke-blackinverse-a12"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
    <div className="flex flex-col justify-between py-2.5 w-[44px]">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-2 w-10 bg-blackinverse-a12 rounded" />
      ))}
    </div>
  </div>
);

export const StrategyDetailSchedule: React.FC<StrategyDetailScheduleProps> = ({
  activePeriod,
  onPeriodChange,
  currentReturn,
  chartData,
  chartDates,
  portfolioData,
  isLoading,
}) => {
  const [hidePortfolio, setHidePortfolio] = useState(true);
  const { t, i18n } = useTranslation('common');

  const periodItems = [
    { label: t('strategiesCatalog.periods.month'), value: 'MONTH' },
    { label: t('strategiesCatalog.periods.year'), value: 'YEAR' },
    { label: t('strategiesCatalog.detail.allTime'), value: 'ALL' },
  ];

  const portfolioItems = [
    { label: t('strategiesCatalog.detail.myPortfolio'), value: 'my' },
    { label: t('strategiesCatalog.detail.hidePortfolio'), value: 'none' },
  ];

  const rechartsData = useMemo<ChartPoint[]>(
    () =>
      chartData.map((v, i) => ({
        index: i,
        date: chartDates[i] ?? '',
        strategy: v,
        portfolio: portfolioData[i],
      })),
    [chartData, chartDates, portfolioData]
  );

  const activeDot = {
    r: 5,
    strokeWidth: 2,
    stroke: 'var(--bg-base)',
  };

  const MONTH_SHORT = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const d = new Date(2024, i, 1);
        return d
          .toLocaleDateString(i18n.language, { month: 'short' })
          .replace('.', '');
      }),
    [i18n.language]
  );

  /** Индексы точек, соответствующие началу каждого нового месяца */
  const monthTicks = useMemo(() => {
    const ticks: number[] = [];
    let prevMonth = -1;
    rechartsData.forEach((pt) => {
      if (!pt.date) return;
      const m = new Date(pt.date).getMonth();
      if (m !== prevMonth) {
        ticks.push(pt.index);
        prevMonth = m;
      }
    });
    return ticks;
  }, [rechartsData]);

  const xTickFormatter = (index: number) => {
    const pt = rechartsData[index];
    if (!pt?.date) return '';
    const d = new Date(pt.date);
    const m = d.getMonth();
    const y = d.getFullYear();
    // Если январь — показываем год вместо названия месяца (как в дизайне)
    if (m === 0) return String(y);
    return MONTH_SHORT[m];
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Period + portfolio + benchmark dropdowns */}
      <div className="flex items-center gap-2">
        <Dropdown
          trigger={({ isOpen, onClick, triggerRef }) => (
            <button
              ref={triggerRef}
              onClick={onClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-border-light text-14 text-text-primary hover:bg-blackinverse-a4 transition"
            >
              {periodItems.find((i) => i.value === activePeriod)?.label}
              <Icon
                variant="chevronDown"
                size={16}
                className={
                  isOpen
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
              />
            </button>
          )}
          items={periodItems}
          selectedValue={activePeriod}
          onSelect={(v) => onPeriodChange(v as PeriodTab)}
        />
        <Dropdown
          trigger={({ isOpen, onClick, triggerRef }) => (
            <button
              ref={triggerRef}
              onClick={onClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-border-light text-14 text-text-secondary hover:bg-blackinverse-a4 transition"
            >
              {hidePortfolio
                ? t('strategiesCatalog.detail.selectPortfolio')
                : t('strategiesCatalog.detail.myPortfolio')}
              <Icon
                variant="chevronDown"
                size={16}
                className={
                  isOpen
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
              />
            </button>
          )}
          items={portfolioItems}
          selectedValue={hidePortfolio ? 'none' : 'my'}
          onSelect={(v) => setHidePortfolio(v === 'none')}
        />
        <Dropdown
          trigger={({ isOpen, onClick, triggerRef }) => (
            <button
              ref={triggerRef}
              onClick={onClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-border-light text-14 text-text-secondary hover:bg-blackinverse-a4 transition"
            >
              {t('strategiesCatalog.detail.selectBenchmark')}
              <Icon
                variant="chevronDown"
                size={16}
                className={
                  isOpen
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
              />
            </button>
          )}
          items={[]}
          onSelect={() => {}}
        />
      </div>

      {/* Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={328}>
          <AreaChart
            data={rechartsData}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient
                id={STRATEGY_GRADIENT_ID}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={STRATEGY_COLOR}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={STRATEGY_COLOR}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient
                id={PORTFOLIO_GRADIENT_ID}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={PORTFOLIO_COLOR}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={PORTFOLIO_COLOR}
                  stopOpacity={0.05}
                />
              </linearGradient>
              <filter
                id={PORTFOLIO_SHADOW_ID}
                x="-5%"
                y="-10%"
                width="110%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="2"
                  floodColor="rgba(0,0,0,0.25)"
                />
              </filter>
            </defs>

            <CartesianGrid
              horizontal
              vertical={false}
              stroke="var(--stroke-a12)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="index"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={monthTicks}
              tickFormatter={xTickFormatter}
              tick={{
                fontSize: 10,
                fill: 'var(--blackinverse-a56)',
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={{ stroke: 'var(--stroke-a12)' }}
              dy={4}
            />
            <YAxis
              orientation="right"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v: number) => v.toFixed(2)}
              tick={{
                fontSize: 10,
                fill: 'var(--blackinverse-a56)',
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={false}
              dx={8}
              width={44}
            />

            <Tooltip
              content={<ChartTooltipContent hidePortfolio={hidePortfolio} />}
              cursor={{
                stroke: 'var(--blackinverse-a32)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
              wrapperStyle={{ outline: 'none', background: 'transparent' }}
            />

            <Area
              type="monotone"
              dataKey="strategy"
              stroke={STRATEGY_COLOR}
              strokeWidth={2}
              fill={`url(#${STRATEGY_GRADIENT_ID})`}
              fillOpacity={1}
              isAnimationActive={false}
              activeDot={{ ...activeDot, fill: STRATEGY_COLOR }}
            />

            {!hidePortfolio && (
              <>
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="transparent"
                  strokeWidth={0}
                  fill={`url(#${PORTFOLIO_GRADIENT_ID})`}
                  fillOpacity={1}
                  isAnimationActive={false}
                  activeDot={false}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke={PORTFOLIO_COLOR}
                  strokeWidth={2}
                  fill="none"
                  isAnimationActive={false}
                  activeDot={{ ...activeDot, fill: PORTFOLIO_COLOR }}
                  style={{ filter: `url(#${PORTFOLIO_SHADOW_ID})` }}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StrategyDetailSchedule;
