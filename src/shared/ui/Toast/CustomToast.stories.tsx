/**
 * CustomToast.stories.tsx
 *
 * TOKEN NOTES:
 *
 * 1. `--brand-base` (info severity border-left):
 *    Defined in theme-variables.css for both :root and [data-theme="dark"].
 *      light → #7863F6 (purple)
 *      dark  → #8A7CF8 (purple, lighter)
 *    Brand files (brand-lime.css, brand-finam.css) override --brand-base to
 *    their respective primary color, so the info border naturally follows the
 *    active brand accent. Previously used --mind-accent which is a legacy alias
 *    for --brand-base in the default theme but was overridden to lime green in
 *    brand-lime.css, making the info border brand-dependent and inconsistent.
 *
 * 2. `bg-[var(--bg-card)]` (action button background):
 *    `--bg-card` is a manual-overrides.css variable:
 *      light → #F2F2F7
 *      dark  → #2C2C2E
 *    Resolves correctly in both modes because manual-overrides.css is imported
 *    globally and provides a dark-theme override under [data-theme="dark"].
 *    Verified via FigmaStates story panels below.
 *
 * 3. `.theme-border`, text colors (inline style):
 *    Text colors use inline style={{ color: 'var(--text-primary)' }} and
 *    style={{ color: 'var(--text-secondary)' }} rather than Tailwind utility
 *    classes. This ensures the color is not overridden by react-toastify's own
 *    CSS injected via ReactToastify.css, which sets a color rule on
 *    .Toastify__toast that can win over @layer components Tailwind utilities.
 *      --text-primary:   #121212 (light) / #FFFFFF (dark)
 *      --text-secondary: #666666 (light) / #AEAEB2 (dark)
 *    The FigmaStates story below uses data-theme panels to exercise both modes.
 */

import React, { useRef } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { Icon } from '@/shared/ui/Icon';
import CustomToast from './CustomToast';
import type { CustomToastProps } from './CustomToast';

/* ───────── Meta ───────── */

const meta: Meta<typeof CustomToast> = {
  title: 'UI/Toast/CustomToast',
  component: CustomToast,
  tags: ['autodocs'],

  argTypes: {
    severity: {
      control: 'radio',
      options: [
        'info',
        'success',
        'error',
        'warning',
      ] satisfies CustomToastProps['severity'][],
      description: 'Controls left-border accent color',
      table: { defaultValue: { summary: 'info' } },
    },
    message: { control: 'text' },
    title: { control: 'text' },
    icon: { table: { disable: true } },
    button: { table: { disable: true } },
    closeToast: { table: { disable: true } },
  },

  args: {
    severity: 'info',
    message: 'Your order has been placed successfully.',
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

/** Minimal toast — severity info, message only, no title or action. */
export const Default: Story = {};

/** Two-row layout: title row with close button + message row. */
export const WithTitle: Story = {
  args: {
    title: 'Order Confirmed',
    message: 'Your limit order for 100 shares of AAPL has been placed.',
  },
};

/** Toast with an action button below the message. */
export const WithButton: Story = {
  args: {
    message: 'A new signal is available for review.',
    button: {
      text: 'View Signal',
      onClick: fn(),
    },
  },
};

/** Success severity — green left border. */
export const Success: Story = {
  args: {
    severity: 'success',
    message: 'Trade executed: +250 TSLA @ $182.50',
  },
};

/** Error severity — red left border. */
export const Error: Story = {
  args: {
    severity: 'error',
    message: 'Connection to broker lost. Retrying…',
  },
};

/** Warning severity — yellow left border. */
export const Warning: Story = {
  args: {
    severity: 'warning',
    message: 'Margin level below 120%. Consider closing positions.',
  },
};

/** Custom icon ReactNode passed as the `icon` prop. */
export const WithIcon: Story = {
  args: {
    severity: 'success',
    message: 'Portfolio synced successfully.',
    icon: <Icon variant="checkmark" size={32} className="theme-text-primary" />,
  },
};

/** Title + button + custom icon — exercises the full component layout. */
export const FullVariant: Story = {
  args: {
    title: 'Risk Alert',
    severity: 'warning',
    message: 'Your position in BTC exceeds 15% of portfolio.',
    icon: (
      <Icon variant="placeHolder" size={32} className="theme-text-primary" />
    ),
    button: {
      text: 'Review Positions',
      link: '/portfolio',
    },
  },
};

/* ───────── FigmaStates — all severities × light/dark ───────── */

const SEVERITIES: NonNullable<CustomToastProps['severity']>[] = [
  'info',
  'success',
  'error',
  'warning',
];

const SEVERITY_MESSAGES: Record<
  NonNullable<CustomToastProps['severity']>,
  string
> = {
  info: 'Your watchlist has been updated.',
  success: 'Trade executed: +100 AAPL @ $182.00',
  error: 'Order rejected: insufficient margin.',
  warning: 'Margin level below 120%.',
};

function ToastPanel({ theme }: { theme: 'light' | 'dark' }) {
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
        {SEVERITIES.map((severity) => (
          <CustomToast
            key={severity}
            severity={severity}
            message={SEVERITY_MESSAGES[severity]}
            closeToast={fn()}
          />
        ))}
        {/* With title */}
        <CustomToast
          severity="info"
          title="Order Confirmed"
          message="Your limit order for 100 shares has been placed."
          closeToast={fn()}
        />
        {/* With button */}
        <CustomToast
          severity="success"
          message="Signal available for your watchlist."
          button={{ text: 'View Signal', onClick: fn() }}
          closeToast={fn()}
        />
      </div>
    </div>
  );
}

/**
 * Visual matrix of all severity variants in both light and dark panels.
 *
 * The `useLayoutEffect` strips `data-theme="dark"` from Storybook ancestor
 * elements so that the light panel renders correctly even when the global
 * Storybook theme switcher is set to dark.
 */
function AllSeveritiesDemo() {
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
      <ToastPanel theme="light" />
      <ToastPanel theme="dark" />
    </div>
  );
}

/**
 * All 4 severity variants + title/button combinations rendered side-by-side
 * in light and dark panels — mirrors Figma design states.
 */
export const AllSeverities: Story = {
  render: () => <AllSeveritiesDemo />,
  parameters: {
    controls: { disable: true },
    layout: 'padded',
  },
};
