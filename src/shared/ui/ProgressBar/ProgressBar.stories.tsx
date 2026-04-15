import type { Meta, StoryObj } from '@storybook/nextjs';
import ProgressBar from '@/shared/ui/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    current: 124,
    total: 500,
    title: 'токенов',
  },
  argTypes: {
    current: { control: { type: 'number', min: 0 } },
    total: { control: { type: 'number', min: 1 } },
    title: { control: 'text' },
    label: { control: 'text' },
    sublabel: { control: 'text' },
    description: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic progress bar without header */
export const Default: Story = {};

/** Almost empty */
export const Low: Story = {
  args: { current: 10, total: 500 },
};

/** Almost full */
export const High: Story = {
  args: { current: 480, total: 500 },
};

/** Full (100%) */
export const Full: Story = {
  args: { current: 500, total: 500 },
};

/** With tariff header (tariffBar variant) */
export const WithHeader: Story = {
  args: {
    label: 'Premium',
    sublabel: '$39/month',
    description: 'Renewal 17.02.2026',
  },
};

/** Left header only, no date */
export const WithLabelOnly: Story = {
  args: {
    label: 'Premium',
    sublabel: '$39/month',
  },
};

/** Large numbers with default locale formatting */
export const LargeNumbers: Story = {
  args: {
    current: 320657,
    total: 600000,
    title: 'tokens',
    label: 'Free',
    sublabel: '$0/month',
  },
};

/** Custom formatValue */
export const CustomFormatter: Story = {
  args: {
    current: 1536,
    total: 5120,
    title: 'storage',
    formatValue: (n: number) => `${(n / 1024).toFixed(1)} GB`,
  },
};
