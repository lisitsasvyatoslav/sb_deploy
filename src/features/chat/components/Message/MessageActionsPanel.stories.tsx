import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import MessageActionsPanel from './MessageActionsPanel';

const meta: Meta<typeof MessageActionsPanel> = {
  title: 'Chat/MessageActionsPanel',
  component: MessageActionsPanel,
  tags: ['autodocs'],
  args: {
    onRefresh: fn(),
    onCopy: fn(),
    onAddToBoard: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAddToBoard: Story = {
  args: {
    onAddToBoard: undefined,
  },
};

export const CopyOnly: Story = {
  args: {
    onRefresh: undefined,
    onAddToBoard: undefined,
  },
};

export const CustomLabel: Story = {
  args: {
    addToBoardLabel: 'На доску',
  },
};
