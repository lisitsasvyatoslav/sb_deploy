'use client';

import { type ReactNode, useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useTranslation } from '@/shared/i18n/client';
import { Typography, Paper, CircularProgress, Alert, Box } from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  TextSnippet,
  InsertDriveFile,
  Image,
  Description,
  OpenInNew,
} from '@mui/icons-material';
import Button from '@/shared/ui/Button';
import { filesApi } from '@/services/api/files';
import { logger } from '@/shared/utils/logger';
import type { Card } from '@/types';

import {
  getFileType,
  isImageFile,
  isPdfFile,
  isTextFile,
  isExcelFile,
  isWordFile,
} from '@/shared/ui/Modal/extensions/fileTypeUtils';

export function getFileIcon(fileType: string): ReactNode {
  switch (fileType) {
    case 'pdf':
      return <PictureAsPdf className="!text-5xl !text-status-negative" />;
    case 'xlsx':
    case 'xls':
    case 'ods':
      return <TableChart className="!text-5xl !text-status-success" />;
    case 'csv':
    case 'txt':
      return <TextSnippet className="!text-5xl !text-colors-other_blue" />;
    case 'doc':
    case 'docx':
    case 'odt':
    case 'rtf':
      return <Description className="!text-5xl !text-accent" />;
    case 'ppt':
    case 'pptx':
    case 'odp':
      return <Description className="!text-5xl !text-accent" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return (
        <Image
          className="!text-5xl"
          style={{ color: 'var(--brand-primary)' }}
        />
      );
    default:
      return <InsertDriveFile className="!text-5xl !text-text-secondary" />;
  }
}

/* ── Hook: shared file-loading state ── */

export interface UseFilePreviewReturn {
  fileUrl: string | null;
  isLoadingContent: boolean;
  textContent: string | null;
  contentError: string | null;
  setContentError: (err: string | null) => void;
}

export function useFilePreview(
  cardFileId: string | null | undefined,
  fileName: string
): UseFilePreviewReturn {
  const { t } = useTranslation('board');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardFileId) {
      setFileUrl(null);
      setTextContent(null);
      setContentError(null);
      return;
    }

    const fileType = getFileType(fileName);
    setIsLoadingContent(true);
    setContentError(null);

    filesApi
      .getFile(cardFileId)
      .then(async (fileInfo) => {
        setFileUrl(fileInfo.downloadUrl);
        if (isTextFile(fileType)) {
          try {
            const response = await fetch(fileInfo.downloadUrl);
            if (!response.ok) throw new Error('Failed to fetch text content');
            const text = await response.text();
            setTextContent(text);
          } catch (err) {
            logger.error('useFilePreview', 'Error fetching text content', err);
            setContentError(t('filePreview.contentLoadError'));
          }
        }
      })
      .catch((err) => {
        logger.error('useFilePreview', 'Error loading file', err);
        setContentError(t('filePreview.loadError'));
      })
      .finally(() => {
        setIsLoadingContent(false);
      });
  }, [cardFileId, fileName, t]);

  return {
    fileUrl,
    isLoadingContent,
    textContent,
    contentError,
    setContentError,
  };
}

/* ── FileDetailContent — shared rendering body ── */

interface FileDetailContentProps {
  card: Card;
  fileUrl: string | null;
  isLoadingContent: boolean;
  textContent: string | null;
  contentError: string | null;
  onContentError: (err: string | null) => void;
}

export default function FileDetailContent({
  card,
  fileUrl,
  isLoadingContent,
  textContent,
  contentError,
  onContentError,
}: FileDetailContentProps) {
  const { t } = useTranslation('board');

  const cardMeta = card.meta;
  const fileName =
    cardMeta?.filename || card.title || t('filePreview.fileDefault');
  const fileType = getFileType(fileName);

  const renderFileContent = () => {
    if (isLoadingContent) {
      return (
        <div className="flex justify-center items-center py-20">
          <CircularProgress />
        </div>
      );
    }

    if (contentError) {
      return (
        <Alert severity="error" className="mb-4">
          {contentError}
        </Alert>
      );
    }

    if (isImageFile(fileType) && fileUrl) {
      return (
        <div className="flex justify-center items-center rounded-lg p-4 mb-4 bg-[var(--bg-card)]">
          <NextImage
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain"
            width={800}
            height={600}
            unoptimized
            onError={() => onContentError(t('filePreview.imageLoadError'))}
          />
        </div>
      );
    }

    if (isPdfFile(fileType) && fileUrl) {
      return (
        <div className="mb-4">
          <iframe
            src={fileUrl}
            className="w-full h-[80vh] rounded-lg border border-[var(--border-medium)]"
            title={fileName}
          />
          <div className="flex justify-center mt-4">
            <Button
              variant="secondary"
              size="md"
              icon={<OpenInNew />}
              onClick={() => window.open(fileUrl, '_blank')}
            >
              {t('filePreview.openInNewTab')}
            </Button>
          </div>
        </div>
      );
    }

    if (isTextFile(fileType) && textContent !== null) {
      return (
        <Paper className="!p-4 mb-4 !bg-[var(--bg-card)]" elevation={0}>
          <pre className="whitespace-pre-wrap font-mono text-sm max-h-[70vh] overflow-auto text-[var(--text-primary)]">
            {textContent}
          </pre>
        </Paper>
      );
    }

    if ((isExcelFile(fileType) || isWordFile(fileType)) && fileUrl) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return (
        <div className="mb-4">
          <iframe
            src={officeViewerUrl}
            className="w-full h-[80vh] rounded-lg border border-[var(--border-medium)]"
            title={fileName}
          />
          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={<OpenInNew />}
              onClick={() => window.open(fileUrl, '_blank')}
            >
              {t('filePreview.openFile')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <Paper className="!p-6 !bg-[var(--surface-medium)]">
          <div className="flex justify-center mb-6">
            <Box className="p-8 rounded-lg !bg-[var(--bg-card)]">
              {getFileIcon(fileType)}
            </Box>
          </div>
          <Alert severity="info" className="mb-4">
            <Typography variant="body2">
              {t('filePreview.previewUnavailable')}
            </Typography>
          </Alert>
        </Paper>
      </div>
    );
  };

  return (
    <div className="p-4 bg-[var(--surface-medium)]">{renderFileContent()}</div>
  );
}
