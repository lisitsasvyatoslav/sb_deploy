import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/shared/ui/Icon/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { DEFAULT_CARD_COLOR } from '@/features/board/components/CardSelectionToolbar';

interface SelectColorWidgetProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export const NOTE_MODAL_COLORS = [
  '#7863F6', // blue
  '#A463F6', // purple
  '#F663C2', // pink
  '#F25555', // red (status/negative)
  '#FF9B42', // orange (status/warning)
  '#FFD43B', // yellow
  '#11C516', // green (status/success)
  '#A9DC4D', // lime
  '#3CC8E3', // cyan
  '#A5734A', // brown
  '#040405', // black
] as const;

const normalizeColor = (color?: string) => (color || '').trim().toLowerCase();

/** Near-black sentinel — in dark theme renders as white via --wrapper-a100 */
const CONTRAST_COLOR = '#040405';
const resolveDisplayColor = (color: string) =>
  normalizeColor(color) === CONTRAST_COLOR ? 'var(--wrapper-a100)' : color;

/**
 * SelectColorWidget — selectColor button with tooltip dropdown.
 *
 * Figma:
 * - Default: 24×24 button, border stroke/a72, 18px colored circle inside
 * - Hover: tooltip "Изменить цвет" below
 * - Active: tooltip with color palette below
 */
export function SelectColorWidget({
  currentColor,
  onColorChange,
  onOpenChange,
}: SelectColorWidgetProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setOpenAndNotify = useCallback(
    (value: boolean) => {
      setOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpenAndNotify(false);
    };

    // Use capture phase so the listener fires before ReactFlow or any other
    // handler has a chance to stop propagation in the bubble phase.
    document.addEventListener('mousedown', handlePointerDown, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
    };
  }, [open, setOpenAndNotify]);

  const selectedColor = currentColor || DEFAULT_CARD_COLOR;
  const normalizedSelectedColor = normalizeColor(selectedColor);

  const handleSelect = (color: string) => {
    onColorChange(color);
    setOpenAndNotify(false);
  };

  const animationProps = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Trigger button — Figma: selectColor, 24×24, border stroke/a72, 18px dot */}
      <button
        type="button"
        onClick={() => setOpenAndNotify(!open)}
        className="flex size-[24px] shrink-0 items-center justify-center border border-stroke-a72 rounded-radius-80"
      >
        <div
          className="size-[18px] rounded-full"
          style={{ backgroundColor: resolveDisplayColor(selectedColor) }}
        />
      </button>

      {/* Hover tooltip — "Изменить цвет" */}
      <AnimatePresence>
        {hovered && !open && (
          <m.div
            className="absolute top-full left-0 z-50 pointer-events-none flex flex-col items-start"
            {...animationProps}
          >
            {/* Arrow — centered over the 24px button */}
            <div className="pl-[8px]">
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-surfacegray-high" />
            </div>
            {/* Content */}
            <div className="bg-surfacegray-high backdrop-blur-effects-panel shadow-effects-panel px-[8px] py-[4px] rounded-[4px] whitespace-nowrap text-[12px] font-normal leading-[16px] tracking-[-0.2px] text-blackinverse-a100">
              {t('colorWidget.changeColor')}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Active tooltip — color palette */}
      <AnimatePresence>
        {open && (
          <m.div
            className="absolute top-full left-0 z-50 flex flex-col items-start"
            {...animationProps}
          >
            {/* Arrow — centered over the 24px button */}
            <div className="pl-[8px]">
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-surfacegray-high" />
            </div>
            {/* Palette content */}
            <div className="bg-surfacegray-high backdrop-blur-effects-panel shadow-effects-panel p-[4px] rounded-[4px] flex items-start gap-0">
              {/* Reset / no-color — picColorNull */}
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="shrink-0 overflow-clip size-[24px] transition-opacity hover:opacity-80"
              >
                <Icon
                  variant="picColorNull"
                  size={24}
                  className="text-blackinverse-a100"
                />
              </button>

              {/* Color dots */}
              {NOTE_MODAL_COLORS.map((color) => {
                const isSelected =
                  normalizeColor(color) === normalizedSelectedColor;

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSelect(color)}
                    className={classNames(
                      'relative shrink-0 size-[24px] transition-opacity hover:opacity-80',
                      isSelected && 'border border-stroke-a72 rounded-radius-16'
                    )}
                  >
                    <div
                      className="absolute inset-[12.5%] rounded-full"
                      style={{ backgroundColor: resolveDisplayColor(color) }}
                    />
                  </button>
                );
              })}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
