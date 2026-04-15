import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { NewsItem } from 'finsignal-feed-explore';
import {
  useTickerBatchQuery,
  tickerQueryKeys,
} from '@/features/ticker/queries';
import { tickersApi } from '@/services/api/tickers';
import type { Ticker } from '@/types/ticker';
import {
  formatTickerPrice,
  formatTickerPercent,
} from '@/shared/utils/formatters';
import {
  extractEntities,
  getTickerSvgLogo,
} from '@/features/news/utils/extractEntities';

export function useNewsTickerEnrichment(
  feedItems: NewsItem[],
  locale: string
): NewsItem[] {
  const { directSymbols, companyNames } = useMemo(() => {
    const syms = new Set<string>();
    const names = new Set<string>();
    feedItems.forEach((item) => {
      item.stocks?.forEach((s) => {
        if (s.symbol) syms.add(s.symbol);
      });
      extractEntities(item).forEach((e) => {
        if (e.ticker?.trim()) syms.add(e.ticker.trim());
        else if (e.type === 'COMPANY' && e.name?.trim())
          names.add(e.name.trim());
      });
    });
    return { directSymbols: Array.from(syms), companyNames: Array.from(names) };
  }, [feedItems]);

  const { data: batchData } = useTickerBatchQuery(directSymbols);

  const companySearchQueries = useQueries({
    queries: companyNames.map((name) => ({
      queryKey: tickerQueryKeys.search(name),
      queryFn: () => tickersApi.searchTickers(name),
      staleTime: 1000 * 60 * 10,
      enabled: !!name,
    })),
  });

  const batchTickerMap = useMemo(
    () => new Map(batchData?.tickers.map((t) => [t.asset_ticker, t]) ?? []),
    [batchData]
  );

  const companyTickerMap = useMemo(() => {
    const map = new Map<string, Ticker>();
    companyNames.forEach((name, idx) => {
      const results = companySearchQueries[idx]?.data;
      if (results?.length) map.set(name, results[0]);
    });
    return map;
  }, [companyNames, companySearchQueries]);

  const enrichedItems = useMemo<NewsItem[]>(() => {
    const hasData = batchTickerMap.size > 0 || companyTickerMap.size > 0;
    if (!hasData) return feedItems;

    return feedItems.map((item) => {
      const entities = extractEntities(item);
      const addedSymbols = new Set<string>();
      const stocks: Array<
        NonNullable<NewsItem['stocks']>[number] & { securityId?: number }
      > = [];

      const pushBatchStock = (symbol: string) => {
        const t = batchTickerMap.get(symbol);
        if (!t) return;
        const pct = t.quote_change_percent ?? 0;
        stocks.push({
          symbol,
          price:
            t.quote_last != null
              ? formatTickerPrice(t.quote_last, t.asset_currency, locale)
              : '',
          change:
            t.quote_change_percent != null
              ? `${pct >= 0 ? '+' : ''}${formatTickerPercent(pct, locale)} %`
              : '',
          changeType: pct >= 0 ? 'positive' : 'negative',
          logo: getTickerSvgLogo(symbol),
          securityId: t.security_id,
        });
        addedSymbols.add(symbol);
      };

      const pushSearchStock = (found: Ticker) => {
        const pct = found.priceChangePercent ?? 0;
        stocks.push({
          symbol: found.symbol,
          price: formatTickerPrice(
            found.price,
            found.currency ?? 'RUB',
            locale
          ),
          change: `${pct >= 0 ? '+' : ''}${formatTickerPercent(pct, locale)} %`,
          changeType: pct >= 0 ? 'positive' : 'negative',
          logo: getTickerSvgLogo(found.symbol),
          securityId: found.securityId,
        });
        addedSymbols.add(found.symbol);
      };

      item.stocks?.forEach((s) => {
        if (!addedSymbols.has(s.symbol)) pushBatchStock(s.symbol);
      });

      entities.forEach((e) => {
        const sym = e.ticker?.trim();
        if (sym && !addedSymbols.has(sym)) {
          pushBatchStock(sym);
        } else if (!sym && e.type === 'COMPANY' && e.name?.trim()) {
          const found = companyTickerMap.get(e.name.trim());
          if (found && !addedSymbols.has(found.symbol)) pushSearchStock(found);
        }
      });

      if (stocks.length === 0) return item;
      return { ...item, stocks };
    });
  }, [feedItems, batchTickerMap, companyTickerMap, locale]);

  return enrichedItems;
}
