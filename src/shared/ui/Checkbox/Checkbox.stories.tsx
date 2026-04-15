/**
 * TOKEN NOTES (Checkbox component):
 *
 * 1. Checked background:
 *    - accent variant: `var(--brand-primary, #7863f6)` light / `var(--brand-primary, #8a7cf8)` dark
 *      (Tailwind `bg-[var(--brand-primary,#7863f6)]` — auto-switches via CSS vars)
 *    - mono variant: `var(--blackinverse-a100)` — #040405 in light, white in dark
 *
 * 2. Unchecked border: `var(--blackinverse-a8)` — rgba(4,4,5,0.08) light / rgba(255,255,255,0.12) dark
 *
 * 3. Error border: `var(--status-negative)` = #f25555 in both themes
 *
 * 4. Icon color: `var(--texticon-fixed_white)` for accent (always white),
 *    `var(--whiteinverse-a100)` for mono (white in light, dark in dark = shows on white box)
 *
 * 5. Label text: `var(--blackinverse-a100)` — auto-switches
 *    Description: `var(--blackinverse-a56)` — auto-switches
 *
 * Figma: 63574:11664 (overview), 63574:11949 (light w/o labels), 63574:13660 (light w/ labels),
 *        63574:13956 (dark w/o labels), 63574:13987 (dark w/ labels)
 */

import React, { useRef, useState } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Checkbox from './Checkbox';

/* ───────── Stateful wrapper ───────── */

const Stateful = (props: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Checkbox {...props} checked={checked} onChange={setChecked} />;
};

/* ───────── Meta ───────── */

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],

  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm = 16×16 px, md = 20×20 px, lg = 24×24 px',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'radio',
      options: ['accent', 'mono'],
      description: "'accent' = brand purple, 'mono' = black/white",
      table: { defaultValue: { summary: 'accent' } },
    },
    label: { control: 'text' },
    description: { control: 'text' },
    className: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },

  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    error: false,
    size: 'md',
    variant: 'accent',
  },

  render: (args) => <Stateful {...args} />,

  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Basic stories ───────── */

/** Unchecked, md size, accent variant */
export const Default: Story = {};

/** Checked, md size, accent variant */
export const Checked: Story = { args: { checked: true } };

/** Indeterminate state */
export const Indeterminate: Story = { args: { indeterminate: true } };

/** With label */
export const WithLabel: Story = { args: { checked: true, label: 'Label' } };

/** With label and footnote */
export const WithDescription: Story = {
  args: { checked: true, label: 'Label', description: 'Footnote' },
};

/** Error state — red border */
export const ErrorState: Story = { args: { error: true } };

/** Disabled unchecked */
export const Disabled: Story = { args: { disabled: true } };

/** Disabled checked */
export const DisabledChecked: Story = {
  args: { checked: true, disabled: true },
};

/** Small size */
export const SizeSm: Story = { args: { size: 'sm' } };

/** Small size checked */
export const SizeSmChecked: Story = { args: { size: 'sm', checked: true } };

/** Large size */
export const SizeLg: Story = { args: { size: 'lg' } };

/** Large size checked */
export const SizeLgChecked: Story = { args: { size: 'lg', checked: true } };

/** Mono variant — black/white */
export const Mono: Story = { args: { variant: 'mono' } };

/** Mono checked */
export const MonoChecked: Story = { args: { variant: 'mono', checked: true } };

/* ───────── AllStates matrix ───────── */

type CheckboxState = {
  label: string;
  props: Partial<React.ComponentProps<typeof Checkbox>>;
};

