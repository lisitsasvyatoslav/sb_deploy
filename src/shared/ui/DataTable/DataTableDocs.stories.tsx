import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { fn } from 'storybook/test';
import DataTable, { type ColumnDef } from './DataTable';
import DataTableCell from './primitives/DataTableCell';
import DataTableHead from './primitives/DataTableHead';
import DataTableHeaderCell from './primitives/DataTableHeaderCell';
import DataTableRow from './primitives/DataTableRow';
import { CloseOpenRow, TrendCaret } from './primitives';
import {
  TableCellTicker,
  TableCellString,
  TableCellNumbers,
  TableCellNA,
  TableCellChart,
  TableCellButton,
  TableCellSkeleton,
  TableCellSymbol,
} from './cells';
import { Icon } from '@/shared/ui/Icon';

// ===== Theme utilities =====

function useStripDarkTheme(ref: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    if (!ref.current) return;

    const stripped = new Map<Element, string>();
    let el: Element | null = ref.current.parentElement;
    while (el) {
      const val = el.getAttribute('data-theme');
      if (val === 'dark') {
        stripped.set(el, val);
        el.removeAttribute('data-theme');
      }
      el = el.parentElement;
    }

    const observer = new MutationObserver(() => {
      stripped.forEach((_, node) => {
        if (node.getAttribute('data-theme') === 'dark') {
          node.removeAttribute('data-theme');
        }
      });
    });

    stripped.forEach((_, node) => {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    });

    return () => {
      observer.disconnect();
      stripped.forEach((val, node) => node.setAttribute('data-theme', val));
    };
  }, [ref]);
}

const ThemePanel: React.FC<{
  theme: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
}> = ({ theme, children, className }) => (
  <div
    data-theme={theme === 'dark' ? 'dark' : undefined}
    className={className}
    style={{
      background: theme === 'dark' ? '#040405' : '#FFFFFF',
      padding: '24px 32px',
      borderRadius: 8,
      flex: 1,
      minWidth: 0,
    }}
  >
    {children}
  </div>
);

const DualTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useStripDarkTheme(ref);
  return (
    <div
      ref={ref}
      style={{ display: 'flex', gap: 24, padding: 32, background: '#E0E0E6' }}
    >
      {(['light', 'dark'] as const).map((theme) => (
        <ThemePanel key={theme} theme={theme}>
          {children}
        </ThemePanel>
      ))}
    </div>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h2
    style={{
      fontSize: 13,
      fontWeight: 700,
      color: 'rgba(0,0,0,0.5)',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      margin: '0 0 16px',
    }}
  >
    {children}
  </h2>
);

const ItemLabel: React.FC<{ children: React.ReactNode; isDark?: boolean }> = ({
  children,
  isDark,
}) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 500,
      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
      fontFamily: 'monospace',
      marginBottom: 8,
    }}
  >
    {children}
  </div>
);

// ===== Sample data for full table =====

interface SampleRow {
  id: string;
  ticker: string;
  securityId?: number;
  broker: string;
  account: string;
  exchange: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnlPercent: number;
  pnlMoney: number;
  realizedPnl: number;
  chartData: number[];
}

