import { useBoardStore } from '@/stores/boardStore';
import { useBoardUIStore } from '@/stores/boardUIStore';
import { RefObject, useCallback, useEffect } from 'react';
import { Viewport, useReactFlow } from '@xyflow/react';

interface UseBoardViewportConfig {
  callbacks: {
    onSelectionUiUpdate?: () => void;
  };
  refs: {
    saveTimeoutRef: RefObject<NodeJS.Timeout | null>;
    selectionUpdateCancelledRef: RefObject<boolean>;
    viewportUpdateTimeoutRef: RefObject<NodeJS.Timeout | null>;
    lastViewportZoom: RefObject<number | null>;
    lastViewportPosition: RefObject<{ x: number; y: number } | null>;
  };
}

export const useBoardViewport = ({
  callbacks,
  refs,
}: UseBoardViewportConfig) => {
  const { onSelectionUiUpdate } = callbacks;
  const {
    saveTimeoutRef,
    selectionUpdateCancelledRef,
    viewportUpdateTimeoutRef,
    lastViewportZoom,
    lastViewportPosition,
  } = refs;

  const reactFlowInstance = useReactFlow();
  const { saveViewport } = useBoardStore();
  const setToolbarState = useBoardUIStore((s) => s.setToolbarState);
  const setGroupOutline = useBoardUIStore((s) => s.setGroupOutline);

  // Initialize initial viewport on first render
  useEffect(() => {
    const currentViewport = reactFlowInstance.getViewport();
    if (lastViewportZoom.current === null) {
      lastViewportZoom.current = currentViewport.zoom;
    }
    if (lastViewportPosition.current === null) {
      lastViewportPosition.current = {
        x: currentViewport.x,
        y: currentViewport.y,
      };
    }
    saveViewport(currentViewport);
  }, [reactFlowInstance, saveViewport, lastViewportZoom, lastViewportPosition]);

  const onMove = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      const zoomChanged =
        lastViewportZoom.current !== null &&
        Math.abs(lastViewportZoom.current - viewport.zoom) > 0.001;

      const positionChanged =
        lastViewportPosition.current !== null &&
        (Math.abs(lastViewportPosition.current.x - viewport.x) > 1 ||
          Math.abs(lastViewportPosition.current.y - viewport.y) > 1);

      if (zoomChanged || positionChanged) {
        setToolbarState((prev) => ({ ...prev, visible: false }));
        setGroupOutline((prev) => ({ ...prev, visible: false }));

        if (viewportUpdateTimeoutRef.current) {
          clearTimeout(viewportUpdateTimeoutRef.current);
        }
      }

      lastViewportZoom.current = viewport.zoom;
      lastViewportPosition.current = { x: viewport.x, y: viewport.y };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveViewport(viewport);

        if (zoomChanged || positionChanged) {
          if (viewportUpdateTimeoutRef.current) {
            clearTimeout(viewportUpdateTimeoutRef.current);
          }

          selectionUpdateCancelledRef.current = false;
          viewportUpdateTimeoutRef.current = setTimeout(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (selectionUpdateCancelledRef.current) return;
                onSelectionUiUpdate?.();
                viewportUpdateTimeoutRef.current = null;
              });
            });
          }, 200);
        } else {
          onSelectionUiUpdate?.();
        }
      }, 150);
    },
    [
      saveViewport,
      onSelectionUiUpdate,
      setToolbarState,
      setGroupOutline,
      saveTimeoutRef,
      selectionUpdateCancelledRef,
      viewportUpdateTimeoutRef,
      lastViewportZoom,
      lastViewportPosition,
    ]
  );

  return { onMove };
};
