'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon/Icon';
import { filesApi } from '@/services/api/files';
import Dialog from '@/shared/ui/Dialog/Dialog';
import { useTranslation } from '@/shared/i18n/client';
import type { FileAttachmentAttrs } from './FileAttachmentExtension';
import {
  getFileType,
  isImageFile,
  isPdfFile,
  isTextFile,
  isExcelFile,
  isWordFile,
} from './fileTypeUtils';
import { formatFileSize } from '@/shared/utils/fileUtils';

function getFileIcon(
  mimeType: string,
  fileType: string
): 'doc' | 'image' | 'docFull' {
  if (mimeType?.startsWith('image/')) return 'image';
  if (fileType === 'pdf' || mimeType === 'application/pdf') return 'doc';
  return 'docFull';
}

/* ── Shared editor storage helpers ── */

interface FileAttachmentStorage {
  expandedNodes: Record<string, boolean>;
  onAskAIWithFile:
    | ((fileId: string, filename: string, mimeType?: string) => void)
    | null;
}

function getFileAttachmentStorage(
  editor: Editor
): FileAttachmentStorage | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (editor.storage as any)?.fileAttachment;
}

interface FileNodeInfo {
  pos: number;
  attrs: FileAttachmentAttrs;
}

// Memoized by doc reference (ProseMirror docs are immutable).
// Uses a WeakMap so each editor's doc is cached independently.
const _fileNodeCache = new WeakMap<ProseMirrorNode, FileNodeInfo[]>();

function collectFileNodes(editor: Editor): FileNodeInfo[] {
  const doc = editor.state.doc;
  const cached = _fileNodeCache.get(doc);
  if (cached) return cached;
  const nodes: FileNodeInfo[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === 'fileAttachment') {
      nodes.push({ pos, attrs: node.attrs as FileAttachmentAttrs });
    }
  });
  _fileNodeCache.set(doc, nodes);
  return nodes;
}

function getExpandedNodes(editor: Editor): Record<string, boolean> {
  return getFileAttachmentStorage(editor)?.expandedNodes ?? {};
}

function setExpandedNode(editor: Editor, fileId: string, value: boolean) {
  const storage = getFileAttachmentStorage(editor);
  if (!storage) return;
  storage.expandedNodes = { ...storage.expandedNodes, [fileId]: value };
  editor.view.dispatch(editor.state.tr.setMeta('fileExpandToggle', true));
}

function toggleExpandedNode(editor: Editor, fileId: string) {
  setExpandedNode(editor, fileId, !getExpandedNodes(editor)[fileId]);
}

/* ── Hover toolbar (portal-rendered to escape overflow clipping) ── */

