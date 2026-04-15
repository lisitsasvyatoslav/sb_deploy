import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useTranslation } from '@/shared/i18n/client';
import InlineChip, { InlineChipData, InlineChipType } from './InlineChip';
import { isValidUrl } from '@/shared/utils/ogExtractor';

export interface ChatInputContent {
  text: string;
  chips: InlineChipData[];
}

export interface ChatInputRichContentRef {
  focus: () => void;
  blur: () => void;
  insertChip: (chipData: InlineChipData) => void;
  removeChip: (chipId: string) => void;
  clear: () => void;
  getContent: () => ChatInputContent;
}

interface ChatInputRichContentProps {
  /** Current plain text value (for controlled component) */
  value: string;
  /** Callback when content changes */
  onChange: (value: string, chips: InlineChipData[]) => void;
  /** Callback when Enter is pressed (without Shift) */
  onSend?: () => void;
  /** Callback when focus state changes */
  onFocusChange?: (focused: boolean) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Current chips in the input */
  chips?: InlineChipData[];
  /** Additional className */
  className?: string;
  /** Callback when file is pasted */
  onPasteFile?: (file: File) => void;
  /** Callback when URL is pasted (for creating link chips) */
  onPasteUrl?: (url: string) => void;
  /** Whether there are external attachments (files, cards, trades) */
  hasAttachments?: boolean;
}

/**
 * Extract domain from URL for display
 */
const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

/**
 * Generate a unique ID for chips
 */