const sampleRows: SampleRow[] = [
  {
    id: '1',
    ticker: 'YDEX',
    broker: 'Finam',
    account: '40817',
    exchange: 'MOEX',
    quantity: 100,
    avgPrice: 3245.5,
    currentPrice: 3380.0,
    pnlPercent: 4.15,
    pnlMoney: 13450,
    realizedPnl: 0,
    chartData: [3200, 3220, 3280, 3260, 3310, 3350, 3380],
  },
  {
    id: '2',
    ticker: 'SBER',
    broker: 'Finam',
    account: '40817',
    exchange: 'MOEX',
    quantity: 50,
    avgPrice: 285.1,
    currentPrice: 278.4,
    pnlPercent: -2.35,
    pnlMoney: -335,
    realizedPnl: 1200,
    chartData: [290, 288, 285, 282, 280, 278, 278],
  },
  {
    id: '3',
    ticker: 'LKOH',
    broker: 'Tinkoff',
    account: '30214',
    exchange: 'MOEX',
    quantity: 10,
    avgPrice: 6890.0,
    currentPrice: 7150.0,
    pnlPercent: 3.77,
    pnlMoney: 2600,
    realizedPnl: 4500,
    chartData: [6800, 6850, 6900, 6950, 7000, 7100, 7150],
  },
  {
    id: '4',
    ticker: 'GAZP',
    broker: 'Finam',
    account: '40817',
    exchange: 'MOEX',
    quantity: 200,
    avgPrice: 155.3,
    currentPrice: 155.3,
    pnlPercent: 0,
    pnlMoney: 0,
    realizedPnl: 0,
    chartData: [155, 155, 156, 155, 155, 155, 155],
  },
  {
    id: '5',
    ticker: 'NVDA',
    broker: 'IB',
    account: 'U1234',
    exchange: 'NASDAQ',
    quantity: 5,
    avgPrice: 890.0,
    currentPrice: 0,
    pnlPercent: 0,
    pnlMoney: 0,
    realizedPnl: 0,
    chartData: [],
  },
];

const formatNumber = (n: number, decimals = 2) =>
  n.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const getTrend = (v: number): 'positive' | 'negative' | 'neutral' =>
  v > 0 ? 'positive' : v < 0 ? 'negative' : 'neutral';

const fullColumns: ColumnDef<SampleRow>[] = [
  {
    key: 'ticker',
    header: 'Инструмент',
    renderCell: (row, isExpanded, toggle) => (
      <TableCellTicker
        ticker={row.ticker}
        securityId={row.securityId}
        isExpanded={isExpanded}
        onToggle={toggle}
      />
    ),
  },
  {
    key: 'broker',
    header: 'Брокер',
    align: 'right',
    renderCell: (row) => <TableCellString value={row.broker} />,
  },
  {
    key: 'account',
    header: 'Счёт',
    align: 'right',
    renderCell: (row) => <TableCellString value={row.account} />,
  },
  {
    key: 'exchange',
    header: 'Площадка',
    align: 'right',
    renderCell: (row) => <TableCellString value={row.exchange} />,
  },
  {
    key: 'quantity',
    header: 'Кол-во',
    align: 'right',
    renderCell: (row) => (
      <TableCellNumbers value={formatNumber(row.quantity, 0)} />
    ),
  },
  {
    key: 'avgPrice',
    header: 'Ср. цена',
    align: 'right',
    renderCell: (row) => (
      <TableCellNumbers value={formatNumber(row.avgPrice)} />
    ),
  },
  {
    key: 'currentPrice',
    header: 'Текущая',
    align: 'right',
    renderCell: (row) =>
      row.currentPrice ? (
        <TableCellNumbers value={formatNumber(row.currentPrice)} />
      ) : (
        <TableCellNA />
      ),
  },
  {
    key: 'chart',
    header: 'График',
    align: 'center',
    renderCell: (row) => (
      <TableCellChart
        data={row.chartData.length > 1 ? row.chartData : undefined}
      />
    ),
  },
  {
    key: 'pnlPercent',
    header: 'P&L %',
    align: 'right',
    renderCell: (row) => (
      <TableCellNumbers
        value={`${row.pnlPercent > 0 ? '+' : ''}${formatNumber(row.pnlPercent)}%`}
        trend={getTrend(row.pnlPercent)}
      />
    ),
  },
  {
    key: 'pnlMoney',
    header: 'P&L ₽',
    align: 'right',
    renderCell: (row) => (
      <TableCellNumbers
        value={`${row.pnlMoney > 0 ? '+' : ''}${formatNumber(row.pnlMoney, 0)} ₽`}
        trend={getTrend(row.pnlMoney)}
      />
    ),
  },
  {
    key: 'realized',
    header: 'Реализ.',
    align: 'right',
    renderCell: (row) =>
      row.realizedPnl ? (
        <TableCellNumbers
          value={`${formatNumber(row.realizedPnl, 0)} ₽`}
          trend={getTrend(row.realizedPnl)}
        />
      ) : (
        <TableCellNA />
      ),
  },
];

