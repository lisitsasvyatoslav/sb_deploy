import { apiClient } from '@/services/api/client';

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

export const filesApi = {
  /**
   * Upload file to S3
   * @param file File to upload
   * @param cardId Optional card ID to link file to
   */
  async uploadFile(file: File, cardId?: number): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (cardId !== undefined) {
      formData.append('cardId', String(cardId));
    }

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get file info with pre-signed S3 download URL
   * @param fileId File ID
   */
  async getFile(fileId: string): Promise<FileInfoResponse> {
    const response = await apiClient.get(`/files/${fileId}`);
    return response.data;
  },
};
