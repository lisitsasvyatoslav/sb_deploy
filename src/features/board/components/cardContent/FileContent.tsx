import { filesApi } from '@/services/api/files';
import { useTranslation } from '@/shared/i18n/client';
import { logger } from '@/shared/utils/logger';
import { sanitizeHtml } from '@/shared/utils/sanitizeHtml';
import { formatFileSizeValue } from '@/shared/utils/fileUtils';
import { Icon } from '@/shared/ui/Icon';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface FileMeta {
  uploading?: boolean;
  filename?: string;
  file_id?: string;
  fileId?: string;
  file_size?: number;
  fileSize?: number;
}

interface FileContentProps {
  fileType?: string;
  meta?: FileMeta;
}

interface FileInfoHeaderProps {
  filename?: string;
  fileSizeFormatted?: string;
  icon: React.ReactNode;
}

const FileInfoHeader: React.FC<FileInfoHeaderProps> = ({
  filename,
  fileSizeFormatted,
  icon,
}) => (
  <div className="flex items-center px-spacing-14 py-spacing-10 gap-spacing-10 rounded-radius-2 shrink-0 w-full">
    <div className="flex items-center justify-center size-[32px] bg-wrapper-a4 rounded-radius-2 shrink-0 text-blackinverse-a100">
      {icon}
    </div>

    <div className="flex flex-col flex-1 min-w-0 gap-spacing-4">
      <span className="font-semibold text-[14px] leading-[20px] tracking-tight-1 text-blackinverse-a100 truncate">
        {filename ?? ''}
      </span>
      {fileSizeFormatted && (
        <span className="font-normal text-[12px] leading-[16px] tracking-tight-1 text-blackinverse-a56 truncate">
          {fileSizeFormatted}
        </span>
      )}
    </div>

    {/* TODO: add page navigation (< N/M >) when pdfjs is integrated */}
  </div>
);

