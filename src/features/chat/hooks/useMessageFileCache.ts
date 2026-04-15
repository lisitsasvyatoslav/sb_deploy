import { useState, useEffect, useRef } from 'react';
import { filesApi, FileInfoResponse } from '@/services/api/files';
import { logger } from '@/shared/utils/logger';
import type { Message } from '@/types';

/**
 * Scans messages for fileIds and fetches file info, deduplicating in-flight requests.
 * Returns a cache map of fileId -> FileInfoResponse.
 */
export function useMessageFileCache(messages: Message[]) {
  const [fileInfoCache, setFileInfoCache] = useState<
    Record<string, FileInfoResponse>
  >({});
  const fetchingFilesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fileIdsToFetch: string[] = [];

    messages.forEach((msg) => {
      if (msg.fileIds && msg.fileIds.length > 0) {
        msg.fileIds.forEach((fileId) => {
          if (!fileInfoCache[fileId] && !fetchingFilesRef.current.has(fileId)) {
            fileIdsToFetch.push(fileId);
          }
        });
      }
    });

    if (fileIdsToFetch.length === 0) return;

    fileIdsToFetch.forEach((id) => fetchingFilesRef.current.add(id));

    Promise.all(
      fileIdsToFetch.map(async (fileId) => {
        try {
          const info = await filesApi.getFile(fileId);
          return { fileId, info };
        } catch (error) {
          logger.error(
            'ChatMessageList',
            `Failed to fetch file info for ${fileId}`,
            error
          );
          return null;
        }
      })
    ).then((results) => {
      const newCache: Record<string, FileInfoResponse> = {};
      results.forEach((result) => {
        if (result) {
          newCache[result.fileId] = result.info;
        }
      });
      // Always clear in-flight set so failed fetches can be retried
      fileIdsToFetch.forEach((id) => fetchingFilesRef.current.delete(id));
      if (Object.keys(newCache).length > 0) {
        setFileInfoCache((prev) => ({ ...prev, ...newCache }));
      }
    });
  }, [messages, fileInfoCache]);

  return fileInfoCache;
}
