import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import PromptActionsPanel from './PromptActionsPanel';

const meta: Meta<typeof PromptActionsPanel> = {
  title: 'Chat/PromptActionsPanel',
  component: PromptActionsPanel,
  tags: ['autodocs'],
  args: {
    sources: [{ type: 'chart', label: 'YDEX' }],
    sourcesCount: 15,
    state: 'default',
    onEdit: fn(),
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=56218-6428&m=dev',
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

export const Saved: Story = {
  args: {
    state: 'saved',
    onEdit: undefined,
  },
};

export const MultipleSources: Story = {
  args: {
    sources: [
      { type: 'chart', label: 'YDEX' },
      { type: 'document', label: 'Отчёт Q4' },
    ],
    sourcesCount: 23,
  },
};

export const NoSources: Story = {
  args: {
    sources: [],
    sourcesCount: undefined,
  },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 500,
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          Default
        </div>
        <PromptActionsPanel
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
        <PromptActionsPanel
          sources={[{ type: 'chart', label: 'YDEX' }]}
          sourcesCount={15}
          state="editing"
          onCancel={fn()}
          onConfirm={fn()}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
          Saved
        </div>
        <PromptActionsPanel
          sources={[{ type: 'chart', label: 'YDEX' }]}
          sourcesCount={15}
          state="saved"
        />
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
