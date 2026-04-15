import { useCallback, useRef } from 'react';
import { useOnboardingUIStore } from '../stores/onboardingUIStore';

/**
 * Handles mouse-based dragging for the floating onboarding widget.
 * Returns a mousedown handler to attach to the drag handle.
 */
export function useWidgetDrag() {
  const widgetMode = useOnboardingUIStore((s) => s.widgetMode);
  const setWidgetPosition = useOnboardingUIStore((s) => s.setWidgetPosition);

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (widgetMode !== 'floating') return;
      e.preventDefault();
      isDragging.current = true;
      // Read position at drag start from the store snapshot
      const pos = useOnboardingUIStore.getState().widgetPosition;
      dragOffset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };

      const handleMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const newX = Math.max(
          0,
          Math.min(ev.clientX - dragOffset.current.x, window.innerWidth - 360)
        );
        const newY = Math.max(
          0,
          Math.min(ev.clientY - dragOffset.current.y, window.innerHeight - 100)
        );
        setWidgetPosition({ x: newX, y: newY });
      };

      const handleUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [widgetMode, setWidgetPosition]
  );

  return handleDragStart;
}
