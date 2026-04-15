import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import Tooltip, { TooltipPosition } from '@/shared/ui/Tooltip';
import Button from '@/shared/ui/Button';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],

  argTypes: {
    content: { control: 'text' },
    show: { control: 'boolean' },
    position: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'] satisfies TooltipPosition[],
      table: { defaultValue: { summary: 'top' } },
    },
    delay: {
      control: 'number',
      description: 'Задержка показа (мс)',
      table: { defaultValue: { summary: '200' } },
    },
    className: { control: 'text' },
  },

  args: {
    content: 'Подсказка',
    show: true,
    position: 'top',
    delay: 0,
  },

  // Tooltip — абсолютно позиционированный, нужен relative-контейнер + trigger
  decorators: [
    (Story) => (
      <div
        style={{ position: 'relative', display: 'inline-block', marginTop: 48 }}
      >
        <Button variant="secondary" size="sm">
          Trigger
        </Button>
        <Story />
      </div>
    ),
  ],

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bottom: Story = {
  args: { position: 'bottom', content: 'Снизу' },
};

export const Left: Story = {
  args: { position: 'left', content: 'Слева' },
};

export const Right: Story = {
  args: { position: 'right', content: 'Справа' },
};

export const Hidden: Story = {
  args: { show: false },
};

/** Интерактивный пример — ховер над кнопкой показывает тултип */
export const OnHover: Story = {
  render: () => {
    const [show, setShow] = useState(false);
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Button
          variant="secondary"
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          Наведи на меня
        </Button>
        <Tooltip
          content="Это подсказка!"
          show={show}
          position="top"
          delay={150}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

/** Все позиции */
export const AllPositions: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 64,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      {(['top', 'right', 'bottom', 'left'] as TooltipPosition[]).map(
        (position) => (
          <div
            key={position}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <Button variant="secondary" size="sm">
              {position}
            </Button>
            <Tooltip content={position} show position={position} delay={0} />
          </div>
        )
      )}
    </div>
  ),
  parameters: { layout: 'padded', controls: { disable: true } },
};
