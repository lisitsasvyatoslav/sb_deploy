/**
 * # Dropdown — Architecture
 *
 * Dropdown is built on a three-layer architecture. Each layer adds convenience
 * on top of the previous one, while lower layers remain accessible for custom scenarios.
 *
 * ## Abstraction Layers
 *
 * ```
 * ┌─────────────────────────────────────────────────┐
 * │  Dropdown  (high level)                         │
 * │  items[] → automatic menu item rendering        │
 * ├─────────────────────────────────────────────────┤
 * │  DropdownBase  (mid level)                      │
 * │  trigger + menu — Render Props API              │
 * ├─────────────────────────────────────────────────┤
 * │  DropdownCompound  (low level)                  │
 * │  Compound Components: Trigger + Menu + Context  │
 * └─────────────────────────────────────────────────┘
 * ```
 *
 * ### 1. `Dropdown` — for standard item lists
 * Accepts `items[]` and automatically renders menu items with Figma styles.
 * Suitable for most use cases (context menus, select-like elements).
 *
 * ```tsx
 * <Dropdown
 *   trigger={({ isOpen, onClick, triggerRef }) => <Button onClick={onClick} ref={triggerRef}>Actions</Button>}
 *   items={[{ label: 'Edit', value: 'edit', leftIcon: 'edit' }]}
 *   onSelect={(value) => console.log(value)}
 * />
 * ```
 *
 * ### 2. `DropdownBase` — for custom menu content
 * Render Props API: accepts `trigger` (render function) and `menu` (ReactNode).
 * Use when menu content is non-standard (forms, complex markup).
 *
 * ```tsx
 * <DropdownBase
 *   trigger={({ isOpen, onClick, triggerRef }) => <Button onClick={onClick} ref={triggerRef}>Settings</Button>}
 *   menu={<div className="p-4"><input placeholder="Search..." /></div>}
 * />
 * ```
 *
 * ### 3. `DropdownCompound` — full control
 * Compound Components API for advanced scenarios with maximum flexibility.
 * Components are connected via React Context (`useDropdownContext`).
 *
 * ```tsx
 * <DropdownCompound>
 *   <DropdownCompound.Trigger>
 *     <Button>Open</Button>
 *   </DropdownCompound.Trigger>
 *   <DropdownCompound.Menu placement="bottom" offset={8}>
 *     <nav>...arbitrary content...</nav>
 *   </DropdownCompound.Menu>
 * </DropdownCompound>
 * ```
 *
 * ## Internal Components
 *
 * | Component            | File                      | Role                                              |
 * |----------------------|---------------------------|---------------------------------------------------|
 * | `DropdownCompound`   | `DropdownCompound.tsx`    | Root: state (controlled/uncontrolled), Context Provider |
 * | `DropdownTrigger`    | `DropdownTrigger.tsx`     | `<button>` with aria-haspopup, aria-expanded, disabled |
 * | `DropdownMenu`       | `DropdownMenu.tsx`        | Portal, positioning, animation (framer-motion), keyboard nav (Arrow Up/Down, Home, End, Esc) |
 * | `DropdownContext`    | `DropdownContext.tsx`     | React Context: isOpen, setIsOpen, triggerRef, menuRef |
 * | `useDropdownPosition`| `useDropdownPosition.ts`  | Hook: menu position calculation with viewport auto-correction |
 *
 * ## Helper Exports (Dropdown.tsx)
 *
 * - `DropdownItemButton` — pre-styled menu item button matching Figma specs
 * - `DropdownItemIconSlot` — icon slot (accepts `IconVariant | ReactElement`)
 * - `DROPDOWN_ITEM_CLASSES` — Tailwind classes for custom menu items
 * - `DROPDOWN_CONTAINER_CLASSES` — menu container Tailwind classes (border, shadow, blur)
 *
 * ## Key Features
 *
 * - **Controlled / Uncontrolled** — `open` + `onOpenChange` or `defaultOpen`
 * - **Portal** — menu renders into `document.body` by default (`usePortal={false}` to disable)
 * - **Placement** — `top | bottom | left | right` + compound variants (`top-left`, `bottom-right`, etc.) with viewport auto-correction
 * - **Animation** — fade + scale via framer-motion
 * - **Accessibility** — `aria-haspopup`, `aria-expanded`, `role="menu"`, keyboard navigation
 * - **matchTriggerWidth** — stretch menu to match trigger width
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useState, useLayoutEffect, useRef } from 'react';
import { Dropdown } from './Dropdown';
import { DropdownMultiSelect } from './DropdownMultiSelect';
import { DropdownBase } from './DropdownBase';
import { DropdownCompound } from './DropdownCompound';
import { DROPDOWN_CONTAINER_CLASSES } from './Dropdown';
import { DropdownHeader } from './DropdownHeader';
import {
  DropdownItemButton,
  DropdownItemText,
  DropdownItemIconSlot,
  getItemTextClasses,
  DROPDOWN_ITEM_CLASSES,
} from './DropdownItemButton';
import { Icon } from '@/shared/ui/Icon';
import Button from '@/shared/ui/Button/Button';
import Switch from '@/shared/ui/Switch';
import Checkbox from '@/shared/ui/Checkbox';
import Avatar from '@/shared/ui/Avatar';
import type { DropdownHeaderThemeValue } from './DropdownHeader';
import type { DropdownItem } from './DropdownItemButton';
import type { DropdownPlacement } from './Dropdown.types';

/* ───────── Sample data ───────── */