const fullColumnsWithAction: ColumnDef<SampleRow>[] = [
  ...fullColumns,
  {
    key: 'action',
    header: '',
    className: 'w-8',
    renderCell: () => (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1">
        <TableCellButton
          icon={
            <Icon
              variant="folder"
              size={16}
              className="text-blackinverse-a56"
            />
          }
          onClick={fn()}
        />
      </div>
    ),
  },
];

const skeletonColumns: ColumnDef<{ id: string }>[] = [
  {
    key: 'ticker',
    header: 'Инструмент',
    renderCell: () => <TableCellSkeleton variant="symbol" />,
  },
  {
    key: 'broker',
    header: 'Брокер',
    align: 'right',
    renderCell: () => <TableCellSkeleton variant="string" />,
  },
  {
    key: 'account',
    header: 'Счёт',
    align: 'right',
    renderCell: () => <TableCellSkeleton variant="string" />,
  },
  {
    key: 'quantity',
    header: 'Кол-во',
    align: 'right',
    renderCell: () => <TableCellSkeleton variant="number" />,
  },
  {
    key: 'price',
    header: 'Цена',
    align: 'right',
    renderCell: () => <TableCellSkeleton variant="number" />,
  },
  {
    key: 'pnl',
    header: 'P&L',
    align: 'right',
    renderCell: () => <TableCellSkeleton variant="number" />,
  },
];

const skeletonRows = Array.from({ length: 5 }, (_, i) => ({ id: String(i) }));

// ===== Composite Elements Demo =====

function CompositeElementsDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useStripDarkTheme(wrapperRef);

  const [chevronOpen, setChevronOpen] = useState(false);

  const items: {
    label: string;
    render: (isDark: boolean) => React.ReactNode;
  }[] = [
    {
      label: 'CloseOpenRow',
      render: () => (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <CloseOpenRow
            isOpen={false}
            onClick={() => setChevronOpen((v) => !v)}
          />
          <CloseOpenRow
            isOpen={true}
            onClick={() => setChevronOpen((v) => !v)}
          />
          <CloseOpenRow
            isOpen={chevronOpen}
            onClick={() => setChevronOpen((v) => !v)}
          />
          <span style={{ fontSize: 11, color: '#888' }}>interactive</span>
        </div>
      ),
    },
    {
      label: 'TrendCaret',
      render: () => (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TrendCaret direction="up" />
          <TrendCaret direction="down" />
        </div>
      ),
    },
    {
      label: 'TableCellTicker',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TableCellTicker ticker="YDEX" onToggle={fn()} isExpanded={false} />
          <TableCellTicker ticker="SBER" onToggle={fn()} isExpanded={true} />
          <TableCellTicker ticker="LKOH" extraCount={3} />
        </div>
      ),
    },
    {
      label: 'TableCellString',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TableCellString value="Finam" />
          <TableCellString value="40817" count={3} />
          <TableCellString value="MOEX" />
        </div>
      ),
    },
    {
      label: 'TableCellNumbers',
      render: () => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          <TableCellNumbers value="3 245,50" />
          <TableCellNumbers
            value="+4,15%"
            trend="positive"
            subValue="+13 450 ₽"
          />
          <TableCellNumbers value="-2,35%" trend="negative" subValue="-335 ₽" />
          <TableCellNumbers value="0,00%" trend="neutral" />
        </div>
      ),
    },
    {
      label: 'TableCellNA',
      render: () => <TableCellNA />,
    },
    {
      label: 'TableCellChart',
      render: () => (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TableCellChart data={[100, 105, 103, 110, 115, 120]} />
          <TableCellChart data={[120, 115, 118, 110, 105, 100]} />
          <TableCellChart />
        </div>
      ),
    },
    {
      label: 'TableCellButton',
      render: () => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <TableCellButton label="Открыть" onClick={fn()} />
          <TableCellButton label="Детали" onClick={fn()} variant="ghost" />
        </div>
      ),
    },
    {
      label: 'TableCellSkeleton',
      render: () => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: 200,
          }}
        >
          <TableCellSkeleton variant="symbol" />
          <TableCellSkeleton variant="string" />
          <TableCellSkeleton variant="number" />
        </div>
      ),
    },
    {
      label: 'TableCellSymbol',
      render: () => (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TableCellSymbol ticker="YDEX" />
          <TableCellSymbol
            ticker="SBER"
            isSelected={true}
            defaultHovered
            onToggle={fn()}
          />
          <TableCellSymbol ticker="LKOH" isSelected={true} onToggle={fn()} />
          <span style={{ fontSize: 11, color: '#888' }}>
            default / inactive / active
          </span>
        </div>
      ),
    },
  ];

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <SectionTitle>Составные элементы</SectionTitle>
      <div style={{ display: 'flex', gap: 24 }}>
        {(['light', 'dark'] as const).map((theme) => (
          <ThemePanel key={theme} theme={theme}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {items.map((item) => (
                <div key={item.label}>
                  <ItemLabel isDark={theme === 'dark'}>{item.label}</ItemLabel>
                  {item.render(theme === 'dark')}
                </div>
              ))}
            </div>
          </ThemePanel>
        ))}
      </div>
    </div>
  );
}

