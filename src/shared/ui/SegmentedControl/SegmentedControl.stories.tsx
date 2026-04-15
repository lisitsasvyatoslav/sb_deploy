import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import SegmentedControl from '@/shared/ui/SegmentedControl';
import type {
  SegmentedControlProps,
  SegmentedControlSize,
  SegmentedControlVariant,
  SegmentedControlWidth,
  Segment,
} from '@/shared/ui/SegmentedControl';
import { Icon } from '@/shared/ui/Icon';

/* ───────── Sample data ───────── */

const loginSignupSegments: Segment[] = [
  { label: 'Вход', value: 'login' },
  { label: 'Регистрация', value: 'signup' },
];

const threeSegments: Segment[] = [
  { label: 'День', value: 'day' },
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
];

const fourSegments: Segment[] = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
];

const longLabelSegments: Segment[] = [
  { label: 'Краткосрочные сделки', value: 'short' },
  { label: 'Среднесрочные инвестиции', value: 'medium' },
  { label: 'Долгосрочный портфель', value: 'long' },
];

const segmentsWithCounters: Segment[] = [
  { label: 'Открытые', value: 'open', counter: 12 },
  { label: 'Закрытые', value: 'closed', counter: 48 },
  { label: 'Все', value: 'all', counter: 60 },
];

const DemoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const segmentsWithIcons: Segment[] = [
  { label: 'Покупка', value: 'buy', icon: <DemoIcon /> },
  { label: 'Продажа', value: 'sell', icon: <DemoIcon /> },
];

const segmentsWithIconsAndCounters: Segment[] = [
  { label: 'Открытые', value: 'open', icon: <DemoIcon />, counter: 5 },
  { label: 'Закрытые', value: 'closed', icon: <DemoIcon />, counter: 23 },
];

/* ───────── Stateful wrapper ───────── */

/** Обёртка с собственным state — каждый экземпляр интерактивен */
const Stateful = (props: SegmentedControlProps) => {
  const [val, setVal] = useState(props.value);
  return <SegmentedControl {...props} value={val} onChange={setVal} />;
};

/* ───────── Meta ───────── */

const meta: Meta<typeof SegmentedControl> = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],

  argTypes: {
    segments: { table: { disable: true } },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    className: { control: 'text' },
    size: {
      control: 'radio',
      options: ['M', 'L'] satisfies SegmentedControlSize[],
      description: 'Размер: M (compact) или L (large)',
      table: { defaultValue: { summary: 'M' } },
    },
    variant: {
      control: 'select',
      options: [
        'mono',
        'surface',
        'inverse',
      ] satisfies SegmentedControlVariant[],
      description: 'Визуальный вариант',
      table: { defaultValue: { summary: 'mono' } },
    },
    widthType: {
      control: 'radio',
      options: ['fixed', 'content'] satisfies SegmentedControlWidth[],
      description: 'fixed — равная ширина, content — по содержимому',
      table: { defaultValue: { summary: 'fixed' } },
    },
  },

  args: {
    segments: loginSignupSegments,
    value: 'login',
    size: 'M',
    variant: 'mono',
    widthType: 'fixed',
  },

  /** Все args-based stories интерактивны по умолчанию */
  render: (args) => {
    const [val, setVal] = useState(args.value);
    return <SegmentedControl {...args} value={val} onChange={setVal} />;
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55088-5326',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Shared decorator ───────── */

const wrap360 = (Story: React.ComponentType) => (
  <div style={{ width: 360 }}>
    <Story />
  </div>
);

/* ───────── Basic stories ───────── */

export const Default: Story = { decorators: [wrap360] };

export const SizeL: Story = {
  args: { size: 'L' },
  decorators: [wrap360],
};

export const VariantSurface: Story = {
  args: { variant: 'surface' },
  decorators: [wrap360],
};

export const VariantInverse: Story = {
  args: { variant: 'inverse' },
  decorators: [wrap360],
};

export const WidthContent: Story = {
  args: { widthType: 'content' },
  decorators: [wrap360],
};

export const ThreeSegments: Story = {
  args: { segments: threeSegments, value: 'day' },
  decorators: [wrap360],
};

export const FourSegments: Story = {
  args: { segments: fourSegments, value: '1d' },
  decorators: [wrap360],
};

export const LongLabels: Story = {
  args: { segments: longLabelSegments, value: 'short', widthType: 'content' },
  decorators: [wrap360],
};

/* ───────── Icon & Counter stories ───────── */

export const WithIcons: Story = {
  args: { segments: segmentsWithIcons, value: 'buy' },
  decorators: [wrap360],
};

export const WithCounters: Story = {
  args: { segments: segmentsWithCounters, value: 'open' },
  decorators: [wrap360],
};

export const WithIconsAndCounters: Story = {
  args: { segments: segmentsWithIconsAndCounters, value: 'open' },
  decorators: [wrap360],
};

/* ───────── Interactive with label ───────── */

/** Интерактивный пример с отображением выбранного значения */
export const Interactive: Story = {
  render: (args) => {
    const [val, setVal] = useState(args.segments[0]?.value ?? 'login');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: 360,
        }}
      >
        <SegmentedControl
          {...args}
          segments={args.segments ?? loginSignupSegments}
          value={val}
          onChange={setVal}
        />
        <div style={{ fontSize: 13, color: 'var(--text-secondary, #888)' }}>
          Выбрано: <strong>{val}</strong>
        </div>
      </div>
    );
  },
};