const sampleItems: DropdownItem[] = [
  { label: 'Редактировать', value: 'edit', leftIcon: 'edit' },
  { label: 'Дублировать', value: 'duplicate', leftIcon: 'copy' },
  { label: 'Удалить', value: 'delete', leftIcon: 'trash' },
];

const negativeItems: DropdownItem[] = [
  { label: 'Редактировать', value: 'edit', leftIcon: 'edit' },
  { label: 'Дублировать', value: 'duplicate', leftIcon: 'copy' },
  { label: 'Удалить', value: 'delete', leftIcon: 'trash', variant: 'negative' },
];

const captionItems: DropdownItem[] = [
  {
    label: 'Лимитная',
    value: 'limit',
    leftIcon: 'chart',
    caption: 'По указанной цене',
  },
  {
    label: 'Рыночная',
    value: 'market',
    leftIcon: 'chartLine',
    caption: 'По текущей цене',
  },
  {
    label: 'Стоп-лимит',
    value: 'stop',
    leftIcon: 'target',
    caption: 'При достижении цены',
  },
];

const detailItems: DropdownItem[] = [
  { label: 'Лимитная ₽', value: 'limit', leftIcon: 'chart' },
  { label: 'Рыночная', value: 'market', leftIcon: 'chartLine' },
  { label: 'Стоп-лимит ₽', value: 'stop', leftIcon: 'target' },
];

const simpleItems: DropdownItem[] = [
  { label: 'Опция 1', value: 'option1' },
  { label: 'Опция 2', value: 'option2' },
  { label: 'Опция 3', value: 'option3' },
];

/* ───────── Meta ───────── */

const meta: Meta<typeof Dropdown> = {
  title: 'UI/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],

  argTypes: {
    items: { table: { disable: true } },
    trigger: { table: { disable: true } },
    selectedValue: { control: 'text' },
    placement: {
      control: 'select',
      options: [
        'top',
        'top-left',
        'top-right',
        'bottom',
        'bottom-left',
        'bottom-right',
        'left',
        'left-top',
        'left-bottom',
        'right',
        'right-top',
        'right-bottom',
      ],
      table: { defaultValue: { summary: 'bottom' } },
    },
    offset: { control: 'number' },
    defaultOpen: { control: 'boolean' },
  },

  parameters: {
    layout: 'centered',
    docs: {
      story: { height: '200px' },
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55089-9408&p=f&m=dev',
    },
  },

  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: 240,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Stories ───────── */

/** Default dropdown with icons */
export const Default: Story = {
  render: () => (
    <Dropdown
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button
          variant="secondary"
          onClick={onClick}
          ref={triggerRef}
          icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
          iconSide="right"
        >
          Действия
        </Button>
      )}
      items={sampleItems}
      onSelect={fn()}
    />
  ),
};

