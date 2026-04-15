import React, { useRef, useState } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { InputBadge, InputBadgeEditable } from '@/shared/ui/InputBadge';
import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';

/* ───────── InputBadge (static) ───────── */

const meta: Meta<typeof InputBadge> = {
  title: 'UI/InputBadge',
  component: InputBadge,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    labelColor: { control: 'color' },
  },
  args: {
    label: 'Label',
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=60732-10057',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithColor: Story = {
  args: {
    label: 'Blue label',
    labelColor: '#7863F6',
  },
};

export const ContrastColor: Story = {
  args: {
    label: 'Contrast label',
    labelColor: '#040405',
  },
};

export const LightColor: Story = {
  args: {
    label: 'Lime label',
    labelColor: '#A9DC4D',
  },
};

export const LongText: Story = {
  args: {
    label: 'Very long label text that should truncate with ellipsis',
    labelColor: '#7863F6',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 200 }}>
        <Story />
      </div>
    ),
  ],
};

/* ───────── InputBadgeEditable ───────── */

function EditableDemo({ color, label }: { color?: string; label: string }) {
  const [value, setValue] = useState(label);
  const [currentColor, setCurrentColor] = useState(color);
  return (
    <InputBadgeEditable
      config={{
        value,
        onChange: setValue,
        onConfirm: () => console.log('confirmed:', value),
        placeholder: 'Untitled',
        color: currentColor,
      }}
      colorWidget={
        <SelectColorWidget
          currentColor={currentColor || '#F2F2F7'}
          onColorChange={setCurrentColor}
        />
      }
    />
  );
}

export const EditableBlue: Story = {
  render: () => <EditableDemo color="#7863F6" label="Blue label" />,
};

export const EditableLime: Story = {
  render: () => <EditableDemo color="#A9DC4D" label="Lime label" />,
};

export const EditableContrast: Story = {
  render: () => <EditableDemo color="#040405" label="Contrast label" />,
};

export const EditableNoColor: Story = {
  render: () => <EditableDemo label="No color label" />,
};

/* ───────── All Variants (light + dark side by side) ───────── */

const DEMO_COLORS = [
  { name: 'Blue', hex: '#7863F6' },
  { name: 'Purple', hex: '#A463F6' },
  { name: 'Pink', hex: '#F663C2' },
  { name: 'Red', hex: '#FF4747' },
  { name: 'Orange', hex: '#FF9B42' },
  { name: 'Yellow', hex: '#FFD43B' },
  { name: 'Green', hex: '#11C516' },
  { name: 'Lime', hex: '#A9DC4D' },
  { name: 'Cyan', hex: '#3CC8E3' },
  { name: 'Brown', hex: '#A5734A' },
  { name: 'Contrast', hex: '#040405' },
  { name: 'No color', hex: undefined },
];

function ColorRow({
  color,
  name,
  editable,
}: {
  color?: string;
  name: string;
  editable?: boolean;
}) {
  const [value, setValue] = useState(name);
  const [currentColor, setCurrentColor] = useState(color);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28 }}>
      <span style={{ fontSize: 11, color: '#888', width: 64, flexShrink: 0 }}>
        {name}
      </span>
      {editable ? (
        <InputBadgeEditable
          config={{
            value,
            onChange: setValue,
            onConfirm: () => {},
            placeholder: 'Untitled',
            color: currentColor,
          }}
          colorWidget={
            <SelectColorWidget
              currentColor={currentColor || '#F2F2F7'}
              onColorChange={setCurrentColor}
            />
          }
        />
      ) : (
        <InputBadge label={name} labelColor={color} />
      )}
    </div>
  );
}

function AllVariantsDemo({ editable }: { editable?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useStripDarkTheme(wrapperRef);

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
              background: theme === 'dark' ? '#040405' : '#FFFFFF',
              padding: '16px 24px',
              minWidth: 340,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {DEMO_COLORS.map(({ name, hex }) => (
              <ColorRow
                key={name}
                color={hex}
                name={name}
                editable={editable}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const AllStaticVariants: Story = {
  render: () => <AllVariantsDemo />,
  parameters: { controls: { disable: true } },
};

export const AllEditableVariants: Story = {
  render: () => <AllVariantsDemo editable />,
  parameters: { controls: { disable: true } },
};
