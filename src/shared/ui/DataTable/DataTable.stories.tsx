import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import DataTable, { type ColumnDef, type SortState } from './DataTable';
import {
  TableCellChart,
  TableCellNumbers,
  TableCellString,
  TableCellSymbol,
  TableCellTicker,
} from './cells';
import DataTableCell from './primitives/DataTableCell';
import DataTableHead from './primitives/DataTableHead';
import DataTableHeaderCell from './primitives/DataTableHeaderCell';
import DataTableRow from './primitives/DataTableRow';
import TableCellButton from './cells/TableCellButton';

// ===== Sample data =====

interface PositionRow {
  id: string;
  ticker: string;
  trades: number;
  pnl: number;
  winRate: number;
}

const sampleRows: PositionRow[] = [
  { id: '1', ticker: 'AAPL', trades: 12, pnl: 4250, winRate: 75 },
  { id: '2', ticker: 'TSLA', trades: 8, pnl: -1200, winRate: 37.5 },
  { id: '3', ticker: 'NVDA', trades: 15, pnl: 8900, winRate: 80 },
  { id: '4', ticker: 'MSFT', trades: 6, pnl: 2100, winRate: 66.7 },
  { id: '5', ticker: 'AMZN', trades: 9, pnl: -450, winRate: 44.4 },
];

const baseColumns: ColumnDef<PositionRow>[] = [
  {
    key: 'ticker',
    header: 'Тикер',
    renderCell: (row) => <strong>{row.ticker}</strong>,
  },
  {
    key: 'trades',
    header: 'Сделок',
    align: 'right',
    renderCell: (row) => row.trades,
  },
  {
    key: 'pnl',
    header: 'P&L',
    align: 'right',
    renderCell: (row) => (
      <span
        style={{
          color:
            row.pnl >= 0
              ? 'var(--color-success, #22c55e)'
              : 'var(--color-negative, #ef4444)',
        }}
      >
        {row.pnl >= 0 ? '+' : ''}
        {row.pnl.toLocaleString('ru')} ₽
      </span>
    ),
  },
  {
    key: 'winRate',
    header: 'Win%',
    align: 'right',
    renderCell: (row) => `${row.winRate.toFixed(1)}%`,
  },
];

