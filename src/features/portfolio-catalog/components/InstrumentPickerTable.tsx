'use client';

import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import DataTable, { DataTableRow, DataTableCell } from '@/shared/ui/DataTable';
import type {
  ColumnDef,
  SortDirection,
  SortState,
} from '@/shared/ui/DataTable';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { InstrumentGroup } from '@/types';
import {
  TableCellTicker,
  TableCellString,
  TableCellNumbers,
} from '@/shared/ui/DataTable/cells';
import React, { useCallback, useMemo, useState } from 'react';
import { useTradeContextMenuBySymbolSingle } from '@/features/statistics/hooks/useTradeContextMenu';
import { useGroupedPositionsQuery } from '@/features/statistics/queries';
import {
  currencySymbol,
  formatNumber,
} from '@/features/statistics/utils/positionsTableUtils';
import { usePaginationSync } from '@/features/statistics/hooks/usePaginationSync';

const SKELETON_ROWS = 6;

function SkeletonRow() {
  return (
    <tr className="border-b theme-border">
      <td className="py-3 px-4">
        <div className="flex items-center gap-[6px]">
          <div className="w-[12px] h-5 shrink-0" />
          <div className="w-6 h-6 rounded-full bg-blackinverse-a12 animate-pulse shrink-0" />
          <div className="w-12 h-3 rounded-[2px] bg-blackinverse-a12 animate-pulse" />
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end">
          <div className="w-8 h-3 rounded-[2px] bg-blackinverse-a12 animate-pulse" />
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end">
          <div className="w-10 h-3 rounded-[2px] bg-blackinverse-a12 animate-pulse" />
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end">
          <div className="w-12 h-3 rounded-[2px] bg-blackinverse-a12 animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

export interface InstrumentPickerTableProps {
  onInstrumentSelectionChange?: (instruments: string[]) => void;
  initialParentInstruments?: string[];
  parentOnlySelection?: boolean;
}

function computeAssetValue(
  quantity: string | undefined | null,
  currentPrice: string | undefined | null,
  avgOpenPrice: string | undefined | null
): number {
  const qty = parseFloat(quantity || '0');
  const price = parseFloat(currentPrice || avgOpenPrice || '0');
  return qty !== 0 && price !== 0 ? qty * price : 0;
}

function getAssetValue(instrument: InstrumentGroup): number {
  return computeAssetValue(
    instrument.totalQuantity,
    instrument.currentPrice,
    instrument.avgOpenPrice
  );
}

const InstrumentPickerTable: React.FC<InstrumentPickerTableProps> = ({
  onInstrumentSelectionChange,
  initialParentInstruments,
  parentOnlySelection,
}) => {
  const { t, i18n } = useTranslation('statistics');
  const locale = getLocaleTag(i18n.language);
  const filters = useStatisticsStore((state) => state.positionsFilters);

  const { data, isLoading } = useGroupedPositionsQuery(filters);
  const instruments = useMemo(() => data?.data || [], [data?.data]);

  usePaginationSync(data?.pagination);

  const [sortState, setSortState] = useState<SortState>({
    key: '',
    direction: 'asc',
  });

  const handleSort = useCallback((key: string, direction: SortDirection) => {
    setSortState({ key, direction });
  }, []);

  const selectionOptions = useMemo(
    () =>
      onInstrumentSelectionChange || initialParentInstruments?.length
        ? {
            onInstrumentSelectionChange,
            initialParentInstruments,
            parentOnlySelection,
          }
        : undefined,
    [onInstrumentSelectionChange, initialParentInstruments, parentOnlySelection]
  );

  const { selectedKeys, handleRowClick, setSelection } =
    useTradeContextMenuBySymbolSingle(selectionOptions);

  const allSelected =
    instruments.length > 0 && selectedKeys.size === instruments.length;
  const someSelected =
    selectedKeys.size > 0 && selectedKeys.size < instruments.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelection([]);
    } else {
      setSelection(instruments.map((i) => i.instrument));
    }
  }, [allSelected, instruments, setSelection]);

  const columns = useMemo<ColumnDef<InstrumentGroup>[]>(
    () => [
      {
        key: 'instrument',
        header: t('columnsLower.instrument'),
        align: 'left',
        sortable: true,
        checkbox: true,
        checked: allSelected,
        indeterminate: someSelected,
        onCheckboxChange: toggleAll,
        renderCell: (instrument, isExpanded, toggle, isSelected) => (
          <TableCellTicker
            ticker={instrument.instrument}
            securityId={instrument.securityId}
            isExpanded={isExpanded}
            onToggle={toggle}
            isSelected={isSelected}
          />
        ),
      },
      {
        key: 'broker',
        header: t('columnsLower.broker'),
        align: 'right',
        sortable: true,
        renderCell: (instrument, isExpanded) => {
          const firstBroker = instrument.brokers[0];
          const extraBrokers = instrument.brokers.length - 1;
          if (isExpanded || !firstBroker) return null;
          return (
            <TableCellString
              value={firstBroker.brokerType}
              count={extraBrokers > 0 ? extraBrokers : undefined}
            />
          );
        },
      },
      {
        key: 'account',
        header: t('columnsLower.account'),
        align: 'right',
        sortable: true,
        renderCell: (instrument, isExpanded) => {
          const allAccounts = instrument.brokers.flatMap((b) => b.accounts);
          const firstAccount = allAccounts[0];
          const extraAccounts = allAccounts.length - 1;
          if (isExpanded || !firstAccount) return null;
          return (
            <TableCellString
              value={firstAccount.accountName || firstAccount.accountId}
              count={extraAccounts > 0 ? extraAccounts : undefined}
            />
          );
        },
      },
      {
        key: 'assetValue',
        header: t('columnsLower.assetValue'),
        align: 'right',
        sortable: true,
        renderCell: (instrument) => {
          const value = getAssetValue(instrument);
          if (value === 0) return <TableCellNumbers value="—" />;
          return (
            <TableCellNumbers
              value={`${formatNumber(value, 2, locale)} ${currencySymbol(instrument.currency)}`}
            />
          );
        },
      },
    ],
    [t, locale, allSelected, someSelected, toggleAll]
  );

  const sortedInstruments = useMemo(() => {
    if (!sortState.key) return instruments;
    const dir = sortState.direction === 'asc' ? 1 : -1;
    return [...instruments].sort((a, b) => {
      switch (sortState.key) {
        case 'instrument':
          return a.instrument.localeCompare(b.instrument) * dir;
        case 'broker': {
          const aB = a.brokers[0]?.brokerType ?? '';
          const bB = b.brokers[0]?.brokerType ?? '';
          return aB.localeCompare(bB) * dir;
        }
        case 'account': {
          const aA = a.brokers.flatMap((br) => br.accounts)[0];
          const bA = b.brokers.flatMap((br) => br.accounts)[0];
          const aName = aA?.accountName || aA?.accountId || '';
          const bName = bA?.accountName || bA?.accountId || '';
          return aName.localeCompare(bName) * dir;
        }
        case 'assetValue':
          return (getAssetValue(a) - getAssetValue(b)) * dir;
        default:
          return 0;
      }
    });
  }, [instruments, sortState]);

  return (
    <div className="h-full overflow-hidden">
      <DataTable
        columns={columns}
        rows={sortedInstruments}
        getRowKey={(instrument) => instrument.instrument}
        onRowClick={handleRowClick}
        selectedKeys={selectedKeys}
        sortState={sortState}
        onSort={handleSort}
        renderExpandedRows={(instrument) => (
          <>
            {instrument.brokers.flatMap((broker) =>
              broker.accounts.map((account) => {
                const value = computeAssetValue(
                  account.quantity,
                  account.currentPrice,
                  account.avgOpenPrice
                );
                return (
                  <DataTableRow
                    key={`${instrument.instrument}-${broker.brokerType}-${account.accountId}`}
                  >
                    <DataTableCell className="pl-12" />
                    <DataTableCell align="right">
                      <TableCellString value={broker.brokerType} />
                    </DataTableCell>
                    <DataTableCell align="right">
                      <TableCellString
                        value={
                          account.accountName
                            ? `${account.accountId} ${account.accountName}`
                            : account.accountId
                        }
                      />
                    </DataTableCell>
                    <DataTableCell align="right">
                      <TableCellNumbers
                        value={
                          value !== 0
                            ? `${formatNumber(value, 2, locale)} ${currencySymbol(account.currency || instrument.currency)}`
                            : '—'
                        }
                      />
                    </DataTableCell>
                  </DataTableRow>
                );
              })
            )}
          </>
        )}
        isLoading={isLoading}
        loadingFallback={
          <table className="w-full">
            <tbody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        }
        isEmpty={instruments.length === 0}
        emptyFallback={
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12">
            <p className="text-[14px] leading-[20px] font-semibold tracking-[-0.2px] text-blackinverse-a100 text-center">
              {t('instrumentPicker.emptyTitle')}
            </p>
            <p className="text-[12px] leading-[16px] font-normal tracking-[-0.2px] text-blackinverse-a56 text-center">
              {t('instrumentPicker.emptyDescription')}
            </p>
          </div>
        }
      />
    </div>
  );
};

export default InstrumentPickerTable;
