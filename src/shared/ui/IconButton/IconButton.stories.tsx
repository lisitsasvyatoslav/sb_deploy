import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import IconButton from '@/shared/ui/IconButton';
import { Icon } from '@/shared/ui/Icon';
import type {
  IconButtonSize,
  IconButtonState,
  IconButtonVariant,
} from '@/shared/ui/IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  tags: ['autodocs'],

  argTypes: {
    size: {
      control: 'select',
      options: [16, 20, 24, 32, 40] satisfies IconButtonSize[],
      description: 'Размер иконки в пикселях',
      table: { defaultValue: { summary: '24' } },
    },
    state: {
      control: 'select',
      options: [
        undefined,
        'default',
        'hover',
        'pressed',
        'focused',
        'disabled',
      ] satisfies (IconButtonState | undefined)[],
      description: 'Явное управление визуальным состоянием',
    },
    disabled: { control: 'boolean' },
    counterValue: {
      control: 'number',
      description: 'Числовой счётчик badge (>0 показывается)',
    },
    showDot: {
      control: 'boolean',
      description: 'Показать точку-индикатор вместо счётчика',
    },
    icon: { table: { disable: true } },
    ariaLabel: { control: 'text' },
  },

  args: {
    icon: <Icon variant="placeHolder" />,
    size: 24,
    onClick: fn(),
    ariaLabel: 'Настройки',
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55600-9214&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 16, icon: <Icon variant="close" />, ariaLabel: 'Закрыть' },
};

export const Large: Story = {
  args: { size: 40, icon: <Icon variant="settings" />, ariaLabel: 'Настройки' },
};

export const WithCounter: Story = {
  args: {
    icon: <Icon variant="ai" />,
    counterValue: 5,
    ariaLabel: 'Уведомления (5)',
  },
};

export const WithCounterOverflow: Story = {
  args: {
    icon: <Icon variant="ai" />,
    counterValue: 150,
    ariaLabel: 'Уведомления (99+)',
  },
};

export const WithDot: Story = {
  args: {
    icon: <Icon variant="ai" />,
    showDot: true,
    ariaLabel: 'Новое уведомление',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/* ---------- Figma-matching layout ---------- */

const FIGMA_SIZES: { label: string; size: IconButtonSize }[] = [
  { label: 'Md', size: 24 },
  { label: 'Sm', size: 20 },
  { label: 'Xs', size: 16 },
];

const DEFAULT_STATES: IconButtonState[] = [
  'default',
  'hover',
  'pressed',
  'focused',
  'disabled',
];
const NEGATIVE_STATES: IconButtonState[] = [
  'default',
  'hover',
  'pressed',
  'disabled',
];

type BadgeMode = 'none' | 'counter' | 'dot';
const BADGE_MODES: BadgeMode[] = ['none', 'counter', 'dot'];

function SizeGroup({
  size,
  variant,
  states,
}: {
  size: IconButtonSize;
  variant: IconButtonVariant;
  states: IconButtonState[];
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        border: '2px dashed #9747FF',
        borderRadius: 4,
        padding: 16,
      }}
    >
      {BADGE_MODES.map((badge) => (
        <div
          key={badge}
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          {states.map((state) => (
            <IconButton
              key={state}
              size={size}
              variant={variant}
              state={state}
              icon="placeHolder"
              counterValue={badge === 'counter' ? 1 : undefined}
              showDot={badge === 'dot'}
              ariaLabel={`${variant} ${state} ${badge}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Figma-matching layout: all sizes, states, and badge modes
 * grouped exactly as in the Figma page "iconButton".
 *
 * Figma node: 60367:50792
 */
export const FigmaStates: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 48, padding: 48 }}
    >
      <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Default</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {FIGMA_SIZES.map(({ label, size }) => (
          <SizeGroup
            key={label}
            size={size}
            variant="default"
            states={DEFAULT_STATES}
          />
        ))}
      </div>

      <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Negative</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {FIGMA_SIZES.map(({ label, size }) => (
          <SizeGroup
            key={label}
            size={size}
            variant="negative"
            states={NEGATIVE_STATES}
          />
        ))}
      </div>
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'fullscreen' },
};
