import Button from '@/shared/ui/Button';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import React from 'react';
import { FundamentalData } from '@/types/ticker';
import { useFundamentalDataByTickersQuery } from '@/features/ticker/queries';
import { useNewsAnalyticsModalStore } from '@/features/ticker/stores/newsAnalyticsModalStore';
import { useFundamentalModalStore } from '@/features/ticker/stores/fundamentalModalStore';
import { useTranslation } from '@/shared/i18n/client';
import { Check, InfoOutlined } from '@mui/icons-material';
import TickerIcon from '@/shared/ui/TickerIcon';
import Table, { TableColumn } from '@/shared/ui/Table';
import { formatMonetaryValue } from '@/features/ticker/utils/currency';
import { REGION } from '@/shared/config/region';

const FundamentalTab: React.FC = () => {
  const { selectedTickers, selectedFundamentalIds, toggleFundamentalRow } =
    useNewsAnalyticsModalStore();
  const { openModal } = useFundamentalModalStore();
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);

  // Fetch fundamental data using TanStack Query
  const { data: filteredFundamental = [], isLoading } =
    useFundamentalDataByTickersQuery(selectedTickers);

  const formatNumber = (value: number | null | undefined) => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleRowClick = (row: FundamentalData) => {
    toggleFundamentalRow(row.id);
  };

  const handleInfoClick = (e: React.MouseEvent, row: FundamentalData) => {
    e.stopPropagation(); // Prevent row click
    openModal(row, true);
  };

  // Table columns definition
  const columns: TableColumn<FundamentalData>[] = [
    {
      key: 'ticker',
      label: '',
      width: '126px',
      render: (row) => {
        const isSelected = selectedFundamentalIds.includes(row.id);
        return (
          <div className="flex gap-3 items-center min-w-0">
            <div className="relative flex-shrink-0">
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
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <p className="text-[15px] font-medium text-[var(--text-base)] leading-[22px] tracking-[-0.09px] overflow-hidden text-ellipsis whitespace-nowrap">
                {REGION === 'us' ? row.tickerSymbol : row.tickerName}
              </p>
              <p className="text-xs font-medium text-[var(--text-muted)] leading-4 overflow-hidden text-ellipsis whitespace-nowrap">
                {row.tickerSymbol}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'pe',
      label: '',
      align: 'right',
      width: '80px',
      render: (row) => (
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[15px] font-medium text-[var(--text-base)] leading-5 tracking-[-0.24px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {formatNumber(row.pe)}
          </span>
          <span className="text-xs font-medium text-[var(--text-muted)] leading-4 whitespace-nowrap">
            {t('fundamental.metrics.pe')}
          </span>
        </div>
      ),
    },
    {
      key: 'debtRatio',
      label: '',
      align: 'right',
      width: '80px',
      render: (row) => {
        // Handle both legacy number and new FundamentalMetric structure
        const debtRatioValue =
          typeof row.debtRatio === 'object' && row.debtRatio !== null
            ? row.debtRatio.value
            : row.debtRatio;
        return (
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[15px] font-medium text-[var(--text-base)] leading-5 tracking-[-0.24px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {formatNumber(debtRatioValue)}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)] leading-4 whitespace-nowrap">
              {t('fundamental.metrics.debtRatio')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'roe',
      label: '',
      align: 'right',
      width: '80px',
      render: (row) => {
        // Handle both legacy number and new FundamentalMetric structure
        const roeValue =
          typeof row.roe === 'object' && row.roe !== null
            ? row.roe.value
            : row.roe;
        return (
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[15px] font-medium text-[var(--text-base)] leading-5 tracking-[-0.24px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {formatNumber(roeValue)}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)] leading-4 whitespace-nowrap">
              {t('fundamental.metrics.roe')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'ebitda',
      label: '',
      align: 'right',
      width: '126px',
      render: (row) => {
        // Handle both legacy number and new FundamentalMetric structure
        const ebitdaValue =
          typeof row.ebitda === 'object' && row.ebitda !== null
            ? row.ebitda.value
            : row.ebitda;
        // Convert to billions (e.g., 32250000000 => 32.25)
        const ebitdaInBillions =
          ebitdaValue !== undefined && ebitdaValue !== null
            ? ebitdaValue / 1_000_000_000
            : undefined;

        return (
          <div className="flex flex-col gap-1 items-end">
            <div className="flex gap-0.5 items-start overflow-hidden max-w-full">
              <span className="text-[15px] font-medium text-[var(--text-base)] leading-5 tracking-[-0.24px] whitespace-nowrap overflow-hidden text-ellipsis">
                {formatMonetaryValue(
                  ebitdaInBillions,
                  t('scale.billion'),
                  row.currency,
                  formatNumber
                )}
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] leading-4 whitespace-nowrap">
              {t('fundamental.metrics.ebitda')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'netIncome',
      label: '',
      align: 'right',
      width: '124px',
      render: (row) => {
        // Show net income in billions (e.g., 43000000000 -> 43)
        const netIncomeValue =
          typeof row.netIncome === 'object' && row.netIncome !== null
            ? row.netIncome.value
            : row.netIncome;
        const netIncomeInBillions =
          netIncomeValue !== undefined && netIncomeValue !== null
            ? netIncomeValue / 1_000_000_000
            : undefined;

        return (
          <div className="flex flex-col gap-1 items-end">
            <div className="flex gap-0.5 items-start overflow-hidden max-w-full">
              <span className="text-[15px] font-medium text-[var(--text-base)] leading-5 tracking-[-0.24px] whitespace-nowrap overflow-hidden text-ellipsis">
                {formatMonetaryValue(
                  netIncomeInBillions,
                  t('scale.billion'),
                  row.currency,
                  formatNumber
                )}
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] leading-4 whitespace-nowrap">
              {t('fundamental.metrics.netIncome')}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 min-h-0 px-8 pr-4 pt-2 pb-0 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-sm text-gray-500">
            {t('fundamental.loadingData')}
          </div>
        </div>
      ) : filteredFundamental.length === 0 ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-sm text-gray-500">{t('fundamental.noData')}</div>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={filteredFundamental}
          onRowClick={handleRowClick}
          getRowKey={(row) => String(row.id)}
          getRowId={(row) => row.id}
          selectedRows={selectedFundamentalIds}
          isHeaderHidden={true}
          isEqualGap
          rowActions={(row, isHovered) => (
            <Button
              onClick={(e) => handleInfoClick(e, row)}
              variant={isHovered ? 'accent' : 'ghost'}
              size="sm"
              icon={<InfoOutlined sx={{ fontSize: 20 }} />}
              className="!p-2 !rounded-full"
              aria-label={t('fundamental.showDetails')}
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

export default FundamentalTab;
