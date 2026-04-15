import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Viewport } from '@xyflow/react';
import { logger } from '@/shared/utils/logger';

interface ViewportPersistenceConfig {
  key: string;
  debounceMs?: number;
}

const loadViewportFromStorage = (key: string): Viewport | null => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as Viewport;
    }
  } catch (error) {
    logger.error('useViewportPersistence', 'Failed to load viewport', error);
  }
  return null;
};

const saveViewportToStorage = (key: string, viewport: Viewport) => {
  try {
    localStorage.setItem(key, JSON.stringify(viewport));
  } catch (error) {
    logger.error('useViewportPersistence', 'Failed to save viewport', error);
  }
};

export const useViewportPersistence = (config: ViewportPersistenceConfig) => {
  const { key, debounceMs = 300 } = config;
  const saveTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const initialViewport = useMemo(() => loadViewportFromStorage(key), [key]);

  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveViewportToStorage(key, viewport);
      }, debounceMs);
    },
    [key, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    initialViewport,
    handleViewportChange,
    shouldFitView: !initialViewport,
  };
};
