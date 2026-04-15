'use client';

import React, { ReactNode } from 'react';
import classNames from 'classnames';

export type ScrollerDirection = 'vertical' | 'horizontal' | 'both';

export interface ScrollerProps {
  children: ReactNode;
  /**
   * Scroll direction
   * @default 'vertical'
   */
  direction?: ScrollerDirection;
  className?: string;
  style?: React.CSSProperties;
}

const OVERFLOW_CLASSES: Record<ScrollerDirection, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
} as const;

/**
 * Scroller — scrollable container with styled custom scrollbar
 * Scrollbar: 8px wide, default state uses blackinverse-a8,
 * hover/active uses blackinverse-a12 (see scrollbar.css)
 *
 * Figma node: 55960:20433
 */
const Scroller: React.FC<ScrollerProps> = ({
  children,
  direction = 'vertical',
  className,
  style,
}) => {
  return (
    <div
      className={classNames(OVERFLOW_CLASSES[direction], className)}
      style={style}
    >
      {children}
    </div>
  );
};

export default Scroller;
