import { chatApi } from '@/services/api/chat';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { ChatListItem, ChatType } from '@/types/chat';

/**
 * Query Keys - централизованное управление ключами кэша для чата
 */
export const chatQueryKeys = {
  all: ['chats'] as const,
  chats: () => [...chatQueryKeys.all] as const,
  chat: (chatId: number) => [...chatQueryKeys.all, chatId] as const,
  chatMessages: (chatId: number) =>
    [...chatQueryKeys.all, chatId, 'messages'] as const,
};

/**
 * Query: Загрузка списка чатов
 */
export const useChatsQuery = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: chatQueryKeys.chats(),
    queryFn: () => chatApi.getChatList(limit, offset),
    staleTime: 1000 * 30, // 30 секунд
  });
};

/**
 * Infinite Query: Load chat list with pagination
 */
export const useInfiniteChatsQuery = (limit = 50) => {
  return useInfiniteQuery({
    queryKey: [...chatQueryKeys.chats(), 'infinite'],
    queryFn: ({ pageParam = 0 }) => chatApi.getChatList(limit, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // If last page has less items than limit, no more pages
      if (lastPage.length < limit) return undefined;
      // Next offset is current total count
      return allPages.flat().length;
    },
    initialPageParam: 0,
    staleTime: 1000 * 30, // 30 секунд
  });
};

/**
 * Query: Загрузка конкретного чата
 */
export const useChatQuery = (chatId: number | null, includeMessages = true) => {
  return useQuery({
    queryKey: chatQueryKeys.chat(chatId ?? 0),
    queryFn: async () => {
      if (!chatId) return null;
      return chatApi.getChat(chatId, includeMessages);
    },
    enabled: !!chatId,
    staleTime: 1000 * 30, // 30 секунд
  });
};

/**
 * Mutation: Создание чата
 */
export const useCreateChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      systemPromptId = 'default',
      type,
    }: {
      name?: string;
      systemPromptId?: string;
      type?: ChatType;
    }) => {
      return await chatApi.createChat({
        name: name || 'New Chat',
        systemPromptId,
        type,
      });
    },
    onSuccess: (newChat) => {
      // Optimistically prepend the new chat so activeChatType resolves immediately
      // (invalidateQueries is async and causes a race with setActiveChatId)

      // Update regular query cache
      queryClient.setQueryData<ChatListItem[]>(chatQueryKeys.chats(), (old) => {
        const item: ChatListItem = {
          id: newChat.id,
          name: newChat.name,
          lastMessage: '',
          lastMessageAt: null,
          messageCount: 0,
          systemPromptId: newChat.systemPromptId,
          type: newChat.type,
          createdAt: newChat.createdAt,
          updatedAt: newChat.updatedAt,
        };
        return old ? [item, ...old] : [item];
      });

      // Invalidate infinite query to refetch with correct offsets
      queryClient.invalidateQueries({
        queryKey: [...chatQueryKeys.chats(), 'infinite'],
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
    },
  });
};

/**
 * Mutation: Обновление чата (имя, system prompt)
 */
export const useUpdateChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      updates,
    }: {
      chatId: number;
      updates: { name?: string; system_prompt_id?: string };
    }) => {
      return await chatApi.updateChat(chatId, updates);
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chat(chatId) });
    },
  });
};

/**
 * Mutation: Удаление чата
 */
export const useDeleteChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: number) => chatApi.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
    },
  });
};

/**
 * Query: Получение доступных моделей
 */
export const useAvailableModelsQuery = () => {
  return useQuery({
    queryKey: ['chat', 'models'],
    queryFn: () => chatApi.getAvailableModels(),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
};

/**
 * Mutation: Отправка сообщения в чат с поддержкой streaming
 */
export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      content,
      cardIds,
      fileIds,
      tradeIds,
      linkUrls,
      boardId,
      model,
      settings,
      onChunk,
      onToolProgress,
      onWarning,
      abortSignal,
    }: {
      chatId: number;
      content: string;
      cardIds?: number[];
      fileIds?: string[];
      tradeIds?: number[];
      linkUrls?: string[];
      boardId?: number;
      model?: string;
      settings?: { maxTokens?: number | null; temperature?: number | null };
      onChunk?: (chunk: string) => void;
      onToolProgress?: (
        progress: import('@/services/api/chat').ToolProgressEvent
      ) => void;
      onWarning?: (message: string) => void;
      abortSignal?: AbortSignal;
    }) => {
      return await chatApi.sendMessage(
        chatId,
        {
          content,
          cardIds,
          fileIds,
          tradeIds,
          linkUrls,
          boardId,
          model,
          temperature: settings?.temperature ?? undefined,
          maxTokens: settings?.maxTokens ?? undefined,
          settings,
        },
        onChunk,
        onToolProgress,
        onWarning,
        abortSignal
      );
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.chat(chatId) });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.chatMessages(chatId),
      });
    },
  });
};
