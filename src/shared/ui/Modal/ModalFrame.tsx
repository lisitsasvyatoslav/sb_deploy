import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import { m } from 'framer-motion';
import { ModalContextProvider } from './ModalContext';
import { ModalControls } from './ModalControls';
import { ModalEditableTitle } from './ModalEditableTitle';
import { ModalEditorSetup } from './ModalEditorSetup';
import { EditorBubbleToolbar } from './EditorBubbleToolbar';
import { PlusButtonMenu } from './PlusButtonMenu';
import { useEditorFileUpload } from './extensions/useEditorFileUpload';
import type {
  EditableTitleConfig,
  EditorConfig,
  ModalSize,
} from './Modal.types';

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-[424px]',
  md: 'max-w-[640px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[1200px]',
};

const fadeTransition = { duration: 0.15 };
const fadeInitial = { opacity: 0 };
const fadeAnimate = { opacity: 1 };
const fadeExit = { opacity: 0 };

const editorClassName =
  'h-full pt-2 px-6 prose prose-sm max-w-none text-[var(--text-primary)] [&_.tiptap]:outline-none [&_*]:!text-inherit [&_a]:!text-[var(--text-accent)] [&_a]:underline [&_a]:cursor-pointer [&_p]:mb-3';

function Overlay({ onClose }: { onClose: () => void }) {
  return (
    <m.div
      className="absolute inset-0 bg-overlay-light backdrop-blur-[12px]"
      onClick={onClose}
      initial={fadeInitial}
      animate={fadeAnimate}
      exit={fadeExit}
      transition={fadeTransition}
    />
  );
}

function EditorBlock({
  editor,
  cardDataId,
  onAskAI,
}: {
  editor: Editor | null;
  cardDataId?: number;
  onAskAI?: () => void;
}) {
  const { handleInsertFile, handleInsertImage } = useEditorFileUpload(
    editor,
    cardDataId
  );

  if (!editor) return null;
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <EditorBubbleToolbar editor={editor} onAskAI={onAskAI} />
      <PlusButtonMenu
        editor={editor}
        onInsertFile={handleInsertFile}
        onInsertImage={handleInsertImage}
      />
      <EditorContent editor={editor} className={editorClassName} />
    </div>
  );
}

