import { useState, useCallback } from 'react';
import { ymBoardTypeFromPathname } from '@/features/board/utils/ymBoardType';
import type { TranslateFn } from '@/shared/i18n/settings';
import { useBoardStore } from '@/stores/boardStore';
import { usePositionedCreateCardMutation } from '@/features/board/queries';
import {
  calculateGridPositions,
  calculateGridPositionsFromCenter,
} from '@/features/board/utils/cardPositioning';
import { currentBoard } from '@/services/api/client';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { useTranslation } from '@/shared/i18n/client';
import { REGION } from '@/shared/config/region';
import {
  createChartCardData,
  createNewsCardData,
  createFundamentalCardData,
  createTechnicalCardData,
} from '@/features/ticker/utils/tickerToCard';
import {
  useTickersQuery,
  useNewsByTickersQuery,
  useFundamentalDataByTickersQuery,
  useTechnicalDataByTickersQuery,
} from '@/features/ticker/queries';
import { CreateCardRequest } from '@/types';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';

interface UseCreateTickerCardsParams {
  selectedTickers: string[]; // Deprecated: for backward compatibility with news/fundamental/technical filters
  selectedSecurityIds: number[]; // Use this for ticker cards
  selectedNewsIds: string[];
  selectedFundamentalIds: string[];
  selectedTechnicalIds: string[];
  viewportCenter?: { x: number; y: number };
}

interface UseCreateTickerCardsReturn {
  createCards: () => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

/**
 * Hook to orchestrate creating ticker-related cards on the board
 * Handles chart cards for tickers, news cards, fundamental cards, and technical cards
 */
export const useCreateTickerCards = ({
  selectedTickers,
  selectedSecurityIds,
  selectedNewsIds,
  selectedFundamentalIds,
  selectedTechnicalIds,
  viewportCenter,
}: UseCreateTickerCardsParams): UseCreateTickerCardsReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('ticker');

  const createCardMutation = usePositionedCreateCardMutation();
  const { trackEvent } = useYandexMetrika();

  const { data: allTickers = [] } = useTickersQuery({
    security_ids: selectedSecurityIds,
    limit: 100, // Get all selected tickers (max 5)
    enabled: selectedSecurityIds.length > 0, // Skip query when no tickers selected
  });
  const { data: allNews = [] } = useNewsByTickersQuery(selectedTickers);
  const { data: allFundamental = [] } =
    useFundamentalDataByTickersQuery(selectedTickers);
  const { data: allTechnical = [] } =
    useTechnicalDataByTickersQuery(selectedTickers);

  const createCards = useCallback(async () => {
    const boardId = currentBoard.getId();

    if (!boardId) {
      setError(t('cards.noActiveBoard'));
      showErrorToast(t('cards.noActiveBoard'));
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const cardRequests: CreateCardRequest[] = [];

      const selectedTickerObjects = allTickers.filter((ticker) =>
        selectedTickers.includes(ticker.symbol)
      );

      const tickerNameMap = new Map(
        selectedTickerObjects.map((t) => [
          t.symbol,
          REGION === 'us' ? t.symbol : t.name,
        ])
      );

      selectedTickerObjects.forEach((ticker) => {
        cardRequests.push(
          createChartCardData(ticker, boardId, { x: 0, y: 0 }, t as TranslateFn)
        );
      });

      const selectedNewsArticles = allNews.filter((news) =>
        selectedNewsIds.includes(news.id)
      );
      selectedNewsArticles.forEach((news) => {
        const tickerName =
          tickerNameMap.get(news.tickerSymbol) || news.tickerSymbol;
        cardRequests.push(
          createNewsCardData(
            news,
            tickerName,
            boardId,
            { x: 0, y: 0 },
            t as TranslateFn
          )
        );
      });

      const selectedFundamentalData = allFundamental.filter((fund) =>
        selectedFundamentalIds.includes(fund.id)
      );
      selectedFundamentalData.forEach((fund) => {
        const tickerName =
          tickerNameMap.get(fund.tickerSymbol) || fund.tickerSymbol;
        cardRequests.push(
          createFundamentalCardData(
            fund,
            tickerName,
            boardId,
            { x: 0, y: 0 },
            t as TranslateFn
          )
        );
      });

      const selectedTechnicalData = allTechnical.filter((tech) =>
        selectedTechnicalIds.includes(tech.id)
      );
      selectedTechnicalData.forEach((tech) => {
        const tickerName =
          tickerNameMap.get(tech.tickerSymbol) || tech.tickerSymbol;
        cardRequests.push(
          createTechnicalCardData(
            tech,
            tickerName,
            boardId,
            { x: 0, y: 0 },
            t as TranslateFn
          )
        );
      });

      const positions = viewportCenter
        ? calculateGridPositionsFromCenter(viewportCenter, cardRequests.length)
        : calculateGridPositions(
            useBoardStore.getState().allCards,
            cardRequests.length
          );

      cardRequests.forEach((request, index) => {
        request.x = positions[index].x;
        request.y = positions[index].y;
      });

      const createPromises = cardRequests.map((request) =>
        createCardMutation.mutateAsync(request)
      );

      await Promise.all(createPromises);

      if (selectedTickerObjects.length > 0) {
        const pathname =
          typeof window !== 'undefined' ? window.location.pathname : '';
        if (pathname.startsWith('/ideas/')) {
          trackEvent('ticker_added', {
            board_id: boardId,
            board_type: ymBoardTypeFromPathname(pathname),
            tickers: selectedTickerObjects.map((t) => t.symbol).join(','),
          });
        }
      }

      selectedFundamentalData.forEach((fund) => {
        trackEvent('fundamentals_save_to_board', {
          board_id: boardId,
          security_id: fund.securityId || 0,
          ticker: fund.tickerSymbol,
        });
      });

      selectedTechnicalData.forEach((tech) => {
        trackEvent('technicals_save_to_board', {
          board_id: boardId,
          security_id: tech.securityId || 0,
          ticker: tech.tickerSymbol,
        });
      });

      showSuccessToast(t('cards.cardsAdded', { count: cardRequests.length }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('cards.createError');
      setError(errorMessage);
      showErrorToast(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [
    selectedTickers,
    selectedNewsIds,
    selectedFundamentalIds,
    selectedTechnicalIds,
    viewportCenter,
    allTickers,
    allNews,
    allFundamental,
    allTechnical,
    createCardMutation,
    trackEvent,
    t,
  ]);

  return {
    createCards,
    isCreating,
    error,
  };
};
