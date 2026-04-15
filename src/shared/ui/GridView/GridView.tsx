import { ErrorState } from '@/shared/ui/ErrorState';
import { LoadingState } from '@/shared/ui/LoadingState';
import { useChatStore } from '@/stores/chatStore';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface ItemConfig {
  w?: number;
  h?: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isResizable?: boolean;
  isDraggable?: boolean;
}

interface GridPadding {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

interface GridViewProps<T> {
  items: T[];
  isLoading?: boolean;
  error?: Error | null;
  renderCard: (item: T, index: number) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string; // Stable key per item (avoids index-based keys)
  title?: string;
  sidebarAware?: boolean;
  getItemConfig?: (item: T, index: number) => ItemConfig;
  onLayoutChange?: (items: T[]) => void;
  maxRows?: number; // Maximum number of rows (undefined = unlimited)
  // Customization props
  cols?: number; // Fixed columns (if set, no calculation)
  maxCols?: number; // Maximum columns (limit for dynamic calculation)
  cardWidth?: number; // Card width (default: 256 or 185 based on sidebar)
  cardHeight?: number; // Card height for rowHeight (default: 200)
  gap?: number; // Gap between items (default: 8)
  verticalGap?: number; // Vertical gap between rows (default: same as gap)
  gridPadding?: GridPadding; // Custom padding for grid container
  horizontalPadding?: number; // Horizontal padding in pixels (for column calculation)
  titleClassName?: string; // Custom title styling
  containerClassName?: string; // Custom container styling
  maxContainerWidth?: string; // Max width for inner container (e.g., "max-w-[1800px]")
  headerControls?: React.ReactNode; // Custom controls to display in header (right side)
}

export const GridView = <T,>({
  items,
  isLoading = false,
  error = null,
  renderCard,
  getItemKey,
  title,
  sidebarAware = false,
  getItemConfig,
  onLayoutChange,
  maxRows,
  cols: fixedCols,
  maxCols,
  cardWidth: customCardWidth,
  cardHeight = 200,
  gap = 8,
  verticalGap,
  gridPadding,
  horizontalPadding: _horizontalPadding = 0,
  titleClassName,
  containerClassName,
  maxContainerWidth,
  headerControls,
}: GridViewProps<T>) => {
  const { isChatSidebarOpen } = useChatStore();
  const { isOpen: isNewsOpen } = useNewsSidebarStore();

  // Container width tracking for responsive columns
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    undefined
  );
  const containerNodeRef = React.useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