export function ModalFrame({
  children,
  className,
  maxWidth,
  zIndex,
  modalId,
  showCloseButton,
  floatingCloseButton,
  expandable,
  leftContent,
  editableTitle,
  colorWidget,
  onAskAI,
  onAskAIWithFile,
  onClose,
  editorConfig,
  expandedBounds,
  onExpandToOverlay,
  expanded,
  onExpandedChange,
  header,
  fullScreen,
}: {
  children: ReactNode;
  className: string;
  maxWidth: ModalSize | number;
  fullScreen?: boolean;
  zIndex: number;
  modalId: string;
  showCloseButton?: boolean;
  floatingCloseButton?: boolean;
  expandable?: boolean;
  leftContent?: ReactNode;
  editableTitle?: EditableTitleConfig;
  colorWidget?: ReactNode;
  onAskAI?: () => void;
  onAskAIWithFile?: (
    fileId: string,
    filename: string,
    mimeType?: string
  ) => void;
  onClose: () => void;
  editorConfig?: EditorConfig;
  expandedBounds?: { left: number; right: number } | null;
  onExpandToOverlay?: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  header?: ReactNode;
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded ?? internalExpanded;
  const setExpanded = useCallback(
    (value: boolean) => {
      if (onExpandedChange) onExpandedChange(value);
      else setInternalExpanded(value);
    },
    [onExpandedChange]
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const toggleExpand = useCallback(
    () => setExpanded(!isExpanded),
    [setExpanded, isExpanded]
  );

  // When expanded, intercept Escape to collapse instead of closing the modal.
  // Uses capture phase so it fires before Modal.tsx's bubble-phase listener.
  useEffect(() => {
    if (!isExpanded) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setExpanded(false);
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [isExpanded, setExpanded]);

  // Sync onAskAIWithFile callback into editor storage for FileAttachmentNodeView
  useEffect(() => {
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = (editor.storage as any)?.fileAttachment;
    if (storage) {
      storage.onAskAIWithFile = onAskAIWithFile ?? null;
    }
  }, [editor, onAskAIWithFile]);

  const contextValue = useMemo(
    () => ({
      showCloseButton,
      floatingCloseButton,
      expandable,
      leftContent,
      onAskAI,
      isExpanded,
      onToggleExpand: toggleExpand,
      onExpandToOverlay,
      onClose,
      editor,
    }),
    [
      showCloseButton,
      floatingCloseButton,
      expandable,
      leftContent,
      onAskAI,
      isExpanded,
      toggleExpand,
      onExpandToOverlay,
      onClose,
      editor,
    ]
  );

  const stopPropagation = useCallback(
    (e: React.MouseEvent) => e.stopPropagation(),
    []
  );

  // Rendered once outside the conditional so toggling isExpanded doesn't
  // unmount/remount the editor (ModalEditorSetup renders null).
  const editorSetup = editorConfig && (
    <ModalEditorSetup config={editorConfig} onEditorReady={setEditor} />
  );

  // Shared across both branches to avoid duplicating ModalContextProvider children.
  const modalContent = (
    <ModalContextProvider value={contextValue}>
      {!header && <ModalControls />}
      <EditorBlock
        editor={editor}
        cardDataId={editorConfig?.cardDataId}
        onAskAI={onAskAI}
      />
      {children}
    </ModalContextProvider>
  );

  const titleBlock = (editableTitle || colorWidget) && (
    <div className="flex items-center justify-between px-6 pb-3 shrink-0">
      <div className="flex-1 min-w-0">
        {editableTitle && <ModalEditableTitle {...editableTitle} />}
      </div>
      {colorWidget && (
        <div className="relative ml-2 shrink-0">{colorWidget}</div>
      )}
    </div>
  );

  // ── Single return: unified tree keeps children mounted across mode switches ──
  const isFull = !!fullScreen;
  const wrapperClass = `fixed inset-0 ${isExpanded ? 'pointer-events-none' : `flex items-center justify-center ${isFull ? 'p-0' : 'p-4'}`}`;

  const panelClass = isExpanded
    ? `fixed top-0 h-full flex flex-col pointer-events-auto bg-surfacegray-high border-l border-blackinverse-a4 shadow-modal backdrop-blur-[40px] overflow-hidden ${className}`
    : `relative flex flex-col items-start ${isFull ? '' : 'gap-spacing-12'} w-full ${isFull ? 'max-w-none' : typeof maxWidth === 'number' ? '' : sizeClass[maxWidth]} ${isFull ? 'h-screen' : 'max-h-[90vh]'} transition-all duration-200 ease-in-out`;

  const panelStyle = isExpanded
    ? { left: expandedBounds?.left ?? 0, right: expandedBounds?.right ?? 0 }
    : typeof maxWidth === 'number'
      ? { maxWidth }
      : undefined;

  const headerWrapperClass = isExpanded
    ? 'pt-spacing-8 pb-spacing-12 pl-spacing-24 pr-spacing-16'
    : 'w-full';

  const contentClass = isExpanded
    ? 'flex-1 min-h-0 flex flex-col overflow-hidden'
    : `relative flex flex-col w-full ${isFull ? 'h-full' : editableTitle ? 'flex-1 min-h-0' : 'max-h-[90vh]'} bg-surfacegray-high ${isFull ? '' : 'border border-blackinverse-a4 rounded shadow-modal'} backdrop-blur-[40px] ${className}`;

  return (
    <>
      {editorSetup}
      <div
        className={wrapperClass}
        style={{ zIndex }}
        data-modal-overlay={zIndex}
        data-modal-id={modalId}
      >
        {!isExpanded && <Overlay onClose={onClose} />}
        {/* key keeps React identity stable when Overlay appears/disappears */}
        <m.div
          key="modal-panel"
          className={panelClass}
          style={panelStyle}
          onClick={stopPropagation}
          initial={fadeInitial}
          animate={fadeAnimate}
          exit={fadeExit}
          transition={fadeTransition}
        >
          {!header && titleBlock}
          {header && <div className={headerWrapperClass}>{header}</div>}
          <div className={contentClass}>{modalContent}</div>
        </m.div>
      </div>
    </>
  );
}
