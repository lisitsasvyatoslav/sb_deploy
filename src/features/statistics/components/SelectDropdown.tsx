'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cn } from '@/shared/utils/cn';

export interface SelectDropdownItem {
  label: string;
  value: string;
}

interface SelectDropdownProps {
  label: string;
  items: SelectDropdownItem[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  'data-testid'?: string;
}

/**
 * Lightweight select dropdown for settings panels.
 *
 * Supports keyboard navigation (ArrowUp/Down, Enter, Escape)
 * and basic ARIA attributes (listbox, option, aria-expanded).
 */
const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  items,
  value,
  onChange,
  placeholder = '—',
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useRef(
    `sd-listbox-${Math.random().toString(36).slice(2, 8)}`
  ).current;

  const selectedItem = items.find((item) => item.value === value);
  const displayLabel = selectedItem?.label || placeholder;

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        const idx = items.findIndex((item) => item.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }, [items, value]);

  const select = useCallback(
    (itemValue: string) => {
      onChange(itemValue);
      close();
    },
    [onChange, close]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          toggle();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < items.length) {
            select(items[highlightedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [isOpen, items, highlightedIndex, toggle, select, close]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const list = listRef.current;
    const item = list?.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, highlightedIndex]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  return (
    <div className="flex flex-col gap-spacing-4">
      <span className="text-12 leading-16 font-normal tracking-tight-1 text-blackinverse-a100 overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>
      <div
        ref={containerRef}
        className="relative"
        // Prevent mousedown from closing the parent DropdownBase overlay
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0
              ? `${listboxId}-opt-${highlightedIndex}`
              : undefined
          }
          className="flex items-center gap-spacing-8 w-full bg-blackinverse-a6 rounded-radius-2 px-spacing-12 py-spacing-10 overflow-clip cursor-pointer text-left"
          onClick={toggle}
          onKeyDown={handleKeyDown}
          data-testid={testId}
        >
          <span className="flex-1 text-14 leading-20 font-normal tracking-tight-1 text-blackinverse-a100 overflow-hidden text-ellipsis whitespace-nowrap">
            {displayLabel}
          </span>
          <KeyboardArrowDownIcon
            sx={{ width: 20, height: 20 }}
            className={cn('text-blackinverse-a56 transition-transform', {
              'rotate-180': isOpen,
            })}
          />
        </button>
        {isOpen && (
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="absolute z-10 top-full left-0 right-0 mt-spacing-4 max-h-[200px] /* no spacing token for 200 */ overflow-auto rounded-radius-2 border border-blackinverse-a4 bg-background-gray_high shadow-modal backdrop-blur-effects-modal py-spacing-6"
          >
            {items.map((item, index) => (
              <button
                key={item.value}
                id={`${listboxId}-opt-${index}`}
                type="button"
                role="option"
                aria-selected={item.value === value}
                onClick={() => select(item.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex items-center w-full px-spacing-12 py-spacing-8 text-left text-14 leading-20 font-normal tracking-tight-1 text-blackinverse-a100 transition-colors',
                  index === highlightedIndex
                    ? 'bg-blackinverse-a8'
                    : 'hover:bg-blackinverse-a4'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDropdown;
