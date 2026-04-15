import { API_BASE_URL_EXPORT } from '@/services/api/client';
import { fetchWithTokenRefresh } from '@/services/api/tokenRefresh';
import type {
  PipelineInitialContext,
  PipelineSSEEvent,
} from '@/features/chat/types/pipeline';
import { logger } from '@/shared/utils/logger';

/**
 * Parse pipeline SSE stream — shared between executeStream and resumeSession.
 */
async function parsePipelineSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: PipelineSSEEvent) => void
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEventType = 'message';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEventType = line.slice(6).trim();
        continue;
      }

      if (line.trim() === '' || line.startsWith(':')) {
        continue;
      }

      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();

        try {
          const raw = JSON.parse(data);
          const parsed = (
            currentEventType !== 'message'
              ? { ...raw, type: currentEventType }
              : raw
          ) as PipelineSSEEvent;

          logger.debug('pipeline', `Received SSE event: ${currentEventType}`, {
            type: parsed.type,
            dataKeys: Object.keys(parsed).join(','),
          });

          onEvent(parsed);
          currentEventType = 'message';
        } catch (parseError) {
          logger.warn('pipeline', 'Failed to parse SSE data', {
            data,
            parseError,
          });
        }
      }
    }
  }
}

export const pipelineApi = {
  /**
   * Execute pipeline with streaming SSE events
   * Uses fetch + ReadableStream (same pattern as chat.ts:103-224)
   */
  async executeStream(
    instruction: string,
    initialContext: PipelineInitialContext | null,
    onEvent: (event: PipelineSSEEvent) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    try {
      const response = await fetchWithTokenRefresh((token) =>
        fetch(`${API_BASE_URL_EXPORT}/pipeline/execute-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            instruction,
            initialContext: initialContext
              ? {
                  ...initialContext,
                  chatId: undefined, // chatId goes at top level
                }
              : undefined,
            chatId: initialContext?.chatId,
          }),
          signal: abortSignal,
        })
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      await parsePipelineSSEStream(response.body.getReader(), onEvent);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.info('pipeline', 'Pipeline execution was aborted by user');
        throw new Error('ABORTED');
      }
      logger.error('pipeline', 'Error executing pipeline', { error });
      throw error;
    }
  },

  /**
   * Resume a disconnected pipeline session.
   * Returns true if a session was found and replayed, false otherwise.
   */
  async resumeSession(
    chatId: number,
    onEvent: (event: PipelineSSEEvent) => void
  ): Promise<boolean> {
    try {
      const response = await fetchWithTokenRefresh((token) =>
        fetch(`${API_BASE_URL_EXPORT}/pipeline/${chatId}/resume-session`, {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
      );

      if (response.status === 404) return false;
      if (!response.ok) return false;
      if (!response.body) return false;

      await parsePipelineSSEStream(response.body.getReader(), onEvent);
      return true;
    } catch (error) {
      logger.warn('pipeline', 'Pipeline resume failed', { chatId, error });
      return false;
    }
  },
};
