import TickerIcon from '@/shared/ui/TickerIcon';
import Button from '@/shared/ui/Button';
import Table, { TableColumn } from '@/shared/ui/Table';
import { useTechnicalDataByTickersQuery } from '@/features/ticker/queries';
import { useNewsAnalyticsModalStore } from '@/features/ticker/stores/newsAnalyticsModalStore';
import { useTechAnalysisModalStore } from '@/features/ticker/stores/techAnalysisModalStore';
import {
  translateDescription,
  translateIndicatorName,
} from '@/features/ticker/utils/techAnalysisTranslations';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import { TechnicalAnalysisData, TechnicalIndicator } from '@/types/ticker';
import { Check, InfoOutlined } from '@mui/icons-material';
import React from 'react';
import { REGION } from '@/shared/config/region';

const TechAnalysisTab: React.FC = () => {
  const { selectedTickers, selectedTechnicalIds, toggleTechnicalRow } =
    useNewsAnalyticsModalStore();
  const { openModal } = useTechAnalysisModalStore();
  const { t } = useTranslation('ticker');
  const tFn = t as TranslateFn;

  // Fetch technical data using TanStack Query
  const { data: filteredTechnical = [], isLoading } =
    useTechnicalDataByTickersQuery(selectedTickers);

  // Get display indicators (prioritize EMA-100, RSI, MACD)
  const getDisplayIndicators = (indicators: TechnicalIndicator[]) => {
    // Priority indicators to display in order
    const priority = ['EMA-100', 'EMA100', 'RSI', 'MACD'];

    // Find indicators matching priority order (case-insensitive, ignore spaces/dashes)
    const priorityIndicators = priority
      .map((name) =>
        indicators.find(
          (ind) =>
            ind.name.toUpperCase().replace(/[- ]/g, '') ===
            name.replace(/[- ]/g, '')
        )
      )
      .filter((ind): ind is TechnicalIndicator => ind !== undefined);

    // If we have less than 3 priority indicators, add other available indicators
    if (priorityIndicators.length < 3) {
      const usedNames = new Set(priorityIndicators.map((ind) => ind.name));
      const otherIndicators = indicators.filter(
        (ind) => !usedNames.has(ind.name) && ind.name !== 'Last Price'
      );
      priorityIndicators.push(
        ...otherIndicators.slice(0, 3 - priorityIndicators.length)
      );
    }

    return priorityIndicators.slice(0, 3);
  };

  const handleRowClick = (techData: TechnicalAnalysisData) => {
    toggleTechnicalRow(String(techData.id));
  };

  const handleInfoClick = (
    e: React.MouseEvent,
    techData: TechnicalAnalysisData
  ) => {
    e.stopPropagation(); // Prevent row click
    openModal(techData, true);
  };

  // Table columns definition
  const columns: TableColumn<TechnicalAnalysisData>[] = [
    {
      key: 'ticker',
      label: '',
      render: (row) => {
        const isSelected = selectedTechnicalIds.includes(String(row.id));

        return (
          <div className="flex items-center gap-3">
            {/* Ticker Logo with checkmark */}
            <div className="relative">
              <TickerIcon
                securityId={row.securityId}
                symbol={row.tickerSymbol}
                size={48}
              />
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary-500 border-2 border-[var(--surface-medium)] flex items-center justify-center">
                  <Check sx={{ fontSize: 16 }} className="text-white" />
                </div>
              )}
            </div>

            {/* Ticker Info */}
            <div className="text-left">
              <p className="text-[15px] font-medium text-[var(--text-base)] leading-[22px] tracking-[-0.09px]">
                {REGION === 'us' ? row.tickerSymbol : row.tickerName}
              </p>
              <p className="text-[12px] font-medium text-[var(--text-muted)] leading-[16px]">
                {row.tickerSymbol}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'indicator1',
      label: '',
      align: 'right',
      render: (row) => {
        const indicators = getDisplayIndicators(row.indicators);
        const indicator = indicators[0];
        return indicator ? (
          <div className="flex flex-col items-end gap-[4px]">
            <p className="text-[15px] font-medium text-[var(--text-base)] leading-[20px] tracking-[-0.24px] text-right whitespace-nowrap">
              {indicator.description
                ? translateDescription(tFn, indicator.description)
                : '—'}
            </p>
            <p className="text-[12px] font-medium text-[var(--text-muted)] leading-[16px] whitespace-nowrap">
              {translateIndicatorName(tFn, indicator.name)}
            </p>
          </div>
        ) : (
          <div />
        );
      },
    },
    {
      key: 'indicator2',
      label: '',
      align: 'right',
      render: (row) => {
        const indicators = getDisplayIndicators(row.indicators);
        const indicator = indicators[1];
        return indicator ? (
          <div className="flex flex-col items-end gap-[4px]">
            <p className="text-[15px] font-medium text-[var(--text-base)] leading-[20px] tracking-[-0.24px] text-right whitespace-nowrap">
              {indicator.description
                ? translateDescription(tFn, indicator.description)
                : '—'}
            </p>
            <p className="text-[12px] font-medium text-[var(--text-muted)] leading-[16px] whitespace-nowrap">
              {translateIndicatorName(tFn, indicator.name)}
            </p>
          </div>
        ) : (
          <div />
        );
      },
    },
    {
      key: 'indicator3',
      label: '',
      align: 'right',
      render: (row) => {
        const indicators = getDisplayIndicators(row.indicators);
        const indicator = indicators[2];
        return indicator ? (
          <div className="flex flex-col items-end gap-[4px]">
            <p className="text-[15px] font-medium text-[var(--text-base)] leading-[20px] tracking-[-0.24px] text-right whitespace-nowrap">
              {indicator.description
                ? translateDescription(tFn, indicator.description)
                : '—'}
            </p>
            <p className="text-[12px] font-medium text-[var(--text-muted)] leading-[16px] whitespace-nowrap">
              {translateIndicatorName(tFn, indicator.name)}
            </p>
          </div>
        ) : (
          <div />
        );
      },
    },
  ];

  return (
    <div className="flex-1 min-h-0 px-8 pr-4 pt-2 pb-0 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-sm text-gray-500">
            {t('techAnalysis.loadingData')}
          </div>
        </div>
      ) : filteredTechnical.length === 0 ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-sm text-gray-500">
            {t('techAnalysis.selectTickers')}
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={filteredTechnical}
          onRowClick={handleRowClick}
          getRowKey={(row) => String(row.id)}
          getRowId={(row) => row.id}
          selectedRows={selectedTechnicalIds}
          isHeaderHidden={true}
          isEqualGap={true}
          rowActions={(row, isHovered) => (
            <Button
              onClick={(e) => handleInfoClick(e, row)}
              variant={isHovered ? 'accent' : 'ghost'}
              size="sm"
              icon={<InfoOutlined sx={{ fontSize: 20 }} />}
              className="!p-2 !rounded-full"
              aria-label={t('techAnalysis.showDetails')}
            />
          )}
          virtualized={{
            enabled: true,
            estimateSize: 80,
            overscan: 5,
          }}
        />
      )}
    </div>
  );
};

export default TechAnalysisTab;
