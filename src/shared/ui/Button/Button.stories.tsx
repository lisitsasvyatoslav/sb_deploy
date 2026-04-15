import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useLayoutEffect, useRef } from 'react';
import Button from './Button';
import { Icon } from '../Icon';
import type { ButtonSize, ButtonVariant } from './Button.types';

const noop = fn();

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],

  argTypes: {
    variant: {
      control: 'select',
      options: [
        'accent',
        'primary',
        'negative',
        'secondary',
        'ghost',
      ] satisfies ButtonVariant[],
      description: 'Visual style from design system',
      table: { defaultValue: { summary: 'accent' } },
    },
    size: {
      control: 'select',
      options: ['xl', 'lg', 'md', 'sm', 'xs'] satisfies ButtonSize[],
      description: 'Size: xl=56px, lg=48px, md=40px, sm=32px, xs=24px',
      table: { defaultValue: { summary: 'md' } },
    },
    iconSide: {
      control: 'radio',
      options: [undefined, 'left', 'right'],
      description: 'Icon placement side (when children present)',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner, hides content',
    },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    href: {
      control: 'text',
      description: 'When set, renders as <a> instead of <button>',
    },
    icon: { table: { disable: true } },
    type: { table: { disable: true } },
    'data-testid': { table: { disable: true } },
  },

  args: {
    children: 'Button',
    onClick: noop,
    variant: 'accent',
    size: 'md',
    loading: false,
    disabled: false,
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55087-5325&p=f&t=FmDGJOFCk5GStMf1-0',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accent: Story = {
  args: { variant: 'accent', children: 'Accent' },
};

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
};

export const Negative: Story = {
  args: { variant: 'negative', children: 'Negative' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Loading: Story = {
  args: { loading: true, children: 'Loading...' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

export const WithIconLeft: Story = {
  args: {
    icon: <Icon variant="plus" />,
    iconSide: 'left',
    children: 'Add',
  },
};

export const WithIconRight: Story = {
  args: {
    icon: <Icon variant="chevronRight" />,
    iconSide: 'right',
    children: 'Next',
  },
};

export const WithBothIcons: Story = {
  args: {
    icon: <Icon variant="placeHolder" />,
    iconRight: <Icon variant="chevronDown" />,
    children: 'Button',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <Icon variant="plus" />,
    children: undefined,
    'aria-label': 'Add',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Sign In',
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export const AsLink: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'Open Link',
  },
};

/** All sizes side by side */
export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {(['xl', 'lg', 'md', 'sm', 'xs'] as ButtonSize[]).map((size) => (
        <Button key={size} size={size} variant="accent" onClick={noop}>
          {size.toUpperCase()}
        </Button>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/** All variants side by side */
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {(
        [
          'accent',
          'primary',
          'negative',
          'secondary',
          'ghost',
        ] as ButtonVariant[]
      ).map((variant) => (
        <Button key={variant} variant={variant} size="md" onClick={noop}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/** Full matrix: sizes x variants */
export const FullMatrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['xl', 'lg', 'md', 'sm', 'xs'] as ButtonSize[]).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {(
            [
              'accent',
              'primary',
              'negative',
              'secondary',
              'ghost',
            ] as ButtonVariant[]
          ).map((variant) => (
            <Button key={variant} size={size} variant={variant} onClick={noop}>
              {variant} / {size}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { layout: 'padded', controls: { disable: true } },
};

/* ─────────── FigmaStates ─────────── */

const SIZES: ButtonSize[] = ['xl', 'lg', 'md', 'sm', 'xs'];
const VARIANTS: ButtonVariant[] = [
  'accent',
  'primary',
  'negative',
  'secondary',
  'ghost',
];

type ButtonState = 'Default' | 'Hovered' | 'Pressed' | 'Loading' | 'Disabled';
const STATES: ButtonState[] = [
  'Default',
  'Hovered',
  'Pressed',
  'Loading',
  'Disabled',
];

function labelStyle(isDark: boolean): React.CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    minWidth: 60,
  };
}

/** Shared props for pseudo-state buttons: Loading / Disabled flags + data-state marker */
function stateProps(state: ButtonState) {
  return {
    loading: state === 'Loading',
    disabled: state === 'Disabled',
    'data-state':
      state === 'Hovered'
        ? 'hover'
        : state === 'Pressed'
          ? 'active'
          : undefined,
  } as const;
}

function VariantPanel({
  variant,
  theme,
}: {
  variant: ButtonVariant;
  theme: 'light' | 'dark';
}) {
  const isDark = theme === 'dark';

  return (
    <div
      data-theme={isDark ? 'dark' : undefined}
      style={{
        background: isDark ? '#040405' : '#FFFFFF',
        padding: '20px 24px',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {variant} / {theme}
      </div>

      {SIZES.map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={labelStyle(isDark)}>{size.toUpperCase()}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {STATES.map((state) => (
              <div
                key={state}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Button
                    size={size}
                    variant={variant}
                    {...stateProps(state)}
                    onClick={noop}
                  >
                    Button
                  </Button>
                  <Button
                    size={size}
                    variant={variant}
                    icon="placeHolder"
                    {...stateProps(state)}
                    aria-label="Add"
                    onClick={noop}
                  />
                  <Button
                    size={size}
                    variant={variant}
                    icon="placeHolder"
                    {...stateProps(state)}
                    onClick={noop}
                  >
                    Button
                  </Button>
                  <Button
                    size={size}
                    variant={variant}
                    iconRight="chevronDown"
                    {...stateProps(state)}
                    onClick={noop}
                  >
                    Button
                  </Button>
                  <Button
                    size={size}
                    variant={variant}
                    icon="placeHolder"
                    iconRight="chevronDown"
                    {...stateProps(state)}
                    onClick={noop}
                  >
                    Button
                  </Button>
                </div>
                <span
                  style={{
                    ...labelStyle(isDark),
                    fontSize: 9,
                    minWidth: 0,
                    textAlign: 'center',
                  }}
                >
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * All states on light and dark backgrounds — matching Figma (node 55087:5325).
 *
 * Hover / Pressed are simulated via `storybook-addon-pseudo-states` which rewrites
 * CSS rules (e.g. `:hover` → `.pseudo-hover`) and applies classes to elements
 * matching the selectors in `parameters.pseudo`.
 *
 * The `useLayoutEffect` strips `data-theme="dark"` from Storybook ancestors
 * so that the light panel renders correctly when the global theme switcher is set to dark.
 */
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

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {VARIANTS.map((variant) => (
        <div
          key={variant}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
        >
          <VariantPanel variant={variant} theme="light" />
          <VariantPanel variant={variant} theme="dark" />
        </div>
      ))}
    </div>
  );
}

/**
 * Comprehensive Figma states matrix — all variants x sizes x states
 * in light and dark panels. Matches Figma node 55087:5325.
 */
export const FigmaStates: Story = {
  render: () => <FigmaStatesDemo />,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    pseudo: {
      hover: '[data-state="hover"]',
      active: '[data-state="active"]',
    },
  },
};
