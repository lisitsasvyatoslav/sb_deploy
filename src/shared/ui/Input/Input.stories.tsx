import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import React, { useState, useLayoutEffect, useRef } from 'react';
import Input from '@/shared/ui/Input';
import type { InputSize } from '@/shared/ui/Input';
import { Icon } from '@/shared/ui/Icon';

/* ───────── Stateful wrapper ───────── */

function InputWithState(props: React.ComponentProps<typeof Input>) {
  const [value, setValue] = useState((props.value as string) ?? '');
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        props.onChange?.(e);
      }}
    />
  );
}

/* ───────── Meta ───────── */

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],

  argTypes: {
    size: {
      control: 'select',
      options: ['lg', 'md', 'sm'] satisfies InputSize[],
      description: 'Размер: lg=48px, md=40px, sm=32px',
      table: { defaultValue: { summary: 'md' } },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    leftIcon: { table: { disable: true } },
    rightIcon: { table: { disable: true } },
  },

  args: {
    placeholder: 'Введите текст',
    onChange: fn(),
  },

  parameters: {
    layout: 'centered',
  },

  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],

  render: (args) => <InputWithState {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'example@mail.ru',
    type: 'email',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Имя пользователя',
    hint: 'Только латинские буквы и цифры',
    placeholder: 'username',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Некорректный email адрес',
    value: 'invalid-email',
    placeholder: 'example@mail.ru',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Заблокировано',
    value: 'readonly value',
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    label: 'Пароль',
    type: 'password',
    placeholder: '••••••••',
  },
};

/** Все размеры */
export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      {(['lg', 'md', 'sm'] as InputSize[]).map((size) => (
        <Input
          key={size}
          size={size}
          label={`Size: ${size}`}
          placeholder={`${size} input`}
        />
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

/* ───────── Interactive ───────── */

const LATIN_ONLY = /[^a-zA-Z]/;

function InteractiveInput({ size }: { size: InputSize }) {
  const [value, setValue] = useState('');
  const error =
    value && LATIN_ONLY.test(value) ? 'Только латинские буквы' : undefined;

  const clearButton = value ? (
    <button
      type="button"
      onClick={() => setValue('')}
      className="flex items-center justify-center cursor-pointer"
      aria-label="Очистить"
    >
      <Icon variant="closeCircleBold" size={20} />
    </button>
  ) : (
    'placeHolder'
  );

  return (
    <Input
      size={size}
      label={`Username (${size})`}
      placeholder="Enter your name"
      hint="Only latin letters allowed"
      imgSrc="https://i.pravatar.cc/40"
      leftIcon="edit"
      rightIcon={clearButton}
      value={value}
      error={error}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

function InteractiveDemo() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}
    >
      {(['lg', 'md', 'sm'] as InputSize[]).map((size) => (
        <InteractiveInput key={size} size={size} />
      ))}
      <Input
        size="md"
        label="Disabled"
        placeholder="Cannot edit"
        imgSrc="https://i.pravatar.cc/40"
        leftIcon="edit"
        rightIcon="placeHolder"
        disabled
      />
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  parameters: { controls: { disable: true } },
};

/* ───────── FigmaStates ───────── */

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

  const states: {
    label: string;
    value: string;
    hint?: string;
    error?: string;
    focused?: boolean;
    hover?: boolean;
    disabled?: boolean;
  }[] = [
    { label: 'Default', value: '', hint: 'Hint text to help user' },
    {
      label: 'Hovered',
      value: '',
      hint: 'Hint text to help user',
      hover: true,
    },
    {
      label: 'Focused',
      value: '',
      hint: 'Hint text to help user',
      focused: true,
    },
    {
      label: 'Typing',
      value: 'Placeholder',
      hint: 'Hint text to help user',
      focused: true,
    },
    { label: 'Entered', value: 'Placeholder', hint: 'Hint text to help user' },
    {
      label: 'Entered + Hover',
      value: 'Placeholder',
      hint: 'Hint text to help user',
      hover: true,
    },
    { label: 'Error', value: 'Placeholder', error: 'Hint text to help user' },
    {
      label: 'Error + Hover',
      value: 'Placeholder',
      error: 'Hint text to help user',
      hover: true,
    },
    {
      label: 'Error Focused',
      value: 'Placeholder',
      error: 'Hint text to help user',
      focused: true,
    },
    {
      label: 'Disabled',
      value: '',
      hint: 'Hint text to help user',
      disabled: true,
    },
  ];

  const sizes: { key: InputSize; label: string }[] = [
    { key: 'lg', label: 'inputLg' },
    { key: 'md', label: 'inputMd' },
    { key: 'sm', label: 'inputSm' },
  ];

  const labelStyle = (isDark: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  });

  const Panel = ({
    theme,
    size,
  }: {
    theme: 'light' | 'dark';
    size: InputSize;
  }) => {
    const isDark = theme === 'dark';
    return (
      <div
        data-theme={isDark ? 'dark' : undefined}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: '24px 32px',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: 280 + 180,
        }}
      >
        {states.map((s) => (
          <div
            key={`${theme}-${size}-${s.label}`}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{ width: 280, flexShrink: 0 }}>
              <Input
                size={size}
                label="Label"
                placeholder="Placeholder"
                value={s.value}
                hint={s.hint}
                error={s.error}
                disabled={s.disabled}
                readOnly
                imgSrc="https://i.pravatar.cc/40"
                leftIcon="placeHolder"
                rightIcon="placeHolder"
                containerClassName={
                  [s.focused && 'sb-focus', s.hover && 'sb-hover']
                    .filter(Boolean)
                    .join(' ') || undefined
                }
              />
            </div>
            <span style={labelStyle(isDark)}>{s.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
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
      {sizes.map(({ key, label }) => (
        <div key={key}>
          <span style={sectionTitle}>{label}</span>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            <Panel theme="light" size={key} />
            <Panel theme="dark" size={key} />
          </div>
        </div>
      ))}
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
      hover: '.sb-hover',
      focusWithin: '.sb-focus',
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55088-5327',
    },
  },
};
