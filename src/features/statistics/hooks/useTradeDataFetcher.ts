'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { useChatManager } from '@/features/chat/hooks/useChatManager';
import { useChatStore, type ChatTradesLabelType } from '@/stores/chatStore';
import { statisticsApi } from '@/services/api/statistics';
import { logger } from '@/shared/utils/logger';
import type { ChildSelection } from './useTradeContextMenu';

const TRADES_PAGE_SIZE = 1000;

interface UseTradeDataFetcherParams {
  tradeIds: number[];
  symbols: string[];
  childSelections: ChildSelection[];
  tickerSecurityIds: Record<string, number | null>;
  labelType: ChatTradesLabelType;
  onClose: () => void;
}

interface UseTradeDataFetcherReturn {
  isLoading: boolean;
  errorMessage: string | null;
  dismissError: () => void;
  handleAskAI: () => Promise<void>;
}

/**
 * Owns the data-fetching and chat-creation logic for TradeContextMenu.
 * Extracted to keep the menu component focused on rendering and event handling.
 */
export function useTradeDataFetcher({
  tradeIds,
  symbols,
  childSelections,
  tickerSecurityIds,
  labelType,
  onClose,
}: UseTradeDataFetcherParams): UseTradeDataFetcherReturn {
  const { t } = useTranslation('statistics');
  const { createChatWithTrades } = useChatManager();
  const openSidebar = useChatStore((s) => s.openSidebar);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAskAI = useCallback(async () => {
    if (isLoading) return;
    logger.info('useTradeDataFetcher', 'handleAskAI START', {
      tradeIds,
      symbols,
      childSelections,
      tickerSecurityIds,
      labelType,
    });
    setIsLoading(true);
    try {
      let ids = [...tradeIds];
      // Build combined tickerSecurityIds including child selections
      const combinedTickerSecurityIds: Record<string, number | null> = {
        ...tickerSecurityIds,
      };
      for (const child of childSelections) {
        combinedTickerSecurityIds[child.symbol] = child.securityId ?? null;
      }

      if (ids.length === 0) {
        const parentSymbolSet = new Set(symbols);

        // Fetch trades for parent-level symbols (no account filter)
        if (symbols.length > 0) {
          logger.info(
            'useTradeDataFetcher',
            'fetching trades for parent symbols',
            { symbols }
          );
          const results = await Promise.allSettled(
            symbols.map((sym) =>
              statisticsApi.getTrades(
                { symbol: sym },
                { pageSize: TRADES_PAGE_SIZE }
              )
            )
          );
          const parentIds = results
            .filter(
              (
                r
              ): r is PromiseFulfilledResult<
                Awaited<ReturnType<typeof statisticsApi.getTrades>>
              > => r.status === 'fulfilled'
            )
            .flatMap((r) => r.value.data.map((trade) => Number(trade.id)));
          const failedCount = results.filter(
            (r) => r.status === 'rejected'
          ).length;
          if (failedCount > 0) {
            logger.warn(
              'useTradeDataFetcher',
              'some parent symbol fetches failed',
              { failedCount }
            );
          }
          logger.info('useTradeDataFetcher', 'parent symbol trades fetched', {
            count: parentIds.length,
            ids: parentIds.slice(0, 10),
          });
          ids = [...ids, ...parentIds];
        }

        // Fetch trades for child-level selections, skip symbols already in parent
        const childToFetch = childSelections.filter(
          (c) => !parentSymbolSet.has(c.symbol)
        );
        if (childToFetch.length > 0) {
          logger.info(
            'useTradeDataFetcher',
            'fetching trades for child selections',
            {
              childToFetch: childToFetch.map((c) => ({
                symbol: c.symbol,
                accountId: c.accountId,
                brokerType: c.brokerType,
                positionIds: c.positionIds,
              })),
            }
          );

          // Prefer position-level fetch (via trade_position_links) when positionIds are available
          const withPositionIds = childToFetch.filter(
            (c) => c.positionIds?.length
          );
          const withoutPositionIds = childToFetch.filter(
            (c) => !c.positionIds?.length
          );

          // Position-level: fetch exact trades linked to each position
          if (withPositionIds.length > 0) {
            const allPositionIds = withPositionIds.flatMap(
              (c) => c.positionIds!
            );
            logger.info('useTradeDataFetcher', 'position-level fetch', {
              allPositionIds,
            });
            const posResults = await Promise.allSettled(
              allPositionIds.map((pid) => statisticsApi.getPositionTrades(pid))
            );
            const brokerTradeIds = posResults
              .filter(
                (
                  r
                ): r is PromiseFulfilledResult<
                  Awaited<ReturnType<typeof statisticsApi.getPositionTrades>>
                > => r.status === 'fulfilled'
              )
              .flatMap((r) =>
                r.value.trades
                  .map((trade) => Number(trade.brokerTradeId))
                  .filter((id) => Number.isInteger(id))
              );
            const failedCount = posResults.filter(
              (r) => r.status === 'rejected'
            ).length;
            if (failedCount > 0) {
              logger.warn(
                'useTradeDataFetcher',
                'some position fetches failed',
                { failedCount }
              );
            }
            logger.info('useTradeDataFetcher', 'position trades fetched', {
              count: brokerTradeIds.length,
              ids: brokerTradeIds.slice(0, 10),
            });
            ids = [...ids, ...brokerTradeIds];
          }

          // Fallback: account-level fetch for children without positionIds
          if (withoutPositionIds.length > 0) {
            logger.info('useTradeDataFetcher', 'fallback account-level fetch', {
              children: withoutPositionIds.map((c) => ({
                symbol: c.symbol,
                accountId: c.accountId,
              })),
            });
            const fallbackResults = await Promise.allSettled(
              withoutPositionIds.map((c) => {
                const filters: { symbol: string; accountIds?: string[] } = {
                  symbol: c.symbol,
                };
                if (c.accountId) {
                  filters.accountIds = [`${c.brokerType}:${c.accountId}`];
                }
                return statisticsApi.getTrades(filters, {
                  pageSize: TRADES_PAGE_SIZE,
                });
              })
            );
            const fallbackIds = fallbackResults
              .filter(
                (
                  r
                ): r is PromiseFulfilledResult<
                  Awaited<ReturnType<typeof statisticsApi.getTrades>>
                > => r.status === 'fulfilled'
              )
              .flatMap((r) => r.value.data.map((trade) => Number(trade.id)));
            const failedCount = fallbackResults.filter(
              (r) => r.status === 'rejected'
            ).length;
            if (failedCount > 0) {
              logger.warn(
                'useTradeDataFetcher',
                'some fallback fetches failed',
                { failedCount }
              );
            }
            logger.info('useTradeDataFetcher', 'fallback trades fetched', {
              count: fallbackIds.length,
              ids: fallbackIds.slice(0, 10),
            });
            ids = [...ids, ...fallbackIds];
          }
        }
      } else {
        logger.info('useTradeDataFetcher', 'using pre-provided tradeIds', {
          count: ids.length,
          ids: ids.slice(0, 10),
        });
      }

      if (ids.length === 0) {
        logger.warn('useTradeDataFetcher', 'no trade IDs found, aborting');
        return;
      }

      // When tradeIds are pre-provided (e.g. individual trades selected in history),
      // count = number of trade IDs. Otherwise count = parent symbols + child selections.
      const selectedCount =
        tradeIds.length > 0
          ? ids.length
          : symbols.length + childSelections.length;
      logger.info('useTradeDataFetcher', 'creating chat with trades', {
        totalTradeIds: ids.length,
        tradeIds: ids,
        symbols,
        childSelectionsCount: childSelections.length,
        selectedCount,
        labelType,
        tickerSecurityIds: combinedTickerSecurityIds,
      });
      await createChatWithTrades(
        ids,
        undefined,
        combinedTickerSecurityIds,
        labelType,
        selectedCount
      );
      openSidebar();
    } catch (error) {
      logger.error(
        'useTradeDataFetcher',
        'Failed to create chat with trades',
        error
      );
      setErrorMessage(t('trades.askAIError'));
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [
    isLoading,
    onClose,
    tradeIds,
    symbols,
    childSelections,
    tickerSecurityIds,
    labelType,
    createChatWithTrades,
    openSidebar,
    t,
  ]);

  const dismissError = useCallback(() => setErrorMessage(null), []);

  return { isLoading, errorMessage, dismissError, handleAskAI };
}
