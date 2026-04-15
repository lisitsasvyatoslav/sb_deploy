import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { useState } from 'react';
import AnswerOptionButton from '@/shared/ui/AnswerOptionButton';

const meta: Meta<typeof AnswerOptionButton> = {
  title: 'UI/AnswerOptionButton',
  component: AnswerOptionButton,
  tags: ['autodocs'],

  argTypes: {
    selected: {
      control: 'boolean',
      description:
        'Выбранное состояние: иконка + поворачивается на 45°, цвет акцентный',
      table: { defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      description: 'Состояние ошибки: красный цвет + shake-анимация',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Заблокированное состояние',
      table: { defaultValue: { summary: 'false' } },
    },
    showIcon: {
      control: 'boolean',
      description: 'Показывать иконку + рядом с текстом',
      table: { defaultValue: { summary: 'true' } },
    },
    children: { control: 'text' },
    onClick: { table: { disable: true } },
  },

  args: {
    children: 'Вариант ответа',
    onClick: fn(),
    selected: false,
    error: false,
    disabled: false,
    showIcon: true,
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
    children: 'Выбранный вариант',
  },
};

export const Error: Story = {
  args: {
    error: true,
    children: 'Неверный ответ',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Недоступно',
  },
};

export const WithoutIcon: Story = {
  args: {
    showIcon: false,
    children: 'Без иконки',
  },
};

export const LongText: Story = {
  args: {
    children:
      'Очень длинный текст варианта ответа, который может занять несколько строк в узком контейнере',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 200 }}>
        <Story />
      </div>
    ),
  ],
};

/** Интерактивная кнопка с переключением состояния */
export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <AnswerOptionButton
        selected={selected}
        onClick={() => setSelected((s) => !s)}
      >
        {selected ? 'Нажмите чтобы снять выбор' : 'Нажмите чтобы выбрать'}
      </AnswerOptionButton>
    );
  },
  parameters: { controls: { disable: true } },
};

/** Матрица всех состояний */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <AnswerOptionButton onClick={fn()}>По умолчанию</AnswerOptionButton>
        <AnswerOptionButton selected onClick={fn()}>
          Выбранный
        </AnswerOptionButton>
        <AnswerOptionButton error onClick={fn()}>
          Ошибка
        </AnswerOptionButton>
        <AnswerOptionButton disabled onClick={fn()}>
          Отключён
        </AnswerOptionButton>
        <AnswerOptionButton showIcon={false} onClick={fn()}>
          Без иконки
        </AnswerOptionButton>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'padded' },
};
