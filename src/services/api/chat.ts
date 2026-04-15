import { API_BASE_URL_EXPORT, apiClient } from '@/services/api/client';
import { fetchWithTokenRefresh } from '@/services/api/tokenRefresh';
import type {
  Chat,
  ChatListItem,
  CreateChatRequest,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  UpdateChatRequest,
} from '@/types';
import { logger } from '@/shared/utils/logger';

/**
 * AI model returned by the /chat/models endpoint
 */
export interface ChatAIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  is_active: boolean;
  max_tokens?: number;
  context_window?: number;
}

/**
 * Tool progress event for streaming updates
 */
export interface ToolProgressEvent {
  type: string; // Tool name (e.g., "get_positions", "get_boards")
  status: 'pending' | 'done' | 'error';
  content: string; // Human-readable message
  meta?: Record<string, unknown>; // Optional structured payload from backend (e.g., created card)
}

interface SSEHandlers {
  onChunk?: (chunk: string) => void;
  onToolProgress?: (progress: ToolProgressEvent) => void;
  onWarning?: (message: string) => void;
}

async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: SSEHandlers
): Promise<SendMessageResponse | null> {
  const decoder = new TextDecoder();
  let finalResult: SendMessageResponse | null = null;
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
      if (line.trim() === '' || line.startsWith(':')) continue;
      if (!line.startsWith('data:')) continue;

      const data = line.slice(5).trim();
      try {
        const parsed = JSON.parse(data);

        if (currentEventType === 'tool_progress' && handlers.onToolProgress) {
          handlers.onToolProgress({
            type: parsed.type,
            status: parsed.status,
            content: parsed.content || '',
            meta: parsed.meta,
          });
        } else if (currentEventType === 'warning' && handlers.onWarning) {
          handlers.onWarning(parsed.message);
        } else if (currentEventType === 'done' || parsed.type === 'complete') {
          finalResult = {
            userMessage: parsed.user_message,
            assistantMessage: parsed.assistant_message,
          };
        } else if (currentEventType === 'error' || parsed.type === 'error') {
          throw new Error(parsed.error || 'Unknown error during streaming');
        } else if (parsed.type === 'chunk' && handlers.onChunk) {
          handlers.onChunk(parsed.content);
        }

        currentEventType = 'message';
      } catch (parseError) {
        if (!(parseError instanceof SyntaxError)) throw parseError;
      }
    }
  }

  return finalResult;
}

