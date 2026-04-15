import type { TranslateFn } from '@/shared/i18n/settings';

/**
 * Maps backend indicator names to i18n translation keys.
 * Backend sends English names; this maps them to ticker:techAnalysis.indicators.* keys.
 * Indicators without a mapping (EMA-100, RSI, MACD, ATR, ADX, CCI, SMA-*) display as-is.
 */
const indicatorNameKeyMap: Record<string, string> = {
  'Last Price': 'techAnalysis.indicators.lastPrice',
  Price: 'techAnalysis.indicators.price',
  'Price Change': 'techAnalysis.indicators.priceChange',
  'Average Price': 'techAnalysis.indicators.averagePrice',
  Volume: 'techAnalysis.indicators.volume',
  // Stochastic intentionally omitted — should stay in English per UX spec
  'Bollinger Bands': 'techAnalysis.indicators.bollingerBands',
};

/**
 * Maps backend description values to i18n translation keys.
 * Handles multiple casing variants (Title Case, snake_case, sentence case).
 */
const descriptionKeyMap: Record<string, string> = {
  // Sentence case (from API)
  'Current price': 'techAnalysis.descriptions.currentPrice',
  'Bullish reversal': 'techAnalysis.descriptions.bullishReversal',
  'Bearish reversal': 'techAnalysis.descriptions.bearishReversal',
  'Bullish weakening': 'techAnalysis.descriptions.bullishWeakening',
  'Bearish weakening': 'techAnalysis.descriptions.bearishWeakening',
  'Bullish momentum': 'techAnalysis.descriptions.bullishMomentum',
  'Bearish momentum': 'techAnalysis.descriptions.bearishMomentum',
  'Neutral zone': 'techAnalysis.descriptions.neutralZone',
  'Overbought zone': 'techAnalysis.descriptions.overboughtZone',
  'Oversold zone': 'techAnalysis.descriptions.oversoldZone',
  'Oversold approaching': 'techAnalysis.descriptions.oversoldApproaching',
  'Strong bullish': 'techAnalysis.descriptions.strongBullish',
  'Strong bearish': 'techAnalysis.descriptions.strongBearish',
  'Strong momentum': 'techAnalysis.descriptions.strongMomentum',
  Neutral: 'techAnalysis.descriptions.neutral',
  'Change over 100 candles': 'techAnalysis.descriptions.changeOver100',
  'Simple moving average': 'techAnalysis.descriptions.simpleMovingAvg',
  'Last volume vs average': 'techAnalysis.descriptions.lastVolumeVsAvg',

  // snake_case (from parquet data)
  bullish_reversal: 'techAnalysis.descriptions.bullishReversal',
  bullish_recovery: 'techAnalysis.descriptions.bullishRecovery',
  bullish: 'techAnalysis.descriptions.bullish',
  bullish_weakening: 'techAnalysis.descriptions.bullishWeakening',
  bearish_reversal: 'techAnalysis.descriptions.bearishReversal',
  bearish: 'techAnalysis.descriptions.bearish',
  bearish_weakening: 'techAnalysis.descriptions.bearishWeakening',
  neutral: 'techAnalysis.descriptions.neutral',
  overbought: 'techAnalysis.descriptions.overbought',
  oversold: 'techAnalysis.descriptions.oversold',

  // Title Case variants
  'Bullish Reversal': 'techAnalysis.descriptions.bullishReversal',
  'Bullish Recovery': 'techAnalysis.descriptions.bullishRecovery',
  Bullish: 'techAnalysis.descriptions.bullish',
  'Bearish Reversal': 'techAnalysis.descriptions.bearishReversal',
  Bearish: 'techAnalysis.descriptions.bearish',
  Overbought: 'techAnalysis.descriptions.overbought',
  Oversold: 'techAnalysis.descriptions.oversold',
};

const trendClassKeyMap: Record<string, string> = {
  turning_up: 'techAnalysis.trendClasses.turningUp',
  turning_down: 'techAnalysis.trendClasses.turningDown',
  sideways: 'techAnalysis.trendClasses.sideways',
  uptrend: 'techAnalysis.trendClasses.uptrend',
  downtrend: 'techAnalysis.trendClasses.downtrend',
  linear_up: 'techAnalysis.trendClasses.linearUp',
  linear_down: 'techAnalysis.trendClasses.linearDown',
};

const trendPowerKeyMap: Record<string, string> = {
  fast: 'techAnalysis.trendPowers.fast',
  slow: 'techAnalysis.trendPowers.slow',
  moderate: 'techAnalysis.trendPowers.moderate',
  strong: 'techAnalysis.trendPowers.strong',
  weak: 'techAnalysis.trendPowers.weak',
};

const patternKeyMap: Record<string, string> = {
  bullish_flag: 'techAnalysis.patterns.bullishFlag',
  bearish_flag: 'techAnalysis.patterns.bearishFlag',
  ascending_triangle: 'techAnalysis.patterns.ascendingTriangle',
  descending_triangle: 'techAnalysis.patterns.descendingTriangle',
  symmetrical_triangle: 'techAnalysis.patterns.symmetricalTriangle',
  head_and_shoulders: 'techAnalysis.patterns.headAndShoulders',
  inverse_head_and_shoulders: 'techAnalysis.patterns.inverseHeadAndShoulders',
  double_top: 'techAnalysis.patterns.doubleTop',
  double_bottom: 'techAnalysis.patterns.doubleBottom',
  triple_top: 'techAnalysis.patterns.tripleTop',
  triple_bottom: 'techAnalysis.patterns.tripleBottom',
  rising_wedge: 'techAnalysis.patterns.risingWedge',
  falling_wedge: 'techAnalysis.patterns.fallingWedge',
  ascending_broadening_wedge: 'techAnalysis.patterns.ascendingBroadeningWedge',
  descending_broadening_wedge:
    'techAnalysis.patterns.descendingBroadeningWedge',
  ascending_broadering_wedge: 'techAnalysis.patterns.ascendingBroadeningWedge',
  descending_broadering_wedge:
    'techAnalysis.patterns.descendingBroadeningWedge',
  cup_and_handle: 'techAnalysis.patterns.cupAndHandle',
  rounding_bottom: 'techAnalysis.patterns.roundingBottom',
  rounding_top: 'techAnalysis.patterns.roundingTop',
};

export const translateIndicatorName = (
  t: TranslateFn,
  name: string
): string => {
  const key = indicatorNameKeyMap[name];
  return key ? t(key) : name;
};

export const translateDescription = (
  t: TranslateFn,
  description: string
): string => {
  const key = descriptionKeyMap[description];
  return key ? t(key) : description;
};

export const translateTrendClass = (
  t: TranslateFn,
  trendClass?: string
): string => {
  if (!trendClass) return t('techAnalysis.undefined');
  const key = trendClassKeyMap[trendClass];
  return key
    ? t(key)
    : trendClass.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const translateTrendPower = (
  t: TranslateFn,
  trendPower?: string
): string => {
  if (!trendPower) return '';
  const key = trendPowerKeyMap[trendPower];
  return key ? t(key) : trendPower;
};

export const translatePattern = (t: TranslateFn, pattern?: string): string => {
  if (!pattern) return '';
  const key = patternKeyMap[pattern];
  return key
    ? t(key)
    : pattern.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