// ===== Interactive selection (compound pattern) =====

function InteractiveTableSection() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedKeys(
      selectedKeys.size === sampleRows.length
        ? new Set()
        : new Set(sampleRows.map((r) => r.id))
    );

  const allSelected = selectedKeys.size === sampleRows.length;
  const someSelected = selectedKeys.size > 0 && !allSelected;

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['light', 'dark'] as const).map((theme) => (
        <ThemePanel key={theme} theme={theme}>
          <div style={{ height: 300, overflowY: 'auto' }}>
            <table className="w-full">
              <DataTableHead>
                <DataTableHeaderCell
                  checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckboxChange={toggleAll}
                >
                  Инструмент
                </DataTableHeaderCell>
                <DataTableHeaderCell align="right">Текущая</DataTableHeaderCell>
                <DataTableHeaderCell align="right">
                  P&amp;L %
                </DataTableHeaderCell>
                <DataTableHeaderCell align="center">График</DataTableHeaderCell>
              </DataTableHead>
              <tbody>
                {sampleRows.map((row) => {
                  const isSelected = selectedKeys.has(row.id);
                  return (
                    <DataTableRow
                      key={row.id}
                      state={isSelected ? 'active' : 'default'}
                      onClick={() => toggleRow(row.id)}
                    >
                      <DataTableCell>
                        <TableCellTicker
                          ticker={row.ticker}
                          securityId={row.securityId}
                          isSelected={isSelected}
                          onToggleSelect={(e) => {
                            e.stopPropagation();
                            toggleRow(row.id);
                          }}
                        />
                      </DataTableCell>
                      <DataTableCell align="right">
                        <TableCellNumbers
                          value={formatNumber(row.currentPrice || row.avgPrice)}
                        />
                      </DataTableCell>
                      <DataTableCell align="right">
                        <TableCellNumbers
                          value={`${row.pnlPercent > 0 ? '+' : ''}${formatNumber(row.pnlPercent)}%`}
                          trend={getTrend(row.pnlPercent)}
                        />
                      </DataTableCell>
                      <DataTableCell align="center">
                        <TableCellChart
                          data={
                            row.chartData.length > 1 ? row.chartData : undefined
                          }
                        />
                      </DataTableCell>
                    </DataTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ThemePanel>
      ))}
    </div>
  );
}

// ===== Main Components Demo =====

function MainComponentsDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useStripDarkTheme(wrapperRef);

  const selectedKeys = new Set(['2']);

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <SectionTitle>Основные компоненты</SectionTitle>

      {/* Interactive selection — DataTableHeaderCell states */}
      <div>
        <ItemLabel>
          Interactive selection (DataTableHeaderCell: unchecked / indeterminate
          / checked)
        </ItemLabel>
        <InteractiveTableSection />
      </div>

      {/* Default table */}
      <div>
        <ItemLabel>Default table</ItemLabel>
        <div style={{ display: 'flex', gap: 24 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <ThemePanel key={theme} theme={theme}>
              <div style={{ height: 300 }}>
                <DataTable
                  columns={fullColumns}
                  rows={sampleRows}
                  getRowKey={(r) => r.id}
                  onRowClick={fn()}
                />
              </div>
            </ThemePanel>
          ))}
        </div>
      </div>

      {/* Selected row */}
      <div>
        <ItemLabel>Selected row (SBER)</ItemLabel>
        <div style={{ display: 'flex', gap: 24 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <ThemePanel key={theme} theme={theme}>
              <div style={{ height: 300 }}>
                <DataTable
                  columns={fullColumns}
                  rows={sampleRows}
                  getRowKey={(r) => r.id}
                  onRowClick={fn()}
                  selectedKeys={selectedKeys}
                />
              </div>
            </ThemePanel>
          ))}
        </div>
      </div>

      {/* With hover action */}
      <div>
        <ItemLabel>With hover action</ItemLabel>
        <div style={{ display: 'flex', gap: 24 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <ThemePanel key={theme} theme={theme}>
              <div style={{ height: 300 }}>
                <DataTable
                  columns={fullColumnsWithAction}
                  rows={sampleRows}
                  getRowKey={(r) => r.id}
                  onRowClick={fn()}
                />
              </div>
            </ThemePanel>
          ))}
        </div>
      </div>

      {/* Skeleton / Loading */}
      <div>
        <ItemLabel>Loading state (skeleton)</ItemLabel>
        <div style={{ display: 'flex', gap: 24 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <ThemePanel key={theme} theme={theme}>
              <div style={{ height: 280 }}>
                <DataTable
                  columns={skeletonColumns}
                  rows={skeletonRows}
                  getRowKey={(r) => r.id}
                />
              </div>
            </ThemePanel>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Full documentation page =====

function DataTableDocsPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 48,
        padding: 32,
        background: '#E0E0E6',
      }}
    >
      <CompositeElementsDemo />
      <MainComponentsDemo />
    </div>
  );
}

