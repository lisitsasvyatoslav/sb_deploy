import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useLayoutEffect, useRef } from 'react';

import Avatar from '@/shared/ui/Avatar';
import { Icon } from '@/shared/ui/Icon';
import IconButton from '@/shared/ui/IconButton';
import Switch from '@/shared/ui/Switch';
import Checkbox from '@/shared/ui/Checkbox';
import RadioButton from '@/shared/ui/RadioButton';

import ListItemApp from './ListItemApp';
import type { ListItemAppState } from './ListItemApp.types';

/* ───────── Meta ───────── */

const meta: Meta<typeof ListItemApp> = {
  title: 'UI/ListItemApp',
  component: ListItemApp,
  tags: ['autodocs'],

  argTypes: {
    state: {
      control: 'select',
      options: [
        'enabled',
        'focused',
        'active',
        'disabled',
      ] satisfies ListItemAppState[],
      table: { defaultValue: { summary: 'enabled' } },
    },
    title: { control: 'text' },
    caption: { control: 'text' },
  },

  args: {
    title: 'Title',
    caption: 'Caption',
    state: 'enabled',
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=9320-7913',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Helpers ───────── */

const DEMO_AVATAR = 'https://i.pravatar.cc/64?u=listitem';

/* ───────── Stories ───────── */

export const Default: Story = {};

export const WithAvatar: Story = {
  args: {
    leading: <Avatar src={DEMO_AVATAR} name="John Doe" size="S" />,
    title: 'John Doe',
    caption: 'Last seen 2 hours ago',
  },
};

export const WithIcon: Story = {
  args: {
    leading: (
      <Icon variant="language" size={24} className="text-blackinverse-a56" />
    ),
    title: 'Settings',
    caption: 'Manage your preferences',
  },
};

export const WithSwitch: Story = {
  args: {
    leading: <Avatar src={DEMO_AVATAR} name="Notifications" size="S" />,
    title: 'Push Notifications',
    caption: 'Receive alerts about trades',
    trailing: <Switch checked={true} onChange={() => {}} size="md" />,
  },
};

export const WithCheckbox: Story = {
  args: {
    leading: <Avatar name="Watchlist" size="S" />,
    title: 'AAPL — Apple Inc.',
    caption: '$178.72 (+1.24%)',
    trailing: <Checkbox checked={true} onChange={() => {}} size="lg" />,
  },
};

export const WithRadioButton: Story = {
  args: {
    leading: <Avatar name="Account" size="S" />,
    title: 'Main Account',
    caption: 'Finam Broker',
    trailing: <RadioButton checked={false} onChange={() => {}} size="lg" />,
  },
};

export const WithIconButton: Story = {
  args: {
    leading: <Avatar src={DEMO_AVATAR} name="Options" size="S" />,
    title: 'Portfolio Item',
    caption: 'Updated today',
    trailing: <IconButton icon="more" />,
  },
};

export const Disabled: Story = {
  args: {
    leading: <Avatar name="Disabled" size="S" />,
    title: 'Disabled Item',
    caption: 'This item is not available',
    state: 'disabled',
    trailing: <Switch checked={false} onChange={() => {}} size="md" />,
  },
};

/** Dropdown built into ListItemApp — click to open */
function WithDropdownDemo() {
  const [selected, setSelected] = React.useState('ru');
  const labels: Record<string, string> = { ru: 'Русский', en: 'English' };

  return (
    <div style={{ width: 412 }}>
      <ListItemApp
        leading={
          <Icon
            variant="language"
            size={24}
            className="text-blackinverse-a56"
          />
        }
        title="Язык"
        caption={labels[selected]}
        trailing={
          <Icon
            variant="chevronDown"
            size={24}
            className="text-blackinverse-a56"
          />
        }
        dropdownMenu={
          <div className="py-spacing-6">
            {(['ru', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelected(lang)}
                className="group flex items-center w-full px-spacing-6 text-left hover:bg-blackinverse-a4 transition-colors"
              >
                <span
                  className={`text-desktop-14 font-medium leading-20 py-spacing-8 px-spacing-10 flex-1 ${
                    selected === lang
                      ? 'text-blackinverse-a100'
                      : 'text-blackinverse-a56'
                  }`}
                >
                  {labels[lang]}
                </span>
                <div className="w-spacing-36 h-spacing-36 flex items-center justify-center shrink-0">
                  <Checkbox
                    checked={selected === lang}
                    onChange={() => setSelected(lang)}
                    size="md"
                    variant="accent"
                  />
                </div>
              </button>
            ))}
          </div>
        }
        dropdownMatchTriggerWidth
      />
    </div>
  );
}

export const WithDropdown: Story = {
  render: () => <WithDropdownDemo />,
  parameters: { controls: { disable: true } },
};

/** All 4 states side by side */
export const AllStates: Story = {
  render: () => {
    const states: ListItemAppState[] = [
      'enabled',
      'focused',
      'active',
      'disabled',
    ];
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 480 }}
      >
        {states.map((s) => (
          <ListItemApp
            key={s}
            leading={<Avatar src={DEMO_AVATAR} name={s} size="S" />}
            title={`State: ${s}`}
            caption="Caption text"
            state={s}
            trailing={
              <Switch checked={s === 'active'} onChange={() => {}} size="md" />
            }
          />
        ))}
      </div>
    );
  },
  parameters: { controls: { disable: true } },
};

