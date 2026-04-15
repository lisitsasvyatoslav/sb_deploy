import type { Meta, StoryObj } from '@storybook/nextjs';
import { SparklineDataPoint } from '@/types/ticker';
import SparklineChart from './SparklineChart';

// Positive trend data (monthly over a year)
const POSITIVE_DATA: SparklineDataPoint[] = [
  { date: '2025-01-15T00:00:00.000Z', value: 100 },
  { date: '2025-02-15T00:00:00.000Z', value: 105 },
  { date: '2025-03-15T00:00:00.000Z', value: 102 },
  { date: '2025-04-15T00:00:00.000Z', value: 110 },
  { date: '2025-05-15T00:00:00.000Z', value: 108 },
  { date: '2025-06-15T00:00:00.000Z', value: 115 },
  { date: '2025-07-15T00:00:00.000Z', value: 120 },
  { date: '2025-08-15T00:00:00.000Z', value: 118 },
  { date: '2025-09-15T00:00:00.000Z', value: 125 },
  { date: '2025-10-15T00:00:00.000Z', value: 130 },
  { date: '2025-11-15T00:00:00.000Z', value: 128 },
  { date: '2025-12-15T00:00:00.000Z', value: 135 },
];

// Negative trend data
const NEGATIVE_DATA: SparklineDataPoint[] = [
  { date: '2025-01-15T00:00:00.000Z', value: 135 },
  { date: '2025-02-15T00:00:00.000Z', value: 130 },
  { date: '2025-03-15T00:00:00.000Z', value: 132 },
  { date: '2025-04-15T00:00:00.000Z', value: 125 },
  { date: '2025-05-15T00:00:00.000Z', value: 120 },
  { date: '2025-06-15T00:00:00.000Z', value: 122 },
  { date: '2025-07-15T00:00:00.000Z', value: 115 },
  { date: '2025-08-15T00:00:00.000Z', value: 110 },
  { date: '2025-09-15T00:00:00.000Z', value: 112 },
  { date: '2025-10-15T00:00:00.000Z', value: 105 },
  { date: '2025-11-15T00:00:00.000Z', value: 100 },
  { date: '2025-12-15T00:00:00.000Z', value: 95 },
];

// Flat trend data
const FLAT_DATA: SparklineDataPoint[] = [
  { date: '2025-01-15T00:00:00.000Z', value: 100 },
  { date: '2025-02-15T00:00:00.000Z', value: 100.2 },
  { date: '2025-03-15T00:00:00.000Z', value: 99.8 },
  { date: '2025-04-15T00:00:00.000Z', value: 100.1 },
  { date: '2025-05-15T00:00:00.000Z', value: 99.9 },
  { date: '2025-06-15T00:00:00.000Z', value: 100 },
];

// Volatile data with large swings
const VOLATILE_DATA: SparklineDataPoint[] = [
  { date: '2025-01-15T00:00:00.000Z', value: 100 },
  { date: '2025-02-15T00:00:00.000Z', value: 140 },
  { date: '2025-03-15T00:00:00.000Z', value: 85 },
  { date: '2025-04-15T00:00:00.000Z', value: 155 },
  { date: '2025-05-15T00:00:00.000Z', value: 70 },
  { date: '2025-06-15T00:00:00.000Z', value: 130 },
  { date: '2025-07-15T00:00:00.000Z', value: 90 },
  { date: '2025-08-15T00:00:00.000Z', value: 145 },
  { date: '2025-09-15T00:00:00.000Z', value: 80 },
  { date: '2025-10-15T00:00:00.000Z', value: 160 },
];

// Intraday data for daily period
const INTRADAY_DATA: SparklineDataPoint[] = [
  { date: '2025-06-15T09:30:00.000Z', value: 100 },
  { date: '2025-06-15T10:00:00.000Z', value: 101.5 },
  { date: '2025-06-15T10:30:00.000Z', value: 102.3 },
  { date: '2025-06-15T11:00:00.000Z', value: 101.8 },
  { date: '2025-06-15T11:30:00.000Z', value: 103.2 },
  { date: '2025-06-15T12:00:00.000Z', value: 104.0 },
  { date: '2025-06-15T12:30:00.000Z', value: 103.5 },
  { date: '2025-06-15T13:00:00.000Z', value: 105.1 },
  { date: '2025-06-15T13:30:00.000Z', value: 104.8 },
  { date: '2025-06-15T14:00:00.000Z', value: 106.2 },
  { date: '2025-06-15T14:30:00.000Z', value: 105.9 },
  { date: '2025-06-15T15:00:00.000Z', value: 107.0 },
];

const meta: Meta<typeof SparklineChart> = {
  title: 'Ticker/SparklineChart',
  component: SparklineChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    height: { control: { type: 'number' } },
    width: { control: { type: 'number' } },
    showTooltip: { control: 'boolean' },
    isNeutralChart: { control: 'boolean' },
    period: { control: 'select', options: ['D', 'W', 'M', 'Q', 'Y', 'all'] },
    customColor: { control: 'color' },
  },
  args: {
    data: POSITIVE_DATA,
    height: 64,
    showTooltip: true,
    period: 'all',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SparklineChart>;

export const Default: Story = {};

export const NegativeTrend: Story = {
  args: { data: NEGATIVE_DATA },
};

export const FlatTrend: Story = {
  args: { data: FLAT_DATA },
};

export const Volatile: Story = {
  args: { data: VOLATILE_DATA },
};

export const NeutralChart: Story = {
  args: { isNeutralChart: true },
};

export const CustomColor: Story = {
  args: { customColor: '#8B5CF6' },
};

export const WithoutTooltip: Story = {
  args: { showTooltip: false },
};

export const DailyPeriod: Story = {
  args: { data: INTRADAY_DATA, period: 'D' },
};

export const AllPeriods: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['D', 'W', 'M', 'Q', 'Y', 'all'] as const).map((period) => (
        <div key={period}>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>
            period: {period}
          </div>
          <SparklineChart
            {...args}
            data={period === 'D' ? INTRADAY_DATA : POSITIVE_DATA}
            period={period}
          />
        </div>
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export const Large: Story = {
  args: { height: 120 },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
};
