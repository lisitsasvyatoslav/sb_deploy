import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import ChipsGroup from './ChipsGroup';

const meta: Meta<typeof ChipsGroup> = {
  title: 'Chat/ChipsGroup',
  component: ChipsGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'lg'],
    },
  },
  args: {
    count: 11,
    label: 'добавлено',
    size: 'sm',
    onClick: fn(),
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=56218-6634&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WebDefault: Story = {};

export const WebFewItems: Story = {
  args: {
    count: 2,
    label: 'добавлено',
  },
};

export const AppDefault: Story = {
  args: {
    size: 'lg',
    count: 11,
    label: 'добавлено',
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=59430-26172&m=dev',
    },
  },
};

export const SizeComparison: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          Web (sm)
        </div>
        <ChipsGroup count={11} label="добавлено" size="sm" onClick={fn()} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          App (lg)
        </div>
        <ChipsGroup count={11} label="добавлено" size="lg" onClick={fn()} />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
