/**
 * Stub file API for Storybook / static deploy (no backend).
 */

export interface FileUploadResponse {
  fileId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  title: string;
  s3Key: string;
  fileType?: string;
}

export interface FileInfoResponse {
  fileId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
  title: string;
}

function extFromName(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export const filesApi = {
  async uploadFile(file: File, _cardId?: number): Promise<FileUploadResponse> {
    const fileType = extFromName(file.name);
    const fileId = `mock-${Date.now()}`;
    return {
      fileId,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      title: file.name,
      s3Key: `mock/${fileId}`,
      fileType: fileType || undefined,
    };
  },

  async getFile(fileId: string): Promise<FileInfoResponse> {
    return {
      fileId,
      filename: 'demo.txt',
      fileSize: 0,
      mimeType: 'text/plain',
      uploadedAt: new Date().toISOString(),
      downloadUrl: '#',
      title: 'Demo file',
    };
  },
};
