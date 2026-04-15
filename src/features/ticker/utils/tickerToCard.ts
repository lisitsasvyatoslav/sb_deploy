import { CreateCardRequest, Tag } from '@/types';
import {
  Ticker,
  NewsArticle,
  FundamentalData,
  TechnicalAnalysisData,
} from '@/types/ticker';
import { getCurrencySymbol } from './currency';
import type { TranslateFn } from '@/shared/i18n/settings';
import { REGION } from '@/shared/config/region';

/**
 * Create a chart card request from ticker data
 * @param ticker - Ticker object with price and chart data
 * @param boardId - Target board ID
 * @param position - {x, y} position on the board
 * @returns CreateCardRequest for chart card
 *
 * NOTE: Chart cards now store only security_id in meta.
 * Actual chart data is fetched dynamically when the card is displayed.
 */
export const createChartCardData = (
  ticker: Ticker,
  boardId: number,
  position: { x: number; y: number },
  t: TranslateFn
): CreateCardRequest => {
  // Minimal content - actual data will be fetched dynamically
  const content = t('cards.chartTitle', { symbol: ticker.symbol });

  // Create ticker tag with new structure (without id field for creation)
  const tags: Omit<Tag, 'id'>[] = [
    {
      type: 'ticker',
      text: ticker.symbol,
      icon: null,
      meta: {
        symbol: ticker.symbol,
        name: ticker.name,
        securityId: ticker.securityId,
      },
      order: 0,
    },
  ];

  return {
    boardId: boardId,
    title: REGION === 'us' ? ticker.symbol : ticker.name,
    content,
    type: 'chart',
    tags,
    meta: {
      // Store only security_id - all other data will be fetched dynamically
      security_id: ticker.securityId,
      symbol: ticker.symbol, // Keep symbol for display purposes
    },
    x: position.x,
    y: position.y,
    zIndex: 0,
  };
};

/**
 * Create a news card request from news article data
 * @param newsArticle - News article object
 * @param tickerName - Name of the ticker this news is related to
 * @param boardId - Target board ID
 * @param position - {x, y} position on the board
 * @returns CreateCardRequest for news card
 */
export const createNewsCardData = (
  newsArticle: NewsArticle,
  tickerName: string,
  boardId: number,
  position: { x: number; y: number },
  t: TranslateFn
): CreateCardRequest => {
  // Use full content if available, otherwise fallback to headline
  const content = newsArticle.content || newsArticle.headline;
  const dateTimeDisplay = `${newsArticle.date} ${newsArticle.time}`;

  // Create ticker tag and optional link tag for news (without id field for creation)
  const tags: Omit<Tag, 'id'>[] = [
    {
      type: 'ticker',
      text: newsArticle.tickerSymbol,
      icon: null,
      meta: {
        symbol: newsArticle.tickerSymbol,
        name: tickerName,
        securityId: newsArticle.securityId,
      },
      order: 0,
    },
  ];

  // Add link tag if news has a URL
  if (newsArticle.url) {
    tags.push({
      type: 'link',
      text: newsArticle.source || t('cards.source'),
      icon: null,
      meta: {
        url: newsArticle.url,
      },
      order: 1,
    });
  }

  return {
    boardId: boardId,
    title: newsArticle.headline,
    content,
    type: 'news',
    tags,
    meta: {
      tickerSymbol: newsArticle.tickerSymbol,
      date: newsArticle.date,
      time: newsArticle.time,
      source: newsArticle.source,
      dateTime: dateTimeDisplay,
      url: newsArticle.url,
    },
    x: position.x,
    y: position.y,
    zIndex: 0,
  };
};

/**
 * Create a fundamental analysis card request from fundamental data
 * @param fundamentalData - Fundamental analysis data
 * @param tickerName - Name of the ticker
 * @param boardId - Target board ID
 * @param position - {x, y} position on the board
 * @returns CreateCardRequest for fundamental card
 */
