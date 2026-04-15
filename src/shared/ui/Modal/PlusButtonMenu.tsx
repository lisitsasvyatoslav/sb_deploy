'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import { Icon } from '@/shared/ui/Icon/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/shared/i18n/client';

interface PlusButtonMenuProps {
  editor: Editor;
  onInsertFile?: () => void;
  onInsertImage?: () => void;
  onInsertLink?: () => void;
}

interface MenuPosition {
  x: number;
  y: number;
}

interface MenuItem {
  key: string;
  label: string;
  icon: IconVariant;
  previewIcon: IconVariant;
  previewCaption: string;
  onClick?: () => void;
}

export function PlusButtonMenu({
  editor,
  onInsertFile,
  onInsertImage,
  onInsertLink,
}: PlusButtonMenuProps) {
  const { t } = useTranslation('common');
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string>('file');

  // Listen for plugin meta dispatches to open/close the menu
  useEffect(() => {
    const handleTransaction = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storage = (editor.storage as any)?.plusButton;
      if (storage?.open) {
        setMenuPos({ x: storage.x, y: storage.y });
        setHoveredKey('file');
        storage.open = false;
      }
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  const close = useCallback(() => {
    setMenuPos(null);
    // Clear active state on the "+" button
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = (editor.storage as any)?.plusButton;
    if (storage) {
      storage.menuOpenAtPos = null;
    }
    // Dispatch transaction to trigger decoration rebuild (removes --active class)
    editor.view.dispatch(editor.state.tr.setMeta('plusMenuClose', true));
  }, [editor]);

  // Close on outside click
  useEffect(() => {
    if (!menuPos) return;
    const handleClick = () => close();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    // Delay listener to avoid catching the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEscape);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuPos, close]);

  // Move cursor to the end of the paragraph the "+" belongs to before invoking the action,
  // so the inserted content appears after that line (not at the previous cursor position).
  const handleItemClick = useCallback(
    (action?: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paragraphPos = (editor.storage as any).plusButton?.menuOpenAtPos;
      close();
      if (paragraphPos != null) {
        const node = editor.state.doc.nodeAt(paragraphPos);
        if (node) {
          editor
            .chain()
            .focus()
            .setTextSelection(paragraphPos + node.nodeSize - 1)
            .run();
        }
      }
      action?.();
    },
    [editor, close]
  );

  if (!menuPos) return null;

  const items: MenuItem[] = [
    {
      key: 'file',
      label: t('editor.insertFile', 'File'),
      icon: 'doc',
      previewIcon: 'docFull',
      previewCaption: `pdf, xls ${t('editor.upTo', 'up to')} 50 MB`,
      onClick: onInsertFile,
    },
    {
      key: 'image',
      label: t('editor.insertImage', 'Image'),
      icon: 'image',
      previewIcon: 'image',
      previewCaption: `jpg, png ${t('editor.upTo', 'up to')} 50 MB`,
      onClick: onInsertImage,
    },
    {
      key: 'link',
      label: t('editor.insertLink', 'Link'),
      icon: 'global',
      previewIcon: 'global',
      previewCaption: t('editor.insertLinkCaption', 'Paste a URL'),
      onClick: onInsertLink,
    },
  ];

  const hoveredItem = items.find((i) => i.key === hoveredKey) ?? items[0];

  return createPortal(
    <div
      className="fixed z-[9999] flex flex-col gap-spacing-4"
      style={{ left: menuPos.x, top: menuPos.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* "Вставка вложения" badge */}
      <div
        className={cn(
          'inline-flex items-center self-start',
          'px-spacing-6 rounded-radius-2',
          'bg-[var(--brand-bg)] text-[var(--brand-base)]',
          'text-14 font-semibold leading-5'
        )}
      >
        {t('editor.insertAttachment', 'Вставка вложения')}
      </div>

      {/* Dropdown panel */}
      <div
        className={cn(
          'rounded-radius-4 border border-blackinverse-a4',
          'bg-background-gray_high shadow-modal backdrop-blur-effects-modal',
          'overflow-hidden py-spacing-6',
          'min-w-[380px]'
        )}
      >
        <div className="flex">
          {/* Left column — menu items */}
          <div className="flex-1 min-w-0">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                className={cn(
                  'flex items-center gap-3 w-full px-spacing-8 py-spacing-6 text-left',
                  'transition-colors',
                  hoveredKey === item.key
                    ? 'bg-blackinverse-a4'
                    : 'hover:bg-blackinverse-a4'
                )}
                onMouseEnter={() => setHoveredKey(item.key)}
                onClick={() => handleItemClick(item.onClick)}
              >
                <Icon
                  variant={item.icon}
                  size={16}
                  className="text-[var(--text-secondary)] shrink-0"
                />
                <span className="text-14 text-[var(--text-primary)]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Right column — preview panel */}
          <div className="w-[160px] flex flex-col items-center justify-center gap-2 px-spacing-8 border-l border-blackinverse-a4">
            <div className="flex items-center justify-center w-12 h-12 rounded-radius-4 bg-blackinverse-a4 text-[var(--text-secondary)]">
              <Icon variant={hoveredItem.previewIcon} size={24} />
            </div>
            <span className="text-12 text-[var(--text-muted)] text-center leading-4">
              {hoveredItem.previewCaption}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
