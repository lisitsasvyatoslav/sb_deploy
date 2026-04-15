import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useLayoutEffect, useRef } from 'react';
import Snackbar from '@/shared/ui/Snackbar';
import type { SnackbarType } from '@/shared/ui/Snackbar';

/* ───────── Meta ───────── */

const meta: Meta<typeof Snackbar> = {
  title: 'UI/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],

  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'danger'] satisfies SnackbarType[],
      description: 'Variant: success (glass) or danger (red)',
      table: { defaultValue: { summary: 'success' } },
    },
    message: { control: 'text' },
    actionLabel: { control: 'text' },
    showIcon: { control: 'boolean' },
    positioned: { control: 'boolean' },
    autoHideDuration: { control: 'number' },
    onAction: { table: { disable: true } },
    onClose: { table: { disable: true } },
  },

  args: {
    message: 'Snackbar message',
    actionLabel: 'Cancel',
    showIcon: true,
    positioned: false,
    onAction: fn(),
    onClose: fn(),
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=59206-22903',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Stories ───────── */

export const Default: Story = {
  args: {
    type: 'success',
  },
};

export const Danger: Story = {
  args: {
    type: 'danger',
  },
};

export const WithAction: Story = {
  args: {
    type: 'success',
    actionLabel: 'Undo',
  },
};

export const NoAction: Story = {
  args: {
    type: 'success',
    actionLabel: undefined,
  },
};

export const NoIcon: Story = {
  args: {
    type: 'success',
    showIcon: false,
  },
};

/* ───────── FigmaStates ───────── */

function FigmaStatesDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const types: { key: SnackbarType; label: string }[] = [
    { key: 'success', label: 'Success' },
    { key: 'danger', label: 'Danger' },
  ];

  const variants: {
    label: string;
    actionLabel?: string;
    showIcon?: boolean;
  }[] = [
    { label: 'Full', actionLabel: 'Cancel', showIcon: true },
    { label: 'No Action', actionLabel: undefined, showIcon: true },
    { label: 'No Icon', actionLabel: 'Cancel', showIcon: false },
    { label: 'Message Only', actionLabel: undefined, showIcon: false },
  ];

  const labelStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  });

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

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
        }}
      >
        {types.map((t) => (
          <div key={t.key}>
            <div style={{ marginBottom: 8 }}>
              <span style={labelStyle(isDark)}>{t.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {variants.map((v) => (
                <div
                  key={`${t.key}-${v.label}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                >
                  <Snackbar
                    type={t.key}
                    message="Snackbar message"
                    actionLabel={v.actionLabel}
                    showIcon={v.showIcon}
                    positioned={false}
                  />
                  <span style={labelStyle(isDark)}>{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
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
      <span style={sectionTitle}>Snackbar — All Variants</span>
      <div style={{ display: 'flex', gap: 24 }}>
        <Panel theme="light" />
        <Panel theme="dark" />
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
  },
};
