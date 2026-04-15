import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useLayoutEffect, useRef } from 'react';
import Button from '@/shared/ui/Button';
import Toast from './Toast';
import type { ToastType } from './Toast.types';

/* ───────── Meta ───────── */

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],

  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info'],
    },
    title: { control: 'text' },
    caption: { control: 'text' },
    onClose: { table: { disable: true } },
    actions: { table: { disable: true } },
    className: { table: { disable: true } },
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55089-9414',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Stories ───────── */

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Portfolios created successfully!',
    caption:
      'You can also create an analytical virtual portfolio to manage virtual data.',
    onClose: () => {},
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Title',
    caption: 'Caption',
    onClose: () => {},
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Title',
    caption: 'Caption',
    onClose: () => {},
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    title: 'Title',
    caption: 'Caption',
    onClose: () => {},
  },
};

export const TitleOnly: Story = {
  args: {
    type: 'success',
    title: 'Operation completed',
    onClose: () => {},
  },
};

export const WithoutClose: Story = {
  args: {
    type: 'info',
    title: 'Title',
    caption: 'This toast has no close button.',
  },
};

export const WithActions: Story = {
  args: {
    type: 'success',
    title: 'Title',
    caption: 'Caption',
    onClose: () => {},
    actions: (
      <>
        <Button size="sm" variant="primary">
          Button
        </Button>
        <Button size="sm" variant="secondary">
          Button
        </Button>
      </>
    ),
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

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  const types: ToastType[] = ['success', 'warning', 'error', 'info'];
  const noop = () => {};

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
          width: 520,
        }}
      >
        {types.map((t) => (
          <Toast
            key={t}
            type={t}
            title="Title"
            caption="Caption"
            onClose={noop}
          />
        ))}
        <Toast
          type="success"
          title="With actions"
          caption="Caption"
          onClose={noop}
          actions={
            <>
              <Button size="sm" variant="primary">
                Button
              </Button>
              <Button size="sm" variant="secondary">
                Button
              </Button>
            </>
          }
        />
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
      <span style={sectionTitle}>Toast — All Variants</span>
      <div style={{ display: 'flex', gap: 24 }}>
        <Panel theme="light" />
        <Panel theme="dark" />
      </div>
    </div>
  );
}

export const FigmaStates: Story = {
  render: () => <FigmaStatesDemo />,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
};
