import type { TranslateFn } from '@/shared/i18n';

export type FilePreviewStrategy =
  | 'PDF_IFRAME'
  | 'TEXT_CONTENT'
  | 'CODE_HIGHLIGHT'
  | 'IMAGE_DIRECT'
  | 'OFFICE_CONVERT'
  | 'ARCHIVE_PLACEHOLDER'
  | 'MEDIA_PLACEHOLDER'
  | 'UNSUPPORTED_PLACEHOLDER';

export interface FileInfo {
  strategy: FilePreviewStrategy;
  mimeType: string;
  extension: string;
  canPreview: boolean;
  needsConversion: boolean;
  displayName: string;
}

/**
 * Determines file preview strategy based on MIME type and extension.
 */
export function getFilePreviewStrategy(
  mimeType: string,
  filename: string,
  t?: TranslateFn
): FileInfo {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return {
      strategy: 'PDF_IFRAME',
      mimeType,
      extension,
      canPreview: true,
      needsConversion: false,
      displayName: t ? t('fileType.pdf') : 'PDF document',
    };
  }

  if (
    mimeType.startsWith('text/') ||
    ['txt', 'md', 'csv', 'log'].includes(extension)
  ) {
    return {
      strategy: 'TEXT_CONTENT',
      mimeType,
      extension,
      canPreview: true,
      needsConversion: false,
      displayName: t ? t('fileType.text') : 'Text file',
    };
  }

  if (isCodeFile(mimeType, extension)) {
    return {
      strategy: 'CODE_HIGHLIGHT',
      mimeType,
      extension,
      canPreview: true,
      needsConversion: false,
      displayName: t ? t('fileType.code') : 'Code file',
    };
  }

  if (mimeType.startsWith('image/') || isImageExtension(extension)) {
    return {
      strategy: 'IMAGE_DIRECT',
      mimeType,
      extension,
      canPreview: true,
      needsConversion: false,
      displayName: t ? t('fileType.image') : 'Image',
    };
  }

  if (isOfficeFile(mimeType, extension)) {
    return {
      strategy: 'OFFICE_CONVERT',
      mimeType,
      extension,
      canPreview: true,
      needsConversion: true,
      displayName: t ? t('fileType.office') : 'Office document',
    };
  }

  if (isArchiveFile(mimeType, extension)) {
    return {
      strategy: 'ARCHIVE_PLACEHOLDER',
      mimeType,
      extension,
      canPreview: false,
      needsConversion: false,
      displayName: t ? t('fileType.archive') : 'Archive',
    };
  }

  if (
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    isMediaExtension(extension)
  ) {
    return {
      strategy: 'MEDIA_PLACEHOLDER',
      mimeType,
      extension,
      canPreview: false,
      needsConversion: false,
      displayName: t ? t('fileType.media') : 'Media file',
    };
  }

  return {
    strategy: 'UNSUPPORTED_PLACEHOLDER',
    mimeType,
    extension,
    canPreview: false,
    needsConversion: false,
    displayName: t ? t('fileType.unknown') : 'Unknown file',
  };
}

function isCodeFile(mimeType: string, extension: string): boolean {
  const codeMimeTypes = [
    'application/json',
    'application/xml',
    'text/xml',
    'application/javascript',
    'text/javascript',
    'application/typescript',
    'text/typescript',
  ];

  const codeExtensions = [
    'js',
    'ts',
    'jsx',
    'tsx',
    'py',
    'java',
    'cpp',
    'c',
    'h',
    'hpp',
    'cs',
    'php',
    'rb',
    'go',
    'rs',
    'swift',
    'kt',
    'scala',
    'sh',
    'bash',
    'zsh',
    'fish',
    'ps1',
    'bat',
    'cmd',
    'sql',
    'html',
    'css',
    'scss',
    'sass',
    'less',
    'vue',
    'svelte',
    'json',
    'xml',
    'yaml',
    'yml',
    'toml',
    'ini',
    'cfg',
    'conf',
    'env',
  ];

  return codeMimeTypes.includes(mimeType) || codeExtensions.includes(extension);
}

function isImageExtension(extension: string): boolean {
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'ico',
    'tiff',
    'tif',
    'raw',
    'heic',
    'heif',
    'avif',
  ];

  return imageExtensions.includes(extension);
}

function isOfficeFile(mimeType: string, extension: string): boolean {
  const officeMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'application/rtf',
  ];

  const officeExtensions = [
    'docx',
    'doc',
    'xlsx',
    'xls',
    'pptx',
    'ppt',
    'odt',
    'ods',
    'odp',
    'rtf',
  ];

  return (
    officeMimeTypes.includes(mimeType) || officeExtensions.includes(extension)
  );
}

function isArchiveFile(mimeType: string, extension: string): boolean {
  const archiveMimeTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-tar',
    'application/x-bzip2',
  ];

  const archiveExtensions = [
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'bz2',
    'xz',
    'lz4',
  ];

  return (
    archiveMimeTypes.includes(mimeType) || archiveExtensions.includes(extension)
  );
}

function isMediaExtension(extension: string): boolean {
  const mediaExtensions = [
    'mp4',
    'avi',
    'mov',
    'wmv',
    'flv',
    'webm',
    'mkv',
    'm4v',
    'mp3',
    'wav',
    'flac',
    'aac',
    'ogg',
    'wma',
    'm4a',
  ];

  return mediaExtensions.includes(extension);
}

export function getFileIcon(strategy: FilePreviewStrategy): string {
  switch (strategy) {
    case 'PDF_IFRAME':
      return '📄';
    case 'TEXT_CONTENT':
      return '📝';
    case 'CODE_HIGHLIGHT':
      return '💻';
    case 'IMAGE_DIRECT':
      return '🖼️';
    case 'OFFICE_CONVERT':
      return '📊';
    case 'ARCHIVE_PLACEHOLDER':
      return '📦';
    case 'MEDIA_PLACEHOLDER':
      return '🎬';
    case 'UNSUPPORTED_PLACEHOLDER':
    default:
      return '📁';
  }
}

export function getPlaceholderMessage(
  strategy: FilePreviewStrategy,
  t?: TranslateFn
): string {
  switch (strategy) {
    case 'ARCHIVE_PLACEHOLDER':
      return t
        ? t('filePreviewError.archiveNotSupported')
        : 'Archives are not supported for preview';
    case 'MEDIA_PLACEHOLDER':
      return t
        ? t('filePreviewError.mediaNotSupported')
        : 'Video and audio files are not supported for preview';
    case 'UNSUPPORTED_PLACEHOLDER':
      return t
        ? t('filePreviewError.typeNotSupported')
        : 'This file type is not supported for preview';
    default:
      return t
        ? t('filePreviewError.previewUnavailable')
        : 'Preview unavailable';
  }
}
