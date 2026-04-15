import type { Meta, StoryObj } from '@storybook/nextjs';
import { ErrorState } from '@/shared/ui/ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'UI/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],

  argTypes: {
    message: {
      control: 'text',
      description: 'Текст сообщения об ошибке',
      table: { defaultValue: { summary: 'Ошибка загрузки' } },
    },
    error: {
      table: { disable: true },
      description:
        'Объект Error — его message имеет приоритет над message пропом',
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
    message: 'Не удалось загрузить данные. Попробуйте позже.',
  },
};

export const WithErrorObject: Story = {
  args: {
    error: new Error('Network request failed: 503 Service Unavailable'),
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
