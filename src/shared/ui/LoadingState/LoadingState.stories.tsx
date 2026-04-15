import type { Meta, StoryObj } from '@storybook/nextjs';
import { LoadingState } from '@/shared/ui/LoadingState';

const meta: Meta<typeof LoadingState> = {
  title: 'UI/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],

  argTypes: {
    message: {
      control: 'text',
      description: 'Текст сообщения загрузки',
      table: { defaultValue: { summary: 'Загрузка...' } },
    },
    fullHeight: {
      control: 'boolean',
      description: 'h-full если true, min-h-[200px] если false',
      table: { defaultValue: { summary: 'true' } },
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS классы',
    },
  },

  args: {
    fullHeight: false,
  },

  parameters: { layout: 'centered' },

  decorators: [
    (Story) => (
      <div style={{ width: 400, border: '1px dashed #ccc', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    message: 'Загрузка позиций...',
  },
};

export const FullHeight: Story = {
  args: {
    fullHeight: true,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 400,
          height: 300,
          border: '1px dashed #ccc',
          borderRadius: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
};
