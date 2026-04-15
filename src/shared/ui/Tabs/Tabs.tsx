/**
 * Segment Control (Tabs) Component
 *
 * @description Redesigned tabs component matching Figma segmentedControl design system
 * @task TD-696
 *
 * @example
 * // Basic usage (3 tabs, default style)
 * <Tabs
 *   tabs={[
 *     { label: 'Новости', value: 'news' },
 *     { label: 'Фундаментал', value: 'fundamental' },
 *     { label: 'Теханализ', value: 'techanalysis' }
 *   ]}
 *   value={activeTab}
 *   onChange={setActiveTab}
 * />
 *
 * @example
 * // Large size with dark theme
 * <Tabs
 *   tabs={tabs}
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   size="L"
 *   variant="inverse"
 * />
 *
 * @example
 * // Mono variant with border
 * <Tabs
 *   tabs={tabs}
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   variant="mono"
 * />
 *
 * @example
 * // Pill style with auto width
 * <Tabs
 *   tabs={[
 *     { label: 'Покупка', value: 'buy' },
 *     { label: 'Продажа', value: 'sell' }
 *   ]}
 *   value={tradeType}
 *   onChange={setTradeType}
 *   pill
 *   widthType="content"
 * />
 */

import React from 'react';

const TAB_ACTIVE_SHADOW = 'shadow-dropdown';

interface Tab {
  label: string;
  value: string;
  disabled?: boolean;
}

type SegmentSize = 'M' | 'L';
type SegmentVariant = 'surface' | 'inverse' | 'mono';
type SegmentWidth = 'content' | 'fixed';

interface TabsProps {
  /** Array of tab items */
  tabs: Tab[];
  /** Currently active tab value */
  value: string;
  /** Callback when tab is clicked */
  onChange: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Size variant: M (default) or L */
  size?: SegmentSize;
  /** Theme variant: surface (light), inverse (dark), or mono (monochrome) */
  variant?: SegmentVariant;
  /** Width type: fixed (equal width) or content (auto width) */
  widthType?: SegmentWidth;
  /** Enable pill style with fully rounded buttons */
  pill?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  className = '',
  size = 'M',
  variant = 'surface',
  widthType = 'fixed',
  pill = false,
}) => {
  // Size styles
  const sizeStyles = {
    M: {
      container: 'p-1',
      button: 'px-4 py-2 text-14 leading-20 tracking-[-0.056px]',
      buttonRadius: pill ? 'rounded-full' : 'rounded-[10px]',
    },
    L: {
      container: 'p-1.5',
      button: 'px-6 py-3 text-16 leading-24 tracking-[-0.064px]',
      buttonRadius: pill ? 'rounded-full' : 'rounded-12',
    },
  };

  // Container radius based on size
  const containerRadius = size === 'M' ? 'rounded-12' : 'rounded-[14px]';

  // Variant styles (light/dark/mono theme) — using design system tokens
  const variantStyles = {
    surface: {
      container: 'bg-[var(--Black-Inverse-A8)]',
      active: `bg-[var(--surface-medium)] text-[var(--Black-Inverse-A100)] ${TAB_ACTIVE_SHADOW}`,
      inactive:
        'bg-transparent text-[var(--Black-Inverse-A56)] hover:text-[var(--Black-Inverse-A100)]',
      disabled:
        'bg-transparent text-[var(--Black-Inverse-A32)] cursor-not-allowed',
    },
    inverse: {
      container: 'bg-[var(--surface-low)]',
      active: `bg-[var(--surface-medium)] text-[var(--Black-Inverse-A100)] ${TAB_ACTIVE_SHADOW}`,
      inactive:
        'bg-transparent text-[var(--Black-Inverse-A56)] hover:text-[var(--Black-Inverse-A100)]',
      disabled:
        'bg-transparent text-[var(--Black-Inverse-A32)] cursor-not-allowed',
    },
    mono: {
      container: 'bg-transparent border border-[var(--Black-Inverse-A8)]',
      active: `bg-[var(--Black-Inverse-A100)] text-[var(--White-Inverse-A100)] ${TAB_ACTIVE_SHADOW}`,
      inactive:
        'bg-transparent text-[var(--Black-Inverse-A56)] hover:text-[var(--Black-Inverse-A100)]',
      disabled:
        'bg-transparent text-[var(--Black-Inverse-A32)] cursor-not-allowed',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <div
      role="tablist"
      className={`${currentSize.container} ${currentVariant.container} ${containerRadius} ${className}`}
    >
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          const isDisabled = tab.disabled || false;

          return (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              disabled={isDisabled}
              className={`
                ${widthType === 'fixed' ? 'flex-1' : ''} 
                flex items-center justify-center 
                ${currentSize.button} 
                ${currentSize.buttonRadius} 
                font-medium whitespace-nowrap
                transition-all duration-200
                ${
                  isDisabled
                    ? currentVariant.disabled
                    : isActive
                      ? currentVariant.active
                      : currentVariant.inactive
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
