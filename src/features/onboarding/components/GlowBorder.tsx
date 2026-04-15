'use client';

import { type ReactNode } from 'react';

type GlowBorderProps = {
  children: ReactNode;
  active: boolean;
  borderWidth?: number;
  borderRadius?: number;
  className?: string;
};

/**
 * Reusable animated shimmering glow border.
 * Wraps any element without affecting its layout (uses absolute positioning
 * with negative inset). The shimmer is a rotating conic gradient masked
 * into a ring shape via CSS mask-composite.
 *
 * Always renders the same wrapper div so toggling `active` never causes
 * React to remount children (preserves component state).
 *
 * Always renders the same wrapper div so toggling `active` never causes
 * React to remount children (preserves component state).
 */
export const GlowBorder = ({
  children,
  active,
  borderWidth = 4,
  borderRadius = 8,
  className = '',
}: GlowBorderProps) => {
  // When inactive with no className, use `display:contents` so the wrapper
  // is invisible to layout (like a fragment) but stays in the DOM tree,
  // preventing React from remounting children when `active` toggles.
  const inactiveClass = className ? '' : 'contents';

  return (
    <div
      data-glow-active={active || undefined}
      className={`${active ? 'relative flex' : inactiveClass} ${className}`}
    >
      {active && (
        <>
          {/* Rotating conic-gradient masked into an inset ring */}
          <div
            className="absolute pointer-events-none z-[60] overflow-hidden glow-border-mask"
            style={{
              inset: 0,
              borderRadius,
              padding: borderWidth,
            }}
          >
            <div
              className="absolute animate-glow-spin"
              style={{
                width: '200%',
                height: '200%',
                top: '-50%',
                left: '-50%',
                background:
                  'conic-gradient(from 0deg, #F461E0, rgba(244,97,224,0) 120deg, rgba(244,97,224,0) 240deg, #F461E0)',
              }}
            />
          </div>

          {/* Soft ambient glow shadow */}
          <div
            className="absolute pointer-events-none z-[60] animate-glow-pulse"
            style={{
              inset: 0,
              borderRadius,
              boxShadow:
                'inset 0 0 20px rgba(244, 97, 224, 0.4), inset 0 0 40px rgba(244, 97, 224, 0.15)',
            }}
          />
        </>
      )}
      {children}
    </div>
  );
};