  // Callback ref - called when DOM element is attached
  const containerRef = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      // Node unmounted
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      containerNodeRef.current = null;
      return;
    }

    // Store node reference
    containerNodeRef.current = node;

    // Measure immediately
    const measureWidth = () => {
      const width = node.offsetWidth;
      setContainerWidth(width);
    };

    measureWidth();

    // Measure after layout completes (for sidebar state)
    requestAnimationFrame(() => {
      requestAnimationFrame(measureWidth);
    });

    // Setup ResizeObserver
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserverRef.current.observe(node);
  }, []);

  // Re-measure when sidebars change (after ref is attached)
  useEffect(() => {
    if (!containerNodeRef.current) return;

    const measureWidth = () => {
      if (containerNodeRef.current) {
        setContainerWidth(containerNodeRef.current.offsetWidth);
      }
    };

    // Measure after sidebar animation completes
    const timer = setTimeout(measureWidth, 50);

    return () => clearTimeout(timer);
  }, [isChatSidebarOpen, isNewsOpen]);

  // Force re-measurement when maxContainerWidth changes (mode switching)
  useEffect(() => {
    if (!containerNodeRef.current) return;

    const measureWidth = () => {
      if (containerNodeRef.current) {
        setContainerWidth(containerNodeRef.current.offsetWidth);
      }
    };

    // Small delay to ensure DOM updates are complete
    const timer = setTimeout(measureWidth, 10);

    return () => clearTimeout(timer);
  }, [maxContainerWidth]);

  // Card width: prioritize custom value, fallback to sidebar-based logic
  const cardWidth =
    customCardWidth ?? (isChatSidebarOpen && isNewsOpen ? 185 : 256);

  // Extract max width value from maxContainerWidth string (e.g., "max-w-[1936px]" -> 1936)
  const maxWidthValue = useMemo(() => {
    if (!maxContainerWidth) return undefined;
    const match = maxContainerWidth.match(/max-w-\[(\d+)px\]/);
    return match ? parseInt(match[1], 10) : undefined;
  }, [maxContainerWidth]);

  // Calculate responsive columns or use fixed
  const cols = useMemo(() => {
    // If fixed columns specified, use them
    if (fixedCols !== undefined) return fixedCols;

    let availableWidth: number;
    if (sidebarAware) {
      const realWidth = containerWidth ?? 1200;
      // For sidebarAware components, padding is already handled by CSS classes
      // offsetWidth measurement doesn't include padding, so no need to subtract it again
      const horizontalPadding = _horizontalPadding || 0;

      if (maxWidthValue) {
        // Use the smaller of real container width and max width constraint
        // This handles both wide screens (limited by maxWidth) and narrow screens (limited by real width)
        const effectiveWidth = Math.min(realWidth, maxWidthValue);
        availableWidth = Math.max(0, effectiveWidth - horizontalPadding);
      } else {
        // Normal screens: use real width minus padding
        availableWidth = Math.max(0, realWidth - horizontalPadding);
      }
    } else {
      // For non-sidebarAware components, use traditional padding calculation
      const horizontalPadding = _horizontalPadding || 32;
      availableWidth = Math.max(0, 1200 - horizontalPadding);
    }

    // Correct formula: (availableWidth + gap) / (cardWidth + gap)
    // Because: N cards need N*cardWidth + (N-1)*gap width
    const calculated = Math.max(
      1,
      Math.floor((availableWidth + gap) / (cardWidth + gap))
    );

    // Apply maxCols limit if specified
    const finalCols =
      maxCols !== undefined ? Math.min(maxCols, calculated) : calculated;

    return finalCols;
  }, [
    fixedCols,
    containerWidth,
    cardWidth,
    gap,
    sidebarAware,
    maxWidthValue,
    maxCols,
    _horizontalPadding,
  ]);

  // If maxRows is set, limit items to fit in maxRows rows
  // Always include the last item (e.g., create button)
  const visibleItems = useMemo(() => {
    if (maxRows === undefined) return items;

    const maxItems = cols * maxRows;

    if (items.length > maxItems) {
      return [...items.slice(0, maxItems - 1), items[items.length - 1]];
    }
    return items;
  }, [items, maxRows, cols]);

  // Resolve a stable string key for each item
  const resolveKey = useCallback(
    (item: T, index: number) => getItemKey?.(item, index) ?? index.toString(),
    [getItemKey]
  );

  // Generate layout configuration for each visible item
  const layout = useMemo<Layout[]>(() => {
    return visibleItems.map((item, i) => {
      const config = getItemConfig?.(item, i) || {};

      return {
        i: resolveKey(item, i),
        x: i % cols,
        y: Math.floor(i / cols),
        w: config.w || 1,
        h: config.h || 1,
        minW: config.minW || 1,
        maxW: config.maxW || 2,
        minH: config.minH || 1,
        maxH: config.maxH || 2,
        isResizable: config.isResizable || false,
        static: config.isDraggable === false, // static = true means not draggable
      };
    });
  }, [visibleItems, cols, getItemConfig, resolveKey]);

  // Pre-compute grid width instead of IIFE in JSX
  const gridWidth = useMemo(() => {
    const calculatedWidth = cols * cardWidth + (cols - 1) * gap;

    if (sidebarAware && maxWidthValue) {
      const horizontalPadding = _horizontalPadding || 0;
      const realWidth = containerWidth ?? 1200;
      const effectiveWidth = Math.min(realWidth, maxWidthValue);
      const maxAvailableWidth = effectiveWidth - horizontalPadding;
      return Math.min(calculatedWidth, maxAvailableWidth);
    }

    return calculatedWidth;
  }, [
    cols,
    cardWidth,
    gap,
    sidebarAware,
    maxWidthValue,
    _horizontalPadding,
    containerWidth,
  ]);

  // Build a key→index map for efficient layout change handling
  const keyToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    visibleItems.forEach((item, i) => {
      map.set(resolveKey(item, i), i);
    });
    return map;
  }, [visibleItems, resolveKey]);

  // Handle layout changes (drag & drop / resize)
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (!onLayoutChange) return;

      // Reorder items based on new layout positions
      const reordered = newLayout
        .sort((a, b) => {
          const posA = a.y * cols + a.x;
          const posB = b.y * cols + b.x;
          return posA - posB;
        })
        .map((l) => {
          const idx = keyToIndexMap.get(l.i);
          return idx !== undefined ? visibleItems[idx] : undefined;
        })
        .filter(Boolean) as T[];

      onLayoutChange(reordered);
    },
    [visibleItems, cols, onLayoutChange, keyToIndexMap]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // Dynamic padding classes based on each sidebar state
  const paddingLeftClass = sidebarAware ? (isNewsOpen ? 'pl-4' : 'pl-10') : '';
  const paddingRightClass = sidebarAware
    ? isChatSidebarOpen
      ? 'pr-4'
      : 'pr-10'
    : '';

  // Apply custom padding if provided
  const finalPaddingTop = gridPadding?.top ?? 'pt-[84px]';
  const finalPaddingBottom =
    gridPadding?.bottom ?? (sidebarAware ? 'pb-4' : 'pb-8');
  const finalPaddingLeft = gridPadding?.left ?? paddingLeftClass;
  const finalPaddingRight = gridPadding?.right ?? paddingRightClass;

  // Inner container max-width logic
  const innerContainerClass = sidebarAware
    ? maxContainerWidth
      ? `w-full ${maxContainerWidth} mx-auto`
      : 'w-full'
    : 'max-w-7xl mx-auto';

  return (
    <div
      ref={containerRef}
      className={`w-full ${finalPaddingTop} ${sidebarAware ? `h-full overflow-auto flex flex-col ${finalPaddingLeft} ${finalPaddingRight} ${finalPaddingBottom}` : `overflow-auto px-8 ${finalPaddingBottom}`} ${containerClassName || ''}`}
    >
      <div className={innerContainerClass}>
        {/* Title */}
        {(title || headerControls) && (
          <div
            className={`${sidebarAware ? 'pb-4' : 'mb-6'} flex items-center justify-between`}
          >
            {title && (
              <h1
                className={
                  titleClassName ||
                  (sidebarAware
                    ? 'font-inter font-semibold leading-7 text-gray-800 text-xl tracking-[-0.6px]'
                    : 'text-3xl font-bold text-gray-900')
                }
              >
                {title}
              </h1>
            )}
            {headerControls && (
              <div className={`flex items-center${title ? '' : ' w-full'}`}>
                {headerControls}
              </div>
            )}
          </div>
        )}

        {/* Grid with react-grid-layout */}
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols}
          rowHeight={cardHeight}
          width={gridWidth}
          margin={[gap, verticalGap ?? gap]}
          containerPadding={[0, 0]}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
        >
          {visibleItems.map((item, index) => (
            <div key={resolveKey(item, index)}>{renderCard(item, index)}</div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};
