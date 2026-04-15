import type { Message } from '@/types';

export type WelcomeMigrationMeta = {
  preview?: string;
  collapsed?: boolean;
  ack?: boolean;
};

// NOTE: This string must match persisted data in the database. Do NOT translate it.
// Existing assistant messages contain this Russian prefix; changing it would break migration detection.
export const WELCOME_AFTER_SAVE_PREFIX =
  'Отлично, теперь диалоги будут сохраняться';

export const getWelcomeMigrationKey = (chatId: number) =>
  `chat_${chatId}_welcome_migration`;

export function loadWelcomeMigration(
  chatId: number
): WelcomeMigrationMeta | null {
  try {
    const raw = localStorage.getItem(getWelcomeMigrationKey(chatId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WelcomeMigrationMeta;
    return {
      preview: typeof parsed.preview === 'string' ? parsed.preview : '',
      collapsed: !!parsed.collapsed,
      ack: !!parsed.ack,
    };
  } catch {
    return null;
  }
}

export function persistWelcomeMigration(
  chatId: number,
  next: WelcomeMigrationMeta
) {
  try {
    localStorage.setItem(getWelcomeMigrationKey(chatId), JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function findWelcomeAssistantMessageId(
  messages: Message[]
): number | null {
  // Only match the seeded welcome assistant message by its known prefix.
  // No fallback — regular assistant messages should never be treated as the welcome boundary.
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (
      m?.role === 'assistant' &&
      m.content?.includes(WELCOME_AFTER_SAVE_PREFIX)
    ) {
      return m.id;
    }
  }
  return null;
}

/**
 * Get messages to display in ChatMessageList.
 * When welcome migration is active, we filter out messages BEFORE welcomeAssistantId
 * because those are shown in the WelcomeMigrationBanner.
 */
export function getDisplayMessages(
  messages: Message[],
  welcomeAssistantId: number | null
): Message[] {
  if (!welcomeAssistantId) return messages;

  // Find index of welcome assistant message
  const welcomeIdx = messages.findIndex((m) => m.id === welcomeAssistantId);
  if (welcomeIdx === -1) return messages;

  // Return messages starting from welcome assistant (inclusive)
  return messages.slice(welcomeIdx);
}

/**
 * Get messages for the WelcomeMigrationBanner (messages BEFORE welcome assistant).
 */
export function getBannerMessages(
  messages: Message[],
  welcomeAssistantId: number | null
): { role: 'user' | 'assistant'; content: string }[] {
  if (!welcomeAssistantId) return [];

  const result: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of messages) {
    // Stop before welcome assistant message
    if (m.id === welcomeAssistantId) break;
    if (m.role === 'user' || m.role === 'assistant') {
      result.push({ role: m.role, content: m.content || '' });
    }
  }
  return result;
}
