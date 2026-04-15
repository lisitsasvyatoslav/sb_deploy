import type { Meta, StoryObj } from '@storybook/nextjs';
import BrokerIcon from './BrokerIcon';

const meta: Meta<typeof BrokerIcon> = {
  title: 'Components/BrokerIcon',
  component: BrokerIcon,
  tags: ['autodocs'],

  argTypes: {
    broker: {
      control: 'select',
      options: ['finam', 'tinkoff', 'demo'],
      description: 'Broker identifier used to resolve icon path',
    },
    size: {
      control: 'number',
      description: 'Icon size in pixels',
      table: { defaultValue: { summary: '32' } },
    },
    alt: {
      control: 'text',
      description: 'Custom alt text (defaults to capitalized broker name)',
    },
  },

  args: {
    broker: 'finam',
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllBrokers: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <BrokerIcon broker="finam" />
      <BrokerIcon broker="tinkoff" />
      <BrokerIcon broker="demo" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {[24, 32, 48, 72].map((size) => (
        <BrokerIcon key={size} broker="finam" size={size} />
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const UnknownBroker: Story = {
  args: {
    broker: 'unknown',
  },
};
