'use client';

/**
 * Tooltip — floating label
 *
 * Figma node: 55831:23760
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { m, AnimatePresence } from 'framer-motion';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
export type TooltipVariant = 'default' | 'compact';

export interface TooltipProps {
  /** Text or tooltip content */
  content: ReactNode;
  /** Show tooltip */
  show: boolean;
  /**
   * Tooltip position relative to the element
   * @default 'top'
   */
  position?: TooltipPosition;
  /**
   * Tooltip variant
   * @default 'compact'
   */
  variant?: TooltipVariant;
  /** Additional class for customization */
  className?: string;
  /**
   * Delay before showing (ms)
   * @default 200
   */
  delay?: number;
  /**
   * Render via React portal (document.body) — escapes overflow:hidden ancestors.
   * Requires anchorRef to calculate position.
   */
  portal?: boolean;
  /** Anchor element ref — required when portal=true */
  anchorRef?: React.RefObject<HTMLElement | null>;
}

const animationProps = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
};

/**
 * Tooltip — floating label above/around an element
 *
 * Figma node: 55831:23760
 *
 * Variants:
 * - compact (default): 8px px + 4px py, radius-4, matches Figma spec
 * - default: larger card, 16px px + 12px py, radius-16
 *
 * Background: surfacegray-high (glassmorphism, theme-aware)
 * Shadow: shadow-400 = effects/panel
 *
 * Portal mode: pass portal=true + anchorRef to escape overflow:hidden containers.
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  show,
  position = 'top',
  variant = 'compact',
  className,
  delay = 200,
  portal = false,
  anchorRef,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [fixedPos, setFixedPos] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShouldShow(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [show, delay]);

  // Recalculate fixed position whenever portal tooltip becomes visible or on scroll/resize
  useEffect(() => {
    if (!portal || !shouldShow || !anchorRef?.current) return;

    const updatePos = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const gap = 8;
      const style: React.CSSProperties = { position: 'fixed' };
      if (position === 'right') {
        style.top = rect.top + rect.height / 2;
        style.left = rect.right + gap;
        style.transform = 'translateY(-50%)';
      } else if (position === 'left') {
        style.top = rect.top + rect.height / 2;
        style.right = window.innerWidth - rect.left + gap;
        style.transform = 'translateY(-50%)';
      } else if (position === 'top') {
        style.bottom = window.innerHeight - rect.top + gap;
        style.left = rect.left + rect.width / 2;
        style.transform = 'translateX(-50%)';
      } else {
        style.top = rect.bottom + gap;
        style.left = rect.left + rect.width / 2;
        style.transform = 'translateX(-50%)';
      }
      setFixedPos(style);
    };

    updatePos();
    window.addEventListener('scroll', updatePos, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', updatePos, { passive: true });
    return () => {
      window.removeEventListener('scroll', updatePos, { capture: true });
      window.removeEventListener('resize', updatePos);
    };
  }, [portal, shouldShow, anchorRef, position]);

  const isCompact = variant === 'compact';

  /* ── Absolute position classes (non-portal mode) ── */
  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-spacing-8',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-spacing-8',
    left: classNames('right-full top-1/2 -translate-y-1/2 mr-spacing-8'),
    right: 'left-full top-1/2 -translate-y-1/2 ml-spacing-8',
  };

  /* ── Arrow ── */
  const arrowSizeClasses = 'border-l-[4px] border-r-[4px] border-t-[4px]';

  const arrowClasses: Record<TooltipPosition, string> = {
    top: classNames(
      'top-full left-1/2 -translate-x-1/2 -mt-[1px]',
      arrowSizeClasses,
      'border-l-transparent border-r-transparent border-t-surfacegray-high'
    ),
    bottom: classNames(
      'bottom-full left-1/2 -translate-x-1/2 -mb-[1px] rotate-180',
      arrowSizeClasses,
      'border-l-transparent border-r-transparent border-t-surfacegray-high'
    ),
    left: classNames(
      'left-full top-1/2 -translate-y-1/2 -ml-[3px] -rotate-90',
      arrowSizeClasses,
      'border-l-transparent border-r-transparent border-t-surfacegray-high'
    ),
    right: classNames(
      'right-full top-1/2 -translate-y-1/2 -mr-[3px] rotate-90',
      arrowSizeClasses,
      'border-l-transparent border-r-transparent border-t-surfacegray-high'
    ),
  };

  /* ── Tooltip body styles ── */
  const tooltipClasses = isCompact
    ? classNames(
        'relative',
        'bg-surfacegray-high backdrop-blur-effects-panel',
        'px-spacing-8 py-spacing-4 rounded-radius-4',
        'shadow-400',
        'text-12 leading-16 font-normal tracking-tight-1 text-blackinverse-a100',
        'whitespace-nowrap',
        className
      )
    : classNames(
        'relative',
        'bg-surfacegray-high backdrop-blur-effects-panel',
        'px-spacing-16 py-spacing-12 rounded-radius-16',
        'shadow-400',
        'text-14 font-normal tracking-tight-1 text-blackinverse-a100',
        'whitespace-nowrap',
        className
      );

  const tooltipContent = (
    <m.div className={tooltipClasses} {...animationProps}>
      {content}
      <div className={classNames('absolute w-0 h-0', arrowClasses[position])} />
    </m.div>
  );

  if (portal) {
    return createPortal(
      <AnimatePresence>
        {shouldShow && (
          <div className="z-[9999] pointer-events-none" style={fixedPos}>
            {tooltipContent}
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <div
          className={classNames(
            'absolute z-50 pointer-events-none',
            positionClasses[position]
          )}
        >
          {tooltipContent}
        </div>
      )}
    </AnimatePresence>
  );
};

export default Tooltip;
