import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { useState } from 'react';
import Table, { type TableColumn } from '@/shared/ui/Table';

// ===== Sample data =====

interface TradeRow {
  id: string;
  ticker: string;
  direction: 'Лонг' | 'Шорт';
  pnl: number;
  date: string;
}

const sampleRows: TradeRow[] = [
  { id: '1', ticker: 'AAPL', direction: 'Лонг', pnl: 1240, date: '2024-01-15' },
  { id: '2', ticker: 'TSLA', direction: 'Шорт', pnl: -380, date: '2024-01-16' },
  { id: '3', ticker: 'NVDA', direction: 'Лонг', pnl: 2150, date: '2024-01-17' },
  { id: '4', ticker: 'MSFT', direction: 'Лонг', pnl: 670, date: '2024-01-18' },
  { id: '5', ticker: 'AMZN', direction: 'Шорт', pnl: -120, date: '2024-01-19' },
];

const baseColumns: TableColumn<TradeRow>[] = [
  {
    key: 'ticker',
    label: 'Тикер',
    render: (row) => <strong>{row.ticker}</strong>,
  },
  { key: 'direction', label: 'Направление', render: (row) => row.direction },
  {
    key: 'pnl',
    label: 'P&L',
    align: 'right',
    render: (row) => (
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
  { key: 'date', label: 'Дата', align: 'right', render: (row) => row.date },
];

const sortableColumns: TableColumn<TradeRow>[] = baseColumns.map((col) => ({
  ...col,
  sortable: col.key === 'pnl' || col.key === 'date',
  defaultSortDirection: col.key === 'pnl' ? 'desc' : 'asc',
}));

// ===== Meta =====

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],

  argTypes: {
    columns: { table: { disable: true } },
    rows: { table: { disable: true } },
    onSort: { table: { disable: true } },
    currentSort: { table: { disable: true } },
    onRowClick: { table: { disable: true } },
    getRowKey: { table: { disable: true } },
    getRowId: { table: { disable: true } },
    selectedRows: { table: { disable: true } },
    rowActions: { table: { disable: true } },
    expandable: { table: { disable: true } },
    virtualized: { table: { disable: true } },
    isEqualGap: { control: 'boolean' },
    isHeaderHidden: { control: 'boolean' },
    isSubTable: { control: 'boolean' },
    containerHeight: { control: 'text' },
    contentPaddingX: { control: 'text' },
    className: { control: 'text' },
  },

  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ===== Stories =====

export const Basic: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <Table
        columns={baseColumns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        getRowId={(row) => row.id}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const WithSorting: Story = {
  render: () => {
    const [sort, setSort] = useState<
      { columnKey: string; direction: 'asc' | 'desc' } | undefined
    >();
    const [rows, setRows] = useState(sampleRows);

    const handleSort = (
      columnKey: string,
      direction: 'asc' | 'desc' | null
    ) => {
      if (!direction) {
        setSort(undefined);
        setRows(sampleRows);
        return;
      }
      setSort({ columnKey, direction });
      setRows(
        [...sampleRows].sort((a, b) => {
          const av = (a as Record<string, unknown>)[columnKey];
          const bv = (b as Record<string, unknown>)[columnKey];
          if (typeof av === 'number' && typeof bv === 'number') {
            return direction === 'asc' ? av - bv : bv - av;
          }
          return direction === 'asc'
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
        })
      );
    };

    return (
      <div style={{ height: 320 }}>
        <Table
          columns={sortableColumns}
          rows={rows}
          getRowKey={(row) => row.id}
          getRowId={(row) => row.id}
          onSort={handleSort}
          currentSort={sort}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithRowClick: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <Table
        columns={baseColumns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        getRowId={(row) => row.id}
        onRowClick={fn()}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['2', '4']);
    return (
      <div style={{ height: 320 }}>
        <Table
          columns={baseColumns}
          rows={sampleRows}
          getRowKey={(row) => row.id}
          getRowId={(row) => row.id}
          selectedRows={selected}
          onRowClick={(row) => {
            setSelected((prev) =>
              prev.includes(row.id)
                ? prev.filter((id) => id !== row.id)
                : [...prev, row.id]
            );
          }}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithExpandableRows: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const columnsWithExpand: TableColumn<TradeRow>[] = [
      {
        key: 'ticker',
        label: 'Тикер',
        render: (row) => (
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() => toggle(row.id)}
          >
            {expanded.has(row.id) ? '▼' : '▶'} {row.ticker}
          </button>
        ),
      },
      ...baseColumns.slice(1),
    ];

    return (
      <div style={{ height: 400 }}>
        <Table
          columns={columnsWithExpand}
          rows={sampleRows}
          getRowKey={(row) => row.id}
          getRowId={(row) => row.id}
          expandable={{
            expandedRows: expanded,
            expandedRowRender: (row) => (
              <div
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  color: 'var(--text-secondary, #555)',
                }}
              >
                <strong>Детали сделки {row.ticker}:</strong> P&amp;L = {row.pnl}{' '}
                ₽, дата = {row.date}
              </div>
            ),
          }}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithRowActions: Story = {
  render: () => (
    <div style={{ height: 320 }}>
      <Table
        columns={baseColumns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        getRowId={(row) => row.id}
        rowActions={(row, isHovered) =>
          isHovered ? (
            <button
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid var(--border-light, #ccc)',
                cursor: 'pointer',
                background: 'var(--bg-card, #fff)',
              }}
              onClick={() => console.log(`Открыть ${row.ticker}`)}
            >
              Открыть
            </button>
          ) : null
        }
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const HiddenHeader: Story = {
  render: () => (
    <div style={{ height: 280 }}>
      <Table
        columns={baseColumns}
        rows={sampleRows}
        getRowKey={(row) => row.id}
        getRowId={(row) => row.id}
        isHeaderHidden
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/** Много строк — демонстрация скролла без виртуализации */
export const ManyRows: Story = {
  render: () => {
    const manyRows: TradeRow[] = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      ticker: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'][i % 5],
      direction: i % 3 === 0 ? 'Шорт' : 'Лонг',
      pnl: Math.round((Math.random() - 0.4) * 3000),
      date: `2024-${String(Math.floor(i / 4) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    }));
    return (
      <div style={{ height: 400 }}>
        <Table
          columns={baseColumns}
          rows={manyRows}
          getRowKey={(row) => row.id}
          getRowId={(row) => row.id}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