// ===== Meta =====

const meta: Meta = {
  title: 'UI/DataTable/Design System',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=61072-40811',
    },
  },
};

export default meta;
type Story = StoryObj;

// ===== Combined docs stories =====

export const DesignSystem: Story = {
  render: () => <DataTableDocsPage />,
};

export const CompositeElements: Story = {
  name: 'Составные элементы',
  render: () => (
    <div style={{ padding: 32, background: '#E0E0E6' }}>
      <CompositeElementsDemo />
    </div>
  ),
};

export const MainComponents: Story = {
  name: 'Основные компоненты',
  render: () => (
    <div style={{ padding: 32, background: '#E0E0E6' }}>
      <MainComponentsDemo />
    </div>
  ),
};

// ===== Individual cell stories =====

export const CellCloseOpenRow: Story = {
  name: 'Cell / CloseOpenRow',
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <DualTheme>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <CloseOpenRow isOpen={false} onClick={fn()} />
            <CloseOpenRow isOpen={true} onClick={fn()} />
            <CloseOpenRow isOpen={open} onClick={() => setOpen((v) => !v)} />
            <span style={{ fontSize: 11, color: '#888' }}>
              closed / open / interactive
            </span>
          </div>
        </DualTheme>
      );
    }
    return <Demo />;
  },
};

