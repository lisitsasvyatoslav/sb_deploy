import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useState, useLayoutEffect, useRef } from 'react';
import SearchInput from '@/shared/ui/SearchInput';
import type { SearchInputSize } from '@/shared/ui/SearchInput';

/* ───────── Stateful wrapper ───────── */

function SearchInputWithState(props: React.ComponentProps<typeof SearchInput>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <SearchInput
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        props.onChange?.(e);
      }}
      onClear={() => {
        setValue('');
        props.onClear?.();
      }}
    />
  );
}

/* ───────── Meta ───────── */

const meta: Meta<typeof SearchInput> = {
  title: 'UI/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],

  argTypes: {
    size: {
      control: 'select',
      options: ['md', 'sm'] satisfies SearchInputSize[],
      description: 'Размер: md=40px, sm=32px',
      table: { defaultValue: { summary: 'md' } },
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    showClearButton: {
      control: 'boolean',
      description: 'Показывать кнопку очистки при наличии значения',
      table: { defaultValue: { summary: 'true' } },
    },
    onClear: { table: { disable: true } },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },

  args: {
    placeholder: 'Search',
    onClear: fn(),
    onChange: fn(),
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55088-5330',
    },
  },

  render: (args) => <SearchInputWithState {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Stories ───────── */

export const Default: Story = {
  args: {
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    value: 'AAPL',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    value: '',
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    disabled: true,
  },
};

export const WithoutClearButton: Story = {
  args: {
    value: 'AAPL',
    showClearButton: false,
  },
};

function InteractiveDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 320 }}>
      <SearchInput
        value={value}
        placeholder="Поиск тикера..."
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue('')}
      />
      {value && (
        <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Поиск: «{value}»
        </p>
      )}
    </div>
  );
}

/** Интерактивная версия с управляемым состоянием */
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  parameters: { controls: { disable: true } },
};

/** Все размеры */
export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}
    >
      {(['md', 'sm'] as SearchInputSize[]).map((size) => (
        <SearchInputWithState
          key={size}
          size={size}
          placeholder={`Размер ${size}`}
        />
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/**
 * Все состояния на light и dark фоне — как в Figma (node 55088-5330).
 *
 * Hover / Entered+Hover и Focused / Typing симулируются через
 * `storybook-addon-pseudo-states` — аддон перезаписывает CSS-правила
 * `hover:opacity-80`, `focus-within:border-*`, `group-focus-within:text-*`
 * и применяет их к элементам, отмеченным через className.
 */
function FigmaStatesDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Снимаем data-theme="dark" со ВСЕХ предков, чтобы Tailwind dark: классы
  // не протекали в light-панель. MutationObserver не даёт Storybook вернуть атрибут.
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const stripped = new Map<Element, string>();
    let el: Element | null = wrapperRef.current.parentElement;
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
  }, []);

  const noop = fn();

  const states: {
    label: string;
    value: string;
    focused?: boolean;
    hover?: boolean;
  }[] = [
    { label: 'Default', value: '' },
    { label: 'Hover', value: '', hover: true },
    { label: 'Focused', value: '', focused: true },
    { label: 'Typing', value: 'Search', focused: true },
    { label: 'Entered', value: 'Search' },
    { label: 'Entered + Hover', value: 'Search', hover: true },
  ];

  const sizes: { key: SearchInputSize; label: string; width: number }[] = [
    { key: 'md', label: 'inputSearchMd', width: 347 },
    { key: 'sm', label: 'inputSearchSm', width: 280 },
  ];

  const labelStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  });

  const Panel = ({
    theme,
    size,
    width,
  }: {
    theme: 'light' | 'dark';
    size: SearchInputSize;
    width: number;
  }) => {
    const isDark = theme === 'dark';
    return (
      <div
        data-theme={isDark ? 'dark' : undefined}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: '24px 32px',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: width + 160,
        }}
      >
        {states.map((s) => (
          <div
            key={`${theme}-${size}-${s.label}`}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{ width, flexShrink: 0 }}>
              <SearchInput
                size={size}
                value={s.value}
                placeholder="Search"
                onChange={noop}
                onClear={noop}
                className={
                  [s.focused && 'sb-focus', s.hover && 'sb-hover']
                    .filter(Boolean)
                    .join(' ') || undefined
                }
              />
            </div>
            <span style={labelStyle(isDark)}>{s.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        padding: 32,
        background: '#E0E0E6',
      }}
    >
      <div style={{ display: 'flex', gap: 24 }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            padding: '24px 32px',
            width: 347 + 64,
          }}
        >
          <span style={sectionTitle}>Interactive</span>
          <div style={{ marginTop: 12 }}>
            <SearchInputWithState placeholder="Search" size="md" />
          </div>
        </div>
        <div
          data-theme="dark"
          style={{
            background: '#040405',
            borderRadius: 8,
            padding: '24px 32px',
            width: 347 + 64,
          }}
        >
          <span style={{ ...sectionTitle, color: 'rgba(255,255,255,0.5)' }}>
            Interactive
          </span>
          <div style={{ marginTop: 12 }}>
            <SearchInputWithState placeholder="Search" size="md" />
          </div>
        </div>
      </div>

      {sizes.map(({ key, label, width }) => (
        <div key={key}>
          <span style={sectionTitle}>{label}</span>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            <Panel theme="light" size={key} width={width} />
            <Panel theme="dark" size={key} width={width} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const FigmaStates: Story = {
  decorators: [],
  render: () => <FigmaStatesDemo />,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    pseudo: {
      hover: '.sb-hover',
      focusWithin: '.sb-focus',
    },
  },
};