function HoverToolbar({
  editor,
  fileId,
  filename,
  mimeType,
  expanded,
  anchorRef,
  onMouseEnter,
  onMouseLeave,
  onDelete,
}: {
  editor: Editor;
  fileId: string;
  filename: string;
  mimeType: string;
  expanded: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation('common');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Position the toolbar at the top-left of the anchor element.
  // Runs on mount and whenever expanded/fileId changes (layout shifts).
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const toolbar = toolbarRef.current;
    if (!anchor || !toolbar) return;
    const rect = anchor.getBoundingClientRect();
    const th = toolbar.offsetHeight;
    // Find the modal container to clamp within its bounds
    const modal = anchor.closest('[role="dialog"]');
    const minTop = modal ? modal.getBoundingClientRect().top : 0;
    const idealTop = rect.top - th;
    setPos({ top: Math.max(idealTop, minTop), left: rect.left });
  }, [anchorRef, expanded, fileId]);

  const fileNodes = collectFileNodes(editor);
  const currentIndex = fileNodes.findIndex((n) => n.attrs.fileId === fileId);
  const totalCount = fileNodes.length;

  const navigateTo = useCallback(
    (targetIndex: number) => {
      const target = fileNodes[targetIndex];
      if (!target) return;
      if (expanded) {
        setExpandedNode(editor, target.attrs.fileId, true);
      }
      editor.chain().focus().setNodeSelection(target.pos).run();
      const dom = editor.view.nodeDOM(target.pos);
      if (dom instanceof HTMLElement) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [editor, fileNodes, expanded]
  );

  const handleToggleView = useCallback(() => {
    toggleExpandedNode(editor, fileId);
  }, [editor, fileId]);

  const iconBtn = (
    action: () => void,
    title: string,
    icon: React.ReactNode,
    opts?: { disabled?: boolean; danger?: boolean; active?: boolean }
  ) => (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center size-6 rounded-radius-2 transition-colors',
        opts?.disabled && 'opacity-30 cursor-default',
        opts?.active && 'text-text-accent bg-blackinverse-a4',
        opts?.danger
          ? 'text-blackinverse-a56 hover:text-[var(--red-500,#ef4444)]'
          : 'text-blackinverse-a56 hover:text-blackinverse-a100 hover:bg-blackinverse-a4'
      )}
      title={title}
      disabled={opts?.disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!opts?.disabled) action();
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

  return createPortal(
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="File attachment actions"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={
        pos
          ? { top: pos.top, left: pos.left, visibility: 'visible' }
          : { top: -9999, left: -9999, visibility: 'hidden' }
      }
      className={cn(
        'fixed z-[9999]',
        'inline-flex flex-row items-center gap-spacing-10',
        'p-spacing-4 px-spacing-8 rounded-radius-4',
        'bg-background-gray_high',
        'ring-1 ring-stroke-a4',
        'shadow-effects-panel backdrop-blur-effects-panel',
        'whitespace-nowrap'
      )}
    >
      {/* Filename */}
      <span
        className="text-12 text-blackinverse-a100 truncate max-w-[368px] leading-5"
        title={filename}
      >
        {filename || t('editor.unknownFile', 'Unknown file')}
      </span>

      {/* Pagination (hidden when single file) */}
      {totalCount > 1 && (
        <>
          {divider}
          {iconBtn(
            () => navigateTo(currentIndex - 1),
            t('editor.previousFile', 'Previous file'),
            <Icon variant="chevronLeftSmall" size={16} />,
            { disabled: currentIndex <= 0 }
          )}
          <span className="text-12 font-medium text-blackinverse-a56 tabular-nums leading-5 select-none">
            {currentIndex + 1}/{totalCount}
          </span>
          {iconBtn(
            () => navigateTo(currentIndex + 1),
            t('editor.nextFile', 'Next file'),
            <Icon variant="chevronRightSmall" size={16} />,
            { disabled: currentIndex >= totalCount - 1 }
          )}
        </>
      )}

      {/* View toggle */}
      {iconBtn(
        handleToggleView,
        expanded
          ? t('editor.collapseFile', 'Collapse file')
          : t('editor.expandFile', 'Expand file'),
        <Icon variant={expanded ? 'docStroke' : 'docFull'} size={20} />,
        { active: expanded }
      )}

      {/* Ask AI */}
      {getFileAttachmentStorage(editor)?.onAskAIWithFile &&
        iconBtn(
          () =>
            getFileAttachmentStorage(editor)?.onAskAIWithFile?.(
              fileId,
              filename,
              mimeType
            ),
          t('editor.askAI', 'Ask AI'),
          <Icon variant="ai" size={20} />
        )}

      {divider}

      {/* Delete */}
      {iconBtn(
        onDelete,
        t('editor.deleteFile', 'Delete file'),
        <Icon variant="trash" size={20} />,
        {
          danger: true,
        }
      )}
    </div>,
    document.body
  );
}

/* ── Shared file info block ── */

