import { useMemo } from 'react';
import { useChatStore, type ChatTradesLabelType } from '@/stores/chatStore';

const EMPTY_TRADES: Array<{ ticker: string; securityId?: number }> = [];

interface ChatAttachedTradesResult {
  trades: Array<{ ticker: string; securityId?: number }>;
  labelType: ChatTradesLabelType;
  selectedCount: number;
}

const EMPTY_RESULT: ChatAttachedTradesResult = {
  trades: EMPTY_TRADES,
  labelType: 'tickers',
  selectedCount: 0,
};

/**
 * Derives the attached trades array and label type from chatStore's chatTradesContext + activeChatId.
 * Replaces prop-drilling of attachedTrades through ChatManager → ChatWindow → ChatInput.
 */
export function useChatAttachedTrades(): ChatAttachedTradesResult {
  const chatTradesContext = useChatStore((s) => s.chatTradesContext);
  const activeChatId = useChatStore((s) => s.activeChatId);

  return useMemo(() => {
    if (!chatTradesContext || chatTradesContext.chatId !== activeChatId)
      return EMPTY_RESULT;
    const trades = Object.entries(chatTradesContext.tickerSecurityIds).map(
      ([ticker, securityId]) => ({
        ticker,
        securityId: securityId ?? undefined,
      })
    );
    const selectedCount = chatTradesContext.selectedCount ?? trades.length;
    return { trades, labelType: chatTradesContext.labelType, selectedCount };
  }, [chatTradesContext, activeChatId]);
}
