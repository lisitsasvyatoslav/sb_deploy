export type StrategiesTab = 'current' | 'saved';

export type ProductSource = number;
export type OrderDirection = number;

export enum ClientRiskCategory {
  Undefined = 0,
  Knur = 1,
  Ksur = 2,
  Kpur = 3,
}

export type RiskLevel = 'moderate' | 'aggressive' | 'conservative' | undefined;

export enum ModerationStatus {
  Draft = 0,
  ReturnedToModeration = 1,
  ReadyForModeration = 2,
  Approved = 3,
  Rejected = 4,
}
export enum StrategyType {
  Trend = 0,
  MeanReversion = 1,
  Arbitrage = 2,
  News = 3,
}

export enum LifeSpan {
  Undefined = 'Undefined',
  MoreThan3Months = 'MoreThan3Months',
  MoreThan1Year = 'MoreThan1Year',
  MoreThen3Years = 'MoreThen3Years',
}

/** OrderByProperty */
export interface OrderByProperty {
  name: string | null;
  order: OrderDirection;
}

/** ProblemDetails */
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | string | null;
  detail?: string | null;
  instance?: string | null;
}

export interface TradingStrategyStatsDataDto {
  profit7Days?: number;
  profit30Days?: number;
  profit90Days?: number;
  profit180Days?: number;
  profit365Days?: number;
  profitYear?: number;
  profitLifetime?: number;
  annualAverageProfit?: number;
  profitableMonthsShare?: number;
  averageTradeDrawdown?: number;
  profitFactor?: number;
  profitDrawdownRatio?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  followersTotalEquity?: number;
}

export interface TradingStrategyDto {
  id: number | string;
  title?: string;
  description?: string;
  jsonDescription?: string;
  textDescription?: string;
  url?: string;
  minSum?: number | string;
  moneyLimit?: number | string;
  autoFollowingTariffId?: number | string;
  autoFollowingTariffName?: string;
  transactionRate?: string;
  maxDrawDown?: number | string;
  riskLevel?: RiskLevel;
  author?: string;
  authorAvatarUrl?: string | null;
  clientRiskCategory?: ClientRiskCategory;
  isQualRequired: boolean;
  followersCount?: number | string;
  tradeActivityIndex?: number | string;
  moderationStatus?: ModerationStatus;
  type?: StrategyType | null;
  hasVerifiedTrackRecord?: boolean | null;
  isMartingale?: boolean | null;
  tradeCount?: number | string | null;
  conditionalValueAtRisk?: number | string;
  createdAt: string; // date
  updatedAt?: string | null; // date | null
  securityTickers?: string[] | null;
  stats?: TradingStrategyStatsDto;
}

export interface TradingStrategyStatsDto {
  id?: number | string;
  data?: TradingStrategyStatsDataDto;
}

/** --- Параметры для /api/public/v1/strategies? --- */
export interface StrategiesListQuery {
  Ids?: (number | string)[];
  SourceIds?: (number | string)[];
  ProductSource?: ProductSource[];
  AuthorIds?: number | string;
  Title?: string;
  TitleContains?: string;
  'MinSum.From'?: number | string;
  'MinSum.To'?: number | string;
  'MoneyLimit.From'?: number | string;
  'MoneyLimit.To'?: number | string;
  'TransactionRate.From'?: number | string;
  'TransactionRate.To'?: number | string;
  'MaxDrawDown.From'?: number | string;
  'MaxDrawDown.To'?: number | string;
  RiskLevel?: RiskLevel[];
  ClientRiskCategory?: ClientRiskCategory[];
  IsQualRequired?: boolean;
  'FollowersCount.From'?: number | string;
  'FollowersCount.To'?: number | string;
  'TradeActivityIndex.From'?: number | string;
  'TradeActivityIndex.To'?: number | string;
  Type?: StrategyType[];
  HasVerifiedTrackRecord?: boolean;
  IsMartingale?: boolean;
  'TradeCount.From'?: number | string;
  'TradeCount.To'?: number | string;
  'ConditionalValueAtRisk.From'?: number | string;
  'ConditionalValueAtRisk.To'?: number | string;
  'CreatedAt.From'?: string; // date
  'CreatedAt.To'?: string; // date
  LifeSpan?: LifeSpan;
  IncludeArchived?: boolean;
  'Profit7Days.From'?: number | string;
  'Profit7Days.To'?: number | string;
  'Profit30Days.From'?: number | string;
  'Profit30Days.To'?: number | string;
  'Profit90Days.From'?: number | string;
  'Profit90Days.To'?: number | string;
  'Profit180Days.From'?: number | string;
  'Profit180Days.To'?: number | string;
  'Profit365Days.From'?: number | string;
  'Profit365Days.To'?: number | string;
  'ProfitYear.From'?: number | string;
  'ProfitYear.To'?: number | string;
  'ProfitLifetime.From'?: number | string;
  'ProfitLifetime.To'?: number | string;
  'ProfitableMonthsShare.From'?: number | string;
  'ProfitableMonthsShare.To'?: number | string;
  'AverageTradeDrawdown.From'?: number | string;
  'AverageTradeDrawdown.To'?: number | string;
  'ProfitFactor.From'?: number | string;
  'ProfitFactor.To'?: number | string;
  'ProfitDrawdownRatio.From'?: number | string;
  'ProfitDrawdownRatio.To'?: number | string;
  'SharpeRatio.From'?: number | string;
  'SharpeRatio.To'?: number | string;
  'SortinoRatio.From'?: number | string;
  'SortinoRatio.To'?: number | string;
  'FollowersTotalEquity.From'?: number | string;
  'FollowersTotalEquity.To'?: number | string;
  SecurityTickers?: string[];
  Page?: number | string;
  PageSize?: number | string;
  OrderBy?: OrderByProperty[];
}

export interface IProfitPoint {
  date: string;
  value: number;
  rValue: number;
}

/** Ответ на GET /api/public/v1/strategies --- массив стратегий */
export type StrategiesListResponse = TradingStrategyDto[];

/** Ответ на GET /api/public/v1/strategies/{strategyId} --- стратегия */
export type StrategyDetailsResponse = TradingStrategyDto;

/** Ответ на GET /api/public/v1/strategies/{strategyId}/profit-points */
export type StrategyProfitPointsResponse = IProfitPoint[];

/** При ошибке (например, стратегия не найдена) */
export type StrategyNotFoundResponse = ProblemDetails;
