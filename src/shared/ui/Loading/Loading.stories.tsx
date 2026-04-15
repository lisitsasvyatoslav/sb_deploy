import type { Meta, StoryObj } from '@storybook/nextjs';
import { Loading } from '@/shared/ui/Loading';

const meta: Meta<typeof Loading> = {
  title: 'UI/Loading',
  component: Loading,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Компонент полноэкранной загрузки. Используется при первом рендере страницы.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Полноэкранный спиннер загрузки */
export const Default: Story = {};
