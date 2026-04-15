import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Logo, LimexLogo, FinamXLogo, FinamProductLogo } from '.';

/* ───────── Brand wrappers ───────────────────────────────────────────────────
 * In Storybook, data-brand is set to "lime" globally (preview.tsx).
 * FinamX and Finam product logos need [data-brand="finam"] to get the correct
 * brand-primary purple. The wrapper overrides the CSS custom property for its
 * subtree; data-theme continues to cascade from <html>.
 * ─────────────────────────────────────────────────────────────────────────── */
const FinamBrand = ({ children }: { children: React.ReactNode }) => (
  <div data-brand="finam" style={{ display: 'inline-flex' }}>
    {children}
  </div>
);

/* ───────── Meta ───────── */

const meta: Meta<typeof Logo> = {
  title: 'UI/Logo',
  component: Logo,
  tags: ['autodocs'],

  argTypes: {
    isCollapsed: {
      control: 'boolean',
      description:
        'Icon-only mode (mini, 28×24px). Default: false (full logo, 92×24px).',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { control: 'text' },
  },

  args: {
    isCollapsed: false,
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55322-11931&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Logo (region-aware sidebar wrapper) ───────── */

export const Default: Story = {};

export const Collapsed: Story = {
  args: { isCollapsed: true },
};

/* ───────── LimexLogo ───────── */

export const LimexFull: Story = {
  render: (args) => <LimexLogo {...args} />,
};

export const LimexCollapsed: Story = {
  render: (args) => <LimexLogo {...args} />,
  args: { isCollapsed: true },
};

/* ───────── FinamXLogo ───────── */

export const FinamXFull: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamXLogo {...args} />
    </FinamBrand>
  ),
};

export const FinamXCollapsed: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamXLogo {...args} />
    </FinamBrand>
  ),
  args: { isCollapsed: true },
};

/* ───────── FinamProductLogo ───────── */

export const FinamDiaryFull: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamProductLogo variant="finam-diary" isCollapsed={args.isCollapsed} />
    </FinamBrand>
  ),
};

export const FinamDiaryCollapsed: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamProductLogo variant="finam-diary" isCollapsed={args.isCollapsed} />
    </FinamBrand>
  ),
  args: { isCollapsed: true },
};

export const FinamDnevnikFull: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamProductLogo
        variant="finam-dnevnik"
        isCollapsed={args.isCollapsed}
      />
    </FinamBrand>
  ),
};

export const FinamSpaceFull: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamProductLogo variant="finam-space" isCollapsed={args.isCollapsed} />
    </FinamBrand>
  ),
};

export const FinamDnevnikCollapsed: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamProductLogo
        variant="finam-dnevnik"
        isCollapsed={args.isCollapsed}
      />
    </FinamBrand>
  ),
  args: { isCollapsed: true },
};

export const FinamSpaceCollapsed: Story = {
  render: (args) => (
    <FinamBrand>
      <FinamProductLogo variant="finam-space" isCollapsed={args.isCollapsed} />
    </FinamBrand>
  ),
  args: { isCollapsed: true },
};

/* ───────── All variants showcase ───────── */

const label = (text: string) => (
  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
    {text}
  </div>
);

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr',
        gap: '16px 32px',
        alignItems: 'center',
      }}
    >
      {label('component')}
      {label('full')}
      {label('collapsed')}

      {/* Lime brand */}
      {label('LimexLogo')}
      <LimexLogo />
      <LimexLogo isCollapsed />

      {/* Finam brand */}
      {label('FinamXLogo')}
      <FinamBrand>
        <FinamXLogo />
      </FinamBrand>
      <FinamBrand>
        <FinamXLogo isCollapsed />
      </FinamBrand>

      {label('FinamProductLogo / finam-diary')}
      <FinamBrand>
        <FinamProductLogo variant="finam-diary" />
      </FinamBrand>
      <FinamBrand>
        <FinamProductLogo variant="finam-diary" isCollapsed />
      </FinamBrand>

      {label('FinamProductLogo / finam-dnevnik')}
      <FinamBrand>
        <FinamProductLogo variant="finam-dnevnik" />
      </FinamBrand>
      <FinamBrand>
        <FinamProductLogo variant="finam-dnevnik" isCollapsed />
      </FinamBrand>

      {label('FinamProductLogo / finam-space')}
      <FinamBrand>
        <FinamProductLogo variant="finam-space" />
      </FinamBrand>
      <FinamBrand>
        <FinamProductLogo variant="finam-space" isCollapsed />
      </FinamBrand>
    </div>
  ),
};
