import type { Meta, StoryObj } from '@storybook/nextjs';
import { Icon } from '@/shared/ui/Icon';
import BaseImage from '@/shared/ui/BaseImage';

/* ───────── Meta ───────── */

const SAMPLE_IMAGE = 'https://i.pravatar.cc/300?u=loadable-image';
const BROKEN_IMAGE = 'https://invalid.url/broken.jpg';

const meta: Meta<typeof BaseImage> = {
  title: 'UI/BaseImage',
  component: BaseImage,
  tags: ['autodocs'],

  argTypes: {
    src: { control: 'text', description: 'Image URL' },
    alt: { control: 'text' },
    placeholder: {
      control: 'select',
      options: ['none', 'skeleton'],
      mapping: { none: undefined, skeleton: 'skeleton' },
      description: '"skeleton" for pulse animation, or custom ReactNode',
      table: { defaultValue: { summary: 'undefined' } },
    },
    optimized: {
      control: 'boolean',
      description: 'Use next/image for optimization',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { control: 'text' },
  },

  args: {
    src: SAMPLE_IMAGE,
    alt: 'Sample avatar',
    optimized: false,
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

/* ───────── Basic stories ───────── */

export const Default: Story = {
  args: {
    className: 'w-24 h-24 rounded-full object-cover',
  },
};

export const WithSkeletonPlaceholder: Story = {
  args: {
    src: SAMPLE_IMAGE,
    placeholder: 'skeleton',
    className: 'w-48 h-32 rounded-lg object-cover',
  },
};

export const WithFallback: Story = {
  args: {
    src: BROKEN_IMAGE,
    fallback: (
      <Icon variant="placeHolder" size={32} className="text-black-a32" />
    ),
    className: 'w-24 h-24 rounded-full object-cover',
  },
};

export const BrokenNoFallback: Story = {
  args: {
    src: BROKEN_IMAGE,
    className: 'w-24 h-24 rounded-full object-cover',
  },
};

/* ───────── Showcase ───────── */

const Label = ({ children }: { children: React.ReactNode }) => (
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

export const AllModes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ width: 96, height: 96 }}>
          <BaseImage
            src={SAMPLE_IMAGE}
            alt="Default"
            optimized={false}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <Label>Default</Label>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ width: 96, height: 96 }}>
          <BaseImage
            src={SAMPLE_IMAGE}
            alt="Skeleton"
            optimized={false}
            placeholder="skeleton"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <Label>Skeleton</Label>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ width: 96, height: 96 }}>
          <BaseImage
            src={BROKEN_IMAGE}
            alt="Fallback"
            optimized={false}
            fallback={
              <Icon
                variant="placeHolder"
                size={32}
                className="text-black-a32"
              />
            }
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <Label>Fallback</Label>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ width: 96, height: 96 }}>
          <BaseImage
            src={BROKEN_IMAGE}
            alt="Broken"
            optimized={false}
            placeholder="skeleton"
            fallback={
              <Icon
                variant="placeHolder"
                size={32}
                className="text-black-a32"
              />
            }
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <Label>Skeleton + Fallback</Label>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const Rectangular: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <BaseImage
          src="https://picsum.photos/seed/a/320/180"
          alt="Card image"
          optimized={false}
          placeholder="skeleton"
          className="w-80 h-[180px] rounded-lg object-cover"
        />
        <Label>With skeleton</Label>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <BaseImage
          src={BROKEN_IMAGE}
          alt="Card broken"
          optimized={false}
          placeholder="skeleton"
          fallback={
            <div className="flex flex-col items-center gap-1 text-black-a32">
              <Icon variant="image" size={24} />
              <span className="text-xs">No image</span>
            </div>
          }
          className="w-80 h-[180px] rounded-lg object-cover"
        />
        <Label>With fallback</Label>
      </div>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