/** Simple options without icons */
export const Simple: Story = {
  render: () => (
    <Dropdown
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button variant="secondary" onClick={onClick} ref={triggerRef}>
          Выбрать {isOpen ? '▲' : '▼'}
        </Button>
      )}
      items={simpleItems}
      onSelect={fn()}
    />
  ),
};

/** With a pre-selected value */
export const WithSelectedValue: Story = {
  render: () => {
    const [selected, setSelected] = useState('option2');
    return (
      <Dropdown
        trigger={({ isOpen, onClick, triggerRef }) => (
          <Button variant="secondary" onClick={onClick} ref={triggerRef}>
            {simpleItems.find((i) => i.value === selected)?.label ?? 'Выбрать'}{' '}
            {isOpen ? '▲' : '▼'}
          </Button>
        )}
        items={simpleItems}
        selectedValue={selected}
        onSelect={setSelected}
      />
    );
  },
};

/** Open by default (for docs preview) */
export const DefaultOpen: Story = {
  render: () => (
    <Dropdown
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button variant="secondary" onClick={onClick} ref={triggerRef}>
          Меню {isOpen ? '▲' : '▼'}
        </Button>
      )}
      items={sampleItems}
      onSelect={fn()}
      defaultOpen
    />
  ),
};

/**
 * All 12 placement variants displayed in a grid.
 * Each dropdown opens below / above / left / right of the trigger
 * with the specified cross-axis alignment.
 */
export const Placement: Story = {
  decorators: [],
  render: () => {
    const placements: DropdownPlacement[] = [
      'top-left',
      'top',
      'top-right',
      'left-top',
      'right-top',
      'left',
      'right',
      'left-bottom',
      'right-bottom',
      'bottom-left',
      'bottom',
      'bottom-right',
    ];

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          padding: 120,
          minHeight: '100vh',
          alignContent: 'center',
          justifyItems: 'center',
        }}
      >
        {placements.map((p) => (
          <Dropdown
            key={p}
            placement={p}
            trigger={({ isOpen, onClick, triggerRef }) => (
              <Button
                variant="secondary"
                onClick={onClick}
                ref={triggerRef}
                size="sm"
              >
                {p}
              </Button>
            )}
            items={simpleItems}
            onSelect={fn()}
          />
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: { story: { height: '600px' } },
  },
};

/** Interactive version with full state management */
export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | undefined>();
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Dropdown
          trigger={({ isOpen, onClick, triggerRef }) => (
            <Button
              variant="secondary"
              onClick={onClick}
              ref={triggerRef}
              icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
              iconSide="right"
            >
              {sampleItems.find((i) => i.value === selected)?.label ??
                'Выберите действие'}
            </Button>
          )}
          items={sampleItems}
          selectedValue={selected}
          onSelect={setSelected}
        />
        {selected && (
          <span style={{ fontSize: 12, color: '#666' }}>
            Выбрано: {selected}
          </span>
        )}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

/* ───────── DropdownBase (Render Props API) ───────── */

/**
 * **DropdownBase** — mid-level abstraction.
 *
 * Accepts `trigger` (render function) and `menu` (ReactNode).
 * Use when menu content is non-standard — forms, custom markup.
 * Trigger and positioning work out of the box.
 */
export const BaseRenderProps: Story = {
  render: () => (
    <DropdownBase
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button variant="secondary" onClick={onClick} ref={triggerRef}>
          Настройки {isOpen ? '▲' : '▼'}
        </Button>
      )}
      menu={
        <div className={DROPDOWN_CONTAINER_CLASSES} style={{ width: 240 }}>
          <div className="p-4 flex flex-col gap-3">
            <span className="text-sm font-medium text-blackinverse-a88">
              Custom content
            </span>
            <p className="text-xs text-blackinverse-a56">
              Any markup can go here: forms, cards, charts.
            </p>
          </div>
        </div>
      }
    />
  ),
};

/* ───────── DropdownCompound (Compound Components API) ───────── */

/**
 * **DropdownCompound** — low level, maximum flexibility.
 *
 * Compound Components are connected via React Context:
 * - `DropdownCompound` — root (state, Provider)
 * - `DropdownCompound.Trigger` — `<button>` with aria-haspopup/expanded
 * - `DropdownCompound.Menu` — portal, positioning, animation, Arrow Up/Down navigation
 *
 * Helper components `DropdownItemButton` and `DropdownItemIconSlot`
 * can be used to render items matching Figma specs.
 */
