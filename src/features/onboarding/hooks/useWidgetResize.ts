import { useCallback } from 'react';
import {
  WIDGET_MIN_WIDTH,
  WIDGET_MAX_WIDTH,
  WIDGET_MIN_HEIGHT,
  WIDGET_MAX_HEIGHT,
} from '../constants';
import { useOnboardingUIStore } from '../stores/onboardingUIStore';

/**
 * Handles mouse-based resizing for the floating onboarding widget.
 * Returns a mousedown handler that accepts an edge string
 * (e.g. 'top', 'bottom-right', 'left').
 */
export function useWidgetResize() {
  const widgetMode = useOnboardingUIStore((s) => s.widgetMode);
  const widgetSize = useOnboardingUIStore((s) => s.widgetSize);
  const widgetPosition = useOnboardingUIStore((s) => s.widgetPosition);
  const setWidgetSize = useOnboardingUIStore((s) => s.setWidgetSize);
  const setWidgetPosition = useOnboardingUIStore((s) => s.setWidgetPosition);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, edge: string) => {
      if (widgetMode !== 'floating') return;
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = widgetSize.width;
      const startH = widgetSize.height;
      const startPosX = widgetPosition.x;
      const startPosY = widgetPosition.y;

      const handleMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let w = startW;
        let h = startH;
        let px = startPosX;
        let py = startPosY;

        if (edge.includes('right'))
          w = Math.min(
            WIDGET_MAX_WIDTH,
            Math.max(WIDGET_MIN_WIDTH, startW + dx)
          );
        if (edge.includes('bottom'))
          h = Math.min(
            WIDGET_MAX_HEIGHT,
            Math.max(WIDGET_MIN_HEIGHT, startH + dy)
          );
        if (edge.includes('left')) {
          w = Math.min(
            WIDGET_MAX_WIDTH,
            Math.max(WIDGET_MIN_WIDTH, startW - dx)
          );
          px = startPosX + (startW - w);
        }
        if (edge.includes('top')) {
          h = Math.min(
            WIDGET_MAX_HEIGHT,
            Math.max(WIDGET_MIN_HEIGHT, startH - dy)
          );
          py = startPosY + (startH - h);
        }

        setWidgetSize({ width: w, height: h });
        if (px !== startPosX || py !== startPosY) {
          setWidgetPosition({ x: px, y: py });
        }
      };

      const handleUp = () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [widgetMode, widgetSize, widgetPosition, setWidgetSize, setWidgetPosition]
  );

  return handleResizeStart;
}
