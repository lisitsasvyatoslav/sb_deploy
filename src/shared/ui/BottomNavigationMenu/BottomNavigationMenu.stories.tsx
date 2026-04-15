import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { useState } from 'react';
import BottomNavigationMenu from '@/shared/ui/BottomNavigationMenu';

const meta: Meta<typeof BottomNavigationMenu> = {
  title: 'UI/BottomNavigationMenu',
  component: BottomNavigationMenu,
  tags: ['autodocs'],

  argTypes: {
    onSignalClick: {
      description: 'Колбэк кнопки «Сигнал» (если не задан — кнопка скрыта)',
      table: { disable: true },
    },
    onDocumentClick: {
      description: 'Колбэк кнопки «Заметка»',
      table: { disable: true },
    },
    onMagnifierClick: {
      description: 'Колбэк кнопки «Тикер»',
      table: { disable: true },
    },
    showMiniMap: {
      control: 'boolean',
      description: 'Подсвечивает кнопку мини-карты как активную',
      table: { defaultValue: { summary: 'false' } },
    },
    onMiniMapClick: {
      description: 'Колбэк кнопки «Мини-карта»',
      table: { disable: true },
    },
  },

  args: {
    onSignalClick: fn(),
    onDocumentClick: fn(),
    onMagnifierClick: fn(),
    onMiniMapClick: fn(),
    showMiniMap: false,
  },

  parameters: { layout: 'centered' },

  // Компонент использует fixed-позиционирование, поэтому нужен относительный контейнер
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 120, height: 220 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMiniMapActive: Story = {
  args: {
    showMiniMap: true,
  },
};

export const WithoutSignal: Story = {
  args: {
    onSignalClick: undefined,
  },
};

/** Интерактивная версия с переключением мини-карты */
export const Interactive: Story = {
  render: () => {
    const [showMiniMap, setShowMiniMap] = useState(false);
    return (
      <div style={{ position: 'relative', width: 120, height: 220 }}>
        <BottomNavigationMenu
          onSignalClick={fn()}
          onDocumentClick={fn()}
          onMagnifierClick={fn()}
          showMiniMap={showMiniMap}
          onMiniMapClick={() => setShowMiniMap((v) => !v)}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};
