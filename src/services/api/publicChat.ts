/**
 * Public Chat API - For unauthenticated users on the welcome page.
 *
 * Provides limited AI chat functionality with streaming support.
 * Does not require authentication tokens.
 */

import { API_BASE_URL_EXPORT } from '@/services/api/client';
import { logger } from '@/shared/utils/logger';

/**
 * Context message for public chat (previous Q&A pairs)
 */
export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Request body for public chat endpoint
 */
export interface PublicMessageRequest {
  content: string;
  contextMessages?: ContextMessage[];
}

/**
 * Response from public chat endpoint
 */
export interface PublicChatResponse {
  content: string;
  type: 'complete' | 'error' | 'rate_limit';
  error?: string;
}

/**
 * Public Chat API for unauthenticated users.
 * Uses SSE streaming for real-time responses.
 */
export const publicChatApi = {
  /**
   * Send a message to AI and stream the response.
   *
   * @param content - User message content
   * @param contextMessages - Previous messages for context
   * @param onChunk - Callback for streaming chunks (receives accumulated content)
   * @returns Final response with complete content
   */
  async sendMessage(
    content: string,
    contextMessages?: ContextMessage[],
    onChunk?: (accumulatedContent: string) => void,
    signal?: AbortSignal
  ): Promise<PublicChatResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL_EXPORT}/chat/public-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            contextMessages,
          } as PublicMessageRequest),
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let finalResult: PublicChatResponse | null = null;
      let buffer = '';
      let currentEventType = 'message';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Track event type from SSE event: line
          if (line.startsWith('event:')) {
            currentEventType = line.slice(6).trim();
            continue;
          }

          // Skip empty lines and SSE comments
          if (line.trim() === '' || line.startsWith(':')) {
            continue;
          }

          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();

            try {
              const parsed = JSON.parse(data);

              if (currentEventType === 'done' || parsed.type === 'complete') {
                finalResult = {
                  content: parsed.content || '',
                  type: 'complete',
                };
              } else if (
                currentEventType === 'error' ||
                parsed.type === 'error' ||
                parsed.type === 'rate_limit'
              ) {
                finalResult = {
                  content: '',
                  type: parsed.type === 'rate_limit' ? 'rate_limit' : 'error',
                  error: parsed.error || 'Unknown error',
                };
                // Don't continue streaming after error
                return finalResult;
              } else if (
                currentEventType === 'chunk' ||
                parsed.type === 'chunk'
              ) {
                // Streaming chunk - call onChunk with accumulated content
                if (onChunk && parsed.content) {
                  onChunk(parsed.content);
                }
              }

              // Reset to default after processing data
              currentEventType = 'message';
            } catch (parseError) {
              logger.warn('publicChat', 'Failed to parse SSE data', {
                data,
                parseError,
              });
            }
          }
        }
      }

      if (!finalResult) {
        throw new Error('No final result received from stream');
      }

      return finalResult;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        throw error;
      logger.error('api', 'Error in public chat', { error });
      return {
        content: '',
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
