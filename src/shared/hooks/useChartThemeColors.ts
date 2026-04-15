import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { resolveThemeColors } from '@/shared/utils/resolveThemeColor';

const CHART_COLOR_VARS = {
  tooltipBg: '--surfacemedium-surfacemedium',
  tooltipText: '--blackinverse-a100',
  tooltipBorder: '--blackinverse-a12',
  axisText: '--blackinverse-a56',
  axisEmphasis: '--blackinverse-a88',
  positive: '--status-success',
  negative: '--status-negative',
  neutral: '--blackinverse-a32',
} as const;

const SPARKLINE_COLOR_VARS = {
  positive: '--status-success',
  positiveFill: '--base-accent_accentsuccessa8',
  negative: '--status-negative',
  negativeFill: '--base-accent_accentdangera8',
  neutral: '--blackinverse-a32',
  neutralFill: '--blackinverse-a8',
  cursor: '--blackinverse-a56',
} as const;

/**
 * Resolves CSS variables for Chart.js after the DOM theme attribute is updated.
 * next-themes updates the DOM in useEffect, so useMemo during render reads STALE values.
 * We defer to requestAnimationFrame to guarantee CSS variables reflect the current theme.
 */
export function useChartThemeColors() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState(() =>
    resolveThemeColors(CHART_COLOR_VARS)
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setColors(resolveThemeColors(CHART_COLOR_VARS));
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  return colors;
}

export function useSparklineThemeColors() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState(() =>
    resolveThemeColors(SPARKLINE_COLOR_VARS)
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setColors(resolveThemeColors(SPARKLINE_COLOR_VARS));
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedTheme]);

  return colors;
}
