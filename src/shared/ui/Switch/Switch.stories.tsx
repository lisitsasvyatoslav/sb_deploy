/**
 * Switch.stories.tsx — token / isolation notes
 *
 * TOKEN ISOLATION (intentional)
 * ─────────────────────────────
 * `SWITCH_THEME_VARS` inlines hardcoded hex values (`#7863f6` light, `#8A7CF8` dark)
 * directly onto the panel wrapper's `style` prop. This intentionally bypasses the
 * production CSS-var chain (`--switch-bg-on: var(--brand-primary, var(--mind-accent))`)
 * so that the FigmaStates panel renders correctly regardless of which design-token
 * theme file is (or isn't) loaded in the Storybook environment. Without this isolation
 * the panel would pick up whatever `--brand-primary` resolves to in the Storybook
 * decorator context, which can differ from the production value.
 *
 * DARK MODE — `--switch-bg-on`
 * ─────────────────────────────────────────
 * `manual-overrides.css [data-theme="dark"]` now explicitly sets
 * `--switch-bg-on: var(--brand-primary, var(--mind-accent))`, which resolves to
 * `#8A7CF8` for the finam brand in dark mode (via `brand-finam.css`) and
 * `#B8E366` for the lime brand (via `brand-lime.css`). The story hardcodes `#8A7CF8`
 * for the dark panel to provide token isolation in Storybook regardless of which brand
 * or theme file is loaded in the decorator context.
 *
 * MONO VARIANT — `bg-blackinverse-a100`
 * ──────────────────────────────────────
 * The mono variant uses `bg-blackinverse-a100` and `focus-visible:ring-blackinverse-a100`.
 * Verified: `blackinverse.a100` is mapped in `tailwind-theme.js` to `var(--blackinverse-a100)`,
 * which resolves to `#040405` (near-black) in light and `#FFFFFF` (white) in dark via
 * `theme-variables.css`. The inversion is correct — no fallback to transparent.
 */

import React, { useRef, useState } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import Switch from '@/shared/ui/Switch';
import type { SwitchSize, SwitchVariant } from '@/shared/ui/Switch';

/* ───────── Stateful wrapper ───────── */

const Stateful = (props: React.ComponentProps<typeof Switch>) => {
  const [checked, setChecked] = useState(props.checked);
  return <Switch {...props} checked={checked} onChange={setChecked} />;
};

/* ───────── Meta ───────── */

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],

  argTypes: {
    checked: { control: 'boolean' },
    size: {
      control: 'radio',
      options: ['sm', 'md'] satisfies SwitchSize[],
      description: 'sm = 24x12px (web), md = 40x20px (app)',
      table: { defaultValue: { summary: 'sm' } },
    },
    variant: {
      control: 'radio',
      options: ['accent', 'mono'] satisfies SwitchVariant[],
      description: 'accent = purple (default), mono = black/white',
      table: { defaultValue: { summary: 'accent' } },
    },
    disabled: { control: 'boolean' },
    onChange: { table: { disable: true } },
    'data-testid': { table: { disable: true } },
    'aria-label': { control: 'text' },
    'aria-labelledby': { table: { disable: true } },
  },

  args: {
    checked: false,
    size: 'sm',
    variant: 'accent',
    disabled: false,
    'aria-label': 'Toggle',
  },

  render: (args) => <Stateful {...args} />,

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55089-9413',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Basic stories ───────── */

export const Default: Story = {};

export const Checked: Story = {
  args: { checked: true },
};

export const SizeMd: Story = {
  args: { size: 'md' },
};

export const SizeMdChecked: Story = {
  args: { size: 'md', checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true },
};

/* ───────── Mono variant ───────── */

export const Mono: Story = {
  args: { variant: 'mono' },
};

export const MonoChecked: Story = {
  args: { variant: 'mono', checked: true },
};

export const MonoMd: Story = {
  args: { variant: 'mono', size: 'md' },
};

export const MonoMdChecked: Story = {
  args: { variant: 'mono', size: 'md', checked: true },
};

/* ───────── All Sizes ───────── */

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['accent', 'mono'] as const).map((variant) =>
        (['sm', 'md'] as const).map((size) => (
          <div
            key={`${variant}-${size}`}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
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
              {variant} / {size}
            </span>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Stateful
                variant={variant}
                size={size}
                checked={false}
                onChange={() => {}}
                aria-label={`${variant} ${size} off`}
              />
              <Stateful
                variant={variant}
                size={size}
                checked={true}
                onChange={() => {}}
                aria-label={`${variant} ${size} on`}
              />
              <Stateful
                variant={variant}
                size={size}
                checked={false}
                disabled
                onChange={() => {}}
                aria-label={`${variant} ${size} disabled off`}
              />
              <Stateful
                variant={variant}
                size={size}
                checked={true}
                disabled
                onChange={() => {}}
                aria-label={`${variant} ${size} disabled on`}
              />
            </div>
          </div>
        ))
      )}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/* ───────── Interactive ───────── */

function InteractiveDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Switch
        checked={checked}
        onChange={setChecked}
        aria-label="Notifications"
        data-testid="switch-interactive"
      />
      <span style={{ fontSize: 14, color: 'var(--text-primary, #121212)' }}>
        {checked ? 'On' : 'Off'}
      </span>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  parameters: { controls: { disable: true } },
};

/* ───────── With Label ───────── */

function WithLabelDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
      }}
    >
      <Switch checked={checked} onChange={setChecked} aria-label="Dark mode" />
      <span style={{ fontSize: 14, color: 'var(--text-primary, #121212)' }}>
        Dark mode
      </span>
    </label>
  );
}

export const WithLabel: Story = {
  render: () => <WithLabelDemo />,
  parameters: { controls: { disable: true } },
};

/* ───────── Figma States ───────── */

/**
 * Hardcoded hex values — see file-level JSDoc for isolation rationale.
 *
 * Light: `--switch-bg-on` = #7863f6 (matches var(--mind-accent) in light DS tokens)
 * Dark:  `--switch-bg-on` = #8A7CF8 (matches var(--brand-primary) for finam dark, set
 *        explicitly in manual-overrides.css [data-theme="dark"] via the brand cascade)
 */
const SWITCH_THEME_VARS = {
  light: {
    '--switch-bg-off': 'rgba(4, 4, 5, 0.12)',
    '--switch-bg-on': '#7863f6',
    '--switch-thumb': 'rgba(255, 255, 255, 0.9)',
    '--switch-dot': '#7863F6',
  },
  dark: {
    '--switch-bg-off': 'rgba(255, 255, 255, 0.2)',
    '--switch-bg-on': '#8A7CF8',
    '--switch-thumb': 'rgba(28, 28, 31, 0.92)',
    '--switch-dot': '#8A7CF8',
  },
} as const;

type SwitchState = 'Default' | 'Hovered' | 'Focused' | 'Disabled';

const FigmaPanel = ({ theme }: { theme: 'light' | 'dark' }) => {
  const isDark = theme === 'dark';
  const variants: SwitchVariant[] = ['accent', 'mono'];
  const sizes: SwitchSize[] = ['sm', 'md'];
  const states: SwitchState[] = ['Default', 'Hovered', 'Focused', 'Disabled'];

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
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            ...SWITCH_THEME_VARS[theme],
          } as React.CSSProperties
        }
      >
        {variants.map((variant) =>
          sizes.map((size) => (
            <div
              key={`${variant}-${size}`}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
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
                {variant} / {size}
              </span>
              {states.map((state) => (
                <div
                  key={state}
                  data-state={
                    state === 'Hovered'
                      ? 'hover'
                      : state === 'Focused'
                        ? 'focus'
                        : undefined
                  }
                  style={{ display: 'flex', gap: 24, alignItems: 'center' }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      fontFamily: 'monospace',
                      minWidth: 52,
                      color: isDark
                        ? 'rgba(255,255,255,0.35)'
                        : 'rgba(0,0,0,0.3)',
                    }}
                  >
                    {state}
                  </span>
                  <Stateful
                    variant={variant}
                    size={size}
                    checked={false}
                    disabled={state === 'Disabled'}
                    onChange={() => {}}
                    aria-label={`${variant} ${size} ${state} off`}
                  />
                  <Stateful
                    variant={variant}
                    size={size}
                    checked={true}
                    disabled={state === 'Disabled'}
                    onChange={() => {}}
                    aria-label={`${variant} ${size} ${state} on`}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * All states on light and dark backgrounds — matching Figma (node 55089-9413).
 *
 * Hover / Focus are simulated via `storybook-addon-pseudo-states` which rewrites
 * CSS rules (e.g. `:hover` → `.pseudo-hover`, `:focus-visible` → `.pseudo-focus-visible`)
 * and applies classes to elements matching the selectors in `parameters.pseudo`.
 *
 * The `useLayoutEffect` strips `data-theme="dark"` from Storybook ancestors so that
 * the light panel renders correctly when the global theme switcher is set to dark.
 * A `MutationObserver` re-strips the attribute if Storybook's theme decorator
 * re-applies it after a theme change. On unmount the original value is restored.
 */
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
      <FigmaPanel theme="light" />
      <FigmaPanel theme="dark" />
    </div>
  );
}

export const FigmaStates: Story = {
  render: () => <FigmaStatesDemo />,
  parameters: {
    controls: { disable: true },
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55089-9413',
    },
    pseudo: {
      hover: '[data-state="hover"] button',
      focusVisible: '[data-state="focus"] button',
    },
  },
};
