import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useState, useSyncExternalStore } from 'react';
import TextArea from '@/shared/ui/TextArea';

/* ───────── Stateful wrapper ───────── */

function TextAreaWithState(props: React.ComponentProps<typeof TextArea>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <TextArea
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        props.onChange?.(e);
      }}
    />
  );
}

/* ───────── Meta ───────── */

const meta: Meta<typeof TextArea> = {
  title: 'UI/TextArea',
  component: TextArea,
  tags: ['autodocs'],

  argTypes: {
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    maxLength: { control: 'number' },
    showCounter: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },

  args: {
    placeholder: 'Placeholder',
    onChange: fn(),
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55088-5328',
    },
  },

  render: (args) => (
    <div style={{ width: 280 }}>
      <TextAreaWithState {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Stories ───────── */

export const Default: Story = {
  args: {
    value: '',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Label',
    value: '',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Label',
    hint: 'Hint text to help user',
    value: '',
  },
};

export const WithError: Story = {
  args: {
    label: 'Label',
    error: 'Error message',
    value: 'Some text',
  },
};

export const ErrorWithCustomHintStyle: Story = {
  args: {
    error: 'Error message with larger text',
    value: 'Some text',
    hintClassName: 'text-14 leading-20',
  },
};

export const WithCounter: Story = {
  args: {
    label: 'Label',
    maxLength: 200,
    value: '',
  },
};

export const WithCounterAndHint: Story = {
  args: {
    label: 'Label',
    hint: 'Hint text to help user',
    maxLength: 200,
    value: '',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Label',
    hint: 'Hint text to help user',
    maxLength: 200,
    value: '',
    disabled: true,
  },
};

function InteractiveDemo() {
  const [value, setValue] = useState('');
  const maxLen = 200;
  const hasError = value.length > maxLen * 0.9;
  return (
    <div style={{ width: 320 }}>
      <TextArea
        label="Description"
        placeholder="Enter description..."
        hint={hasError ? undefined : 'Hint text to help user'}
        error={hasError ? 'Text is too long' : undefined}
        maxLength={maxLen}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  parameters: { controls: { disable: true } },
};

/**
 * All Figma states on light and dark backgrounds (node 55088-5328).
 *
 * Hover and Focus are simulated via `storybook-addon-pseudo-states` —
 * the addon rewrites CSS rules and applies them to elements
 * marked with `.sb-hover` / `.sb-focus` classNames.
 */
/** Reactively reads `data-brand` from `<html>` so panels re-render on region switch */
function useBrand(): string {
  return useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-brand'],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.getAttribute('data-brand') || 'finam'
  );
}

function FigmaStatesDemo() {
  const brand = useBrand();
  const noop = fn();

  const states: {
    label: string;
    value: string;
    focused?: boolean;
    hover?: boolean;
    error?: boolean;
    disabled?: boolean;
  }[] = [
    { label: 'Default', value: '' },
    { label: 'Hover', value: '', hover: true },
    { label: 'Focused', value: '', focused: true },
    { label: 'Entered', value: 'Some entered text' },
    { label: 'Entered + Hover', value: 'Some entered text', hover: true },
    { label: 'Error', value: 'Some entered text', error: true },
    {
      label: 'Error + Hover',
      value: 'Some entered text',
      error: true,
      hover: true,
    },
    {
      label: 'Error Focused',
      value: 'Some entered text',
      error: true,
      focused: true,
    },
    { label: 'Disabled', value: '', disabled: true },
  ];

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
        data-brand={brand}
        data-theme={isDark ? 'dark' : 'light'}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: '24px 32px',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: 440,
        }}
      >
        {states.map((s) => (
          <div
            key={`${theme}-${s.label}`}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}
          >
            <div style={{ width: 280, flexShrink: 0 }}>
              <TextArea
                label="Label"
                placeholder="Placeholder"
                hint={s.error ? undefined : 'Hint text to help user'}
                error={s.error ? 'Error message' : undefined}
                maxLength={200}
                value={s.value}
                disabled={s.disabled}
                rows={2}
                onChange={noop}
                containerClassName={
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        padding: 32,
        background: '#E0E0E6',
      }}
    >
      <div>
        <span style={sectionTitle}>textArea</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          <Panel theme="light" />
          <Panel theme="dark" />
        </div>
      </div>
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
