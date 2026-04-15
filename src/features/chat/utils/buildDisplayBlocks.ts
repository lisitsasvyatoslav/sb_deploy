import React from 'react';
import type { Message } from '@/types';

export type DisplayBlock =
  | { type: 'welcome_ack'; msg: Message }
  | { type: 'survey_qa'; msg: Message }
  | { type: 'survey_feedback'; msg: Message }
  | {
      type: 'user_pair';
      userMsg: Message;
      assistantMsg: Message | null;
      userIndex: number;
    }
  | { type: 'assistant_only'; msg: Message; index: number }
  | { type: 'strategy_results'; msg: Message }
  | { type: 'survey_footer'; content: React.ReactNode }
  | { type: 'pipeline_progress'; content: React.ReactNode };

export function isChatMessage(msg: Message): boolean {
  return (
    msg.messageType === 'chat' ||
    msg.messageType === 'survey_rows' ||
    !msg.messageType
  );
}

/**
 * Converts a flat message list into display blocks for the virtual list.
 * User + next assistant become one user_pair block; standalone assistants become assistant_only.
 */
export const SPECIAL_MESSAGE_TYPES: Record<string, DisplayBlock['type']> = {
  welcome_ack: 'welcome_ack',
  survey_qa: 'survey_qa',
  survey_feedback: 'survey_feedback',
  strategy_results: 'strategy_results',
};

export function buildDisplayBlocks(messages: Message[]): DisplayBlock[] {
  type Acc = { blocks: DisplayBlock[]; skip: boolean };

  const { blocks } = messages.reduce<Acc>(
    (acc, msg, i) => {
      if (acc.skip) {
        return { blocks: acc.blocks, skip: false };
      }

      const specialType = SPECIAL_MESSAGE_TYPES[msg.messageType ?? ''];
      if (specialType) {
        acc.blocks.push({ type: specialType, msg } as DisplayBlock);
        return acc;
      }

      if (msg.role === 'user' && isChatMessage(msg)) {
        const next = messages[i + 1];
        const assistantMsg =
          next?.role === 'assistant' && isChatMessage(next) ? next : null;
        acc.blocks.push({
          type: 'user_pair',
          userMsg: msg,
          assistantMsg,
          userIndex: i,
        });
        return { blocks: acc.blocks, skip: !!assistantMsg };
      }

      if (msg.role === 'assistant' && isChatMessage(msg)) {
        const hasPlans = msg.plans && msg.plans.length > 0;
        if (hasPlans || (msg.content && msg.content.trim() !== '')) {
          acc.blocks.push({ type: 'assistant_only', msg, index: i });
        }
      }

      return acc;
    },
    { blocks: [], skip: false }
  );

  return blocks;
}
