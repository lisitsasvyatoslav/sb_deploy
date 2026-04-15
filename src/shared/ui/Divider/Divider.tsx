'use client';

import React from 'react';
import classNames from 'classnames';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  className?: string;
}

/**
 * Divider — 1px separator line
 *
 * Figma node: 55960:21347
 */
const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={classNames('w-[1px] self-stretch bg-stroke-a12', className)}
      />
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={classNames(
        'w-full border-none h-[1px] bg-stroke-a12',
        className
      )}
    />
  );
};

export default Divider;
