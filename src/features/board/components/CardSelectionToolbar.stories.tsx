import React, { useRef } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { CardSelectionToolbar } from './CardSelectionToolbar';

const meta: Meta<typeof CardSelectionToolbar> = {
  title: 'UI/CardSelectionToolbar',
  component: CardSelectionToolbar,
  tags: ['autodocs'],
  argTypes: {
    visible: { control: 'boolean' },
    selectedCount: { control: { type: 'number', min: 1, max: 10 } },
    selectedCardType: {
      control: 'select',
      options: ['note', 'signal', 'news', 'file', 'strategy', 'news_feed'],
    },
  },
  args: {
    visible: true,
    x: 300,
    y: 40,
    selectedCount: 1,
    selectedCardType: 'note',
    onRename: () => console.log('rename'),
    onAskAI: () => console.log('ask AI'),
    onOpen: () => console.log('open'),
    onDelete: () => console.log('delete'),
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ZHieIhaMiZrfUrR6VLRLB2/Workspaces?node-id=1437-1448',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleSelected: Story = {
  args: { selectedCount: 3 },
};

export const NewsFeedWidget: Story = {
  args: {
    selectedCardType: 'news_feed',
    onChangeFilters: () => console.log('change filters'),
  },
};

export const StrategyCard: Story = {
  args: { selectedCardType: 'strategy' },
};

/* ───────── All Variants (light + dark) ───────── */

function AllVariantsDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useStripDarkTheme(wrapperRef);

  const baseProps = {
    visible: true,
    x: 250,
    y: 30,
    onRename: () => {},
    onAskAI: () => {},
    onOpen: () => {},
    onDelete: () => {},
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>
            {theme === 'dark' ? 'darkTheme' : 'lightTheme'}
          </span>
          <div
            data-theme={theme}
            style={{
              position: 'relative',
              background: theme === 'dark' ? '#040405' : '#FFFFFF',
              padding: '60px 32px 32px',
              minWidth: 540,
              borderRadius: 8,
            }}
          >
            {/* Single card — note */}
            <div style={{ position: 'relative', height: 50, marginBottom: 16 }}>
              <CardSelectionToolbar
                {...baseProps}
                selectedCount={1}
                selectedCardType="note"
              />
            </div>

            {/* Multiple cards */}
            <div style={{ position: 'relative', height: 50, marginBottom: 16 }}>
              <CardSelectionToolbar
                {...baseProps}
                selectedCount={4}
                selectedCardType="note"
              />
            </div>

            {/* News feed widget with filters */}
            <div style={{ position: 'relative', height: 50 }}>
              <CardSelectionToolbar
                {...baseProps}
                selectedCount={1}
                selectedCardType="news_feed"
                onChangeFilters={() => {}}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
  parameters: { controls: { disable: true } },
};
