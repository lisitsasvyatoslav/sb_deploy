import React, { useRef, useState } from 'react';
import { useStripDarkTheme } from '@/shared/ui/_storybook/useStripDarkTheme';
import type { Meta, StoryObj } from '@storybook/nextjs';
import CardControls from '@/shared/ui/CardControls';
import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';

const meta: Meta<typeof CardControls> = {
  title: 'UI/CardControls',
  component: CardControls,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['card', 'modal', 'fullscreen'] },
    label: { control: 'text' },
    labelColor: { control: 'color' },
    ticker: { control: 'text' },
    tickerLogo: { control: 'text' },
    time: { control: 'text' },
  },
  args: {
    mode: 'card',
    label: 'Label',
    ticker: 'VTBR',
    time: '14:23',
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

/* ───────── Basic stories ───────── */

export const CardMode: Story = {};

export const ModalMode: Story = {
  args: {
    mode: 'modal',
    label: 'Label',
    labelColor: '#7863F6',
    onMore: () => console.log('more'),
    onExpand: () => console.log('expand'),
    onClose: () => console.log('close'),
  },
};

export const FullscreenMode: Story = {
  args: {
    mode: 'fullscreen',
    label: 'Label',
    labelColor: '#7863F6',
    onMore: () => console.log('more'),
    onExpand: () => console.log('collapse'),
    onClose: () => console.log('close'),
  },
};

/* ───────── Editable Label demos ───────── */

function EditableLabelDemo({
  color,
  label,
}: {
  color?: string;
  label: string;
}) {
  const [value, setValue] = useState(label);
  return (
    <CardControls
      mode="modal"
      editableLabel={{
        value,
        onChange: setValue,
        onConfirm: () => console.log('confirmed:', value),
        placeholder: 'Untitled',
        color,
      }}
      time="14:23"
      onMore={() => {}}
      onExpand={() => {}}
      onClose={() => {}}
    />
  );
}

export const EditableLabelBlue: Story = {
  render: () => <EditableLabelDemo color="#7863F6" label="Blue label" />,
};

export const EditableLabelLime: Story = {
  render: () => <EditableLabelDemo color="#A9DC4D" label="Lime label" />,
};

export const EditableLabelContrast: Story = {
  render: () => <EditableLabelDemo color="#040405" label="Contrast label" />,
};

export const EditableLabelNoColor: Story = {
  render: () => <EditableLabelDemo label="No color label" />,
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

function ColorRow({ color, name }: { color?: string; name: string }) {
  const [value, setValue] = useState(name);
  const [currentColor, setCurrentColor] = useState(color);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28 }}>
      <span style={{ fontSize: 11, color: '#888', width: 64, flexShrink: 0 }}>
        {name}
      </span>
      <CardControls
        mode="modal"
        editableLabel={{
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
    </div>
  );
}

function AllVariantsDemo() {
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
              <ColorRow key={name} color={hex} name={name} />
            ))}
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
