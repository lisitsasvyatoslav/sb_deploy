/** File type detection helpers shared between editor NodeView and FileDetailContent */

export function getFileType(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/** All helpers below expect a lowercase file extension (as returned by `getFileType`). */

export function isImageFile(ft: string): boolean {
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ft);
}

export function isPdfFile(ft: string): boolean {
  return ft === 'pdf';
}

export function isTextFile(ft: string): boolean {
  return ['txt', 'csv', 'log', 'md'].includes(ft);
}

export function isExcelFile(ft: string): boolean {
  return ['xls', 'xlsx', 'ods'].includes(ft);
}

export function isWordFile(ft: string): boolean {
  return ['doc', 'docx', 'odt', 'rtf'].includes(ft);
}
