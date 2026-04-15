/**
 * Utilities for working with files and their types
 */

export interface FileInfo {
  name: string;
  type: string;
  extension: string;
}

/**
 * Get icon for file type
 */
export const getFileIcon = (fileType: string): string => {
  const type = fileType.toLowerCase();

  const iconMap: Record<string, string> = {
    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📄',
    rtf: '📝',

    // Spreadsheets
    xls: '📊',
    xlsx: '📊',
    csv: '📊',

    // Presentations
    ppt: '📊',
    pptx: '📊',

    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    bmp: '🖼️',
    webp: '🖼️',

    // Archives
    zip: '🗜️',
    rar: '🗜️',
    '7z': '🗜️',
    tar: '🗜️',
    gz: '🗜️',

    // Video
    mp4: '🎥',
    avi: '🎥',
    mov: '🎥',
    wmv: '🎥',
    flv: '🎥',

    // Audio
    mp3: '🎵',
    wav: '🎵',
    flac: '🎵',
    aac: '🎵',

    // Code
    js: '💻',
    ts: '💻',
    py: '💻',
    java: '💻',
    cpp: '💻',
    c: '💻',
    html: '💻',
    css: '💻',
    json: '💻',
    xml: '💻',
    yaml: '💻',
    yml: '💻',
  };

  return iconMap[type] || '📁';
};

/**
 * Extract file type from filename
 */
export const getFileTypeFromExtension = (filename: string): string => {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return 'file';
  }

  return filename.substring(lastDotIndex + 1).toLowerCase();
};

/**
 * Get file info
 */
export const getFileInfo = (filename: string): FileInfo => {
  const extension = getFileTypeFromExtension(filename);
  const name = filename.substring(0, filename.lastIndexOf('.'));

  return {
    name: name || filename,
    type: extension,
    extension: extension,
  };
};

/**
 * Get color for file type
 */
export const getFileTypeColor = (fileType: string): string => {
  const type = fileType.toLowerCase();

  const colorMap: Record<string, string> = {
    // Documents - blue
    pdf: '#3B82F6',
    doc: '#2563EB',
    docx: '#2563EB',
    txt: '#3B82F6',
    rtf: '#2563EB',

    // Spreadsheets - green
    xls: '#10B981',
    xlsx: '#10B981',
    csv: '#10B981',

    // Presentations - orange
    ppt: '#F59E0B',
    pptx: '#F59E0B',

    // Images - neutral gray
    jpg: '#6B7280',
    jpeg: '#6B7280',
    png: '#6B7280',
    gif: '#6B7280',
    svg: '#6B7280',
    bmp: '#6B7280',
    webp: '#6B7280',

    // Archives - gray
    zip: '#6B7280',
    rar: '#6B7280',
    '7z': '#6B7280',
    tar: '#6B7280',
    gz: '#6B7280',

    // Video - red
    mp4: '#EF4444',
    avi: '#EF4444',
    mov: '#EF4444',
    wmv: '#EF4444',
    flv: '#EF4444',

    // Audio - purple
    mp3: '#8B5CF6',
    wav: '#8B5CF6',
    flac: '#8B5CF6',
    aac: '#8B5CF6',

    // Code - green
    js: '#059669',
    ts: '#059669',
    py: '#059669',
    java: '#059669',
    cpp: '#059669',
    c: '#059669',
    html: '#059669',
    css: '#059669',
    json: '#059669',
    xml: '#059669',
    yaml: '#059669',
    yml: '#059669',
  };

  return colorMap[type] || '#8E8E93';
};

/**
 * Format file size as a human-readable string (e.g. "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format file size as a structured value + unit (for i18n)
 */
export function formatFileSizeValue(bytes: number): {
  value: number;
  unit: 'mb' | 'kb' | 'bytes';
} {
  if (bytes >= 1_048_576)
    return { value: Math.round(bytes / 1_048_576), unit: 'mb' };
  if (bytes >= 1_024) return { value: Math.round(bytes / 1_024), unit: 'kb' };
  return { value: bytes, unit: 'bytes' };
}

/**
 * Check, Is the file an image?
 */
export const isImageFile = (fileType: string): boolean => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'];
  return imageTypes.includes(fileType.toLowerCase());
};

/**
 * Check if the file is a document
 */
export const isDocumentFile = (fileType: string): boolean => {
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  return documentTypes.includes(fileType.toLowerCase());
};

/**
 * Check if the file is a spreadsheet
 */
export const isSpreadsheetFile = (fileType: string): boolean => {
  const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
  return spreadsheetTypes.includes(fileType.toLowerCase());
};
