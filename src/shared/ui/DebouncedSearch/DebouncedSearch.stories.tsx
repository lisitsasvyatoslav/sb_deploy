import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import DebouncedSearch from '@/shared/ui/DebouncedSearch';
import type { SearchInputSize } from '@/shared/ui/SearchInput';

const meta: Meta<typeof DebouncedSearch> = {
  title: 'UI/DebouncedSearch',
  component: DebouncedSearch,
  tags: ['autodocs'],

  argTypes: {
    placeholder: { control: 'text' },
    delay: {
      control: 'number',
      description: 'Задержка в мс перед вызовом onChange',
      table: { defaultValue: { summary: '500' } },
    },
    size: {
      control: 'select',
      options: ['md', 'sm'] satisfies SearchInputSize[],
      description: 'Размер поля ввода',
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: { control: 'boolean' },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Интерактивная версия: введите текст и увидите задержку обновления */
export const Default: Story = {
  render: (args) => {
    const [debouncedValue, setDebouncedValue] = useState('');

    return (
      <div
        style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <DebouncedSearch
          {...args}
          value=""
          onChange={(v) => setDebouncedValue(v ?? '')}
        />
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #666)' }}>
          <div>
            После debounce ({args.delay ?? 500}мс): «{debouncedValue}»
          </div>
        </div>
      </div>
    );
  },
  args: {
    placeholder: 'Поиск...',
    delay: 500,
  },
};

export const FastDebounce: Story = {
  render: (args) => {
    const [debouncedValue, setDebouncedValue] = useState('');

    return (
      <div
        style={{
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <DebouncedSearch
          {...args}
          value=""
          onChange={(v) => setDebouncedValue(v ?? '')}
        />
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-secondary, #666)',
            margin: 0,
          }}
        >
          Debounce: «{debouncedValue}»
        </p>
      </div>
    );
  },
  args: {
    placeholder: 'Быстрый поиск (100мс)',
    delay: 100,
  },
};

export const SmallSize: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 280 }}>
        <DebouncedSearch
          {...args}
          value={value}
          onChange={(v) => setValue(v ?? '')}
        />
      </div>
    );
  },
  args: {
    size: 'sm',
    placeholder: 'Поиск...',
    delay: 500,
  },
};
