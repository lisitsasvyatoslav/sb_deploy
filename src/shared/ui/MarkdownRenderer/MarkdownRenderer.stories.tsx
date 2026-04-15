import type { Meta, StoryObj } from '@storybook/nextjs';
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'UI/MarkdownRenderer',
  component: MarkdownRenderer,
  tags: ['autodocs'],

  argTypes: {
    content: {
      control: 'text',
      description: 'Markdown-строка для рендеринга',
    },
    className: {
      control: 'text',
      description: 'CSS класс обёртки (если задан — оборачивает в div)',
    },
    components: {
      table: { disable: true },
      description: 'Переопределение компонентов рендеринга',
    },
  },

  parameters: { layout: 'padded' },

  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleText: Story = {
  args: {
    content: 'Простой текст без разметки.',
  },
};

export const WithFormatting: Story = {
  args: {
    content: `# Заголовок первого уровня

## Заголовок второго уровня

Обычный параграф с **жирным**, *курсивом* и ~~зачёркнутым~~ текстом.

Список:
- Первый пункт
- Второй пункт
- Третий пункт

Нумерованный список:
1. Один
2. Два
3. Три`,
  },
};

export const WithCode: Story = {
  args: {
    content: `Инлайн код: \`const x = 42;\`

Блок кода:

\`\`\`typescript
function greet(name: string): string {
  return \`Привет, \${name}!\`;
}

const result = greet('Трейдер');
console.log(result);
\`\`\``,
  },
};

export const WithTable: Story = {
  args: {
    content: `| Тикер | Цена  | Изменение |
|-------|-------|-----------|
| AAPL  | $182  | +1.2%     |
| TSLA  | $245  | -0.8%     |
| NVDA  | $495  | +3.5%     |
| MSFT  | $378  | +0.4%     |`,
  },
};

export const WithBlockquote: Story = {
  args: {
    content: `> Рынок может оставаться иррациональным дольше, чем вы можете оставаться платёжеспособным.
>
> — Джон Мейнард Кейнс

Это цитата, которая часто используется в трейдинге.`,
  },
};

export const WithLinks: Story = {
  args: {
    content: `Полезные ресурсы:

- [TradingView](https://www.tradingview.com) — графики и аналитика
- [Investing.com](https://www.investing.com) — финансовые новости

Ссылки открываются в новой вкладке.`,
  },
};

/** Полный пример со всеми элементами разметки */
export const FullContent: Story = {
  args: {
    content: `# Анализ позиции AAPL

## Технический анализ

Акция торгуется **выше 200-дневной скользящей средней**, что является *бычьим сигналом*.

### Ключевые уровни

| Уровень    | Цена   |
|------------|--------|
| Поддержка  | $175   |
| Сопротивление | $190 |
| Стоп-лосс  | $170   |

### Код стратегии

\`\`\`python
entry = 182.50
stop_loss = 170.00
take_profit = 195.00
risk = entry - stop_loss  # 12.50
reward = take_profit - entry  # 12.50
rr_ratio = reward / risk  # 1:1
\`\`\`

> **Риск-менеджмент**: не рискуй более 1-2% капитала на одну сделку.

---

Итог: открыть **лонг** с \`RR = 1:1\`, выставить стоп на $170.`,
  },
};
