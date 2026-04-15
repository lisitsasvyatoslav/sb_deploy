import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ArrowUpward,
  ArrowDownward,
  Autorenew,
  SignalCellularAlt,
  CallMade,
  UTurnLeft,
  UTurnRight,
} from '@mui/icons-material';

const CLS = 'text-[var(--text-primary)] opacity-80 shrink-0';

/**
 * Icon for the overall trend class.
 * Uses includes() for robustness with compound values from the backend.
 */
export const getTrendIcon = (trendClass?: string): React.ReactNode => {
  if (!trendClass) return null;
  const s = trendClass.toLowerCase();

  if (s.includes('turning_up'))
    return <Autorenew sx={{ fontSize: 20 }} className={CLS} />;
  if (s.includes('turning_down'))
    return <TrendingDown sx={{ fontSize: 20 }} className={CLS} />;
  if (s.includes('uptrend') || s.includes('linear_up'))
    return <TrendingUp sx={{ fontSize: 20 }} className={CLS} />;
  if (s.includes('downtrend') || s.includes('linear_down'))
    return <TrendingDown sx={{ fontSize: 20 }} className={CLS} />;
  return <TrendingFlat sx={{ fontSize: 20 }} className={CLS} />;
};

/**
 * Icon for trend power rows.
 */
export const getTrendPowerIcon = (trendPower?: string): React.ReactNode => {
  if (!trendPower) return null;
  const s = trendPower.toLowerCase();

  if (s.includes('strong'))
    return <SignalCellularAlt sx={{ fontSize: 20 }} className={CLS} />;
  return <CallMade sx={{ fontSize: 20 }} className={CLS} />;
};

/**
 * Icon for indicator signal values.
 * Maps signal strings (snake_case from backend) to directional icons.
 */
export const getSignalIcon = (signal?: string | null): React.ReactNode => {
  if (!signal) return null;
  const s = signal.toLowerCase();

  // Reversal signals → turning arrows
  if (s.includes('bullish_reversal'))
    return (
      <UTurnLeft
        sx={{ fontSize: 20, transform: 'rotate(90deg)' }}
        className={CLS}
      />
    );
  if (s.includes('bearish_reversal'))
    return (
      <UTurnRight
        sx={{ fontSize: 20, transform: 'rotate(-90deg)' }}
        className={CLS}
      />
    );

  // General bullish / bearish
  if (s.includes('bullish') || s.includes('uptrend') || s.includes('buy'))
    return <TrendingUp sx={{ fontSize: 20 }} className={CLS} />;
  if (s.includes('bearish') || s.includes('downtrend') || s.includes('sell'))
    return <TrendingDown sx={{ fontSize: 20 }} className={CLS} />;

  // Overbought / oversold
  if (s.includes('overbought'))
    return <ArrowUpward sx={{ fontSize: 20 }} className={CLS} />;
  if (s.includes('oversold'))
    return <ArrowDownward sx={{ fontSize: 20 }} className={CLS} />;

  // Speed indicators
  if (s.includes('strong'))
    return <SignalCellularAlt sx={{ fontSize: 20 }} className={CLS} />;
  if (s.includes('fast') || s.includes('slow') || s.includes('moderate'))
    return <CallMade sx={{ fontSize: 20 }} className={CLS} />;

  // Neutral / sideways
  if (s.includes('neutral') || s.includes('sideways'))
    return <TrendingFlat sx={{ fontSize: 20 }} className={CLS} />;

  return null;
};