export const CellTrendCaret: Story = {
  name: 'Cell / TrendCaret',
  render: () => (
    <DualTheme>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <TrendCaret direction="up" />
        <TrendCaret direction="down" />
        <span style={{ fontSize: 11, color: '#888' }}>up / down</span>
      </div>
    </DualTheme>
  ),
};

export const CellTicker: Story = {
  name: 'Cell / TableCellTicker',
  render: () => (
    <DualTheme>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TableCellTicker ticker="YDEX" />
        <TableCellTicker ticker="SBER" onToggle={fn()} isExpanded={false} />
        <TableCellTicker ticker="LKOH" onToggle={fn()} isExpanded={true} />
        <TableCellTicker ticker="GAZP" extraCount={3} />
        <TableCellTicker ticker="NVDA" trend="up" />
        <TableCellTicker ticker="MSFT" trend="down" />
      </div>
    </DualTheme>
  ),
};

export const CellString: Story = {
  name: 'Cell / TableCellString',
  render: () => (
    <DualTheme>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TableCellString value="Finam" />
        <TableCellString value="Tinkoff" />
        <TableCellString value="40817" count={3} />
        <TableCellString value="MOEX" />
      </div>
    </DualTheme>
  ),
};

export const CellNumbers: Story = {
  name: 'Cell / TableCellNumbers',
  render: () => (
    <DualTheme>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        <TableCellNumbers value="3 245,50 ₽" />
        <TableCellNumbers
          value="+4,15%"
          trend="positive"
          subValue="+13 450 ₽"
        />
        <TableCellNumbers value="-2,35%" trend="negative" subValue="-335 ₽" />
        <TableCellNumbers value="0,00%" trend="neutral" subValue="0 ₽" />
      </div>
    </DualTheme>
  ),
};

export const CellNA: Story = {
  name: 'Cell / TableCellNA',
  render: () => (
    <DualTheme>
      <TableCellNA />
    </DualTheme>
  ),
};

export const CellChart: Story = {
  name: 'Cell / TableCellChart',
  render: () => (
    <DualTheme>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TableCellChart data={[100, 105, 103, 110, 115, 120]} />
        <TableCellChart data={[120, 115, 118, 110, 105, 100]} />
        <TableCellChart data={[100, 100, 100, 100, 100, 100]} />
        <TableCellChart />
      </div>
    </DualTheme>
  ),
};

export const CellButton: Story = {
  name: 'Cell / TableCellButton',
  render: () => (
    <DualTheme>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TableCellButton label="Открыть" onClick={fn()} />
        <TableCellButton label="Детали" onClick={fn()} variant="ghost" />
      </div>
    </DualTheme>
  ),
};

export const CellSkeleton: Story = {
  name: 'Cell / TableCellSkeleton',
  render: () => (
    <DualTheme>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 200 }}
      >
        <TableCellSkeleton variant="symbol" />
        <TableCellSkeleton variant="string" />
        <TableCellSkeleton variant="number" />
      </div>
    </DualTheme>
  ),
};

export const CellSymbol: Story = {
  name: 'Cell / TableCellSymbol',
  render: () => (
    <DualTheme>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TableCellSymbol ticker="YDEX" />
          <span style={{ fontSize: 11, color: '#888' }}>default</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TableCellSymbol ticker="SBER" defaultHovered onToggle={fn()} />
          <span style={{ fontSize: 11, color: '#888' }}>
            hovered (not selected)
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TableCellSymbol ticker="LKOH" isSelected={true} onToggle={fn()} />
          <span style={{ fontSize: 11, color: '#888' }}>selected</span>
        </div>
      </div>
    </DualTheme>
  ),
};