export const CompoundComponents: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | undefined>();
    return (
      <DropdownCompound>
        <DropdownCompound.Trigger>
          {(isOpen: boolean) => (
            <Button
              variant="secondary"
              icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
              iconSide="right"
            >
              Compound API
            </Button>
          )}
        </DropdownCompound.Trigger>
        <DropdownCompound.Menu className={DROPDOWN_CONTAINER_CLASSES}>
          <div className="py-spacing-6">
            {sampleItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSelected(item.value)}
                className={DROPDOWN_ITEM_CLASSES}
              >
                {item.leftIcon && <DropdownItemIconSlot icon={item.leftIcon} />}
                <span
                  className={getItemTextClasses(
                    'default',
                    selected === item.value
                  )}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </DropdownCompound.Menu>
      </DropdownCompound>
    );
  },
  parameters: { controls: { disable: true } },
};

/* ───────── Negative & Caption variants ───────── */

/** Dropdown with a negative (destructive) item — red text on hover */
export const WithNegativeItem: Story = {
  render: () => (
    <Dropdown
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button
          variant="secondary"
          onClick={onClick}
          ref={triggerRef}
          icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
          iconSide="right"
        >
          Действия
        </Button>
      )}
      items={negativeItems}
      onSelect={fn()}
    />
  ),
};

/** Dropdown items with caption sub-text */
export const WithCaptions: Story = {
  render: () => (
    <Dropdown
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button
          variant="secondary"
          onClick={onClick}
          ref={triggerRef}
          icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
          iconSide="right"
        >
          Тип ордера
        </Button>
      )}
      items={captionItems}
      onSelect={fn()}
    />
  ),
};

/** Dropdown with order type items */
export const OrderTypes: Story = {
  render: () => (
    <Dropdown
      trigger={({ isOpen, onClick, triggerRef }) => (
        <Button
          variant="secondary"
          onClick={onClick}
          ref={triggerRef}
          icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
          iconSide="right"
        >
          Тип ордера
        </Button>
      )}
      items={detailItems}
      onSelect={fn()}
    />
  ),
};

/** Dropdown with theme header (Header=Yes variant from Figma) */
export const WithHeader: Story = {
  render: () => {
    const [theme, setTheme] = useState<DropdownHeaderThemeValue>('system');
    return (
      <Dropdown
        trigger={({ isOpen, onClick, triggerRef }) => (
          <Button
            variant="secondary"
            onClick={onClick}
            ref={triggerRef}
            icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
            iconSide="right"
          >
            Настройки
          </Button>
        )}
        header={<DropdownHeader activeTheme={theme} onThemeChange={setTheme} />}
        items={sampleItems}
        onSelect={fn()}
      />
    );
  },
};

/* ───────── FigmaStates ───────── */

/**
 * All menu item states on light and dark backgrounds — matching Figma (node 55089:9408).
 *
 * Hover / Pressed are simulated via `storybook-addon-pseudo-states` —
 * the addon applies real CSS pseudo-states (:hover, :active) to elements
 * inside `[data-state="hover"]` / `[data-state="pressed"]`.
 *
 * Active (selected) is not a CSS pseudo-state, it's set via an explicit class.
 *
 * Themes are isolated via `data-theme` + `useLayoutEffect` (same as SearchInput.stories).
 */
function FigmaStatesDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Strip data-theme="dark" from ALL ancestors so Tailwind dark: classes
  // don't leak into the light panel. MutationObserver prevents Storybook from restoring it.
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const stripped = new Map<Element, string>();
    let el: Element | null = wrapperRef.current.parentElement;
    while (el) {
      const val = el.getAttribute('data-theme');
      if (val === 'dark') {
        stripped.set(el, val);
        el.removeAttribute('data-theme');
      }
      el = el.parentElement;
    }

    const observer = new MutationObserver(() => {
      stripped.forEach((_, node) => {
        if (node.getAttribute('data-theme') === 'dark') {
          node.removeAttribute('data-theme');
        }
      });
    });

    stripped.forEach((_, node) => {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    });

    return () => {
      observer.disconnect();
      stripped.forEach((val, node) => node.setAttribute('data-theme', val));
    };
  }, []);

  type ItemState = 'default' | 'hover' | 'pressed' | 'active';

  const itemStates: { state: ItemState; label: string }[] = [
    { state: 'default', label: 'Default' },
    { state: 'hover', label: 'Hover' },
    { state: 'pressed', label: 'Pressed' },
    { state: 'active', label: 'Active' },
  ];

  const labelStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    width: 64,
    flexShrink: 0,
  });

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  // Static menu container matching Figma styles (node 55089:9408)
  const MenuContainer = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-radius-4 border border-blackinverse-a4 bg-background-gray_high shadow-modal overflow-hidden"
      style={{ width: 288 }}
    >
      <div className="py-spacing-6">{children}</div>
    </div>
  );

  const Panel = ({
    theme,
    children,
    style,
  }: {
    theme: 'light' | 'dark';
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => {
    const isDark = theme === 'dark';
    return (
      <div
        data-theme={isDark ? 'dark' : undefined}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: '24px 32px',
          borderRadius: 8,
          ...style,
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        padding: 32,
        background: '#E0E0E6',
      }}
    >
      {/* Interactive demos — usePortal={false} so menus inherit panel theme */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            padding: '24px 32px',
          }}
        >
          <span style={sectionTitle}>Interactive</span>
          <div style={{ marginTop: 12 }}>
            <Dropdown
              trigger={({ isOpen, onClick, triggerRef }) => (
                <Button
                  variant="secondary"
                  onClick={onClick}
                  ref={triggerRef}
                  icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
                  iconSide="right"
                >
                  Действия
                </Button>
              )}
              items={sampleItems}
              onSelect={fn()}
              usePortal={false}
            />
          </div>
        </div>
        <div
          data-theme="dark"
          style={{
            background: '#040405',
            borderRadius: 8,
            padding: '24px 32px',
          }}
        >
          <span style={{ ...sectionTitle, color: 'rgba(255,255,255,0.5)' }}>
            Interactive
          </span>
          <div style={{ marginTop: 12 }}>
            <Dropdown
              trigger={({ isOpen, onClick, triggerRef }) => (
                <Button
                  variant="secondary"
                  onClick={onClick}
                  ref={triggerRef}
                  icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
                  iconSide="right"
                >
                  Действия
                </Button>
              )}
              items={sampleItems}
              onSelect={fn()}
              usePortal={false}
            />
          </div>
        </div>
      </div>

      {/* Item states — pseudo-states addon applies :hover/:active on buttons */}
      <div>
        <span style={sectionTitle}>Item States</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          {(['light', 'dark'] as const).map((theme) => {
            const isDark = theme === 'dark';
            return (
              <Panel
                key={theme}
                theme={theme}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {itemStates.map(({ state, label }) => (
                  <div
                    key={`${theme}-${state}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <span style={labelStyle(isDark)}>{label}</span>
                    <div
                      data-state={
                        state !== 'default' && state !== 'active'
                          ? state
                          : undefined
                      }
                    >
                      <MenuContainer>
                        {sampleItems.map((item) => (
                          <DropdownItemButton
                            key={item.value}
                            item={item}
                            isActive={state === 'active'}
                          />
                        ))}
                      </MenuContainer>
                    </div>
                  </div>
                ))}
              </Panel>
            );
          })}
        </div>
      </div>

      {/* Negative items */}
      <div>
        <span style={sectionTitle}>Negative Items</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          {(['light', 'dark'] as const).map((theme) => {
            const isDark = theme === 'dark';
            return (
              <Panel
                key={theme}
                theme={theme}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {itemStates
                  .filter((s) => s.state !== 'active')
                  .map(({ state, label }) => (
                    <div
                      key={`${theme}-neg-${state}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                    >
                      <span style={labelStyle(isDark)}>{label}</span>
                      <div data-state={state !== 'default' ? state : undefined}>
                        <MenuContainer>
                          {negativeItems.map((item) => (
                            <DropdownItemButton key={item.value} item={item} />
                          ))}
                        </MenuContainer>
                      </div>
                    </div>
                  ))}
              </Panel>
            );
          })}
        </div>
      </div>

      {/* Caption items */}
      <div>
        <span style={sectionTitle}>Caption Items</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <Panel key={theme} theme={theme}>
              <MenuContainer>
                {captionItems.map((item) => (
                  <DropdownItemButton key={item.value} item={item} />
                ))}
              </MenuContainer>
            </Panel>
          ))}
        </div>
      </div>

      {/* Detail items (right text) */}
      <div>
        <span style={sectionTitle}>Detail Items (right text)</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <Panel key={theme} theme={theme}>
              <MenuContainer>
                {detailItems.map((item) => (
                  <DropdownItemButton key={item.value} item={item} />
                ))}
              </MenuContainer>
            </Panel>
          ))}
        </div>
      </div>

      {/* Header (theme switcher) */}
      <div>
        <span style={sectionTitle}>Header (Theme Switcher)</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <Panel key={theme} theme={theme}>
              <MenuContainer>
                <DropdownHeader activeTheme="system" />
                {sampleItems.map((item) => (
                  <DropdownItemButton key={item.value} item={item} />
                ))}
              </MenuContainer>
            </Panel>
          ))}
        </div>
      </div>

      {/* Simple items (no icons) */}
      <div>
        <span style={sectionTitle}>Simple Items (no icons)</span>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          {(['light', 'dark'] as const).map((theme) => (
            <Panel key={theme} theme={theme}>
              <MenuContainer>
                {simpleItems.map((item) => (
                  <DropdownItemButton key={item.value} item={item} />
                ))}
              </MenuContainer>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}

export const FigmaStates: Story = {
  decorators: [],
  render: () => <FigmaStatesDemo />,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    pseudo: {
      hover: '[data-state="hover"] button, [data-state="hover"] > div',
      active: '[data-state="pressed"] button',
    },
  },
};

/* ───────── Составные элементы (Figma node 61006:8413) ───────── */

function CompositeElementsDemo() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const stripped = new Map<Element, string>();
    let el: Element | null = wrapperRef.current.parentElement;
    while (el) {
      const val = el.getAttribute('data-theme');
      if (val === 'dark') {
        stripped.set(el, val);
        el.removeAttribute('data-theme');
      }
      el = el.parentElement;
    }
    const observer = new MutationObserver(() => {
      stripped.forEach((_, node) => {
        if (node.getAttribute('data-theme') === 'dark')
          node.removeAttribute('data-theme');
      });
    });
    stripped.forEach((_, node) =>
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })
    );
    return () => {
      observer.disconnect();
      stripped.forEach((val, node) => node.setAttribute('data-theme', val));
    };
  }, []);

  // Dashed purple border like Figma component set
  const componentSetBorder =
    'border border-dashed border-purple-600 rounded-[5px] p-spacing-16';

  // Item row for state demos — uses real DropdownItemButton
  const ItemRow = ({ item, state }: { item: DropdownItem; state: string }) => (
    <div
      data-state={state !== 'default' && state !== 'active' ? state : undefined}
    >
      <DropdownItemButton item={item} isActive={state === 'active'} />
    </div>
  );

  // Assembled dropdown container (Figma: border, shadow, blur, bg)
  const DropdownContainer = ({
    children,
    width = 256,
    withHeaderPadding,
  }: {
    children: React.ReactNode;
    width?: number;
    withHeaderPadding?: boolean;
  }) => (
    <div
      className="rounded-radius-4 border border-blackinverse-a4 bg-background-gray_high shadow-modal backdrop-blur-effects-modal overflow-hidden"
      style={{ width }}
    >
      {withHeaderPadding ? (
        children
      ) : (
        <div className="py-spacing-6">{children}</div>
      )}
    </div>
  );

  return (
    <div ref={wrapperRef} className="bg-white-000 rounded-radius-8 shadow-600">
      {/* Page title */}
      <div className="pt-spacing-48 px-spacing-48 pb-spacing-24">
        <h1 className="text-[48px] font-semibold leading-[64px] tracking-[-0.4px] text-blackinverse-a100">
          Выпадающий список
        </h1>
      </div>

      <div className="pt-spacing-24 px-spacing-48 pb-spacing-48 flex flex-col gap-spacing-40">
        {/* ═══════ Section: Составные элементы ═══════ */}
        <div className="flex flex-col gap-spacing-24">
          <h2 className="text-[18px] font-semibold leading-[24px] text-blackinverse-a100">
            Составные элементы
          </h2>

          {/* 3-column layout matching Figma (node 61006:8418) */}
          <div
            className="border-2 border-blackinverse-a8 rounded-radius-4 p-spacing-48 flex items-start"
            style={{ gap: 49 }}
          >
            {/* ── Column 1: Sub-components (width ~245) ── */}
            <div className="flex flex-col" style={{ gap: 25, width: 245 }}>
              {/* dropdown/itemLeftPart */}
              <div className={`${componentSetBorder} flex gap-spacing-16`}>
                <DropdownItemIconSlot icon="edit" />
                <DropdownItemIconSlot
                  icon={
                    <Avatar
                      name="John Doe"
                      size="S"
                      showInitials={false}
                      className="w-[20px] h-[20px]"
                    />
                  }
                />
                <DropdownItemIconSlot
                  icon={<Checkbox checked={false} onChange={fn()} size="sm" />}
                />
              </div>

              {/* dropdown/itemMiddle */}
              <div className={`${componentSetBorder} flex gap-spacing-16`}>
                <DropdownItemText label="Action" />
                <DropdownItemText label="Action" caption="Caption" />
              </div>

              {/* Dropdown/itemRightPart */}
              <div className={`${componentSetBorder} flex gap-spacing-16`}>
                <DropdownItemIconSlot icon="chevronRight" />
                <DropdownItemIconSlot
                  icon={<Checkbox checked={false} onChange={fn()} size="sm" />}
                />
                <DropdownItemIconSlot
                  icon={<Switch checked={false} onChange={fn()} size="sm" />}
                />
              </div>
            </div>

            {/* ── Column 2: Assembled items with states (width 288) ── */}
            <div className="flex flex-col" style={{ gap: 46 }}>
              {/* dropdown/master/itemDefault */}
              <div
                className={`${componentSetBorder} flex flex-col gap-spacing-16`}
                style={{ width: 288 }}
              >
                {(['default', 'hover', 'pressed', 'active'] as const).map(
                  (state) => (
                    <ItemRow
                      key={state}
                      item={{
                        label: 'Action',
                        value: state,
                        leftIcon: 'edit',
                        rightIcon: 'chevronRight',
                      }}
                      state={state}
                    />
                  )
                )}
              </div>

              {/* dropdown/master/itemNegative */}
              <div
                className={`${componentSetBorder} flex flex-col gap-spacing-16`}
                style={{ width: 288 }}
              >
                {(['default', 'hover', 'pressed'] as const).map((state) => (
                  <ItemRow
                    key={state}
                    item={{
                      label: 'Action',
                      value: state,
                      leftIcon: 'edit',
                      rightIcon: 'chevronRight',
                      variant: 'negative',
                    }}
                    state={state}
                  />
                ))}
              </div>
            </div>

            {/* ── Column 3: Theme header components (width 256) ── */}
            <div className="flex flex-col" style={{ gap: 59, width: 256 }}>
              {/* dropdownHead/Theme/Item — 3 states */}
              <div className={`${componentSetBorder} flex gap-spacing-16`}>
                {(['default', 'hover', 'active'] as const).map((state) => (
                  <div
                    key={state}
                    data-state={state === 'hover' ? 'hover' : undefined}
                    className={`flex items-center justify-center p-spacing-12 ${
                      state === 'active'
                        ? 'bg-brand-bg_deep'
                        : 'bg-blackinverse-a2 hover:bg-blackinverse-a4'
                    }`}
                  >
                    <Icon
                      variant="themeSystem"
                      size={20}
                      className={
                        state === 'active'
                          ? 'text-brand-base'
                          : 'text-blackinverse-a56'
                      }
                    />
                  </div>
                ))}
              </div>

              {/* dropdownHead/Theme — assembled row */}
              <DropdownHeader activeTheme="system" />
            </div>
          </div>
        </div>

        {/* ═══════ Section: Основной компонент в сборе ═══════ */}
        <div className="flex flex-col gap-spacing-24">
          <h2 className="text-[18px] font-semibold leading-[24px] text-blackinverse-a100">
            Основной компонент в сборе
          </h2>

          {/* 2 dropdowns side by side: Header=No, Header=Yes */}
          <div className="border-2 border-blackinverse-a8 rounded-radius-4 p-spacing-48 flex justify-center items-start gap-spacing-40">
            {/* dropdown component set */}
            <div className={`${componentSetBorder} flex gap-spacing-16`}>
              {/* Header=No */}
              <DropdownContainer>
                {sampleItems.map((item) => (
                  <ItemRow key={item.value} item={item} state="default" />
                ))}
              </DropdownContainer>

              {/* Header=Yes */}
              <DropdownContainer withHeaderPadding>
                <DropdownHeader activeTheme="system" />
                <div className="py-spacing-6">
                  {sampleItems.map((item) => (
                    <ItemRow key={item.value} item={item} state="default" />
                  ))}
                </div>
              </DropdownContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Figma node 61006:8413 — All composite sub-components with states */
export const CompositeElements: Story = {
  decorators: [],
  render: () => <CompositeElementsDemo />,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    pseudo: {
      hover: '[data-state="hover"] button, [data-state="hover"] > div',
      active: '[data-state="pressed"] button',
    },
  },
};

