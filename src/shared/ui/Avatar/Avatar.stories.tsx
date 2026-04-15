import type { Meta, StoryObj } from '@storybook/nextjs';
import Avatar from '@/shared/ui/Avatar';
import type { AvatarSizePreset } from '@/shared/ui/Avatar';

/* ───────── Meta ───────── */

const SAMPLE_IMAGE = 'https://i.pravatar.cc/150?u=avatar-storybook';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],

  argTypes: {
    src: {
      control: 'text',
      description: 'Image URL. Falls back to initials on error.',
    },
    name: {
      control: 'text',
      description: 'User name (used to derive initials)',
    },
    initials: {
      control: 'text',
      description: 'Explicit initials override (max 2 chars)',
    },
    size: {
      control: 'select',
      options: ['XL', 'L', 'M', 'S'] satisfies AvatarSizePreset[],
      description:
        'Size: XL=104px, L=72px, M=48px, S=32px, or any custom number (px)',
      table: { defaultValue: { summary: 'M' } },
    },
    alt: { control: 'text' },
    className: { control: 'text' },
  },

  args: {
    size: 'M',
    name: 'John Doe',
  },

  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/vD3NeVE8xWvwznKqp3k2Iz/LIMEX-Design-System?node-id=55086-5323&m=dev',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Basic stories ───────── */

export const Default: Story = {};

export const WithImage: Story = {
  args: { src: SAMPLE_IMAGE, name: 'John Doe' },
};

export const WithInitials: Story = {
  args: { initials: 'AB' },
};

export const BrokenImage: Story = {
  args: { src: 'https://invalid.url/broken.jpg', name: 'Jane Smith' },
};

export const EmptyPlaceholder: Story = {
  args: { name: undefined, initials: undefined, src: undefined },
};

export const SingleName: Story = {
  args: { name: 'John' },
};

/* ───────── Size stories ───────── */

export const SizeXL: Story = {
  args: { size: 'XL', name: 'Alex Brown' },
};

export const SizeL: Story = {
  args: { size: 'L', name: 'Alex Brown' },
};

export const SizeM: Story = {
  args: { size: 'M', name: 'Alex Brown' },
};

export const SizeS: Story = {
  args: { size: 'S', name: 'Alex Brown' },
};

/* ───────── Showcase ───────── */

const sizes: AvatarSizePreset[] = ['XL', 'L', 'M', 'S'];

export const AllSizesPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Avatar size={size} name="John Doe" />
          <Avatar size={size} />
          <span style={{ fontSize: 10, color: '#aaa' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const AllSizesImage: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Avatar
            size={size}
            src={`https://i.pravatar.cc/150?u=${size}`}
            name="John Doe"
          />
          <span style={{ fontSize: 10, color: '#aaa' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const CustomSize20px: Story = {
  args: { size: 20, name: 'John Doe' },
};

export const CustomSize64px: Story = {
  args: { size: 64, name: 'John Doe' },
};

export const ImageVsPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Avatar size="L" src={SAMPLE_IMAGE} name="John Doe" />
        <span style={{ fontSize: 10, color: '#aaa' }}>Image</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Avatar size="L" name="John Doe" />
        <span style={{ fontSize: 10, color: '#aaa' }}>Placeholder</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Avatar size="L" />
        <span style={{ fontSize: 10, color: '#aaa' }}>Empty</span>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
