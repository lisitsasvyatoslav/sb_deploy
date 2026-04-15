import type { Meta, StoryObj } from '@storybook/nextjs';
import Tag from '@/shared/ui/Tag';
import type { Tag as TagType } from '@/types';

// Примеры тегов каждого типа
const tickerTag: TagType = {
  id: 1,
  order: 0,
  type: 'ticker',
  text: 'SBER',
  meta: { symbol: 'SBER', securityId: 123 },
};

const keywordTag: TagType = {
  id: 2,
  order: 1,
  type: 'keyword',
  text: 'дивиденды',
};

const aiTag: TagType = {
  id: 3,
  order: 2,
  type: 'ai-response',
  text: 'AI анализ',
};

const entityTag: TagType = {
  id: 4,
  order: 3,
  type: 'entity',
  text: 'Сбербанк',
  meta: { entityType: 'ORG' },
};

const sentimentPositiveTag: TagType = {
  id: 5,
  order: 4,
  type: 'sentiment',
  text: 'positive',
  meta: { label: 'positive' },
};

const sentimentNegativeTag: TagType = {
  id: 6,
  order: 5,
  type: 'sentiment',
  text: 'negative',
  meta: { label: 'negative' },
};

const linkTag: TagType = {
  id: 7,
  order: 6,
  type: 'link',
  text: 'Источник',
  meta: { url: 'https://example.com' },
};

const signalTag: TagType = {
  id: 8,
  order: 7,
  type: 'signal',
  text: 'Сигнал',
};

const meta: Meta<typeof Tag> = {
  title: 'UI/Tag',
  component: Tag,
  tags: ['autodocs'],

  argTypes: {
    tag: { table: { disable: true } },
    className: { control: 'text' },
  },

  args: {
    tag: keywordTag,
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Keyword: Story = {
  args: { tag: keywordTag },
};

export const Ticker: Story = {
  args: { tag: tickerTag },
};

export const AiResponse: Story = {
  args: { tag: aiTag },
};

export const Entity: Story = {
  args: { tag: entityTag },
};

export const SentimentPositive: Story = {
  args: { tag: sentimentPositiveTag },
};

export const SentimentNegative: Story = {
  args: { tag: sentimentNegativeTag },
};

export const Link: Story = {
  args: { tag: linkTag },
};

export const Signal: Story = {
  args: { tag: signalTag },
};

/** Все типы тегов */
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 500 }}>
      <Tag tag={tickerTag} />
      <Tag tag={keywordTag} />
      <Tag tag={aiTag} />
      <Tag tag={entityTag} />
      <Tag tag={sentimentPositiveTag} />
      <Tag tag={sentimentNegativeTag} />
      <Tag tag={linkTag} />
      <Tag tag={signalTag} />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