export const createFundamentalCardData = (
  fundamentalData: FundamentalData,
  tickerName: string,
  boardId: number,
  position: { x: number; y: number },
  t: TranslateFn
): CreateCardRequest => {
  // Helper to get numeric value from either legacy number or FundamentalMetric
  const getValue = (field: unknown): number => {
    if (typeof field === 'number') return field;
    if (
      field &&
      typeof field === 'object' &&
      'value' in field &&
      typeof (field as { value: unknown }).value === 'number'
    )
      return (field as { value: number }).value;
    return 0;
  };

  const pe = getValue(fundamentalData.pe);
  const debtRatio = getValue(fundamentalData.debtRatio);
  const roe = getValue(fundamentalData.roe);
  const ebitda = getValue(fundamentalData.ebitda);
  const netIncome = getValue(fundamentalData.netIncome);

  // Get currency symbol for proper display
  const currencySymbol = getCurrencySymbol(fundamentalData.currency);

  // Format EBITDA in billions and Net Income in billions
  const ebitdaInBillions = ebitda ? ebitda / 1_000_000_000 : undefined;
  const netIncomeInBillions = netIncome ? netIncome / 1_000_000_000 : undefined;

  const content = `${t('fundamental.metrics.pe')}: ${pe || '—'}\n${t('fundamental.metrics.debtRatio')}: ${debtRatio || '—'}\n${t('fundamental.metrics.roe')}: ${roe || '—'}\n${t('fundamental.metrics.ebitda')}: ${ebitdaInBillions !== undefined ? `${ebitdaInBillions.toFixed(2)} ${t('scale.billion')} ${currencySymbol}` : '—'}\n${t('fundamental.metrics.netIncome')}: ${netIncomeInBillions !== undefined ? `${netIncomeInBillions.toFixed(2)} ${t('scale.billion')} ${currencySymbol}` : '—'}`;

  // Structure metrics for display in FundamentalContent component
  const metrics = [
    {
      label: t('fundamental.metrics.pe'),
      value: pe ? pe.toFixed(2) : '—',
      color: pe && pe < 15 ? 'positive' : 'default',
    },
    {
      label: t('fundamental.metrics.debtRatio'),
      value: debtRatio ? debtRatio.toFixed(2) : '—',
      color: debtRatio && debtRatio < 0.6 ? 'positive' : 'default',
    },
    {
      label: t('fundamental.metrics.roe'),
      value: roe ? roe.toFixed(2) : '—',
      color: roe && roe > 15 ? 'positive' : 'default',
    },
    {
      label: t('fundamental.metrics.ebitda'),
      value:
        ebitdaInBillions !== undefined
          ? `${ebitdaInBillions.toFixed(2)} ${t('scale.billion')} ${currencySymbol}`
          : '—',
      color: 'default',
    },
    {
      label: t('fundamental.metrics.netIncome'),
      value:
        netIncomeInBillions !== undefined
          ? `${netIncomeInBillions.toFixed(2)} ${t('scale.billion')} ${currencySymbol}`
          : '—',
      color: 'default',
    },
  ];

  // Create ticker tag (without id field for creation)
  const tags: Omit<Tag, 'id'>[] = [
    {
      type: 'ticker',
      text: fundamentalData.tickerSymbol,
      icon: null,
      meta: {
        symbol: fundamentalData.tickerSymbol,
        name: tickerName,
        securityId: fundamentalData.securityId,
      },
      order: 0,
    },
  ];

  return {
    boardId: boardId,
    title: t('cards.fundamentalTitle'),
    content,
    type: 'fundamental',
    tags,
    meta: {
      tickerSymbol: fundamentalData.tickerSymbol,
      tickerName: fundamentalData.tickerName,
      securityId: fundamentalData.securityId,
      currency: fundamentalData.currency,
      metrics,
      fundamentalData, // Store complete data for modal
    },
    x: position.x,
    y: position.y,
    zIndex: 0,
  };
};

/**
 * Create a technical analysis card request from technical data
 * @param technicalData - Technical analysis data
 * @param tickerName - Name of the ticker
 * @param boardId - Target board ID
 * @param position - {x, y} position on the board
 * @returns CreateCardRequest for technical card
 */
export const createTechnicalCardData = (
  technicalData: TechnicalAnalysisData,
  tickerName: string,
  boardId: number,
  position: { x: number; y: number },
  t: TranslateFn
): CreateCardRequest => {
  // Format content from indicators array
  const contentParts: string[] = [];

  // Add trend info if available
  if (technicalData.trendClass) {
    contentParts.push(
      `Trend: ${technicalData.trendClass}${technicalData.trendPower ? ` (${technicalData.trendPower})` : ''}`
    );
  }

  // Add pattern if available
  if (technicalData.pattern) {
    contentParts.push(`Pattern: ${technicalData.pattern}`);
  }

  // Add top indicators
  technicalData.indicators.slice(0, 5).forEach((ind) => {
    const value = ind.value !== undefined ? ind.value : 'N/A';
    const signal = ind.signal ? ` [${ind.signal.toUpperCase()}]` : '';
    contentParts.push(`${ind.name}: ${value}${signal}`);
  });

  const content =
    contentParts.join('\n') ||
    technicalData.summary ||
    'No technical data available';

  // Select key indicators for card preview: Stochastic, EMA-100, RSI, MACD
  const priorityNames = ['Stochastic', 'EMA-100', 'RSI', 'MACD'];
  const priorityIndicators = priorityNames
    .map((name) =>
      technicalData.indicators.find(
        (ind) =>
          ind.name.replace(/[- ]/g, '').toLowerCase() ===
          name.replace(/[- ]/g, '').toLowerCase()
      )
    )
    .filter((ind): ind is NonNullable<typeof ind> => ind !== undefined);

  const indicators = priorityIndicators.map((ind) => ({
    label: ind.name,
    signal: ind.signal || ind.description || 'neutral',
  }));

  // Create ticker tag (without id field for creation)
  const tags: Omit<Tag, 'id'>[] = [
    {
      type: 'ticker',
      text: technicalData.tickerSymbol,
      icon: null,
      meta: {
        symbol: technicalData.tickerSymbol,
        name: tickerName,
        securityId: technicalData.securityId,
      },
      order: 0,
    },
  ];

  return {
    boardId: boardId,
    title: t('cards.technicalTitle'),
    content,
    type: 'technical',
    tags,
    meta: {
      tickerSymbol: technicalData.tickerSymbol,
      tickerName: technicalData.tickerName,
      securityId: technicalData.securityId,
      trendClass: technicalData.trendClass,
      trendPower: technicalData.trendPower,
      pattern: technicalData.pattern,
      indicators, // Simplified for card display
      summary: technicalData.summary,
      // Store complete technical data for modal
      technicalData,
    },
    x: position.x,
    y: position.y,
    zIndex: 0,
  };
};