/* ───────── DropdownMultiSelect ───────── */

const multiSelectItems = [
  { label: 'Finam', value: 'finam' },
  { label: 'T-bank', value: 'tbank' },
  { label: 'Sber', value: 'sber' },
];

/**
 * **DropdownMultiSelect** — multi-select dropdown with checkboxes.
 *
 * Menu stays open on item click; checkboxes appear on the right side.
 * Uses the same `DropdownBase` positioning and animation.
 */
export const MultiSelect: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[] | null>(null);
    return (
      <DropdownMultiSelect
        trigger={({ isOpen, onClick, triggerRef, triggerText }) => (
          <Button
            variant="secondary"
            onClick={onClick}
            ref={triggerRef}
            icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
            iconSide="right"
          >
            {triggerText}
          </Button>
        )}
        items={multiSelectItems}
        selectedValues={selected}
        onChange={setSelected}
        allLabel="Все"
      />
    );
  },
  parameters: { controls: { disable: true } },
};

/** Multi-select with inputMd trigger (like Figma node 5176:12570) */
export const MultiSelectInputTrigger: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[] | null>(null);
    return (
      <div style={{ width: 240 }}>
        <DropdownMultiSelect
          trigger={({ isOpen, onClick, triggerRef, disabled, triggerText }) => (
            <button
              ref={triggerRef}
              onClick={onClick}
              disabled={disabled}
              type="button"
              className="flex items-center w-full py-spacing-10 px-spacing-12 gap-spacing-8 rounded-radius-2 bg-blackinverse-a8 transition-colors duration-360 cursor-pointer"
            >
              <span className="flex-1 text-left text-14 leading-20 font-normal tracking-tight-1 text-blackinverse-a56 truncate">
                {triggerText}
              </span>
              <Icon
                variant="chevronDownSmall"
                size={20}
                className={`shrink-0 aspect-square transition-transform duration-200 text-blackinverse-a56 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )}
          items={multiSelectItems}
          selectedValues={selected}
          onChange={setSelected}
          allLabel="Все"
          matchTriggerWidth
          placement="bottom"
          offset={8}
        />
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

/** Multi-select without "All" option */
export const MultiSelectNoAll: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[] | null>(['finam']);
    return (
      <DropdownMultiSelect
        trigger={({ isOpen, onClick, triggerRef, triggerText }) => (
          <Button
            variant="secondary"
            onClick={onClick}
            ref={triggerRef}
            icon={<Icon variant={isOpen ? 'chevronUp' : 'chevronDown'} />}
            iconSide="right"
          >
            {triggerText || 'Выберите брокера'}
          </Button>
        )}
        items={multiSelectItems}
        selectedValues={selected}
        onChange={setSelected}
      />
    );
  },
  parameters: { controls: { disable: true } },
};
