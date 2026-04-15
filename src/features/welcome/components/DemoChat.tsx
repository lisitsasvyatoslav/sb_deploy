'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import ChatWindow from '@/features/chat/components/ChatWindow';
import { publicChatApi, ContextMessage } from '@/services/api/publicChat';
import {
  WELCOME_CHAT_CONFIG,
  WELCOME_STORAGE_KEYS,
  WELCOME_SIGNUP_PROMPT,
  WELCOME_AFTER_SAVE_TEXT,
} from '../constants';
import { useDemoNoteStore } from '@/stores/demoNoteStore';
import { useDemoChatStore } from '@/stores/demoChatStore';
import type { Message } from '@/types';

interface DemoChatProps {
  isOpen: boolean;
}

const CHAT_WIDTH = 450;

const DemoChat: React.FC<DemoChatProps> = ({ isOpen }) => {
  const messages = useDemoChatStore((s) => s.messages);
  const neededAuth = useDemoChatStore((s) => s.neededAuth);
  const isStreaming = useDemoChatStore((s) => s.isStreaming);

  const [isWaitingForAI, setIsWaitingForAI] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const initialQuestionSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setNoteTitle = useDemoNoteStore((state) => state.setTitle);
  const setNoteContent = useDemoNoteStore((state) => state.setContent);
  const setNoteIsLoading = useDemoNoteStore((state) => state.setIsLoading);

  // On mount: restore note from persisted messages, or auto-send initial question
  useEffect(() => {
    if (initialQuestionSent.current) return;
    initialQuestionSent.current = true;

    const state = useDemoChatStore.getState();

    // Restore note state from persisted messages
    if (state.messages.length > 0) {
      const firstUserMsg = state.messages.find((m) => m.role === 'user');
      const firstAssistantMsg = state.messages.find(
        (m) => m.role === 'assistant'
      );
      if (firstUserMsg) setNoteTitle(firstUserMsg.content);
      if (firstAssistantMsg) setNoteContent(firstAssistantMsg.content);
      return;
    }

    // No persisted messages — check for initial question to auto-send
    const question = state.initialQuestion;
    if (question) {
      useDemoChatStore.getState().setInitialQuestion(null);
      sendMessage(question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abort streaming on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      useDemoChatStore.getState().setStreaming(false);
    };
  }, []);

  // Build context messages for API
  const buildContextMessages = useCallback((): ContextMessage[] => {
    return messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }, [messages]);

  // Save conversation for post-auth restoration
  const saveConversationForAuth = useCallback((allMessages: Message[]) => {
    try {
      const lastUserMsg = [...allMessages]
        .reverse()
        .find((m) => m.role === 'user');
      if (lastUserMsg) {
        localStorage.setItem(
          WELCOME_STORAGE_KEYS.PENDING_MESSAGE,
          lastUserMsg.content
        );
      }

      const seedMessages = allMessages
        .filter((m) => m.content !== WELCOME_SIGNUP_PROMPT)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      seedMessages.push({
        role: 'assistant' as const,
        content: WELCOME_AFTER_SAVE_TEXT,
      });

      const firstUserMsg = allMessages.find((m) => m.role === 'user');
      const firstAssistantMsg = allMessages.find((m) => m.role === 'assistant');

      localStorage.setItem(
        WELCOME_STORAGE_KEYS.SEED_CHAT_PAYLOAD,
        JSON.stringify({
          name: 'Демо чат',
          system_prompt_id: 'default',
          seed_messages: seedMessages,
          preview: lastUserMsg?.content || '',
          create_card: true,
          card_title: firstUserMsg?.content || '',
          card_content: firstAssistantMsg?.content || '',
        })
      );
    } catch {
      // ignore
    }
  }, []);

  // Send message handler
  const sendMessage = useCallback(
    async (msg: string) => {
      const trimmedMsg = msg.trim();
      if (!trimmedMsg || isWaitingForAI) return;

      const store = useDemoChatStore.getState();
      setError(null);

      // Check message limit
      if (store.userMessageCount >= WELCOME_CHAT_CONFIG.MAX_USER_MESSAGES) {
        saveConversationForAuth(store.messages);
        useDemoChatStore.getState().setNeededAuth(true);
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        chatId: 0,
        userId: '',
        role: 'user',
        content: trimmedMsg,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      useDemoChatStore.getState().addMessage(userMessage);
      if (store.userMessageCount === 0) {
        setNoteTitle(trimmedMsg);
        setNoteContent('');
        setNoteIsLoading(true);
      }
      setIsWaitingForAI(true);
      useDemoChatStore.getState().setStreaming(true);

      // Create AI placeholder
      const aiMessageId = Date.now() + 1;
      const aiPlaceholder: Message = {
        id: aiMessageId,
        chatId: 0,
        userId: '',
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      useDemoChatStore.getState().addMessage(aiPlaceholder);

      // Create AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const contextMessages = buildContextMessages();

        const response = await publicChatApi.sendMessage(
          trimmedMsg,
          contextMessages,
          (accumulatedContent) => {
            useDemoChatStore
              .getState()
              .updateMessageById(aiMessageId, accumulatedContent);
            if (store.userMessageCount === 0) {
              setNoteIsLoading(false);
              setNoteContent(accumulatedContent);
            }
          },
          abortController.signal
        );

        if (response.type === 'error' || response.type === 'rate_limit') {
          useDemoChatStore.getState().removeMessageById(aiMessageId);
          setError(response.error || 'Произошла ошибка. Попробуйте позже.');
          setIsWaitingForAI(false);
          useDemoChatStore.getState().setStreaming(false);
          setNoteIsLoading(false);
          return;
        }

        useDemoChatStore.getState().setStreaming(false);

        const newCount = store.userMessageCount + 1;
        useDemoChatStore.getState().setUserMessageCount(newCount);

        const isLastMessage = newCount >= WELCOME_CHAT_CONFIG.MAX_USER_MESSAGES;

        // Update the AI message with final content
        const currentMessages = useDemoChatStore.getState().messages;
        const updated = currentMessages.map((m) =>
          m.id === aiMessageId
            ? { ...m, content: response.content, truncated: isLastMessage }
            : m
        );

        saveConversationForAuth(updated);
        useDemoChatStore.getState().setMessages(updated);

        if (isLastMessage) {
          const signupPrompt: Message = {
            id: Date.now() + 2,
            chatId: 0,
            userId: '',
            role: 'assistant',
            content: WELCOME_SIGNUP_PROMPT,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          useDemoChatStore.getState().addMessage(signupPrompt);
          useDemoChatStore.getState().setNeededAuth(true);
        }
      } catch (err) {
        // Ignore abort errors — they're expected on unmount
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Error sending demo message:', err);
        useDemoChatStore.getState().removeMessageById(aiMessageId);
        setError('Произошла ошибка при отправке сообщения. Попробуйте позже.');
        useDemoChatStore.getState().setStreaming(false);
        setNoteIsLoading(false);
      } finally {
        setIsWaitingForAI(false);
        abortControllerRef.current = null;
      }
    },
    [
      isWaitingForAI,
      buildContextMessages,
      saveConversationForAuth,
      setNoteTitle,
      setNoteContent,
      setNoteIsLoading,
    ]
  );

  // Wrapper for ChatWindow's onSendMessage (expects async with extra params)
  const handleSendMessage = useCallback(
    async (message: string) => {
      await sendMessage(message);
    },
    [sendMessage]
  );

  const handleRemoveCard = useCallback(() => {}, []);
  const handleAddCard = useCallback(() => {}, []);

  return (
    <m.div
      className="relative flex-shrink-0"
      animate={{ width: isOpen ? CHAT_WIDTH : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 44 }}
    >
      <m.div
        className={`
          relative flex flex-col h-full
          ${isOpen ? 'border-r border-[var(--border-light)]' : 'border-0 pointer-events-none'}
          overflow-hidden bg-background-base
        `}
        animate={{
          width: isOpen ? CHAT_WIDTH : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 44 }}
      >
        {isOpen && (
          <>
            {/* Chat header */}
            <div className="h-[52px] px-4 flex items-center flex-shrink-0 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-text-primary">
                  AI ЧАТ
                </span>
                <span className="text-[14px] font-normal text-text-secondary">
                  GPT-5.2
                </span>
              </div>
            </div>

            {/* Chat body */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <ChatWindow
                chatId={0}
                cards={[]}
                messages={messages}
                onSendMessage={handleSendMessage}
                onRemoveCard={handleRemoveCard}
                minimal
                showLlmActions
                showAuthNotice={neededAuth}
                error={error}
                isExternalLoading={isStreaming}
              />
            </div>
          </>
        )}
      </m.div>
    </m.div>
  );
};

export default DemoChat;
