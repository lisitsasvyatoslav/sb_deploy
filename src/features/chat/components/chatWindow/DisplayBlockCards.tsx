import React from 'react';
import type { Message } from '@/types';

const CARD_CLASS =
  'p-4 rounded-[12px] flex flex-col gap-2 max-w-[520px] bg-background-card';
const TEXT_BOLD = 'text-sm font-bold text-text-primary leading-relaxed';
const TEXT_NORMAL = 'text-sm text-text-primary leading-relaxed';

export const WelcomeAckBlock: React.FC<{ msg: Message }> = ({ msg }) => (
  <div className={CARD_CLASS}>
    <div className={TEXT_BOLD}>{msg.content}</div>
  </div>
);

export const SurveyQaBlock: React.FC<{ msg: Message }> = ({ msg }) => {
  const [questionText, ...answerParts] = msg.content.split('\n');
  const answerText = answerParts.join('\n');
  return (
    <div className={CARD_CLASS}>
      <div className={TEXT_BOLD}>{questionText}</div>
      <div className={TEXT_NORMAL}>{answerText}</div>
    </div>
  );
};

export const SurveyFeedbackBlock: React.FC<{ msg: Message }> = ({ msg }) => (
  <div className={`${TEXT_NORMAL} max-w-[520px]`}>{msg.content}</div>
);
