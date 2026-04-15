'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Icon } from '@/shared/ui/Icon/Icon';
import { normalizeUrl } from '@/shared/utils/formatters';
import { useTranslation } from '@/shared/i18n/client';
import { cn } from '@/shared/utils/cn';

interface EditorBubbleToolbarProps {
  editor: Editor;
  onAskAI?: () => void;
}

function LinkInput({
  defaultValue,
  onSubmit,
  onCancel,
  placeholder,
}: {
  defaultValue: string;
  onSubmit: (url: string) => void;
  onCancel: () => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1 px-1">
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onCancel()}
        placeholder={placeholder}
        className={cn(
          'w-[200px] h-7 px-2 text-12 rounded-radius-2',
          'bg-blackinverse-a4 text-[var(--text-primary)]',
          'border border-stroke-a4 outline-none',
          'focus:border-[var(--text-accent)]',
          'placeholder:text-[var(--text-muted)]'
        )}
      />
      <button
        type="button"
        className="flex items-center justify-center size-7 rounded-radius-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-blackinverse-a4"
        onMouseDown={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
      >
        <Icon variant="tick" size={16} />
      </button>
    </div>
  );
}

export function EditorBubbleToolbar({
  editor,
  onAskAI,
}: EditorBubbleToolbarProps) {
  const { t } = useTranslation('common');
  const [, setTick] = useState(0);
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkDefaultValue, setLinkDefaultValue] = useState('');

  useEffect(() => {
    const update = () =>
      setTick((prev) => {
        const next =
          (editor.isActive('bold') ? 1 : 0) |
          (editor.isActive('italic') ? 2 : 0) |
          (editor.isActive('strike') ? 4 : 0) |
          (editor.isActive('underline') ? 8 : 0) |
          (editor.isActive('link') ? 16 : 0) |
          (editor.isActive('bulletList') ? 32 : 0) |
          (editor.isActive('orderedList') ? 64 : 0) |
          (editor.state.selection.empty ? 128 : 0);
        return next === prev ? prev : next;
      });
    editor.on('transaction', update);
    return () => {
      editor.off('transaction', update);
    };
  }, [editor]);

  const handleLink = useCallback(() => {
    const existingHref = editor.getAttributes('link').href;
    setLinkDefaultValue(existingHref || '');
    setLinkInputVisible(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(
    (url: string) => {
      setLinkInputVisible(false);
      if (editor.isActive('link')) {
        if (!url) {
          editor.chain().focus().unsetLink().run();
          return;
        }
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: normalizeUrl(url) })
          .run();
        return;
      }
      if (!url) {
        editor.chain().focus().run();
        return;
      }
      const href = normalizeUrl(url);
      if (editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            marks: [{ type: 'link', attrs: { href } }],
            text: url,
          })
          .run();
      } else {
        editor.chain().focus().setLink({ href }).run();
      }
    },
    [editor]
  );

  const handleLinkCancel = useCallback(() => {
    setLinkInputVisible(false);
    editor.chain().focus().run();
  }, [editor]);

  const btn = (
    active: boolean,
    action: () => void,
    title: string,
    icon: React.ReactNode
  ) => (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center size-8 rounded-radius-2 transition-colors',
        active
          ? 'text-[var(--text-accent)] bg-[var(--blackinverse-a4)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--blackinverse-a4)]'
      )}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
    >
      {icon}
    </button>
  );

  const divider = (
    <span
      className="w-base-1 h-spacing-16 bg-wrapper-a6 flex-shrink-0"
      aria-hidden="true"
    />
  );

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={100}
      shouldShow={({ editor: e }) => {
        if (e.isActive('fileAttachment')) return false;
        return !e.state.selection.empty || linkInputVisible;
      }}
    >
      <div
        role="toolbar"
        aria-label="Text formatting"
        className={cn(
          'inline-flex flex-row items-center gap-0.5',
          'p-spacing-2 rounded-radius-2',
          'bg-background-gray_high',
          'ring-1 ring-stroke-a4',
          'shadow-effects-panel backdrop-blur-effects-panel'
        )}
      >
        {linkInputVisible ? (
          <LinkInput
            defaultValue={linkDefaultValue}
            onSubmit={handleLinkSubmit}
            onCancel={handleLinkCancel}
            placeholder={t('editor.enterUrlPrompt', 'Enter URL')}
          />
        ) : (
          <>
            {btn(
              editor.isActive('bold'),
              () => editor.chain().focus().toggleBold().run(),
              t('editor.toolbar.bold'),
              <Icon variant="textBold" size={16} />
            )}
            {btn(
              editor.isActive('italic'),
              () => editor.chain().focus().toggleItalic().run(),
              t('editor.toolbar.italic'),
              <Icon variant="textItalic" size={16} />
            )}
            {btn(
              editor.isActive('strike'),
              () => editor.chain().focus().toggleStrike().run(),
              t('editor.toolbar.strikethrough'),
              <Icon variant="textStrikethrough" size={16} />
            )}
            {btn(
              editor.isActive('underline'),
              () => editor.chain().focus().toggleUnderline().run(),
              t('editor.toolbar.underline'),
              <Icon variant="textUnderline" size={16} />
            )}
            {btn(
              editor.isActive('link'),
              handleLink,
              t('editor.toolbar.link'),
              <Icon variant="textLink" size={16} />
            )}

            {divider}

            {btn(
              editor.isActive('bulletList'),
              () => editor.chain().focus().toggleBulletList().run(),
              t('editor.toolbar.bulletList'),
              <Icon variant="textList" size={16} />
            )}
            {btn(
              editor.isActive('orderedList'),
              () => editor.chain().focus().toggleOrderedList().run(),
              t('editor.toolbar.numberedList'),
              <Icon variant="textListNumbers" size={16} />
            )}

            {divider}

            {onAskAI &&
              btn(
                false,
                onAskAI,
                t('editor.toolbar.askAI'),
                <Icon variant="ai" size={16} />
              )}
            {btn(
              false,
              () => editor.chain().focus().deleteSelection().run(),
              t('editor.toolbar.delete'),
              <Icon variant="trash" size={16} />
            )}
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