export const chatApi = {
  // ========== CHAT MANAGEMENT ==========

  /**
   * Get list of all chats for current user
   */
  async getChatList(
    limit = 100,
    offset = 0,
    type?: string
  ): Promise<ChatListItem[]> {
    try {
      const response = await apiClient.get(`/chat`, {
        params: { limit, offset, ...(type ? { type } : {}) },
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error fetching chat list', { error });
      throw error;
    }
  },

  /**
   * Get specific chat with optional messages
   */
  async getChat(
    chatId: number,
    includeMessages = true
  ): Promise<Chat & { messages?: Message[] }> {
    try {
      const response = await apiClient.get(`/chat/${chatId}`, {
        params: { includeMessages },
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error fetching chat', { chatId, error });
      throw error;
    }
  },

  /**
   * Create a new chat
   */
  async createChat(data: CreateChatRequest = {}): Promise<Chat> {
    try {
      const response = await apiClient.post('/chat', {
        name: data.name || 'New Chat',
        systemPromptId: data.systemPromptId || 'default',
        type: data.type || undefined,
        seedMessages: data.seedMessages || undefined,
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error creating chat', { error });
      throw error;
    }
  },

  /**
   * Update chat properties
   */
  async updateChat(chatId: number, updates: UpdateChatRequest): Promise<Chat> {
    try {
      const response = await apiClient.put(`/chat/${chatId}`, updates);
      return response.data;
    } catch (error) {
      logger.error('api', 'Error updating chat', { chatId, error });
      throw error;
    }
  },

  /**
   * Delete a chat and all its messages
   */
  async deleteChat(chatId: number): Promise<void> {
    try {
      await apiClient.delete(`/chat/${chatId}`);
    } catch (error) {
      logger.error('api', 'Error deleting chat', { chatId, error });
      throw error;
    }
  },

  // ========== MESSAGE MANAGEMENT ==========

  /**
   * Send a message and get AI response with streaming
   */
  async sendMessage(
    chatId: number,
    data: SendMessageRequest,
    onChunk?: (chunk: string) => void,
    onToolProgress?: (progress: ToolProgressEvent) => void,
    onWarning?: (message: string) => void,
    abortSignal?: AbortSignal
  ): Promise<SendMessageResponse> {
    try {
      const response = await fetchWithTokenRefresh((token) =>
        fetch(`${API_BASE_URL_EXPORT}/chat/${chatId}/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            content: data.content,
            cardIds: data.cardIds,
            fileIds: data.fileIds,
            tradeIds: data.tradeIds,
            linkUrls: data.linkUrls,
            boardId: data.boardId,
            model: data.model,
            temperature: data.temperature,
            maxTokens: data.maxTokens,
            settings: data.settings,
          }),
          signal: abortSignal,
        })
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const result = await parseSSEStream(response.body.getReader(), {
        onChunk,
        onToolProgress,
        onWarning,
      });

      if (!result) {
        throw new Error('No final result received from stream');
      }
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.info('api', 'Message sending was aborted by user', { chatId });
        throw new Error('ABORTED');
      }
      logger.error('api', 'Error sending message', { chatId, error });
      throw error;
    }
  },

  /**
   * Resume a disconnected chat session by replaying cached events.
   * Returns null if no active session exists (404).
   */
  async resumeSession(
    chatId: number,
    onChunk?: (chunk: string) => void,
    onToolProgress?: (progress: ToolProgressEvent) => void
  ): Promise<SendMessageResponse | null> {
    try {
      const response = await fetchWithTokenRefresh((token) =>
        fetch(`${API_BASE_URL_EXPORT}/chat/${chatId}/resume-session`, {
          method: 'GET',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
      );

      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error(`Resume session failed: ${response.status}`);
      if (!response.body) return null;

      return await parseSSEStream(response.body.getReader(), {
        onChunk,
        onToolProgress,
      });
    } catch (error) {
      logger.error('api', 'Error resuming session', { chatId, error });
      throw error;
    }
  },

  /**
   * Stop an in-progress generation on the backend.
   */
  async stopGeneration(chatId: number): Promise<void> {
    await fetchWithTokenRefresh((token) =>
      fetch(`${API_BASE_URL_EXPORT}/chat/${chatId}/stop-generation`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
    );
  },

  /**
   * Get available AI models for chat
   */
  async getAvailableModels(): Promise<ChatAIModel[]> {
    const response = await apiClient.get('/chat/models');
    return response.data;
  },

  /**
   * Get messages for a specific chat
   */
  async getMessages(
    chatId: number,
    limit = 100,
    offset = 0
  ): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/chat/${chatId}/messages`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error fetching messages', { chatId, error });
      throw error;
    }
  },

  /**
   * Estimate tokens for a message including attachments
   * Uses the new token calculation system that includes file costs
   */
  async estimateTokens(
    content: string,
    modelId: string,
    fileIds?: string[],
    cardIds?: number[]
  ): Promise<{
    promptTokens: number;
    attachmentsTokens: number;
    totalTokens: number;
    provider: string;
  }> {
    try {
      const response = await apiClient.post('/chat/estimate-tokens', {
        content,
        modelId: modelId,
        fileIds: fileIds || [],
        cardIds: cardIds || [],
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error estimating tokens', { error });
      throw error;
    }
  },

  /**
   * Create a survey Q&A message in chat (not included in AI context)
   */
  async createSurveyMessage(
    chatId: number,
    questionText: string,
    answerTexts: string[]
  ): Promise<Message> {
    try {
      const response = await apiClient.post(`/chat/${chatId}/survey-message`, {
        questionText: questionText,
        answerTexts: answerTexts,
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error creating survey message', { chatId, error });
      throw error;
    }
  },

  /**
   * Create a welcome acknowledgment message in chat (not included in AI context)
   */
  async createWelcomeAck(chatId: number): Promise<Message> {
    try {
      const response = await apiClient.post(`/chat/${chatId}/welcome-ack`);
      return response.data;
    } catch (error) {
      logger.error('api', 'Error creating welcome ack', { chatId, error });
      throw error;
    }
  },

  /**
   * Create a survey feedback message from assistant (generated by LLM, not included in AI context)
   */
  async createSurveyFeedback(
    chatId: number,
    questionText: string,
    answerTexts: string[]
  ): Promise<Message> {
    try {
      const response = await apiClient.post(`/chat/${chatId}/survey-feedback`, {
        questionText: questionText,
        answerTexts: answerTexts,
      });
      return response.data;
    } catch (error) {
      logger.error('api', 'Error creating survey feedback', { chatId, error });
      throw error;
    }
  },
};
