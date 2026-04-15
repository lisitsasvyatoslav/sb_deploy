import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';

import { Icon } from '@/shared/ui/Icon';
import IconButton from '@/shared/ui/IconButton';
import { Dropdown } from '@/shared/ui/Dropdown';

import SidebarNavItem from './SidebarNavItem';
import SidebarNavSubitem from './SidebarNavSubitem';
import SidebarNavGroup from './SidebarNavGroup';

/* ───────── Meta ───────── */

const meta: Meta = {
  title: 'UI/SidebarNav',
  tags: ['autodocs'],

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55302-11212',
    },
  },

  decorators: [
    (Story) => (
      <div style={{ width: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

/* ───────── SidebarNavItem stories ───────── */

export const ItemDefault: StoryObj = {
  name: 'Item / Default',
  render: () => <SidebarNavItem icon="editNote" label="Boards" />,
};

export const ItemActive: StoryObj = {
  name: 'Item / Active',
  render: () => <SidebarNavItem icon="editNote" label="Boards" isActive />,
};

export const ItemWithChevron: StoryObj = {
  name: 'Item / With Chevron',
  render: () => (
    <div className="flex flex-col gap-spacing-4">
      <SidebarNavItem
        icon="editNote"
        label="Collapsed"
        showChevron
        isExpanded={false}
      />
      <SidebarNavItem icon="editNote" label="Expanded" showChevron isExpanded />
    </div>
  ),
};

export const ItemWithRightArea: StoryObj = {
  name: 'Item / With Right Area',
  render: () => (
    <SidebarNavItem
      icon="chartPie"
      label="Portfolios"
      rightArea={<Icon variant="plusSmall" size={16} />}
    />
  ),
};

export const ItemNoIcon: StoryObj = {
  name: 'Item / No Icon',
  render: () => <SidebarNavItem label="Label Only" showIcon={false} />,
};

export const ItemHighlighted: StoryObj = {
  name: 'Item / Highlighted',
  render: () => <SidebarNavItem icon="editNote" label="Boards" isHighlighted />,
};

export const ItemAllStates: StoryObj = {
  name: 'Item / All States',
  render: () => (
    <div className="flex flex-col gap-spacing-4">
      <SidebarNavItem icon="editNote" label="Default" />
      <SidebarNavItem icon="editNote" label="Active" isActive />
      <SidebarNavItem icon="editNote" label="Highlighted" isHighlighted />
    </div>
  ),
};

/* ───────── Collapsed (Mini) stories ───────── */

export const CollapsedDefault: StoryObj = {
  name: 'Collapsed / Default',
  render: () => (
    <div style={{ width: 48 }}>
      <SidebarNavItem icon="editNote" label="Boards" isCollapsed />
    </div>
  ),
};

export const CollapsedActive: StoryObj = {
  name: 'Collapsed / Active',
  render: () => (
    <div style={{ width: 48 }}>
      <SidebarNavItem icon="editNote" label="Boards" isCollapsed isActive />
    </div>
  ),
};

export const CollapsedWithTooltip: StoryObj = {
  name: 'Collapsed / With Tooltip',
  render: () => (
    <div style={{ width: 48 }}>
      <SidebarNavItem
        icon="editNote"
        label="Boards"
        isCollapsed
        tooltip="Boards"
      />
    </div>
  ),
};

export const CollapsedAllStates: StoryObj = {
  name: 'Collapsed / All States',
  render: () => (
    <div className="flex flex-col gap-spacing-4" style={{ width: 48 }}>
      <SidebarNavItem icon="editNote" label="Boards" isCollapsed />
      <SidebarNavItem icon="chartPie" label="Portfolios" isCollapsed isActive />
      <SidebarNavItem icon="target" label="Strategies" isCollapsed />
    </div>
  ),
};

/* ───────── SidebarNavSubitem stories ───────── */

export const SubitemDefault: StoryObj = {
  name: 'Subitem / Default',
  render: () => <SidebarNavSubitem label="Board 1" />,
};

export const SubitemActive: StoryObj = {
  name: 'Subitem / Active',
  render: () => <SidebarNavSubitem label="Board 1" isActive />,
};

export const SubitemWithRightArea: StoryObj = {
  name: 'Subitem / With Right Area',
  render: () => (
    <SidebarNavSubitem
      label="Board 1"
      rightArea={<Icon variant="chevronRightSmall" size={20} />}
    />
  ),
};

export const SubitemAllStates: StoryObj = {
  render: () => (
    <div className="flex flex-col">
      <SidebarNavSubitem label="Default" />
      <SidebarNavSubitem label="Active" isActive />
    </div>
  ),
};

/* ───────── SidebarNavGroup stories ───────── */

export const GroupCollapsed: StoryObj = {
  name: 'Group / Collapsed',
  render: () => (
    <SidebarNavGroup
      item={{ icon: 'editNote', label: 'Boards' }}
      isExpanded={false}
    >
      <SidebarNavSubitem label="Board 1" />
      <SidebarNavSubitem label="Board 2" />
    </SidebarNavGroup>
  ),
};

export const GroupExpanded: StoryObj = {
  name: 'Group / Expanded',
  render: () => (
    <SidebarNavGroup item={{ icon: 'editNote', label: 'Boards' }} isExpanded>
      <SidebarNavSubitem label="Board 1" />
      <SidebarNavSubitem label="Board 2" isActive />
      <SidebarNavSubitem label="Board 3" />
    </SidebarNavGroup>
  ),
};

export const GroupSidebarCollapsed: StoryObj = {
  name: 'Group / Sidebar Collapsed',
  render: () => (
    <div style={{ width: 48 }}>
      <SidebarNavGroup
        item={{ icon: 'editNote', label: 'Boards' }}
        isCollapsed
        tooltip="Boards"
      >
        <SidebarNavSubitem label="Board 1" />
        <SidebarNavSubitem label="Board 2" />
      </SidebarNavGroup>
    </div>
  ),
};

export const GroupInteractive: StoryObj = {
  name: 'Group / Interactive',
  render: function InteractiveGroup() {
    const [expanded, setExpanded] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);

    const items = ['Ideas Board', 'Trading Log', 'Watchlist', 'Research'];

    return (
      <SidebarNavGroup
        item={{ icon: 'editNote', label: 'Boards' }}
        isExpanded={expanded}
        onToggle={() => setExpanded((prev) => !prev)}
      >
        {items.map((name) => (
          <SidebarNavSubitem
            key={name}
            label={name}
            isActive={activeItem === name}
            onClick={() => setActiveItem(name)}
          />
        ))}
      </SidebarNavGroup>
    );
  },
};

/* ───────── Full sidebar demo ───────── */

export const FullSidebarDemo: StoryObj = {
  render: function FullDemo() {
    const [expandedSection, setExpandedSection] = useState<string | null>(
      'boards'
    );
    const [activeItem, setActiveItem] = useState('Ideas Board');

    const sections = [
      {
        id: 'boards',
        icon: 'editNote' as const,
        label: 'Boards',
        items: ['Ideas Board', 'Trading Log', 'Watchlist'],
      },
      {
        id: 'portfolios',
        icon: 'chartPie' as const,
        label: 'Portfolios',
        items: ['Main Portfolio', 'Test Portfolio'],
      },
      {
        id: 'strategies',
        icon: 'target' as const,
        label: 'Strategies',
        items: ['Momentum', 'Mean Reversion'],
      },
    ];

    return (
      <div className="flex flex-col gap-spacing-2">
        {sections.map((section) => (
          <SidebarNavGroup
            key={section.id}
            item={{
              icon: section.icon,
              label: section.label,
              isActive: section.items.includes(activeItem),
            }}
            isExpanded={expandedSection === section.id}
            onToggle={() =>
              setExpandedSection((prev) =>
                prev === section.id ? null : section.id
              )
            }
          >
            {section.items.map((name) => (
              <SidebarNavSubitem
                key={name}
                label={name}
                isActive={activeItem === name}
                onClick={() => setActiveItem(name)}
              />
            ))}
          </SidebarNavGroup>
        ))}
      </div>
    );
  },
};

/* ───────── Subitem with context menu ───────── */

const CONTEXT_MENU_ITEMS = [
  { label: 'Спросить AI', value: 'ask-ai', leftIcon: 'ai' as const },
  { label: 'Переименовать', value: 'rename', leftIcon: 'edit' as const },
  { label: 'Дублировать', value: 'duplicate', leftIcon: 'copy' as const },
  {
    label: 'Скопировать ссылку',
    value: 'copy-link',
    leftIcon: 'share' as const,
  },
  {
    label: 'Удалить',
    value: 'delete',
    leftIcon: 'trash' as const,
    variant: 'negative' as const,
  },
];

export const SubitemWithContextMenu: StoryObj = {
  name: 'Subitem / With Context Menu',
  render: function SubitemContextMenu() {
    const [activeItem, setActiveItem] = useState<string | null>('Биткойн');

    const items = [
      'Идеи для ВТБ',
      'Газ 2025',
      'Альткойны',
      'Биткойн',
      'Сбер',
      'Пшеница',
    ];

    const renderRightArea = (name: string) => (
      <Dropdown
        trigger={({ isOpen, onClick, triggerRef }) => (
          <span ref={triggerRef} className="flex">
            <IconButton
              icon="moreHorizontal"
              size="sm"
              ariaLabel="More actions"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onClick();
              }}
              className={isOpen ? 'opacity-100' : undefined}
            />
          </span>
        )}
        items={CONTEXT_MENU_ITEMS}
        onSelect={(value: string) => console.log(name, value)}
        placement="bottom"
      />
    );

    return (
      <div style={{ width: 260 }}>
        <SidebarNavGroup
          item={{ icon: 'editNote', label: 'Поиск идей', isHighlighted: true }}
          isExpanded
        >
          {items.map((name) => (
            <SidebarNavSubitem
              key={name}
              label={name}
              isActive={activeItem === name}
              onClick={() => setActiveItem(name)}
              rightArea={renderRightArea(name)}
            />
          ))}
        </SidebarNavGroup>
      </div>
    );
  },
};
