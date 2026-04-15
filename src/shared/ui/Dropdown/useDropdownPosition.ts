import { useEffect, useState, RefObject } from 'react';
import type { ComputedPosition, DropdownPlacement } from './Dropdown.types';

type PrimaryAxis = 'top' | 'bottom' | 'left' | 'right';
type CrossAlignment = 'start' | 'end' | undefined;

function parsePlacement(placement: DropdownPlacement): {
  primaryAxis: PrimaryAxis;
  crossAlignment: CrossAlignment;
} {
  const parts = placement.split('-');
  const primaryAxis = parts[0] as PrimaryAxis;

  if (parts.length === 1) return { primaryAxis, crossAlignment: undefined };

  const second = parts[1];
  if (primaryAxis === 'top' || primaryAxis === 'bottom') {
    return {
      primaryAxis,
      crossAlignment: second === 'left' ? 'start' : 'end',
    };
  }
  return {
    primaryAxis,
    crossAlignment: second === 'top' ? 'start' : 'end',
  };
}

function flipPrimaryAxis(placement: DropdownPlacement): DropdownPlacement {
  const opposites: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  const parts = placement.split('-');
  parts[0] = opposites[parts[0]];
  return parts.join('-') as DropdownPlacement;
}

interface PositionConfig {
  placement: DropdownPlacement;
  offset: number;
  triggerRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
}

export function useDropdownPosition({
  placement,
  offset,
  triggerRef,
  menuRef,
  isOpen,
}: PositionConfig): ComputedPosition {
  const [position, setPosition] = useState<ComputedPosition>({
    placement,
  });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const computePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const menuWidth = menuRect?.width || 0;
      const menuHeight = menuRect?.height || 0;

      const { primaryAxis, crossAlignment } = parsePlacement(placement);
      let finalPlacement = placement;
      let top: number | undefined;
      let bottom: number | undefined;
      let left: number | undefined;
      let right: number | undefined;

      switch (primaryAxis) {
        case 'bottom': {
          top = triggerRect.bottom + offset;

          if (crossAlignment === 'end') {
            left = triggerRect.right - menuWidth;
          } else {
            left = triggerRect.left;
          }

          // Flip to top if no space below
          if (
            top + menuHeight > viewportHeight &&
            triggerRect.top - menuHeight - offset > 0
          ) {
            finalPlacement = flipPrimaryAxis(placement);
            bottom = viewportHeight - triggerRect.top + offset;
            top = undefined;
            // Recalculate cross-alignment after flip
            if (crossAlignment === 'end') {
              left = triggerRect.right - menuWidth;
            } else {
              left = triggerRect.left;
            }
          }

          // Horizontal viewport clamping
          if (left !== undefined) {
            if (left + menuWidth > viewportWidth)
              left = viewportWidth - menuWidth;
            if (left < 0) left = 0;
          }
          break;
        }

        case 'top': {
          bottom = viewportHeight - triggerRect.top + offset;

          if (crossAlignment === 'end') {
            left = triggerRect.right - menuWidth;
          } else {
            left = triggerRect.left;
          }

          // Flip to bottom if no space above
          if (
            triggerRect.top - menuHeight - offset < 0 &&
            triggerRect.bottom + menuHeight + offset < viewportHeight
          ) {
            finalPlacement = flipPrimaryAxis(placement);
            top = triggerRect.bottom + offset;
            bottom = undefined;
          }

          // Horizontal viewport clamping
          if (left !== undefined) {
            if (left + menuWidth > viewportWidth)
              left = viewportWidth - menuWidth;
            if (left < 0) left = 0;
          }
          break;
        }

        case 'left': {
          right = viewportWidth - triggerRect.left + offset;

          if (crossAlignment === 'end') {
            top = triggerRect.bottom - menuHeight;
          } else {
            top = triggerRect.top;
          }

          // Flip to right if no space on left
          if (
            triggerRect.left - menuWidth - offset < 0 &&
            triggerRect.right + menuWidth + offset < viewportWidth
          ) {
            finalPlacement = flipPrimaryAxis(placement);
            left = triggerRect.right + offset;
            right = undefined;
          }

          // Vertical viewport clamping
          if (top !== undefined) {
            if (top + menuHeight > viewportHeight)
              top = viewportHeight - menuHeight;
            if (top < 0) top = 0;
          }
          break;
        }

        case 'right': {
          left = triggerRect.right + offset;

          if (crossAlignment === 'end') {
            top = triggerRect.bottom - menuHeight;
          } else {
            top = triggerRect.top;
          }

          // Flip to left if no space on right
          if (
            left + menuWidth > viewportWidth &&
            triggerRect.left - menuWidth - offset > 0
          ) {
            finalPlacement = flipPrimaryAxis(placement);
            right = viewportWidth - triggerRect.left + offset;
            left = undefined;
          }

          // Vertical viewport clamping
          if (top !== undefined) {
            if (top + menuHeight > viewportHeight)
              top = viewportHeight - menuHeight;
            if (top < 0) top = 0;
          }
          break;
        }
      }

      setPosition({ top, bottom, left, right, placement: finalPlacement });
    };

    computePosition();

    let rafId = 0;
    const throttled = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computePosition);
    };

    window.addEventListener('scroll', throttled, true);
    window.addEventListener('resize', throttled);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', throttled, true);
      window.removeEventListener('resize', throttled);
    };
  }, [isOpen, placement, offset, triggerRef, menuRef]);

  return position;
}
