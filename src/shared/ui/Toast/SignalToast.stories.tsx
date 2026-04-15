/**
 * SignalToast.stories.tsx
 *
 * TOKEN ISSUES TO VERIFY:
 *
 * 1. `bg-surface-medium` (SignalToast Tailwind class) vs `var(--surface-medium)` inline style (CustomToast):
 *    Both resolve to the same design-system token. In Tailwind config, `bg-surface-medium`
 *    maps to `var(--surface-medium)`. In CustomToast, `getBackgroundStyle()` returns
 *    `backgroundColor: 'var(--surface-medium)'` as an inline style.
 *    The DS alias chain: --surface-medium → var(--surfacemedium-surfacemedium)
 *    which is defined in theme-variables.css and switches per theme.
 *    Functionally identical — verify visually in the AllStates story below.
 *
 * 2. `.theme-border`, `.theme-text-primary`, `.theme-text-secondary`:
 *    Custom @layer components classes from globals.css:
 *      .theme-border        → border-color: var(--border-light)   (#F1F1F1 / #3B3B3D)
 *      .theme-text-primary  → color: var(--text-primary)          (#121212 / #FFFFFF)
 *      .theme-text-secondary→ color: var(--text-secondary)        (#666666 / #AEAEB2)
 *    All switch correctly in dark mode via [data-theme="dark"] overrides in
 *    manual-overrides.css. Exercised in both panel themes of AllStates below.
 *
 * 3. `next/image` (Image component) in Storybook:
 *    `@storybook/nextjs` mocks next/image — no extra configuration needed.
 *    Use only paths resolvable from /public (e.g. `/icons/brokers/limex.svg`)
 *    or reliable external URLs. Avoid paths that require auth or dynamic routes.
 *
 * 4. `useRouter()` from next/navigation:
 *    `@storybook/nextjs` mocks useRouter automatically.
 *    The `button.link` prop triggers `router.push()` — works as a no-op in stories.
 *
 * 5. `theme-icon-invert` on the Image element:
 *    Defined in globals.css: `[data-theme="dark"] .theme-icon-invert { filter: invert(1) }`
 *    This means dark-mode panels with SVG icons will show inverted colors.
 *    Use icons/SVGs that look reasonable when inverted, or PNG icons from brokers.
 */

import React, { useRef } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import SignalToast from './SignalToast';
import type { SignalToastProps } from './SignalToast';

/* ───────── Meta ───────── */

const meta: Meta<typeof SignalToast> = {
  title: 'UI/Toast/SignalToast',
  component: SignalToast,
  tags: ['autodocs'],

  argTypes: {
    iconUrl: {
      control: 'text',
      description:
        'URL for the signal source icon (public path or external URL)',
    },
    sourceName: {
      control: 'text',
      description: 'Display name of the signal source',
    },
    message: { control: 'text' },
    messageTicker: { table: { disable: true } },
    button: { table: { disable: true } },
    closeToast: { table: { disable: true } },
  },

  args: {
    iconUrl: '/icons/brokers/limex.svg',
    sourceName: 'LimeX',
    message: 'New buy signal detected for AAPL.',
    closeToast: fn(),
  },

  parameters: {
    layout: 'padded',
    docs: { toc: true },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Basic stories ───────── */

/** Minimal signal toast — source icon, name, and message. No ticker, no action. */
export const Default: Story = {};

/** With a ticker badge displayed to the left of the message. */
export const WithTicker: Story = {
  args: {
    message: 'Strong momentum detected — consider adding to position.',
    messageTicker: {
      ticker: 'AAPL',
      securityId: 1,
    },
  },
};

/** With an action button below the message. */
export const WithButton: Story = {
  args: {
    message: 'A new trading signal has been generated.',
    button: {
      text: 'View Signal',
      onClick: fn(),
    },
  },
};

/** Ticker + action button together — full layout exercise. */
export const WithTickerAndButton: Story = {
  args: {
    sourceName: 'Finam',
    iconUrl: '/icons/brokers/finam.svg',
    message: 'RSI crossed 70 — overbought territory.',
    messageTicker: {
      ticker: 'TSLA',
      securityId: 2,
    },
    button: {
      text: 'Analyze Chart',
      link: '/board',
    },
  },
};

/** Different broker source — Tinkoff icon. */
export const TinkoffSource: Story = {
  args: {
    sourceName: 'Tinkoff',
    iconUrl: '/icons/brokers/tinkoff.svg',
    message: 'Dividend payment scheduled for SBER next week.',
  },
};

/* ───────── AllStates — FigmaStates style × light/dark panels ───────── */

type ToastConfig = {
  label: string;
  props: Omit<SignalToastProps, 'closeToast'>;
};

const TOAST_CONFIGS: ToastConfig[] = [
  {
    label: 'No ticker, no button',
    props: {
      iconUrl: '/icons/brokers/limex.svg',
      sourceName: 'LimeX',
      message: 'New buy signal detected for AAPL.',
    },
  },
  {
    label: 'With ticker',
    props: {
      iconUrl: '/icons/brokers/limex.svg',
      sourceName: 'LimeX',
      message: 'Momentum breakout signal.',
      messageTicker: { ticker: 'AAPL', securityId: 1 },
    },
  },
  {
    label: 'With button',
    props: {
      iconUrl: '/icons/brokers/finam.svg',
      sourceName: 'Finam',
      message: 'Portfolio rebalance recommended.',
      button: { text: 'Rebalance Now', onClick: fn() },
    },
  },
  {
    label: 'Ticker + button',
    props: {
      iconUrl: '/icons/brokers/tinkoff.svg',
      sourceName: 'Tinkoff',
      message: 'RSI crossed 70 — overbought territory.',
      messageTicker: { ticker: 'TSLA', securityId: 2 },
      button: { text: 'View Chart', link: '/board' },
    },
  },
];

function SignalToastPanel({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>
        {isDark ? 'darkTheme' : 'lightTheme'}
      </span>
      <div
        data-theme={theme}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: 24,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: 320,
        }}
      >
        {TOAST_CONFIGS.map(({ label, props }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                fontFamily: 'monospace',
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
                paddingLeft: 2,
              }}
            >
              {label}
            </span>
            <SignalToast {...props} closeToast={fn()} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Combinations of ticker/no-ticker/button rendered side-by-side in light and
 * dark panels — mirrors Figma design states.
 *
 * The `useLayoutEffect` strips `data-theme="dark"` from Storybook ancestor
 * elements so that the light panel renders correctly even when the global
 * Storybook theme switcher is set to dark.
 */
function AllStatesDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useStripDarkTheme(wrapperRef);

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      <SignalToastPanel theme="light" />
      <SignalToastPanel theme="dark" />
    </div>
  );
}

/**
 * All state combinations — no-ticker, ticker, button, ticker+button —
 * rendered in light and dark panels. Matches Figma design review layout.
 */
export const AllStates: Story = {
  render: () => <AllStatesDemo />,
  parameters: {
    controls: { disable: true },
    layout: 'padded',
  },
};
