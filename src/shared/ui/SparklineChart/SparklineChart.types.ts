export type SparklineChartVariant = 'positive' | 'negative' | 'skeleton';

export interface SparklineChartProps {
  /** Price data points to plot */
  data?: number[];
  /**
   * Color variant. If omitted, derived automatically:
   * last value >= first value → 'positive', otherwise → 'negative'.
   * Falls back to 'skeleton' when data is missing or has fewer than 2 points.
   */
  variant?: SparklineChartVariant;
  /** Show horizontal open-price reference line. Default: true */
  showOpenLine?: boolean;
  /** Fade left edge with gradient mask. Default: false */
  fadeLeft?: boolean;
  /** Chart width in px. Default: 120 */
  width?: number;
  /** Chart height in px. Default: 32 */
  height?: number;
  className?: string;
  'data-testid'?: string;
}

export interface SkeletonChartProps {
  width: number;
  height: number;
  gradientId: string;
  lineColor: string;
  shadeColorFrom: string;
  shadeColorTo: string;
  maskStyle: React.CSSProperties | undefined;
  className?: string;
  dataTestId?: string;
}
