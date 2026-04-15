import type { Meta, StoryObj } from '@storybook/nextjs';
import Container from '@/shared/ui/Container';

const meta: Meta<typeof Container> = {
  title: 'UI/Container',
  component: Container,
  tags: ['autodocs'],

  argTypes: {
    height: {
      control: 'text',
      description: 'CSS значение высоты (e.g. "200px", "100%")',
    },
    padding: {
      control: 'text',
      description: 'CSS значение padding (number → px, string → as-is)',
    },
    backgroundColor: {
      control: 'color',
      description: 'Цвет фона (переопределяет bg-white по умолчанию)',
    },
    borderRadius: {
      control: 'text',
      description: 'Скругление углов (e.g. "8px", "1rem")',
    },
    border: {
      control: 'text',
      description: 'CSS border (e.g. "1px solid #ccc")',
    },
    boxShadow: {
      control: 'text',
      description: 'CSS box-shadow',
    },
    className: {
      control: 'text',
      description: 'Дополнительные Tailwind/CSS классы',
    },
  },

  args: {
    children: 'Содержимое контейнера',
  },

  parameters: { layout: 'centered' },

  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <p style={{ padding: 16 }}>
        Базовый контейнер с белым фоном и скруглением
      </p>
    ),
  },
};

export const WithShadow: Story = {
  args: {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    children: <p style={{ padding: 16 }}>Контейнер с тенью</p>,
  },
};

export const WithCustomBackground: Story = {
  args: {
    backgroundColor: 'var(--surface-medium, #f5f5f7)',
    children: <p style={{ padding: 16 }}>Контейнер с кастомным фоном</p>,
  },
};

export const WithFixedHeight: Story = {
  args: {
    height: '200px',
    children: (
      <p style={{ padding: 16 }}>Контейнер с фиксированной высотой 200px</p>
    ),
  },
};

export const WithPadding: Story = {
  args: {
    padding: 24,
    children: 'Содержимое с padding 24px',
  },
};

export const Card: Story = {
  args: {
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    children: (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>
          Заголовок карточки
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--text-secondary, #666)',
          }}
        >
          Текст карточки с тенью и паддингом
        </p>
      </div>
    ),
  },
};