export const FileContent: React.FC<FileContentProps> = ({ fileType, meta }) => {
  const { t } = useTranslation('board');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [excelData, setExcelData] = useState<string[][] | null>(null);
  const [excelError, setExcelError] = useState(false);

  const [txtContent, setTxtContent] = useState<string | null>(null);
  const [txtError, setTxtError] = useState(false);

  const [docxContent, setDocxContent] = useState<string | null>(null);
  const [docxError, setDocxError] = useState(false);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);

  const isUploading = meta?.uploading === true;

  const actualFileType =
    fileType ||
    (meta?.filename ? meta.filename.split('.').pop()?.toLowerCase() : '');

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(
    actualFileType?.toLowerCase() || ''
  );
  const isExcel = ['xls', 'xlsx', 'csv'].includes(
    actualFileType?.toLowerCase() || ''
  );
  const isTxt = actualFileType?.toLowerCase() === 'txt';
  const isDocx = ['doc', 'docx'].includes(actualFileType?.toLowerCase() || '');
  const isPdf = actualFileType?.toLowerCase() === 'pdf';

  const fileId = meta?.file_id || meta?.fileId;
  const filename = meta?.filename;
  const fileSize = meta?.file_size ?? meta?.fileSize;
  let fileSizeFormatted: string | undefined;
  if (fileSize !== undefined) {
    const { value, unit } = formatFileSizeValue(fileSize);
    fileSizeFormatted = `${value} ${t(`fileSize.${unit}`)}`;
  }

  useEffect(() => {
    if (isImage && fileId && !isUploading) {
      setIsLoading(true);
      filesApi
        .getFile(fileId)
        .then((info) => {
          setImageUrl(info.downloadUrl);
          setImageError(false);
        })
        .catch((err) => {
          logger.error('FileContent', 'Failed to load image preview', err);
          setImageUrl(null);
          setImageError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [actualFileType, fileId, isImage, isUploading]);

  useEffect(() => {
    if (isExcel && fileId && !isUploading) {
      setIsLoading(true);
      filesApi
        .getFile(fileId)
        .then(async (info) => {
          const response = await fetch(info.downloadUrl);
          const arrayBuffer = await response.arrayBuffer();
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: unknown[][] = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
          });

          const limitedData = jsonData
            .slice(0, 10)
            .map((row) =>
              (Array.isArray(row) ? row : [])
                .slice(0, 10)
                .map((cell) =>
                  cell !== null && cell !== undefined ? String(cell) : ''
                )
            );

          setExcelData(limitedData);
          setExcelError(false);
        })
        .catch((err) => {
          logger.error('FileContent', 'Failed to load Excel preview', err);
          setExcelData(null);
          setExcelError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [actualFileType, fileId, isExcel, isUploading]);

  useEffect(() => {
    if (isTxt && fileId && !isUploading) {
      setIsLoading(true);
      filesApi
        .getFile(fileId)
        .then(async (info) => {
          const response = await fetch(info.downloadUrl);
          const text = await response.text();
          const limitedText =
            text.length > 500 ? text.substring(0, 500) + '...' : text;
          setTxtContent(limitedText);
          setTxtError(false);
        })
        .catch((err) => {
          logger.error('FileContent', 'Failed to load TXT preview', err);
          setTxtContent(null);
          setTxtError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [actualFileType, fileId, isTxt, isUploading]);

  useEffect(() => {
    if (isDocx && fileId && !isUploading) {
      setIsLoading(true);
      filesApi
        .getFile(fileId)
        .then(async (info) => {
          const response = await fetch(info.downloadUrl);
          const arrayBuffer = await response.arrayBuffer();
          const mammoth = (await import('mammoth')).default;
          const result = await mammoth.convertToHtml({ arrayBuffer });

          let limitedHtml = result.value;
          if (limitedHtml.length > 1000) {
            limitedHtml = limitedHtml.substring(0, 1000) + '...';
          }

          setDocxContent(limitedHtml);
          setDocxError(false);
        })
        .catch((err) => {
          logger.error('FileContent', 'Failed to load DOCX preview', err);
          setDocxContent(null);
          setDocxError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [actualFileType, fileId, isDocx, isUploading]);

  useEffect(() => {
    if (isPdf && fileId && !isUploading) {
      setIsLoading(true);
      filesApi
        .getFile(fileId)
        .then((info) => {
          setPdfUrl(info.downloadUrl);
          setPdfError(false);
        })
        .catch((err) => {
          logger.error('FileContent', 'Failed to load PDF URL', err);
          setPdfUrl(null);
          setPdfError(true);
        })
        .finally(() => setIsLoading(false));
    }
  }, [actualFileType, fileId, isPdf, isUploading]);

  const fileIcon: React.ReactNode = isImage ? (
    <Icon variant="image" size={24} />
  ) : isExcel ? (
    <Icon variant="table" size={24} />
  ) : isPdf || isDocx ? (
    <Icon variant="doc" size={24} />
  ) : (
    <Icon variant="folder" size={24} />
  );

  if (isUploading) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <FileInfoHeader
          filename={filename}
          fileSizeFormatted={fileSizeFormatted}
          icon={fileIcon}
        />
        <div className="flex-1 min-h-0 px-spacing-12 flex items-center justify-center">
          <div className="w-full h-full animate-pulse rounded-radius-4 flex items-center justify-center bg-background-hover">
            <p className="text-12 font-normal theme-text-secondary">
              {t('fileLoading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    // Images render full-bleed without a header — show a plain spinner to avoid
    // a flash of FileInfoHeader that disappears once the URL is fetched.
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-base)]" />
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <FileInfoHeader
          filename={filename}
          fileSizeFormatted={fileSizeFormatted}
          icon={fileIcon}
        />
        <div className="flex-1 min-h-0 px-spacing-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-base)]" />
        </div>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <FileInfoHeader
          filename={filename}
          fileSizeFormatted={fileSizeFormatted}
          icon={fileIcon}
        />
        <div className="flex-1 min-h-0 overflow-hidden px-spacing-12">
          {pdfUrl && !pdfError ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={filename ?? 'PDF preview'}
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Icon variant="doc" size={48} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isExcel && excelData && !excelError) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <FileInfoHeader
          filename={filename}
          fileSizeFormatted={fileSizeFormatted}
          icon={fileIcon}
        />
        <div className="flex-1 overflow-y-auto min-h-0 px-spacing-12">
          <table className="border-collapse text-10 w-full">
            <tbody>
              {excelData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-[2px] theme-text-primary theme-border border"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (isTxt && txtContent && !txtError) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <FileInfoHeader
          filename={filename}
          fileSizeFormatted={fileSizeFormatted}
          icon={fileIcon}
        />
        <div className="flex-1 overflow-y-auto min-h-0 px-spacing-12">
          <pre className="font-mono text-10 theme-text-primary whitespace-pre-wrap break-words">
            {txtContent}
          </pre>
        </div>
      </div>
    );
  }

  if (isDocx && docxContent && !docxError) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <FileInfoHeader
          filename={filename}
          fileSizeFormatted={fileSizeFormatted}
          icon={fileIcon}
        />
        <div className="flex-1 overflow-y-auto min-h-0 px-spacing-12">
          <div
            className="text-10 theme-text-primary leading-[14px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(docxContent) }}
          />
        </div>
      </div>
    );
  }

  // Image cards: full-bleed image, no header
  if (isImage && imageUrl && !imageError) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <Image
            src={imageUrl}
            alt="File preview"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onError={() => setImageError(true)}
            width={400}
            height={300}
            unoptimized
          />
        </div>
      </div>
    );
  }

  // Default: unknown file type fallback
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <FileInfoHeader
        filename={filename}
        fileSizeFormatted={fileSizeFormatted}
        icon={fileIcon}
      />
      <div className="flex-1 min-h-0 overflow-hidden relative px-spacing-12">
        <div className="flex items-center justify-center h-full">
          <Icon variant="folder" size={48} />
        </div>
      </div>
    </div>
  );
};
