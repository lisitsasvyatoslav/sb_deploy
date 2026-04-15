'use client';

/**
 * PaymentsSection — Payment history table
 *
 * Figma node: 962:206221
 */

import React, { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import DataTable, {
  type ColumnDef,
  type SortState,
  type SortDirection,
} from '@/shared/ui/DataTable';
import { TableCellString } from '@/shared/ui/DataTable/cells';
import SearchInput from '@/shared/ui/SearchInput';

interface Payment {
  id: string;
  date: string;
  amount: number;
  type: 'tokens' | 'subscription';
  status: 'paid' | 'rejected';
}

const STUB_PAYMENTS: Payment[] = [
  { id: '1', date: '06.03.2026', amount: 1000, type: 'tokens', status: 'paid' },
  {
    id: '2',
    date: '05.03.2026',
    amount: 1000,
    type: 'tokens',
    status: 'rejected',
  },
  { id: '3', date: '24.02.2026', amount: 1000, type: 'tokens', status: 'paid' },
  {
    id: '4',
    date: '12.02.2026',
    amount: 2000,
    type: 'subscription',
    status: 'paid',
  },
  {
    id: '5',
    date: '12.01.2026',
    amount: 2000,
    type: 'subscription',
    status: 'paid',
  },
];

const PaymentsSection: React.FC = () => {
  const { t } = useTranslation('profile');
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    key: 'date',
    direction: 'desc',
  });

  const handleSort = (key: string, direction: SortDirection) => {
    setSortState({ key, direction });
  };

  const columns: ColumnDef<Payment>[] = [
    {
      key: 'date',
      header: t('payments.columns.date'),
      sortable: true,
      align: 'left',
      className: 'pl-spacing-56',
      renderCell: (row) => <TableCellString align="left" value={row.date} />,
    },
    {
      key: 'amount',
      header: t('payments.columns.amount'),
      sortable: true,
      align: 'right',
      renderCell: (row) => (
        <TableCellString value={row.amount.toLocaleString('ru-RU')} />
      ),
    },
    {
      key: 'type',
      header: t('payments.columns.type'),
      sortable: true,
      align: 'right',
      renderCell: (row) => (
        <TableCellString value={t(`payments.types.${row.type}`)} />
      ),
    },
    {
      key: 'status',
      header: t('payments.columns.status'),
      sortable: true,
      align: 'right',
      className: 'pr-spacing-56',
      renderCell: (row) => (
        <TableCellString value={t(`payments.statuses.${row.status}`)} />
      ),
    },
  ];

  const filteredRows = useMemo(
    () => STUB_PAYMENTS.filter((p) => p.date.includes(search.trim())),
    [search]
  );

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    const { key, direction } = sortState;
    sorted.sort((a, b) => {
      const aVal = a[key as keyof Payment];
      const bVal = b[key as keyof Payment];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [filteredRows, sortState]);

  return (
    <div
      className="w-full max-w-[720px] py-spacing-40 flex flex-col gap-spacing-12
                 bg-wrapper-a2 border border-stroke-a4 rounded-radius-4
                 shadow-[0_20px_76px_0_rgba(0,0,0,0.2)] backdrop-blur-[16px]"
    >
      <div className="px-spacing-48 pb-spacing-12">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder={t('payments.searchPlaceholder')}
          size="md"
        />
      </div>

      <DataTable<Payment>
        columns={columns}
        rows={sortedRows}
        getRowKey={(row) => row.id}
        sortState={sortState}
        onSort={handleSort}
        rowClassName={(row) =>
          row.status === 'rejected' ? 'bg-colors-status_negative_bg' : undefined
        }
      />
    </div>
  );
};

export default PaymentsSection;
