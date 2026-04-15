import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { Icon } from '../Icon';
import ControlsPanel from './ControlsPanel';
import type { ControlsItem } from './ControlsPanel.types';

const meta: Meta<typeof ControlsPanel> = {
  title: 'UI/ControlsPanel',
  component: ControlsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=63340-1481&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ControlsPanel>;

// Figma instance 1 (63340:1643): 3 ghost buttons + divider + trash
export const ActionButtons: Story = {
  args: {
    'aria-label': 'Action buttons',
    items: [
      { icon: 'edit', children: 'Переименовать', onClick: fn() },
      { icon: 'ai', children: 'Спросить AI', onClick: fn() },
      { icon: 'expand', children: 'Открыть', onClick: fn() },
      'divider',
      {
        kind: 'icon-button',
        icon: 'trash',
        variant: 'negative',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Удалить',
      },
    ] satisfies ControlsItem[],
  },
};

// Figma instance 2 (63340:1662): text formatting toolbar
export const TextFormatting: Story = {
  args: {
    'aria-label': 'Text formatting',
    items: [
      {
        kind: 'icon-button',
        icon: 'textBold',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Bold',
      },
      {
        kind: 'icon-button',
        icon: 'textItalic',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Italic',
      },
      {
        kind: 'icon-button',
        icon: 'textStrikethrough',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Strikethrough',
      },
      {
        kind: 'icon-button',
        icon: 'textUnderline',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Underline',
      },
      'divider',
      {
        kind: 'icon-button',
        icon: 'textLink',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Link',
      },
      'divider',
      {
        kind: 'icon-button',
        icon: 'textList',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Bullet list',
      },
      {
        kind: 'icon-button',
        icon: 'textListNumbers',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Numbered list',
      },
      'divider',
      {
        kind: 'icon-button',
        icon: 'ai',
        size: 16,
        onClick: fn(),
        ariaLabel: 'AI',
      },
      {
        kind: 'icon-button',
        icon: 'trash',
        variant: 'negative',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Удалить',
      },
    ] satisfies ControlsItem[],
  },
};

// Figma instance 3 (63340:2614): document viewer toolbar
export const DocumentViewer: Story = {
  args: {
    'aria-label': 'Document viewer',
    items: [
      {
        kind: 'custom',
        content: (
          <span className="flex items-center justify-center p-spacing-8 text-12 leading-16 tracking-tight-1 text-blackinverse-a100">
            Finam Flow.pdf
          </span>
        ),
      },
      'divider',
      {
        kind: 'custom',
        content: (
          <span className="flex items-center py-spacing-8 px-spacing-4 text-blackinverse-a56">
            <button
              type="button"
              className="inline-flex items-center justify-center"
              onClick={fn()}
              aria-label="Previous page"
            >
              <Icon variant="chevronLeftSmall" size={16} />
            </button>
            <span className="text-12 leading-16 tracking-tight-1 font-medium text-blackinverse-a56">
              1/3
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center"
              onClick={fn()}
              aria-label="Next page"
            >
              <Icon variant="chevronRightSmall" size={16} />
            </button>
          </span>
        ),
      },
      {
        kind: 'icon-button',
        icon: 'docStroke',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Single page',
      },
      {
        kind: 'icon-button',
        icon: 'docFull',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Full page',
      },
      'divider',
      {
        kind: 'icon-button',
        icon: 'ai',
        size: 16,
        onClick: fn(),
        ariaLabel: 'AI',
      },
      {
        kind: 'icon-button',
        icon: 'trash',
        variant: 'negative',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Удалить',
      },
    ] satisfies ControlsItem[],
  },
};

// All three Figma instances stacked (lightTheme frame 63340:1481)
export const FigmaShowcase: Story = {
  render: () => (
    <div className="flex flex-col gap-spacing-16 p-spacing-40">
      <ControlsPanel
        aria-label="Action buttons"
        items={[
          { icon: 'edit', children: 'Переименовать', onClick: fn() },
          { icon: 'ai', children: 'Спросить AI', onClick: fn() },
          { icon: 'expand', children: 'Открыть', onClick: fn() },
          'divider',
          {
            kind: 'icon-button',
            icon: 'trash',
            variant: 'negative',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Удалить',
          },
        ]}
      />
      <ControlsPanel
        aria-label="Text formatting"
        items={[
          {
            kind: 'icon-button',
            icon: 'textBold',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Bold',
          },
          {
            kind: 'icon-button',
            icon: 'textItalic',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Italic',
          },
          {
            kind: 'icon-button',
            icon: 'textStrikethrough',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Strikethrough',
          },
          {
            kind: 'icon-button',
            icon: 'textUnderline',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Underline',
          },
          'divider',
          {
            kind: 'icon-button',
            icon: 'textLink',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Link',
          },
          'divider',
          {
            kind: 'icon-button',
            icon: 'textList',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Bullet list',
          },
          {
            kind: 'icon-button',
            icon: 'textListNumbers',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Numbered list',
          },
          'divider',
          {
            kind: 'icon-button',
            icon: 'ai',
            size: 16,
            onClick: fn(),
            ariaLabel: 'AI',
          },
          {
            kind: 'icon-button',
            icon: 'trash',
            variant: 'negative',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Удалить',
          },
        ]}
      />
      <ControlsPanel
        aria-label="Document viewer"
        items={[
          {
            kind: 'custom',
            content: (
              <span className="flex items-center justify-center p-spacing-8 text-12 leading-16 tracking-tight-1 text-blackinverse-a100">
                Finam Flow.pdf
              </span>
            ),
          },
          'divider',
          {
            kind: 'custom',
            content: (
              <span className="flex items-center py-spacing-8 px-spacing-4 text-blackinverse-a56">
                <button
                  type="button"
                  className="inline-flex items-center justify-center"
                  onClick={fn()}
                  aria-label="Previous page"
                >
                  <Icon variant="chevronLeftSmall" size={16} />
                </button>
                <span className="text-12 leading-16 tracking-tight-1 font-medium text-blackinverse-a56">
                  1/3
                </span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center"
                  onClick={fn()}
                  aria-label="Next page"
                >
                  <Icon variant="chevronRightSmall" size={16} />
                </button>
              </span>
            ),
          },
          {
            kind: 'icon-button',
            icon: 'docStroke',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Single page',
          },
          {
            kind: 'icon-button',
            icon: 'docFull',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Full page',
          },
          'divider',
          {
            kind: 'icon-button',
            icon: 'ai',
            size: 16,
            onClick: fn(),
            ariaLabel: 'AI',
          },
          {
            kind: 'icon-button',
            icon: 'trash',
            variant: 'negative',
            size: 16,
            onClick: fn(),
            ariaLabel: 'Удалить',
          },
        ]}
      />
    </div>
  ),
};

// With dropdowns: buttons open menus on click
export const WithDropdowns: Story = {
  args: {
    'aria-label': 'Actions with dropdowns',
    items: [
      {
        icon: 'edit',
        children: 'Переименовать',
        dropdown: {
          placement: 'bottom',
          items: [
            { label: 'Переименовать', value: 'rename', leftIcon: 'edit' },
            { label: 'Дублировать', value: 'duplicate', leftIcon: 'expand' },
          ],
        },
      },
      {
        icon: 'ai',
        children: 'Спросить AI',
        dropdown: {
          placement: 'bottom',
          items: [
            { label: 'Анализ', value: 'analyze', leftIcon: 'ai' },
            { label: 'Суммаризация', value: 'summarize', leftIcon: 'ai' },
          ],
        },
      },
      { icon: 'expand', children: 'Открыть', onClick: fn() },
      'divider',
      {
        kind: 'icon-button',
        icon: 'trash',
        variant: 'negative',
        size: 16,
        onClick: fn(),
        ariaLabel: 'Удалить',
      },
    ] satisfies ControlsItem[],
  },
};

// All items disabled
export const Disabled: Story = {
  args: {
    'aria-label': 'Disabled controls',
    items: [
      {
        icon: 'edit',
        children: 'Переименовать',
        disabled: true,
        onClick: fn(),
      },
      { icon: 'ai', children: 'Спросить AI', disabled: true, onClick: fn() },
      { icon: 'expand', children: 'Открыть', disabled: true, onClick: fn() },
      'divider',
      {
        kind: 'icon-button',
        icon: 'trash',
        variant: 'negative',
        size: 16,
        disabled: true,
        onClick: fn(),
        ariaLabel: 'Удалить',
      },
    ] satisfies ControlsItem[],
  },
};
