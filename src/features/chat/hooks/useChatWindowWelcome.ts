import { useCallback, useEffect, useState } from 'react';
import {
  type WelcomeMigrationMeta,
  loadWelcomeMigration,
  persistWelcomeMigration as persistWelcomeMigrationStorage,
} from '@/features/chat/components/chatWindow/welcomeMigration';

interface UseChatWindowWelcomeParams {
  chatId: number;
}

interface UseChatWindowWelcomeReturn {
  welcomeMigration: WelcomeMigrationMeta | null;
  isWelcomeMigrationActive: boolean;
  isWelcomeCollapsed: boolean;
  isWelcomeAcked: boolean;
  handleToggleWelcomeCollapsed: () => void;
  handleWelcomeAck: (
    createWelcomeAckMessage: () => Promise<void>
  ) => Promise<void>;
  persistWelcomeMigration: (next: WelcomeMigrationMeta) => void;
}

export function useChatWindowWelcome({
  chatId,
}: UseChatWindowWelcomeParams): UseChatWindowWelcomeReturn {
  const [welcomeMigration, setWelcomeMigration] =
    useState<WelcomeMigrationMeta | null>(null);

  useEffect(() => {
    setWelcomeMigration(loadWelcomeMigration(chatId));
  }, [chatId]);

  const isWelcomeMigrationActive =
    !!welcomeMigration && !!welcomeMigration.preview;
  const isWelcomeCollapsed =
    isWelcomeMigrationActive && !!welcomeMigration?.collapsed;
  const isWelcomeAcked = isWelcomeMigrationActive && !!welcomeMigration?.ack;

  const persistWelcomeMigration = useCallback(
    (next: WelcomeMigrationMeta) => {
      setWelcomeMigration(next);
      persistWelcomeMigrationStorage(chatId, next);
    },
    [chatId]
  );

  const handleToggleWelcomeCollapsed = useCallback(() => {
    if (!welcomeMigration) return;
    persistWelcomeMigration({
      ...welcomeMigration,
      collapsed: !welcomeMigration.collapsed,
    });
  }, [persistWelcomeMigration, welcomeMigration]);

  const handleWelcomeAck = useCallback(
    async (createWelcomeAckMessage: () => Promise<void>) => {
      if (!welcomeMigration || !isWelcomeMigrationActive) return;
      await createWelcomeAckMessage();
      const next: WelcomeMigrationMeta = {
        ...welcomeMigration,
        ack: true,
        collapsed: true,
      };
      persistWelcomeMigration(next);
    },
    [welcomeMigration, isWelcomeMigrationActive, persistWelcomeMigration]
  );

  return {
    welcomeMigration,
    isWelcomeMigrationActive,
    isWelcomeCollapsed,
    isWelcomeAcked,
    handleToggleWelcomeCollapsed,
    handleWelcomeAck,
    persistWelcomeMigration,
  };
}