function FileInfo({
  filename,
  fileSize,
  iconVariant,
  unknownFileLabel,
}: {
  filename: string;
  fileSize: number;
  iconVariant: 'doc' | 'image' | 'docFull';
  unknownFileLabel: string;
}) {
  return (
    <>
      <div className="flex items-center justify-center w-8 h-8 shrink-0 text-[var(--text-secondary)]">
        <Icon variant={iconVariant} size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-14 text-[var(--text-primary)] truncate leading-5"
          title={filename}
        >
          {filename || unknownFileLabel}
        </div>
        {fileSize > 0 && (
          <div className="text-12 text-[var(--text-muted)] leading-4 mt-0.5">
            {formatFileSize(fileSize)}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Main NodeView ── */

export function FileAttachmentNodeView({
  node,
  editor,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as FileAttachmentAttrs;
  const { fileId, filename, fileSize, mimeType, fileType, loading } = attrs;

  const { t } = useTranslation('common');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDestroyingRef = useRef(false);

  // Read expanded state from shared editor storage
  const [expanded, setExpandedLocal] = useState(false);
  useEffect(() => {
    const update = () => {
      if (isDestroyingRef.current) return;
      setExpandedLocal(!!getExpandedNodes(editor)[fileId]);
    };
    update();
    editor.on('transaction', update);
    return () => {
      editor.off('transaction', update);
    };
  }, [editor, fileId]);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setHovered(false), 150);
  }, []);

  useEffect(() => {
    return () => clearTimeout(hoverTimeoutRef.current);
  }, []);

  // Fetch presigned URL on mount and refresh before expiry (skip while uploading)
  useEffect(() => {
    if (!fileId || loading) return;
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout>;

    const fetchUrl = () => {
      filesApi
        .getFile(fileId)
        .then((info) => {
          if (cancelled) return;
          setDownloadUrl(info.downloadUrl);
          // Re-fetch 45 min before typical 1h expiry
          refreshTimer = setTimeout(fetchUrl, 45 * 60 * 1000);
        })
        .catch(() => {
          // ignore — user can retry
        });
    };

    fetchUrl();
    return () => {
      cancelled = true;
      clearTimeout(refreshTimer);
    };
  }, [fileId, loading]);

  // Fetch text content when expanding a text file
  const resolvedFileType = fileType || getFileType(filename);
  useEffect(() => {
    if (
      !expanded ||
      !downloadUrl ||
      !isTextFile(resolvedFileType) ||
      textContent !== null
    )
      return;
    setTextLoading(true);
    fetch(downloadUrl)
      .then((r) => r.text())
      .then(setTextContent)
      .catch(() => setTextContent('Failed to load text content'))
      .finally(() => setTextLoading(false));
  }, [expanded, downloadUrl, resolvedFileType, textContent]);

  const iconVariant = getFileIcon(mimeType, fileType);

  // Render the inline preview based on file type
  const renderPreview = () => {
    if (!downloadUrl) {
      return (
        <div className="flex items-center justify-center h-[200px] text-[var(--text-muted)]">
          <Icon variant="loader" size={24} className="animate-spin" />
        </div>
      );
    }

    if (isPdfFile(resolvedFileType)) {
      return (
        <iframe
          src={downloadUrl}
          className="w-full h-[360px] border-0"
          title={filename}
        />
      );
    }

    if (isImageFile(resolvedFileType)) {
      return (
        <div className="flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={downloadUrl}
            alt={filename}
            className="max-w-full max-h-[360px] object-contain rounded"
          />
        </div>
      );
    }

    if (isTextFile(resolvedFileType)) {
      if (textLoading) {
        return (
          <div className="flex items-center justify-center h-[200px] text-[var(--text-muted)]">
            <Icon variant="loader" size={24} className="animate-spin" />
          </div>
        );
      }
      return (
        <pre className="whitespace-pre-wrap font-mono text-12 p-4 max-h-[360px] overflow-auto text-[var(--text-primary)]">
          {textContent}
        </pre>
      );
    }

    if (isExcelFile(resolvedFileType) || isWordFile(resolvedFileType)) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-[var(--text-muted)]">
          <Icon variant={iconVariant} size={48} />
          <span className="text-12">
            {t(
              'editor.officePreviewUnavailable',
              'Preview not available for Office documents'
            )}
          </span>
          <a
            href={downloadUrl}
            download={filename}
            className="text-12 text-[var(--text-accent)] hover:underline"
          >
            {t('editor.downloadFile', 'Download file')}
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-[var(--text-muted)]">
        <Icon variant={iconVariant} size={48} />
        <span className="text-12">
          {t('editor.previewNotAvailable', 'Preview not available')}
        </span>
      </div>
    );
  };

  const handleDeleteRequest = useCallback(() => setDeleteConfirmOpen(true), []);

  const handleDeleteConfirm = useCallback(() => {
    isDestroyingRef.current = true;
    setDeleteConfirmOpen(false);
    const fileNode = collectFileNodes(editor).find(
      (n) => n.attrs.fileId === fileId
    );
    if (!fileNode) return;
    editor
      .chain()
      .focus()
      .setNodeSelection(fileNode.pos)
      .deleteSelection()
      .run();
  }, [editor, fileId]);

  const toolbar = hovered && (
    <HoverToolbar
      editor={editor}
      fileId={fileId}
      filename={filename}
      mimeType={mimeType}
      expanded={expanded}
      anchorRef={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDelete={handleDeleteRequest}
    />
  );

  const deleteDialog = (
    <Dialog
      open={deleteConfirmOpen}
      onOpenChange={setDeleteConfirmOpen}
      icon="delete"
      title={t('editor.deleteFileTitle', 'Delete file?')}
      subtitle={t('editor.deleteFileSubtitle', {
        filename,
        defaultValue: 'The file "{{filename}}" will be removed from the note.',
      })}
      confirmLabel={t('editor.deleteFileConfirm', 'Delete')}
      cancelLabel={t('editor.deleteFileCancel', 'Cancel')}
      onConfirm={handleDeleteConfirm}
    />
  );

  // ── Loading view ──
  if (loading) {
    return (
      <NodeViewWrapper
        as="div"
        data-type="file-attachment"
        contentEditable={false}
      >
        <div
          className={cn(
            'my-2 flex items-center gap-3 px-4 py-3',
            'rounded-radius-2 border border-blackinverse-a4',
            'bg-background-gray_high',
            'cursor-default select-none'
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 shrink-0 text-[var(--text-muted)]">
            <Icon variant="loader" size={24} className="animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-14 text-[var(--text-primary)] truncate leading-5">
              {filename}
            </div>
            <div className="text-12 text-[var(--text-muted)] leading-4 mt-0.5">
              {t('editor.uploading', 'Uploading...')}
            </div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // ── Expanded view ──
  if (expanded) {
    return (
      <NodeViewWrapper
        as="div"
        data-type="file-attachment"
        contentEditable={false}
      >
        <div
          ref={wrapperRef}
          className={cn(
            'my-2 rounded-radius-2 border overflow-hidden',
            'bg-background-gray_high',
            selected ? 'border-[var(--text-accent)]' : 'border-blackinverse-a4',
            'cursor-default select-none'
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {toolbar}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-blackinverse-a4">
            <FileInfo
              filename={filename}
              fileSize={fileSize}
              iconVariant={iconVariant}
              unknownFileLabel={t('editor.unknownFile', 'Unknown file')}
            />
          </div>
          <div className="max-h-[400px] overflow-auto">{renderPreview()}</div>
        </div>
        {deleteDialog}
      </NodeViewWrapper>
    );
  }

  // ── Collapsed view ──
  return (
    <NodeViewWrapper
      as="div"
      data-type="file-attachment"
      contentEditable={false}
    >
      <div
        ref={wrapperRef}
        className={cn(
          'my-2 flex items-center gap-3 px-4 py-3',
          'rounded-radius-2 border',
          'bg-background-gray_high',
          selected ? 'border-[var(--text-accent)]' : 'border-blackinverse-a4',
          'cursor-default select-none'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {toolbar}
        <FileInfo
          filename={filename}
          fileSize={fileSize}
          iconVariant={iconVariant}
          unknownFileLabel={t('editor.unknownFile', 'Unknown file')}
        />
      </div>
      {deleteDialog}
    </NodeViewWrapper>
  );
}
