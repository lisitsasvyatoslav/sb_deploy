import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import UserMessageBlock from './UserMessageBlock';

const meta: Meta<typeof UserMessageBlock> = {
  title: 'Chat/UserMessageBlock',
  component: UserMessageBlock,
  tags: ['autodocs'],
  args: {
    text: 'Проанализируй текущее состояние портфеля и дай рекомендации по ребалансировке',
    sources: [{ type: 'chart', label: 'YDEX' }],
    sourcesCount: 15,
    state: 'default',
    onEdit: fn(),
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=56218-6417&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    state: 'editing',
    onEdit: undefined,
    onCancel: fn(),
    onConfirm: fn(),
  },
};

export const LongText: Story = {
  args: {
    text: 'Подробно проанализируй текущее состояние моего инвестиционного портфеля, включая все позиции по акциям, облигациям и ETF. Дай рекомендации по ребалансировке с учётом текущей рыночной ситуации, макроэкономических факторов и моего риск-профиля.',
  },
};

export const MultipleSources: Story = {
  args: {
    sources: [
      { type: 'chart', label: 'YDEX' },
      { type: 'chart', label: 'SBER' },
      { type: 'document', label: 'Отчёт' },
    ],
    sourcesCount: 42,
  },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 500,
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          Default
        </div>
        <UserMessageBlock
          text="Проанализируй портфель"
          sources={[{ type: 'chart', label: 'YDEX' }]}
          sourcesCount={15}
          state="default"
          onEdit={fn()}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          Editing
        </div>
        <UserMessageBlock
          text="Проанализируй портфель"
          sources={[{ type: 'chart', label: 'YDEX' }]}
          sourcesCount={15}
          state="editing"
          onCancel={fn()}
          onConfirm={fn()}
        />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
