/**
 * RadioButton.stories.tsx
 *
 * TOKEN NOTES:
 *
 * 1. Unchecked border: `var(--blackinverse-a8)` — rgba(4,4,5,0.08) light / rgba(255,255,255,0.12) dark
 *
 * 2. Accent checked bg: `var(--brand-primary, #7863f6)` light / `var(--brand-primary, #8a7cf8)` dark
 *    (auto-switches via CSS vars)
 *
 * 3. Mono checked bg: `var(--blackinverse-a100)` — #040405 in light, white in dark
 *
 * 4. Error border: `var(--status-negative)` = #f25555 in both themes
 *
 * 5. Mark (inner dot) color:
 *    - accent: `bg-white` (#fff always) — `--texticon-fixed_white` Tailwind class compiles to empty rule (token not in tailwind config)
 *    - mono: `var(--whiteinverse-a100)` — white in light (visible on black box), dark in dark (visible on white box)
 *
 * TOKEN ISOLATION (intentional)
 * ─────────────────────────────
 * `RADIO_THEME_VARS` inlines hardcoded hex values directly onto the panel wrapper's
 * `style` prop. This bypasses the production CSS-var chain (`--brand-primary`) so the
 * FigmaStates panel renders correctly regardless of which brand/theme token file is
 * loaded in Storybook. Without this, `--brand-primary` is empty in the Storybook iframe
 * and the dark panel shows the fallback `#7863f6` instead of the correct `#8a7cf8`.
 *
 * Figma: 63574:14519 (overview), 63574:15664 (light), 63574:15999 (dark)
 */

import React, { useRef, useState } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import RadioButton from './RadioButton';
import type { RadioButtonSize, RadioButtonVariant } from './RadioButton';

/* ───────── Stateful wrapper ───────── */

const Stateful = (props: React.ComponentProps<typeof RadioButton>) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <RadioButton
      {...props}
      checked={checked}
      onChange={() => setChecked(true)}
    />
  );
};

/* ───────── Meta ───────── */

const meta: Meta<typeof RadioButton> = {
  title: 'UI/RadioButton',
  component: RadioButton,
  tags: ['autodocs'],

  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'] satisfies RadioButtonSize[],
      description: 'sm = 16×16 px, md = 20×20 px, lg = 24×24 px',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'radio',
      options: ['accent', 'mono'] satisfies RadioButtonVariant[],
      description: "'accent' = brand purple, 'mono' = black/white",
      table: { defaultValue: { summary: 'accent' } },
    },
    className: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },

  args: {
    checked: false,
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

type RadioState = {
  label: string;
  props: Partial<React.ComponentProps<typeof RadioButton>>;
};

const STATES: RadioState[] = [
  { label: 'Unchecked', props: {} },
  { label: 'Checked', props: { checked: true } },
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

/**
 * Hardcoded hex values for token isolation — see file-level JSDoc.
 * Light: --brand-primary = #7863f6, --blackinverse-a8 = rgba(4,4,5,0.08), --blackinverse-a100 = #040405
 * Dark:  --brand-primary = #8a7cf8, --blackinverse-a8 = rgba(255,255,255,0.12), --blackinverse-a100 = #ffffff
 */
const RADIO_THEME_VARS = {
  light: {
    '--brand-primary': '#7863f6',
    '--blackinverse-a8': 'rgba(4,4,5,0.08)',
    '--blackinverse-a100': '#040405',
    '--whiteinverse-a100': '#ffffff',
    '--status-negative': '#f25555',
    '--texticon-fixed_white': '#ffffff',
  },
  dark: {
    '--brand-primary': '#8a7cf8',
    '--blackinverse-a8': 'rgba(255,255,255,0.12)',
    '--blackinverse-a100': '#ffffff',
    '--whiteinverse-a100': '#040405',
    '--status-negative': '#f25555',
    '--texticon-fixed_white': '#ffffff',
  },
} as const;

type VisualState = 'Default' | 'Hovered' | 'Pressed' | 'Disabled';
const VISUAL_STATES: VisualState[] = [
  'Default',
  'Hovered',
  'Pressed',
  'Disabled',
];
const ENABLES = ['Off', 'On', 'Error'] as const;
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

function RadioButtonPanel({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark';

  function propsFor(enable: Enable, state: VisualState) {
    return {
      checked: enable === 'On',
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
        style={
          {
            background: isDark ? '#040405' : '#FFFFFF',
            padding: 32,
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            ...RADIO_THEME_VARS[theme],
          } as React.CSSProperties
        }
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
            {/* Rows: one per visual state × all sizes */}
            {(['lg', 'md', 'sm'] as const).map((size) => (
              <div
                key={size}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <span style={{ ...labelStyle(isDark), fontSize: 9 }}>
                  size/{size}
                </span>
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
                      <RadioButton
                        key={enable}
                        size={size}
                        variant={variant}
                        onChange={() => {}}
                        {...propsFor(enable, state)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
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
      <RadioButtonPanel theme="light" />
      <RadioButtonPanel theme="dark" />
    </div>
  );
}

/**
 * All radio button states rendered side-by-side in light and dark panels — mirrors
 * Figma nodes 63574:15664 (light) and 63574:15999 (dark).
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
      hover: '[data-state="hover"] [role="radio"]',
      active: '[data-state="pressed"] [role="radio"]',
    },
  },
};