/** All trailing control types */
export const AllTrailingControls: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 480 }}
    >
      <ListItemApp
        leading={<Avatar name="A" size="S" />}
        title="With Switch"
        caption="Toggle control"
        trailing={<Switch checked={true} onChange={() => {}} size="md" />}
      />
      <ListItemApp
        leading={<Avatar name="B" size="S" />}
        title="With Checkbox"
        caption="Checkbox control"
        trailing={<Checkbox checked={true} onChange={() => {}} size="lg" />}
      />
      <ListItemApp
        leading={<Avatar name="C" size="S" />}
        title="With RadioButton"
        caption="Radio control"
        trailing={<RadioButton checked={true} onChange={() => {}} size="lg" />}
      />
      <ListItemApp
        leading={<Avatar name="D" size="S" />}
        title="With IconButton"
        caption="Action button"
        trailing={<IconButton icon="more" />}
      />
      <ListItemApp
        leading={<Avatar name="E" size="S" />}
        title="No trailing"
        caption="Plain list item"
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/**
 * FigmaStates — all states on light & dark panels side by side.
 *
 * Uses useLayoutEffect to strip data-theme="dark" from ancestors
 * so the light panel renders correctly in Storybook.
 */
function FigmaStatesDemo() {
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

  const states: ListItemAppState[] = [
    'enabled',
    'focused',
    'active',
    'disabled',
  ];

  const trailingVariants: { label: string; node: React.ReactNode }[] = [
    {
      label: 'Switch',
      node: <Switch checked={true} onChange={() => {}} size="md" />,
    },
    {
      label: 'Checkbox',
      node: <Checkbox checked={true} onChange={() => {}} size="lg" />,
    },
    {
      label: 'RadioButton',
      node: <RadioButton checked={true} onChange={() => {}} size="lg" />,
    },
    { label: 'IconButton', node: <IconButton icon="more" /> },
  ];

  const labelStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    marginLeft: 8,
  });

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  const Panel = ({ theme }: { theme: 'light' | 'dark' }) => {
    const isDark = theme === 'dark';
    return (
      <div
        data-theme={isDark ? 'dark' : undefined}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: '12px',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: 320,
        }}
      >
        {states.map((s) => (
          <div
            key={`${theme}-${s}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={labelStyle(isDark)}>{s}</span>
            <div style={{ flex: '0 0 180px' }}>
              <ListItemApp
                leading={<Avatar src={DEMO_AVATAR} name="User" size="S" />}
                title="Title"
                caption="Caption"
                state={s}
                trailing={
                  trailingVariants[states.indexOf(s) % trailingVariants.length]
                    .node
                }
              />
            </div>
          </div>
        ))}
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
      <span style={sectionTitle}>listItemApp</span>
      <div style={{ display: 'flex', gap: 24 }}>
        <Panel theme="light" />
        <Panel theme="dark" />
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
  },
};
