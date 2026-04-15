import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import MessageBlock from './MessageBlock';

const meta: Meta<typeof MessageBlock> = {
  title: 'Chat/MessageBlock',
  component: MessageBlock,
  tags: ['autodocs'],
  args: {
    content: `## Анализ портфеля

Ваш портфель содержит **3 позиции** общей стоимостью 156 234 ₽.

### Основные показатели:
- **YDEX**: 88 363 лота по 1,85₽ — доходность -4.55%
- **SU26233RMFS5**: 137 облигаций по 596.80₽
- **SU29022RMFS9**: 42 облигации по 982.51₽

### Рекомендации:
1. Рассмотрите увеличение доли облигаций для снижения волатильности
2. YDEX показывает отрицательную динамику — возможно стоит зафиксировать убыток`,
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

export const ShortAnswer: Story = {
  args: {
    content:
      'Рынок MOEX сегодня торгуется в боковике. Индекс МосБиржи: 2 845,32 (+0.12%).',
  },
};

export const WithCodeBlock: Story = {
  args: {
    content: `Вот пример расчёта доходности:

\`\`\`
Доходность = (Текущая цена - Цена покупки) / Цена покупки × 100%
YDEX: (1.85 - 1.94) / 1.94 × 100% = -4.64%
\`\`\`

Как видите, позиция показывает убыток.`,
  },
};
