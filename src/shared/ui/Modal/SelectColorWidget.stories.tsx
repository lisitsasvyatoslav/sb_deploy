import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useState, useRef } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import { SelectColorWidget } from './SelectColorWidget';

/* ───────── Stateful wrapper ───────── */

function SelectColorWidgetWithState(
  props: React.ComponentProps<typeof SelectColorWidget>
) {
  const [color, setColor] = useState(props.currentColor);
  return (
    <SelectColorWidget
      {...props}
      currentColor={color}
      onColorChange={(c) => {
        setColor(c);
        props.onColorChange?.(c);
      }}
    />
  );
}

/* ───────── Meta ───────── */

const meta: Meta<typeof SelectColorWidget> = {
  title: 'UI/SelectColorWidget',
  component: SelectColorWidget,
  tags: ['autodocs'],

  argTypes: {
    currentColor: {
      control: 'color',
      description: 'Текущий выбранный цвет',
    },
    onColorChange: { table: { disable: true } },
  },

  args: {
    currentColor: '#7863F6',
    onColorChange: fn(),
  },

  decorators: [
    (Story) => (
      <div style={{ padding: '60px 200px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=56154-14025',
    },
  },

  render: (args) => <SelectColorWidgetWithState {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Stories ───────── */

export const Default: Story = {
  args: {
    currentColor: '#7863F6',
  },
};

export const WithColor: Story = {
  args: {
    currentColor: '#F25555',
  },
};

function InteractiveDemo() {
  const [color, setColor] = useState('#7863F6');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <SelectColorWidget currentColor={color} onColorChange={setColor} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: color,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        />
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#666' }}>
          {color}
        </span>
      </div>
    </div>
  );
}

/** Интерактивная версия с отображением выбранного цвета */
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  parameters: { controls: { disable: true } },
};

/* ───────── All Variants (light + dark side by side) ───────── */

function AllVariantsDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useStripDarkTheme(wrapperRef);

  const labelStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  });

  const Panel = ({ theme }: { theme: 'light' | 'dark' }) => {
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
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>
          {isDark ? 'darkTheme' : 'lightTheme'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SelectColorWidgetWithState
            currentColor="#7863F6"
            onColorChange={fn()}
          />
          <span style={labelStyle(isDark)}>Collapsed (blue)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SelectColorWidgetWithState
            currentColor="#F25555"
            onColorChange={fn()}
          />
          <span style={labelStyle(isDark)}>Collapsed (red)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SelectColorWidgetWithState
            currentColor="#040405"
            onColorChange={fn()}
          />
          <span style={labelStyle(isDark)}>Collapsed (black)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ ...labelStyle(isDark), fontStyle: 'italic' }}>
            Click any dot to expand palette
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      <Panel theme="light" />
      <Panel theme="dark" />
    </div>
  );
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
  parameters: { controls: { disable: true } },
};
