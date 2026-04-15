'use client';

import React, { useRef } from 'react';
import classNames from 'classnames';
import Counter from '@/shared/ui/Counter';
import type { CounterVariant } from '@/shared/ui/Counter';

export type SegmentedControlSize = 'M' | 'L';
export type SegmentedControlVariant = 'mono' | 'surface' | 'inverse';
export type SegmentedControlWidth = 'content' | 'fixed';

export interface Segment {
  label: string;
  value: string;
  icon?: React.ReactNode;
  counter?: number;
}

export interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Size M (compact) or L (large). Default: 'M' */
  size?: SegmentedControlSize;
  /** Visual variant. Default: 'mono' */
  variant?: SegmentedControlVariant;
  /** Width type: 'fixed' (equal width) or 'content' (hug). Default: 'fixed' */
  widthType?: SegmentedControlWidth;
}

const SIZE_CONFIG = {
  M: {
    pill: 'px-spacing-8 py-spacing-4 gap-spacing-6',
    text: 'text-12 font-medium leading-16 tracking-tight-1',
  },
  L: {
    pill: 'px-spacing-12 py-spacing-8 gap-spacing-6',
    text: 'text-14 font-semibold leading-20 tracking-tight-1',
  },
} as const;

const VARIANT_CONFIG = {
  // Figma: container has bg fill + blur, NO border
  mono: {
    container: 'bg-blackinverse-a6 backdrop-blur-medium',
    active: 'bg-surfacewhite-high text-blackinverse-a100 shadow-200',
    inactive:
      'bg-transparent text-blackinverse-a32 hover:text-blackinverse-a56',
  },
  // Figma: container is transparent with border, NO fill, NO blur
  surface: {
    container: 'bg-transparent border border-blackinverse-a8',
    // border-[0.8px] — sub-pixel; no exact token. Using standard 1px `border` as closest match.
    active:
      'bg-blackinverse-a8 text-blackinverse-a100 border border-blackinverse-a4 backdrop-blur-medium',
    inactive:
      'bg-transparent text-blackinverse-a32 hover:text-blackinverse-a56',
  },
  // Figma: container has bg fill + blur, NO border
  inverse: {
    container: 'bg-blackinverse-a8 backdrop-blur-medium',
    active: 'bg-blackinverse-a100 text-whiteinverse-a100 backdrop-blur-medium',
    inactive:
      'bg-transparent text-blackinverse-a32 hover:text-blackinverse-a56',
  },
} as const;

/** Figma counter variant mapping: variant × active → Counter variant */
const COUNTER_VARIANT: Record<
  SegmentedControlVariant,
  { active: CounterVariant; inactive: CounterVariant }
> = {
  mono: { active: 'primary', inactive: 'secondary' },
  surface: { active: 'primary', inactive: 'secondary' },
  inverse: { active: 'accent', inactive: 'secondary' },
};

/**
 * SegmentedControl — Figma segmentedControl/Pill
 *
 * Figma node: 2746:41733
 * Props: size (M/L), variant (mono/surface/inverse), widthType (fixed/content)
 * Each segment can optionally have an icon (20×20) and a counter badge.
 * Full keyboard support: Arrow keys, Home, End, Enter, Space.
 */
const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  value,
  onChange,
  className = '',
  size = 'M',
  variant = 'mono',
  widthType = 'fixed',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusTab = (index: number) => {
    const buttons =
      containerRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
    buttons?.[index]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (index + 1) % segments.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = (index - 1 + segments.length) % segments.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = segments.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(segments[index].value);
        return;
      default:
        return;
    }

    focusTab(newIndex);
    onChange(segments[newIndex].value);
  };

  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];
  const counterVariant = COUNTER_VARIANT[variant];

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={classNames(
        'inline-flex items-center gap-spacing-2 rounded-radius-4 p-spacing-2',
        widthType === 'fixed' && 'w-full',
        variantConfig.container,
        className
      )}
    >
      {segments.map((segment, index) => {
        const isActive = segment.value === value;

        return (
          <button
            key={segment.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(segment.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={classNames(
              'flex items-center justify-center',
              'rounded-radius-2 transition-colors duration-200',
              'overflow-hidden text-ellipsis whitespace-nowrap',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-mind-accent focus-visible:ring-offset-2',
              widthType === 'fixed' && 'flex-1',
              sizeConfig.pill,
              sizeConfig.text,
              isActive ? variantConfig.active : variantConfig.inactive
            )}
          >
            {segment.icon && (
              <span className="w-base-20 h-base-20 flex-shrink-0 flex items-center justify-center">
                {segment.icon}
              </span>
            )}
            {segment.label}
            {segment.counter != null && (
              <Counter
                size="XL"
                variant={
                  isActive ? counterVariant.active : counterVariant.inactive
                }
              >
                {segment.counter}
              </Counter>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
