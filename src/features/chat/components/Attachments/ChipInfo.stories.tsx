import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import ChipInfo from './ChipInfo';

const meta: Meta<typeof ChipInfo> = {
  title: 'Chat/ChipInfo',
  component: ChipInfo,
  tags: ['autodocs'],
  args: {
    title: 'YDEX',
    date: '12 мар 2026',
    info: '3 245,50 ₽',
    time: '14:30',
    onRemove: fn(),
    onClick: fn(),
  },
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=56218-6611&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLogo: Story = {
  args: {
    title: 'Яндекс',
    date: '12 мар 2026',
    info: '3 245,50 ₽',
    time: '14:30',
    logo: (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#FC3F1D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        Я
      </div>
    ),
  },
};

export const WithoutPrice: Story = {
  args: {
    title: 'Отчёт за Q4 2025',
    date: '10 мар 2026',
    info: undefined,
    time: undefined,
  },
};

export const NotRemovable: Story = {
  args: {
    title: 'SBER',
    date: '11 мар 2026',
    info: '285,10 ₽',
    time: '10:15',
    onRemove: undefined,
  },
};

export const MultipleItems: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <ChipInfo
        title="YDEX"
        date="12 мар 2026"
        info="3 245,50 ₽"
        time="14:30"
        onRemove={fn()}
      />
      <ChipInfo
        title="SBER"
        date="11 мар 2026"
        info="285,10 ₽"
        time="10:15"
        onRemove={fn()}
      />
      <ChipInfo
        title="LKOH"
        date="10 мар 2026"
        info="6 890,00 ₽"
        time="09:45"
        onRemove={fn()}
      />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