/* ───────── Showcase: All States ───────── */

const sizes: SegmentedControlSize[] = ['M', 'L'];
const variants: SegmentedControlVariant[] = ['mono', 'surface', 'inverse'];
const widthTypes: SegmentedControlWidth[] = ['fixed', 'content'];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: '#888',
    }}
  >
    {children}
  </span>
);

/** Матрица всех Size × Variant × Width комбинаций (каждый элемент интерактивен) */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {sizes.map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            Size {size}
          </h3>

          {variants.map((variant) => (
            <div
              key={variant}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <SectionLabel>{variant}</SectionLabel>

              <div
                style={{
                  display: 'flex',
                  gap: 24,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                {widthTypes.map((wt) => (
                  <div
                    key={wt}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <span style={{ fontSize: 10, color: '#aaa' }}>
                      width: {wt}
                    </span>
                    <div style={{ width: wt === 'fixed' ? 280 : undefined }}>
                      <Stateful
                        size={size}
                        variant={variant}
                        widthType={wt}
                        segments={loginSignupSegments}
                        value="login"
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 3 segments */}
              <div
                style={{
                  display: 'flex',
                  gap: 24,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                {widthTypes.map((wt) => (
                  <div
                    key={wt}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <span style={{ fontSize: 10, color: '#aaa' }}>
                      3 tabs / {wt}
                    </span>
                    <div style={{ width: wt === 'fixed' ? 360 : undefined }}>
                      <Stateful
                        size={size}
                        variant={variant}
                        widthType={wt}
                        segments={threeSegments}
                        value="day"
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'padded' },
};

/** Все варианты с иконками и каунтерами (каждый элемент интерактивен) */
export const AllFeatures: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {sizes.map((size) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            Size {size}
          </h3>

          {variants.map((variant) => (
            <div
              key={variant}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <SectionLabel>{variant}</SectionLabel>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* With icons */}
                <div style={{ width: 320 }}>
                  <Stateful
                    size={size}
                    variant={variant}
                    segments={segmentsWithIcons}
                    value="buy"
                    onChange={() => {}}
                  />
                </div>

                {/* With counters */}
                <div style={{ width: 360 }}>
                  <Stateful
                    size={size}
                    variant={variant}
                    segments={segmentsWithCounters}
                    value="open"
                    onChange={() => {}}
                  />
                </div>

                {/* With icons + counters */}
                <div style={{ width: 360 }}>
                  <Stateful
                    size={size}
                    variant={variant}
                    segments={segmentsWithIconsAndCounters}
                    value="open"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'padded' },
};

/* ───────── Contextual examples ───────── */

/** Пример в карточке авторизации */
export const InAuthCard: Story = {
  render: () => {
    const [tab, setTab] = useState('login');
    return (
      <div
        style={{
          width: 360,
          padding: 24,
          background: 'var(--bg-card, #fff)',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <SegmentedControl
          segments={loginSignupSegments}
          value={tab}
          onChange={setTab}
        />
        <div
          style={{
            marginTop: 24,
            padding: 16,
            textAlign: 'center',
            color: 'var(--text-secondary, #888)',
          }}
        >
          Форма: {tab === 'login' ? 'Вход' : 'Регистрация'}
        </div>
      </div>
    );
  },
  parameters: { layout: 'centered', controls: { disable: true } },
};

/* ───────── Figma Reference ───────── */

const figmaSegments: Segment[] = [
  {
    label: 'Первый',
    value: 'first',
    icon: <Icon variant="placeHolder" size={20} />,
    counter: 1,
  },
  {
    label: 'Второй',
    value: 'second',
    icon: <Icon variant="placeHolder" size={20} />,
    counter: 1,
  },
];

const figmaVariants: SegmentedControlVariant[] = ['mono', 'surface', 'inverse'];
const figmaSizes: SegmentedControlSize[] = ['M', 'L'];

/** Panel with explicit data-theme for full isolation from Storybook global theme */
const FigmaPanel = ({ theme }: { theme: 'light' | 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>
        {isDark ? 'darkTheme' : 'lightTheme'}
      </span>
      <div
        data-theme={theme}
        style={{
          background: isDark ? '#040405' : '#FFFFFF',
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          borderRadius: 8,
        }}
      >
        {figmaVariants.map((variant) => (
          <div
            key={variant}
            style={{ display: 'flex', gap: 32, alignItems: 'center' }}
          >
            {figmaSizes.map((size) => (
              <Stateful
                key={size}
                size={size}
                variant={variant}
                widthType="content"
                segments={figmaSegments}
                value="first"
                onChange={() => {}}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Figma reference: lightTheme + darkTheme, 3 варианта × 2 размера. */
export const FigmaReference: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FigmaPanel theme="light" />
      <FigmaPanel theme="dark" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    layout: 'padded',
  },
};
