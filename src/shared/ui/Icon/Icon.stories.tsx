import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';
import { Icon } from './Icon';
import type { IconVariant, IconSize } from './Icon.types';
import { iconLoaders } from './iconMap';

const allVariants = Object.keys(iconLoaders) as IconVariant[];

const figma16Only: IconVariant[] = [
  'editMicro',
  'tickMicro',
  'markerTools',
  'symbolLogo',
];

const figma12Only: IconVariant[] = ['chevronDownMicro', 'chevronRightMicro'];

const customIcons: IconVariant[] = [
  'activityOutline',
  'docOutline',
  'gridSmall',
  'lineChartOutline',
  'mapFill',
  'newsWidget',
  'sortDown',
  'sortUp',
  'targetWithArrow',
  'textListSmall',
  'tickCircle',
  'userRound',
];

const nonMainSet = new Set([...figma16Only, ...figma12Only, ...customIcons]);
const figmaMainIcons = allVariants.filter((v) => !nonMainSet.has(v));

const meta: Meta<typeof Icon> = {
  title: 'UI/Icon',
  component: Icon,
  tags: ['autodocs'],

  argTypes: {
    variant: {
      control: 'select',
      options: allVariants,
      description: 'Тип иконки',
    },
    size: {
      control: 'select',
      options: [12, 16, 20, 24] satisfies IconSize[],
      description: 'Размер иконки в пикселях',
      table: { defaultValue: { summary: '24' } },
    },
    className: { control: 'text' },
  },

  args: {
    variant: 'edit',
    size: 24,
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Size12: Story = {
  args: { size: 12 },
};

export const Size16: Story = {
  args: { size: 16 },
};

export const Size20: Story = {
  args: { size: 20 },
};

export const Size24: Story = {
  args: { size: 24 },
};

interface IconCardProps {
  variant: IconVariant;
  size: number;
  copied: string | null;
  onCopy: (variant: string) => void;
}

const IconCard = ({ variant, size, copied, onCopy }: IconCardProps) => (
  <div
    key={variant}
    onClick={() => onCopy(variant)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onCopy(variant)}
    title={`Click to copy "${variant}"`}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      padding: '10px 4px',
      borderRadius: 8,
      border: '1px solid transparent',
      cursor: 'pointer',
      transition: 'background 0.15s, border-color 0.15s',
      background: copied === variant ? '#e8f5e9' : undefined,
      borderColor: copied === variant ? '#81c784' : undefined,
    }}
    onMouseEnter={(e) => {
      if (copied !== variant) {
        e.currentTarget.style.background = '#f5f5f5';
        e.currentTarget.style.borderColor = '#ddd';
      }
    }}
    onMouseLeave={(e) => {
      if (copied !== variant) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }
    }}
  >
    <Icon variant={variant} size={size} />
    <span
      style={{
        fontSize: 10,
        color: copied === variant ? '#2e7d32' : 'var(--text-secondary, #666)',
        textAlign: 'center',
        wordBreak: 'break-word',
        lineHeight: '1.3',
      }}
    >
      {copied === variant ? 'Copied!' : variant}
    </span>
  </div>
);

const IconGallery = () => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (variant: string) => {
    navigator.clipboard.writeText(variant);
    setCopied(variant);
    setTimeout(() => setCopied(null), 1500);
  };

  const filterIcons = (icons: IconVariant[]) =>
    icons.filter((v) => v.toLowerCase().includes(search.toLowerCase()));

  const filteredFigmaMain = filterIcons(figmaMainIcons);
  const filteredFigma16 = filterIcons(figma16Only);
  const filteredFigma12 = filterIcons(figma12Only);
  const filteredCustom = filterIcons(customIcons);
  const totalFiltered =
    filteredFigmaMain.length +
    filteredFigma16.length +
    filteredFigma12.length +
    filteredCustom.length;

  const gridStyle = {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: 12,
  };

  const headingStyle = {
    fontSize: 14,
    fontWeight: 600 as const,
    margin: '16px 0 8px',
    color: 'var(--text-primary, #333)',
  };

  return (
    <div style={{ width: '100%', maxWidth: 900 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск иконки..."
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: 14,
            flex: 1,
            maxWidth: 300,
            outline: 'none',
          }}
        />
        <span style={{ fontSize: 13, color: '#888' }}>
          {totalFiltered} / {allVariants.length}
        </span>
      </div>

      {filteredFigmaMain.length > 0 && (
        <>
          <h3 style={headingStyle}>
            Figma — Для 24, 20, 16, 12 размера ({filteredFigmaMain.length})
          </h3>
          <div style={gridStyle}>
            {filteredFigmaMain.map((variant) => (
              <IconCard
                key={variant}
                variant={variant}
                size={24}
                copied={copied}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </>
      )}

      {filteredFigma16.length > 0 && (
        <>
          <h3 style={{ ...headingStyle, margin: '24px 0 8px' }}>
            Figma — Только для 16 размера ({filteredFigma16.length})
          </h3>
          <div style={gridStyle}>
            {filteredFigma16.map((variant) => (
              <IconCard
                key={variant}
                variant={variant}
                size={16}
                copied={copied}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </>
      )}

      {filteredFigma12.length > 0 && (
        <>
          <h3 style={{ ...headingStyle, margin: '24px 0 8px' }}>
            Figma — Только для 12 размера ({filteredFigma12.length})
          </h3>
          <div style={gridStyle}>
            {filteredFigma12.map((variant) => (
              <IconCard
                key={variant}
                variant={variant}
                size={12}
                copied={copied}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </>
      )}

      {filteredCustom.length > 0 && (
        <>
          <h3 style={{ ...headingStyle, margin: '24px 0 8px' }}>
            Custom ({filteredCustom.length})
          </h3>
          <div style={gridStyle}>
            {filteredCustom.map((variant) => (
              <IconCard
                key={variant}
                variant={variant}
                size={24}
                copied={copied}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/** Gallery of all icons grouped by Figma / Custom with search */
export const Gallery: Story = {
  render: () => <IconGallery />,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
  },
};

/** All sizes for a single icon */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      {([12, 16, 20, 24] as IconSize[]).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon variant="edit" size={size} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary, #888)' }}>
            {size}px
          </span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
