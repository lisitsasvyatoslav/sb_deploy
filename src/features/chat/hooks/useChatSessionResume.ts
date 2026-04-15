import { useCallback, useRef } from 'react';
import { chatApi, type ToolProgressEvent } from '@/services/api/chat';
import { logger } from '@/shared/utils/logger';

interface ResumeCallbacks {
  onChunk: (chunk: string) => void;
  onToolProgress: (progress: ToolProgressEvent) => void;
  onResumeStart: () => void;
  onResumeEnd: (hadSession: boolean) => void;
}

export const useChatSessionResume = (callbacks: ResumeCallbacks) => {
  const isResumingRef = useRef(false);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const attemptResume = useCallback(
    async (chatId: number): Promise<boolean> => {
      if (isResumingRef.current) return false;
      isResumingRef.current = true;
      callbacksRef.current.onResumeStart();

      try {
        const result = await chatApi.resumeSession(
          chatId,
          callbacksRef.current.onChunk,
          callbacksRef.current.onToolProgress
        );

        const hadSession = result !== null;
        callbacksRef.current.onResumeEnd(hadSession);
        return hadSession;
      } catch (error) {
        logger.warn('useChatSessionResume', 'Resume attempt failed', {
          chatId,
          error,
        });
        callbacksRef.current.onResumeEnd(false);
        return false;
      } finally {
        isResumingRef.current = false;
      }
    },
    []
  );

  return { attemptResume, isResumingRef };
};
