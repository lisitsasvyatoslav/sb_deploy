export interface TickerBatchItem {
  security_id: number;
  asset_currency: string;
  asset_name: string;
  asset_ticker: string;
  asset_mic: string;
  quote_change: number | null;
  quote_change_percent: number | null;
  quote_last: number | null;
}

export interface TickerBatchResponse {
  tickers: TickerBatchItem[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface SparklineDataPoint {
  date: string; // UTC ISO string, e.g. "2025-07-11T07:30:00.000Z"
  value: number;
}

export interface Ticker {
  id: string;
  name: string;
  symbol: string;
  securityId?: number; // Security ID for CloudFront icon URL
  price: number;
  priceChange: number;
  priceChangePercent: number;
  yearlyChange: number;
  yearlyChangePercent: number;
  sparkline: SparklineDataPoint[]; // Array of data points with dates and values
  category?: string; // Optional category for filtering
  logo?: string; // Optional logo URL
  lastUpdate?: string; // Optional timestamp like "14:45"
  currency?: string; // Currency code (USD, EUR, RUB, etc.)
}

export interface TickerCategory {
  label: string;
  value: string;
}

// News & Analytics types
export interface NewsArticle {
  id: string;
  tickerSymbol: string;
  securityId?: number;
  headline: string;
  date: string;
  time: string;
  source: string;
  url?: string;
  content?: string;
  /** Raw ISO timestamp for accurate formatting in detail views */
  timestamp?: string;
}

export interface FundamentalMetric {
  name: string;
  value: number;
  format: 'price' | 'percent' | 'number';
  description?: string;
}

export interface FundamentalData {
  id: string;
  tickerSymbol: string;
  tickerName: string;
  securityId?: number; // Security ID for CloudFront icon URL
  currency?: string; // Currency code (USD, EUR, RUB, etc.)

  // === ОЦЕНКА СТОИМОСТИ (Valuation) ===
  peRatio?: FundamentalMetric | null; // P/E
  priceBook?: FundamentalMetric | null; // P/BV
  priceSales?: FundamentalMetric | null; // P/S
  priceCf?: FundamentalMetric | null; // P/Cf
  priceFcf?: FundamentalMetric | null; // P/FCF

  // === ДОЛГОВАЯ НАГРУЗКА (Debt Load) ===
  debtRatio?: FundamentalMetric | null;
  debtEquity?: FundamentalMetric | null;
  capexRevenue?: FundamentalMetric | null;

  // === РЕНТАБЕЛЬНОСТЬ (Profitability) ===
  roe?: FundamentalMetric | null; // ROE
  roa?: FundamentalMetric | null; // ROA
  roi?: FundamentalMetric | null; // ROI
  netMargin?: FundamentalMetric | null; // Net margin

  // === ДАННЫЕ О ПРИБЫЛЯХ И УБЫТКАХ (Income Statement) ===
  dividends?: FundamentalMetric | null;
  netIncome?: FundamentalMetric | null;
  ebitda?: FundamentalMetric | null;
  operatingIncome?: FundamentalMetric | null;
  grossProfit?: FundamentalMetric | null;
  sharesOutstanding?: FundamentalMetric | null;
  totalAssets?: FundamentalMetric | null;
  cashOnHand?: FundamentalMetric | null;

  // === БАЛАНСОВЫЕ АКТИВЫ (Balance Sheet) ===
  longTermDebt?: FundamentalMetric | null;
  totalLiabilities?: FundamentalMetric | null;
  totalShareholderEquity?: FundamentalMetric | null;

  // === ДЕНЕЖНЫЕ ПОТОКИ (Cash Flows) ===
  operatingCashFlow?: FundamentalMetric | null;
  freeCashFlow?: FundamentalMetric | null;
  capex?: FundamentalMetric | null;

  // === Дополнительные метрики ===
  revenue?: FundamentalMetric | null;
  marketCapitalization?: FundamentalMetric | null;
  dividendYield?: FundamentalMetric | null;

  // Legacy fields for backward compatibility (for FundamentalTab)
  pe?: number;
}

export interface TechnicalIndicator {
  name: string;
  value?: number | string; // Может быть числом или текстом (например "bearish", "Продавать")
  format: 'price' | 'percent' | 'number' | 'text';
  signal?: 'buy' | 'sell' | 'neutral';
  description?: string;
}

export interface TechnicalAnalysisData {
  id: string;
  tickerSymbol: string;
  tickerName: string;
  securityId?: number; // Security ID for CloudFront icon URL
  trendClass?: string; // e.g., "sideways", "turning_up", "turning_down"
  trendPower?: string; // e.g., "slow", "fast"
  pattern?: string; // e.g., "descending_broadering_wedge"
  indicators: TechnicalIndicator[];
  summary?: string;
}

export type AnalyticsTab = 'news' | 'fundamental' | 'techanalysis';