const STATES: CheckboxState[] = [
  { label: 'Unchecked', props: {} },
  { label: 'Checked', props: { checked: true } },
  { label: 'Indeterminate', props: { indeterminate: true } },
  { label: 'Error', props: { error: true } },
  { label: 'Disabled', props: { disabled: true } },
];

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['lg', 'md', 'sm'] as const).map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: '#888',
            }}
          >
            size / {size}
          </span>
          <div
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {STATES.map(({ label, props }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                }}
              >
                <Stateful size={size} onChange={() => {}} {...props} />
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: 'rgba(0,0,0,0.35)',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/* ───────── FigmaStates — side-by-side light / dark panels ───────── */

type VisualState = 'Default' | 'Hovered' | 'Pressed' | 'Disabled';
const VISUAL_STATES: VisualState[] = [
  'Default',
  'Hovered',
  'Pressed',
  'Disabled',
];
const ENABLES = ['Off', 'On', 'Indeterminate', 'Error'] as const;
type Enable = (typeof ENABLES)[number];

function labelStyle(isDark: boolean): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 500,
    fontFamily: 'monospace',
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    minWidth: 64,
    whiteSpace: 'nowrap',
  };
}

function CheckboxPanel({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark';

  function propsFor(enable: Enable, state: VisualState) {
    return {
      checked: enable === 'On',
      indeterminate: enable === 'Indeterminate',
      error: enable === 'Error',
      disabled: state === 'Disabled',
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>
        {isDark ? 'darkTheme' : 'lightTheme'}
      </span>
      <div
        data-theme={theme}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: 32,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {(['accent', 'mono'] as const).map((variant) => (
          <div
            key={variant}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
              }}
            >
              {variant}
            </span>
            {/* Column headers */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ ...labelStyle(isDark), visibility: 'hidden' }}>
                spacer
              </span>
              {ENABLES.map((lbl) => (
                <span
                  key={lbl}
                  style={{
                    ...labelStyle(isDark),
                    fontSize: 9,
                    minWidth: 0,
                    textAlign: 'center',
                    width: 24,
                  }}
                >
                  {lbl}
                </span>
              ))}
            </div>
            {/* Rows: one per visual state */}
            {VISUAL_STATES.map((state) => (
              <div
                key={state}
                data-state={
                  state === 'Hovered'
                    ? 'hover'
                    : state === 'Pressed'
                      ? 'pressed'
                      : undefined
                }
                style={{ display: 'flex', gap: 20, alignItems: 'center' }}
              >
                <span style={labelStyle(isDark)}>{state}</span>
                {ENABLES.map((enable) => (
                  <Checkbox
                    key={enable}
                    size="lg"
                    variant={variant}
                    onChange={() => {}}
                    {...propsFor(enable, state)}
                  />
                ))}
              </div>
            ))}
            {/* With label row */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={labelStyle(isDark)}>w/ label</span>
              <Checkbox
                size="lg"
                variant={variant}
                checked={false}
                label="Label"
                onChange={() => {}}
              />
              <Checkbox
                size="lg"
                variant={variant}
                checked={true}
                label="Label"
                onChange={() => {}}
              />
            </div>
            {/* With label + description row */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <span style={{ ...labelStyle(isDark), paddingTop: 2 }}>
                w/ desc
              </span>
              <Checkbox
                size="lg"
                variant={variant}
                checked={true}
                label="Label"
                description="Footnote"
                onChange={() => {}}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FigmaStatesDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useStripDarkTheme(wrapperRef);

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
      <CheckboxPanel theme="light" />
      <CheckboxPanel theme="dark" />
    </div>
  );
}

/**
 * All checkbox states rendered side-by-side in light and dark panels — mirrors
 * Figma nodes 63574:11949 (light) and 63574:13956 (dark).
 *
 * Hover/pressed are simulated via `storybook-addon-pseudo-states`.
 * `useLayoutEffect` strips `data-theme="dark"` from Storybook ancestors so
 * the light panel renders correctly when the global theme is set to dark.
 */
export const FigmaStates: Story = {
  render: () => <FigmaStatesDemo />,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    pseudo: {
      hover: '[data-state="hover"] [role="checkbox"]',
      active: '[data-state="pressed"] [role="checkbox"]',
    },
  },
};