const generateChipId = (): string => {
  return `chip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Serialize content from DOM to ChatInputContent
 */
const serializeContent = (element: HTMLElement): ChatInputContent => {
  let text = '';
  const chips: InlineChipData[] = [];

  const walkNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    } else if (node instanceof HTMLElement) {
      if (node.classList.contains('inline-chip-wrapper')) {
        const chipId = node.dataset.chipId;
        const chipType = node.dataset.chipType as InlineChipType;
        const chipLabel = node.dataset.chipLabel;
        const chipUrl = node.dataset.chipUrl;
        const chipTicker = node.dataset.chipTicker;
        const chipFileId = node.dataset.chipFileId;

        if (chipId && chipType && chipLabel) {
          chips.push({
            id: chipId,
            type: chipType,
            label: chipLabel,
            url: chipUrl,
            tickerSymbol: chipTicker,
            fileId: chipFileId,
          });
          text += ' '; // Chip takes one space in text
        }
      } else if (node.tagName === 'BR') {
        text += '\n';
      } else {
        // Recursively walk children
        node.childNodes.forEach(walkNodes);
        // Add newline for block elements (except the last one)
        if (node.tagName === 'DIV' && node.nextSibling) {
          text += '\n';
        }
      }
    }
  };

  element.childNodes.forEach(walkNodes);

  return { text: text.trim(), chips };
};

/**
 * ChatInputRichContent - A contentEditable component that supports inline chips
 * for links, cards, and tickers within the text input.
 */
const ChatInputRichContent: React.FC<
  ChatInputRichContentProps & { ref?: React.Ref<ChatInputRichContentRef> }
> = ({
  value,
  onChange,
  onSend,
  onFocusChange,
  placeholder,
  disabled = false,
  chips = [],
  className = '',
  onPasteFile,
  onPasteUrl,
  hasAttachments = false,
  ref,
}) => {
  const { t } = useTranslation('chat');
  const resolvedPlaceholder = placeholder ?? t('input.richPlaceholder');
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const lastValueRef = useRef(value);
  const chipsRef = useRef<InlineChipData[]>(chips);
  const chipRootsRef = useRef<Map<string, Root>>(new Map());
  // Local state to track chips count for re-rendering (since parent may not sync chips prop)
  const [localChipsCount, setLocalChipsCount] = useState(chips.length);

  // Update chipsRef when chips prop changes
  useEffect(() => {
    chipsRef.current = chips;
    setLocalChipsCount(chips.length);
  }, [chips]);

  // Unmount all chip roots on component unmount
  useEffect(() => {
    const roots = chipRootsRef.current;
    return () => {
      roots.forEach((root) => root.unmount());
      roots.clear();
    };
  }, []);

  // Insert a chip at the current cursor position
  const insertChip = useCallback(
    (chipData: InlineChipData) => {
      const editor = editorRef.current;
      if (!editor || disabled) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // If no selection, place at end
        editor.focus();
      }

      const range = selection?.getRangeAt(0);

      // Create a minimal container for React to render into
      const chipElement = document.createElement('span');

      // Set data attributes on wrapper BEFORE React render (which is async)
      // so serializeContent can find them immediately
      chipElement.className = 'inline-chip-wrapper';
      chipElement.dataset.chipId = chipData.id;
      chipElement.dataset.chipType = chipData.type;
      chipElement.dataset.chipLabel = chipData.label;
      if (chipData.url) chipElement.dataset.chipUrl = chipData.url;
      if (chipData.tickerSymbol)
        chipElement.dataset.chipTicker = chipData.tickerSymbol;
      if (chipData.fileId) chipElement.dataset.chipFileId = chipData.fileId;

      // Render InlineChip inside the wrapper (data attrs already on wrapper for serializeContent)
      const root = createRoot(chipElement);
      chipRootsRef.current.set(chipData.id, root);
      root.render(
        <InlineChip
          type={chipData.type}
          label={chipData.label}
          onRemove={() => {
            chipElement.remove();
            root.unmount();
            chipRootsRef.current.delete(chipData.id);
            // Trigger onChange after removal
            const content = serializeContent(editor);
            onChange(content.text, content.chips);
            setLocalChipsCount(content.chips.length);
          }}
        />
      );

      // Insert at cursor or end
      if (range && editor.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(chipElement);

        // Move cursor after the chip
        range.setStartAfter(chipElement);
        range.setEndAfter(chipElement);
        selection?.removeAllRanges();
        selection?.addRange(range);

        // Add a space after the chip for better UX
        const space = document.createTextNode('\u00A0');
        range.insertNode(space);
        range.setStartAfter(space);
        range.setEndAfter(space);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        editor.appendChild(chipElement);
        editor.appendChild(document.createTextNode('\u00A0'));
      }

      // Trigger onChange
      const content = serializeContent(editor);
      onChange(content.text, content.chips);
      setLocalChipsCount(content.chips.length);
    },
    [disabled, onChange]
  );

  // Unmount a chip's React root by chip ID
  const unmountChipRoot = useCallback((chipId: string) => {
    const root = chipRootsRef.current.get(chipId);
    if (root) {
      root.unmount();
      chipRootsRef.current.delete(chipId);
    }
  }, []);

  // Remove a chip by ID
  const removeChip = useCallback(
    (chipId: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      // Find and remove the chip element from DOM
      const chipElement = editor.querySelector(`[data-chip-id="${chipId}"]`);
      if (chipElement) {
        unmountChipRoot(chipId);
        chipElement.remove();
        // Trigger onChange after removal
        const content = serializeContent(editor);
        onChange(content.text, content.chips);
        setLocalChipsCount(content.chips.length);
      }
    },
    [onChange, unmountChipRoot]
  );

  // Clear the editor
  const clear = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Unmount all chip React roots before clearing DOM
    chipRootsRef.current.forEach((root) => root.unmount());
    chipRootsRef.current.clear();
    editor.innerHTML = '';
    lastValueRef.current = '';
    chipsRef.current = [];
    onChange('', []);
    setLocalChipsCount(0);
  }, [onChange]);

  // Get current content
  const getContent = useCallback((): ChatInputContent => {
    const editor = editorRef.current;
    if (!editor) return { text: '', chips: [] };
    return serializeContent(editor);
  }, []);

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      focus: () => editorRef.current?.focus(),
      blur: () => editorRef.current?.blur(),
      insertChip,
      removeChip,
      clear,
      getContent,
    }),
    [insertChip, removeChip, clear, getContent]
  );

  // Handle input changes
  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;

    const editor = editorRef.current;
    if (!editor) return;

    const content = serializeContent(editor);
    lastValueRef.current = content.text;
    chipsRef.current = content.chips;
    onChange(content.text, content.chips);
    setLocalChipsCount(content.chips.length);
  }, [onChange]);

  // Handle key down events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Handle Enter key
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend?.();
        return;
      }

      // Handle backspace through chip
      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (!range.collapsed) return;

        const node = range.startContainer;
        const offset = range.startOffset;

        // Check if we're at the beginning of a text node following a chip
        if (node.nodeType === Node.TEXT_NODE && offset === 0) {
          const prevSibling = node.previousSibling;
          if (
            prevSibling instanceof HTMLElement &&
            prevSibling.classList.contains('inline-chip-wrapper')
          ) {
            e.preventDefault();
            const chipId = prevSibling.dataset.chipId;
            if (chipId) unmountChipRoot(chipId);
            prevSibling.remove();
            handleInput();
            return;
          }
        }

        // Check if we're in the editor and the previous element is a chip
        if (node === editorRef.current && offset > 0) {
          const prevChild = editorRef.current.childNodes[offset - 1];
          if (
            prevChild instanceof HTMLElement &&
            prevChild.classList.contains('inline-chip-wrapper')
          ) {
            e.preventDefault();
            const chipId = prevChild.dataset.chipId;
            if (chipId) unmountChipRoot(chipId);
            prevChild.remove();
            handleInput();
            return;
          }
        }
      }
    },
    [onSend, handleInput, unmountChipRoot]
  );

  // Handle paste events
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      // Prevent the global paste-to-board listener in usePasteToBoard.ts
      // from also creating a card when pasting into the chat input.
      e.stopPropagation();

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // Check for files first - process ALL files, not just the first one
      const items = clipboardData.items;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0 && onPasteFile) {
        e.preventDefault();
        // Process all pasted files
        files.forEach((file) => onPasteFile(file));
        return;
      }

      // Check for URL in plain text
      const text = clipboardData.getData('text/plain').trim();
      if (text && isValidUrl(text)) {
        e.preventDefault();

        if (onPasteUrl) {
          onPasteUrl(text);
        } else {
          // Default behavior: insert as link chip
          insertChip({
            id: generateChipId(),
            type: 'link',
            label: extractDomain(text),
            url: text,
          });
        }
        return;
      }

      // For regular text, let default paste happen but clean up HTML
      if (text) {
        e.preventDefault();
        document.execCommand('insertText', false, text);
      }
    },
    [onPasteFile, onPasteUrl, insertChip]
  );

  // Handle composition events (for IME input)
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);

  // Sync external value changes to editor (must run before the .empty-class sync)
  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Only sync if external value is different from our last known value
    // and there are no chips (otherwise we'd lose the chip structure)
    if (value !== lastValueRef.current && chipsRef.current.length === 0) {
      const hadFocus = document.activeElement === editor;

      // Only update if the editor is empty or value was cleared externally
      if (editor.textContent !== value) {
        if (value === '') {
          editor.innerHTML = '';
        } else if (!hadFocus) {
          // Only set text content if not focused to avoid cursor jumps
          editor.textContent = value;
        }
      }

      lastValueRef.current = value;
    }
  }, [value]);

  // Sync .empty class directly to DOM based on actual content (avoids flicker)
  // useLayoutEffect runs synchronously before paint
  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Check DOM directly for content
    const hasChips = editor.querySelector('.inline-chip-wrapper') !== null;
    // Replace non-breaking spaces (\u00A0) with regular spaces before trimming
    // because .trim() doesn't remove \u00A0
    const textContent = (editor.textContent || '')
      .replace(/\u00A0/g, ' ')
      .trim();
    const hasText = textContent.length > 0;
    const editorIsEmpty = !hasChips && !hasText && !hasAttachments;

    if (editorIsEmpty) {
      editor.classList.add('empty');
    } else {
      editor.classList.remove('empty');
    }
  }, [value, localChipsCount, hasAttachments]);

  return (
    <div
      ref={editorRef}
      contentEditable={!disabled}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      data-placeholder={resolvedPlaceholder}
      suppressContentEditableWarning
      className={`
          chat-input-editable
          w-full
          outline-none
          text-sm text-text-primary
          leading-5 tracking-[-0.2px]
          min-h-[24px] max-h-[120px]
          overflow-y-auto
          whitespace-pre-wrap
          break-words
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${className}
        `}
      role="textbox"
      aria-multiline="true"
      aria-label={resolvedPlaceholder}
      aria-placeholder={resolvedPlaceholder}
      {...(disabled && { 'aria-disabled': 'true' })}
    />
  );
};

export default ChatInputRichContent;
export { generateChipId, extractDomain };
