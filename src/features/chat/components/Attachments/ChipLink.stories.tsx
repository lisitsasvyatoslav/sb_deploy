import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import ChipLink from './ChipLink';

const meta: Meta<typeof ChipLink> = {
  title: 'Chat/ChipLink',
  component: ChipLink,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'chart',
        'document',
        'ai_answer',
        'note',
        'link',
        'group',
        'image',
        'attachment',
      ],
    },
  },
  args: {
    label: 'YDEX',
    type: 'chart',
    onClick: fn(),
  },
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=56218-6592&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRemove: Story = {
  args: {
    label: 'YDEX',
    type: 'chart',
    onRemove: fn(),
  },
};

export const Document: Story = {
  args: {
    label: 'Отчёт Q4',
    type: 'document',
    onRemove: fn(),
  },
};

export const Link: Story = {
  args: {
    label: 'google.com',
    type: 'link',
    onRemove: fn(),
  },
};

export const Note: Story = {
  args: {
    label: 'Заметка',
    type: 'note',
  },
};

export const AiAnswer: Story = {
  args: {
    label: 'AI ответ',
    type: 'ai_answer',
  },
};

export const Group: Story = {
  args: {
    label: '3 тикера',
    type: 'group',
    onRemove: fn(),
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <ChipLink type="chart" label="YDEX" onRemove={fn()} />
      <ChipLink type="document" label="Отчёт Q4" onRemove={fn()} />
      <ChipLink type="ai_answer" label="AI ответ" />
      <ChipLink type="note" label="Заметка" />
      <ChipLink type="link" label="google.com" onRemove={fn()} />
      <ChipLink type="group" label="5 тикеров" onRemove={fn()} />
      <ChipLink type="image" label="image.png" />
      <ChipLink type="attachment" label="file.pdf" />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
