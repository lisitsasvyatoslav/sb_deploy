'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { Typography, Alert } from '@mui/material';
import { InsertDriveFile, Download } from '@mui/icons-material';
import { Card } from '@/types';
import FileDetailContent, {
  useFilePreview,
  getFileIcon,
} from '@/features/ticker/components/FileDetailContent';
import {
  getFileType,
  isPdfFile,
  isImageFile,
} from '@/shared/ui/Modal/extensions/fileTypeUtils';

interface FilePreviewProps {
  open: boolean;
  card: Card | null;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ open, card, onClose }) => {
  const { t } = useTranslation('board');
  const { t: tCommon } = useTranslation('common');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const cardFileId = (card?.meta?.file_id || card?.meta?.fileId) as
    | string
    | undefined;
  const fileName =
    card?.meta?.filename || card?.title || t('filePreview.fileDefault');

  const {
    fileUrl,
    isLoadingContent,
    textContent,
    contentError,
    setContentError,
  } = useFilePreview(open ? cardFileId : null, fileName);

  const handleDownload = useCallback(() => {
    if (!fileUrl) {
      setDownloadError(t('filePreview.notFound'));
      return;
    }
    setDownloadError(null);
    window.open(fileUrl, '_blank');
  }, [fileUrl, t]);

  const handleDialogContextMenu = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target && target.closest('input, textarea, [contenteditable="true"]')) {
      return;
    }
    event.preventDefault();
  }, []);

  if (!card) return null;

  const cardMeta = card.meta;
  const hasFile = cardMeta?.file_id || cardMeta?.fileId;

  if (!hasFile) {
    return (
      <Modal
        open={open}
        onOpenChange={(isOpen) => !isOpen && onClose()}
        maxWidth="md"
        zIndex={1500}
      >
        <ModalHeader className="pt-2">
          <div className="flex items-center gap-4">
            <InsertDriveFile className="!text-5xl text-[var(--text-secondary)]" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {card.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('filePreview.fileTypeCard')}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              {t('filePreview.fileNotFound')}
            </Typography>
            <Typography variant="body2">
              {t('filePreview.fileNotAttached')}
            </Typography>
          </Alert>
        </ModalBody>
      </Modal>
    );
  }

  const fileType = getFileType(fileName);
  const fileSize = cardMeta?.file_size || cardMeta?.fileSize;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return t('filePreview.unknown');
    if (bytes < 1024) return tCommon('fileSize.bytes', { size: bytes });
    if (bytes < 1024 * 1024)
      return tCommon('fileSize.kilobytes', {
        size: (bytes / 1024).toFixed(1),
      });
    return tCommon('fileSize.megabytes', {
      size: (bytes / (1024 * 1024)).toFixed(1),
    });
  };

  const contentMaxWidth =
    isPdfFile(fileType) || isImageFile(fileType)
      ? ('lg' as const)
      : ('md' as const);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      maxWidth={contentMaxWidth}
      zIndex={1500}
      expandable={!!card}
    >
      <ModalHeader className="pt-2">
        <div className="flex items-center gap-4">
          {getFileIcon(fileType)}
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {fileName}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {fileType.toUpperCase()} {t('filePreview.fileDefault')}{' '}
              {fileSize && `• ${formatFileSize(fileSize)}`}
            </p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody padding="none">
        <div onContextMenu={handleDialogContextMenu}>
          <FileDetailContent
            card={card}
            fileUrl={fileUrl}
            isLoadingContent={isLoadingContent}
            textContent={textContent}
            contentError={contentError}
            onContentError={setContentError}
          />

          {downloadError && (
            <Alert severity="error" className="mx-4 mb-4">
              {downloadError}
            </Alert>
          )}
        </div>
      </ModalBody>
      <ModalFooter align="center">
        <Button
          variant="accent"
          size="md"
          icon={<Download />}
          onClick={handleDownload}
          disabled={!fileUrl}
        >
          {t('filePreview.download')}
        </Button>
        <Button variant="secondary" size="md" onClick={onClose}>
          {t('filePreview.close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default FilePreview;
