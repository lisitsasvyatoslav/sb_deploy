import type { Meta, StoryObj } from '@storybook/nextjs';

import { useState } from 'react';

import { IconCountryFlag } from './IconCountryFlag';
import type {
  IconCountryFlagSize,
  IconCountryFlagVariant,
} from './IconCountryFlag.types';
import { flagLoaders } from './countryFlagMap';

const allVariants = Object.keys(flagLoaders) as IconCountryFlagVariant[];

const meta: Meta<typeof IconCountryFlag> = {
  title: 'UI/IconCountryFlag',
  component: IconCountryFlag,
  tags: ['autodocs'],

  argTypes: {
    variant: {
      control: 'select',
      options: allVariants,
      description: 'Country flag variant',
    },
    size: {
      control: 'select',
      options: [16, 20, 24, 32] satisfies IconCountryFlagSize[],
      description: 'Flag size in pixels',
      table: { defaultValue: { summary: '24' } },
    },
    className: { control: 'text' },
  },

  args: {
    variant: 'russia',
    size: 24,
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

interface FlagCardProps {
  variant: IconCountryFlagVariant;
  size: number;
  copied: string | null;
  onCopy: (variant: string) => void;
}

const FlagCard = ({ variant, size, copied, onCopy }: FlagCardProps) => (
  <div
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
    <IconCountryFlag variant={variant} size={size} />
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

const FlagGallery = () => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (variant: string) => {
    navigator.clipboard.writeText(variant);
    setCopied(variant);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = allVariants.filter((v) =>
    v.toLowerCase().includes(search.toLowerCase())
  );

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
          placeholder="Search flags..."
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
          {filtered.length} / {allVariants.length}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((variant) => (
          <FlagCard
            key={variant}
            variant={variant}
            size={24}
            copied={copied}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
};

/** Gallery of all country flags with search */
export const Gallery: Story = {
  render: () => <FlagGallery />,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
  },
};

/** All sizes for a single flag */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      {([16, 20, 24, 32] as IconCountryFlagSize[]).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <IconCountryFlag variant="russia" size={size} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary, #888)' }}>
            {size}px
          </span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
