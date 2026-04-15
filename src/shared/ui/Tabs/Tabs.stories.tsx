import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { useState } from 'react';
import Tabs from '@/shared/ui/Tabs';

const sampleTabs = [
  { label: 'Новости', value: 'news' },
  { label: 'Фундаментал', value: 'fundamental' },
  { label: 'Теханализ', value: 'techanalysis' },
];

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],

  argTypes: {
    size: {
      control: 'radio',
      options: ['M', 'L'],
      description: 'Размер: M (стандартный) или L (большой)',
      table: { defaultValue: { summary: 'M' } },
    },
    variant: {
      control: 'select',
      options: ['surface', 'inverse', 'mono'],
      description: 'Цветовой вариант',
      table: { defaultValue: { summary: 'surface' } },
    },
    widthType: {
      control: 'radio',
      options: ['fixed', 'content'],
      description: 'fixed — равная ширина вкладок, content — по содержимому',
    },
    pill: {
      control: 'boolean',
      description: 'Полностью скруглённые кнопки',
    },
    tabs: { table: { disable: true } },
    onChange: { table: { disable: true } },
    value: { table: { disable: true } },
  },

  args: {
    tabs: sampleTabs,
    value: 'news',
    onChange: fn(),
    size: 'M',
    variant: 'surface',
    widthType: 'fixed',
    pill: false,
  },

  parameters: { layout: 'centered' },

  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { size: 'L' },
};

export const Inverse: Story = {
  args: { variant: 'inverse' },
};

export const Mono: Story = {
  args: { variant: 'mono' },
};

export const Pill: Story = {
  args: { pill: true, widthType: 'content' },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { label: 'Активная', value: 'active' },
      { label: 'Недоступная', value: 'disabled', disabled: true },
      { label: 'Ещё одна', value: 'another' },
    ],
    value: 'active',
  },
};

/** Интерактивный пример с управляемым состоянием */
export const Interactive: Story = {
  render: (args) => {
    const [activeTab, setActiveTab] = useState('news');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 360,
        }}
      >
        <Tabs
          {...args}
          tabs={args.tabs ?? sampleTabs}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--bg-card)',
            borderRadius: 8,
          }}
        >
          Активная вкладка: <strong>{activeTab}</strong>
        </div>
      </div>
    );
  },
};

/** Все варианты */
export const AllVariants: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}
    >
      {(['surface', 'inverse', 'mono'] as const).map((variant) => (
        <div
          key={variant}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-secondary, #888)' }}>
            {variant}
          </span>
          <Tabs
            tabs={sampleTabs}
            value="news"
            onChange={fn()}
            variant={variant}
          />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
