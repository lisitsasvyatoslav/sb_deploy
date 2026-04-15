import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Counter from '@/shared/ui/Counter';
import type { CounterSize, CounterVariant } from '@/shared/ui/Counter';

/* ───────── Meta ───────── */

const meta: Meta<typeof Counter> = {
  title: 'UI/Counter',
  component: Counter,
  tags: ['autodocs'],

  argTypes: {
    children: {
      control: 'text',
      description: 'Displayed value',
    },
    size: {
      control: 'select',
      options: ['XL', 'L', 'M', 'S'] satisfies CounterSize[],
      description: 'Size: XL=20px, L=16px, M=14px, S=12px',
      table: { defaultValue: { summary: 'M' } },
    },
    variant: {
      control: 'select',
      options: [
        'accent',
        'primary',
        'secondary',
        'white',
      ] satisfies CounterVariant[],
      description: 'Visual variant',
      table: { defaultValue: { summary: 'primary' } },
    },
    className: { control: 'text' },
  },

  args: {
    children: '12',
    size: 'M',
    variant: 'primary',
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55600-10571',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Basic stories ───────── */

export const Default: Story = {};

export const Accent: Story = {
  args: { variant: 'accent' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const White: Story = {
  args: { variant: 'white' },
  decorators: [
    (Story) => (
      <div style={{ background: '#1a1a1f', padding: 16, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

/* ───────── Size stories ───────── */

export const SizeXL: Story = {
  args: { size: 'XL' },
};

export const SizeS: Story = {
  args: { size: 'S' },
};

/* ───────── Edge cases ───────── */

export const LargeNumber: Story = {
  args: { children: '999+', size: 'XL' },
};

export const SingleDigit: Story = {
  args: { children: '1' },
};

/* ───────── Showcase ───────── */

const sizes: CounterSize[] = ['XL', 'L', 'M', 'S'];
const variants: CounterVariant[] = ['accent', 'primary', 'secondary', 'white'];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: '#888',
    }}
  >
    {children}
  </span>
);

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {variants.map((variant) => {
        const isWhite = variant === 'white';
        return (
          <div
            key={variant}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: isWhite ? 8 : undefined,
              background: isWhite ? '#1a1a1f' : undefined,
              borderRadius: isWhite ? 8 : undefined,
            }}
          >
            <Counter variant={variant} size="XL">
              1
            </Counter>
            <span style={{ fontSize: 10, color: isWhite ? '#888' : '#aaa' }}>
              {variant}
            </span>
          </div>
        );
      })}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Counter size={size}>12</Counter>
          <span style={{ fontSize: 10, color: '#aaa' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

const CounterRow = ({
  variant,
  label,
}: {
  variant: CounterVariant;
  label: string;
}) => {
  const isWhite = variant === 'white';
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: isWhite ? '12px' : undefined,
        background: isWhite ? '#1a1a1f' : undefined,
        borderRadius: isWhite ? 8 : undefined,
      }}
    >
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Counter size={size} variant={variant}>
            {label}
          </Counter>
          <span style={{ fontSize: 10, color: isWhite ? '#888' : '#aaa' }}>
            {size}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {variants.map((variant) => (
        <div
          key={variant}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <SectionLabel>{variant}</SectionLabel>
          <CounterRow variant={variant} label="1" />
          <CounterRow variant={variant} label="12" />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'padded' },
};