const columnsWithExpand: ColumnDef<PositionRow>[] = [
  {
    key: 'expand',
    header: '',
    className: 'w-10',
    renderCell: (_row, isExpanded, toggle) => (
      <button
        onClick={toggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        {isExpanded ? '▼' : '▶'}
      </button>
    ),
  },
  ...baseColumns,
];

// ===== Meta =====

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  tags: ['autodocs'],

  argTypes: {
    columns: { table: { disable: true } },
    rows: { table: { disable: true } },
    getRowKey: { table: { disable: true } },
    renderExpandedRows: { table: { disable: true } },
    header: { table: { disable: true } },
    loadingFallback: { table: { disable: true } },
    emptyFallback: { table: { disable: true } },
    isLoading: { control: 'boolean', description: 'Показать loadingFallback' },
    isEmpty: { control: 'boolean', description: 'Показать emptyFallback' },
  },

  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ===== Stories =====

export const Basic: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <DataTable
        columns={baseColumns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const LoadingState: Story = {
  render: () => (
    <div style={{ height: 200 }}>
      <DataTable
        columns={baseColumns}
        rows={[]}
        getRowKey={(row) => row.id}
        isLoading
        loadingFallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <p style={{ color: 'var(--text-secondary, #888)' }}>
              Загрузка данных...
            </p>
          </div>
        }
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const EmptyState: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <DataTable
        columns={baseColumns}
        rows={[]}
        getRowKey={(row) => row.id}
        isEmpty
        emptyFallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <p style={{ color: 'var(--text-secondary, #888)' }}>
              Нет данных для отображения
            </p>
          </div>
        }
        header={
          <div style={{ padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>
            Позиции
          </div>
        }
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const WithExpandedRows: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <DataTable
        columns={columnsWithExpand}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        renderExpandedRows={(row) => (
          <tr>
            <td
              colSpan={columnsWithExpand.length}
              style={{
                padding: '8px 16px',
                background: 'var(--surface-medium, #f9f9f9)',
                fontSize: 13,
              }}
            >
              <strong>{row.ticker}</strong>: {row.trades} сделок, P&amp;L ={' '}
              {row.pnl} ₽, WinRate = {row.winRate}%
            </td>
          </tr>
        )}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const WithHeader: Story = {
  render: () => (
    <div style={{ height: 360 }}>
      <DataTable
        columns={baseColumns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        header={
          <div
            style={{
              padding: '12px 16px',
              fontWeight: 600,
              fontSize: 16,
              borderBottom: '1px solid var(--border-light, #eee)',
              marginBottom: 4,
            }}
          >
            Статистика по тикерам
          </div>
        }
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

function WithSymbolSelectionDemo() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const columns: ColumnDef<PositionRow>[] = [
    {
      key: 'symbol',
      header: '',
      className: 'w-10',
      renderCell: (row, _isExpanded, _toggle, isSelected) => (
        <TableCellSymbol
          ticker={row.ticker}
          isSelected={isSelected}
          onToggle={() => toggle(row.id)}
        />
      ),
    },
    ...baseColumns,
  ];

  return (
    <div style={{ height: 300 }}>
      <DataTable
        columns={columns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        selectedKeys={selectedKeys}
        onRowClick={(row) => toggle(row.id)}
      />
    </div>
  );
}

export const WithSymbolSelection: Story = {
  name: 'TableCellSymbol — выбор строк',
  render: () => <WithSymbolSelectionDemo />,
  parameters: { controls: { disable: true } },
};

function WithSortingDemo() {
  const [sortState, setSortState] = useState<SortState | undefined>();

  const sortedRows = useMemo(() => {
    if (!sortState) return sampleRows;
    return [...sampleRows].sort((a, b) => {
      const dir = sortState.direction === 'asc' ? 1 : -1;
      const ak = a[sortState.key as keyof PositionRow];
      const bk = b[sortState.key as keyof PositionRow];
      return (ak < bk ? -1 : ak > bk ? 1 : 0) * dir;
    });
  }, [sortState]);

  const columns: ColumnDef<PositionRow>[] = [
    {
      key: 'ticker',
      header: 'Тикер',
      sortable: true,
      renderCell: (row) => <strong>{row.ticker}</strong>,
    },
    {
      key: 'trades',
      header: 'Сделок',
      align: 'right',
      sortable: true,
      renderCell: (row) => row.trades,
    },
    {
      key: 'pnl',
      header: 'P&L',
      align: 'right',
      sortable: true,
      renderCell: (row) => row.pnl,
    },
    {
      key: 'winRate',
      header: 'Win%',
      align: 'right',
      renderCell: (row) => `${row.winRate.toFixed(1)}%`,
    },
  ];

  return (
    <div style={{ height: 300 }}>
      <DataTable
        columns={columns}
        rows={sortedRows}
        getRowKey={(row) => row.id}
        sortState={sortState}
        onSort={(key, direction) => setSortState({ key, direction })}
      />
    </div>
  );
}

export const WithSorting: Story = {
  name: 'Sortable columns',
  render: () => <WithSortingDemo />,
  parameters: { controls: { disable: true } },
};

// ===== Compound primitives story =====

function CompoundDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<SortState | undefined>();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sortedRows = useMemo(() => {
    if (!sortState) return sampleRows;
    return [...sampleRows].sort((a, b) => {
      const dir = sortState.direction === 'asc' ? 1 : -1;
      const ak = a[sortState.key as keyof PositionRow];
      const bk = b[sortState.key as keyof PositionRow];
      return (ak < bk ? -1 : ak > bk ? 1 : 0) * dir;
    });
  }, [sortState]);

  const columns: ColumnDef<PositionRow>[] = [
    {
      key: 'ticker',
      header: 'Тикер',
      renderCell: (row) => <strong>{row.ticker}</strong>,
    },
    {
      key: 'trades',
      header: 'Сделок',
      align: 'right',
      sortable: true,
      renderCell: (row) => row.trades,
    },
    {
      key: 'pnl',
      header: 'P&L',
      align: 'right',
      sortable: true,
      renderCell: (row) => (
        <span
          style={{
            color:
              row.pnl >= 0 ? 'var(--color-success)' : 'var(--color-negative)',
          }}
        >
          {row.pnl >= 0 ? '+' : ''}
          {row.pnl.toLocaleString('ru')} ₽
        </span>
      ),
    },
    {
      key: 'winRate',
      header: 'Win%',
      align: 'right',
      renderCell: (row) => `${row.winRate.toFixed(1)}%`,
    },
  ];

  return (
    <div style={{ height: 300 }}>
      <DataTable
        columns={columns}
        rows={sortedRows}
        getRowKey={(row) => row.id}
        selectedKeys={selected}
        onRowClick={(row) => toggle(row.id)}
        sortState={sortState}
        onSort={(key, direction) => setSortState({ key, direction })}
      />
    </div>
  );
}

export const CompoundUsage: Story = {
  name: 'Compound primitives (Row + Cell + HeaderCell)',
  render: () => <CompoundDemo />,
  parameters: { controls: { disable: true } },
};

// ===== Row states story =====

const chartData = [62, 64, 63, 67, 65, 68, 66, 70, 65, 68];

function RowStatesDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Strip dark theme from parent so light panel renders correctly
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const stripped = new Map<Element, string>();
    let el: Element | null = wrapperRef.current.parentElement;
    while (el) {
      if (el.getAttribute('data-theme') === 'dark') {
        stripped.set(el, 'dark');
        el.removeAttribute('data-theme');
      }
      el = el.parentElement;
    }
    const observer = new MutationObserver(() => {
      stripped.forEach((_, node) => {
        if (node.getAttribute('data-theme') === 'dark')
          node.removeAttribute('data-theme');
      });
    });
    stripped.forEach((_, node) =>
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
    );
    return () => {
      observer.disconnect();
      stripped.forEach((val, node) => node.setAttribute('data-theme', val));
    };
  }, []);

  const labelStyle = (isDark: boolean) => ({
    fontSize: 11,
    color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace' as const,
  });

  const defaultCells = (
    <>
      <DataTableCell>
        <TableCellTicker ticker="VTBR" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellNumbers value="65,00 ₽" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellNumbers value="65,00 ₽" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellNumbers value="65,00 ₽" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellChart data={chartData} />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellButton icon="chevronRightSmall" onClick={() => {}} />
      </DataTableCell>
    </>
  );

  const activeCells = (
    <>
      <DataTableCell>
        <TableCellTicker ticker="VTBR" isSelected onToggleSelect={() => {}} />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellNumbers value="65,00 ₽" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellNumbers value="65,00 ₽" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellNumbers value="65,00 ₽" />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellChart data={chartData} />
      </DataTableCell>
      <DataTableCell align="right">
        <TableCellButton icon="chevronRightSmall" onClick={() => {}} />
      </DataTableCell>
    </>
  );

  return (
    <div
      ref={wrapperRef}
      style={{ padding: 32, background: '#E0E0E6', display: 'flex', gap: 24 }}
    >
      {(['light', 'dark'] as const).map((theme) => {
        const isDark = theme === 'dark';
        return (
          <div
            key={theme}
            data-theme={isDark ? 'dark' : undefined}
            style={{
              flex: 1,
              background: isDark ? '#040405' : '#FFFFFF',
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div
              style={{
                ...labelStyle(isDark),
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 16,
              }}
            >
              {theme}
            </div>
            <table className="w-full">
              <tbody>
                <tr style={labelStyle(isDark)}>
                  <td colSpan={7} style={{ padding: '0 4px 4px' }}>
                    state=Default, hover=off
                  </td>
                </tr>
                <DataTableRow>{defaultCells}</DataTableRow>

                <tr style={labelStyle(isDark)}>
                  <td colSpan={7} style={{ padding: '12px 4px 4px' }}>
                    state=Default, hover=On
                  </td>
                </tr>
                <DataTableRow className="!bg-blackinverse-a2">
                  {defaultCells}
                </DataTableRow>

                <tr style={labelStyle(isDark)}>
                  <td colSpan={7} style={{ padding: '12px 4px 4px' }}>
                    state=Active, hover=off
                  </td>
                </tr>
                <DataTableRow state="active">{activeCells}</DataTableRow>

                <tr style={labelStyle(isDark)}>
                  <td colSpan={7} style={{ padding: '12px 4px 4px' }}>
                    state=Active, hover=On
                  </td>
                </tr>
                <DataTableRow state="active">{activeCells}</DataTableRow>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export const RowStates: Story = {
  name: 'Row states (Figma: tableRow)',
  render: () => <RowStatesDemo />,
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
};

// ===== TableHead story (Figma: tableHead 63081:854) =====

function TableHeadDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [allChecked, setAllChecked] = useState(false);
  const [sortState, setSortState] = useState<SortState | undefined>();

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const stripped = new Map<Element, string>();
    let el: Element | null = wrapperRef.current.parentElement;
    while (el) {
      if (el.getAttribute('data-theme') === 'dark') {
        stripped.set(el, 'dark');
        el.removeAttribute('data-theme');
      }
      el = el.parentElement;
    }
    const observer = new MutationObserver(() => {
      stripped.forEach((_, node) => {
        if (node.getAttribute('data-theme') === 'dark')
          node.removeAttribute('data-theme');
      });
    });
    stripped.forEach((_, node) =>
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
    );
    return () => {
      observer.disconnect();
      stripped.forEach((val, node) => node.setAttribute('data-theme', val));
    };
  }, []);

  const handleSort = (key: string, direction: 'asc' | 'desc') =>
    setSortState({ key, direction });

  return (
    <div
      ref={wrapperRef}
      style={{
        padding: 32,
        background: '#E0E0E6',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {(['light', 'dark'] as const).map((theme) => {
        const isDark = theme === 'dark';
        return (
          <div
            key={theme}
            data-theme={isDark ? 'dark' : undefined}
            style={{
              background: isDark ? '#040405' : '#FFFFFF',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <table className="w-full">
              <DataTableHead>
                <DataTableHeaderCell
                  checkbox
                  checked={allChecked}
                  onCheckboxChange={() => setAllChecked((v) => !v)}
                >
                  Инструмент
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  align="right"
                  sortKey="price"
                  sortState={sortState}
                  onSort={handleSort}
                >
                  Тек. цена
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  align="right"
                  sortKey="day"
                  sortState={sortState}
                  onSort={handleSort}
                >
                  За день
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  align="right"
                  sortKey="year"
                  sortState={sortState}
                  onSort={handleSort}
                >
                  За год
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  align="right"
                  sortKey="chart"
                  sortState={sortState}
                  onSort={handleSort}
                >
                  Динамика
                </DataTableHeaderCell>
              </DataTableHead>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export const TableHead: Story = {
  name: 'TableHead (Figma: tableHead)',
  render: () => <TableHeadDemo />,
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
};

// ===== TableCellString align + column padding story =====

interface PaymentRow {
  id: string;
  date: string;
  amount: number;
  type: string;
  status: 'paid' | 'rejected';
}

const paymentRows: PaymentRow[] = [
  { id: '1', date: '06.03.2026', amount: 1000, type: 'Токены', status: 'paid' },
  {
    id: '2',
    date: '05.03.2026',
    amount: 1000,
    type: 'Токены',
    status: 'rejected',
  },
  { id: '3', date: '24.02.2026', amount: 1000, type: 'Токены', status: 'paid' },
  {
    id: '4',
    date: '12.02.2026',
    amount: 2000,
    type: 'Подписка',
    status: 'paid',
  },
  {
    id: '5',
    date: '12.01.2026',
    amount: 2000,
    type: 'Подписка',
    status: 'paid',
  },
];

function CellStringAlignDemo() {
  const [sortState, setSortState] = useState<SortState | undefined>();

  const columns: ColumnDef<PaymentRow>[] = [
    {
      key: 'date',
      header: 'Дата',
      sortable: true,
      align: 'left',
      className: 'pl-spacing-56',
      renderCell: (row) => <TableCellString align="left" value={row.date} />,
    },
    {
      key: 'amount',
      header: 'Сумма',
      sortable: true,
      align: 'right',
      renderCell: (row) => (
        <TableCellString value={row.amount.toLocaleString('ru-RU')} />
      ),
    },
    {
      key: 'type',
      header: 'Тип платежа',
      sortable: true,
      align: 'right',
      renderCell: (row) => <TableCellString value={row.type} />,
    },
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      align: 'right',
      className: 'pr-spacing-56',
      renderCell: (row) => (
        <TableCellString value={row.status === 'paid' ? 'Оплачено' : 'Отказ'} />
      ),
    },
  ];

  const sortedRows = useMemo(() => {
    if (!sortState) return paymentRows;
    return [...paymentRows].sort((a, b) => {
      const dir = sortState.direction === 'asc' ? 1 : -1;
      const ak = a[sortState.key as keyof PaymentRow];
      const bk = b[sortState.key as keyof PaymentRow];
      return (ak < bk ? -1 : ak > bk ? 1 : 0) * dir;
    });
  }, [sortState]);

  return (
    <div className="w-full max-w-[720px] py-spacing-40 flex flex-col gap-spacing-12 bg-wrapper-a2 border border-stroke-a4 rounded-radius-4 shadow-[0_20px_76px_0_rgba(0,0,0,0.2)] backdrop-blur-[16px]">
      <DataTable<PaymentRow>
        columns={columns}
        rows={sortedRows}
        getRowKey={(row) => row.id}
        sortState={sortState}
        onSort={(key, direction) => setSortState({ key, direction })}
        rowClassName={(row) =>
          row.status === 'rejected' ? 'bg-colors-status_negative_bg' : undefined
        }
      />
    </div>
  );
}

export const CellStringAlign: Story = {
  name: 'TableCellString — align + column padding',
  render: () => <CellStringAlignDemo />,
  parameters: { controls: { disable: true } },
};
