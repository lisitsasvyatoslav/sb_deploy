import TrendCaretNegative from './assets/trendCaretNegative.svg';
import TrendCaretPositive from './assets/trendCaretPositive.svg';

interface TrendCaretProps {
  direction: 'up' | 'down';
  className?: string;
}

/**
 * TrendCaret — directional caret indicating positive/negative trend
 *
 * Figma node: 61027:40851 (trendCaret component set)
 *
 * Variants:
 *   trend=positive → triangle pointing up,  8×8px, fill #11C516
 *   trend=negative → triangle pointing down, 8×8px, fill #F25555
 */
const TrendCaret: React.FC<TrendCaretProps> = ({ direction, className }) => {
  const Svg = direction === 'up' ? TrendCaretPositive : TrendCaretNegative;
  return <Svg width={8} height={8} className={className} aria-hidden />;
};

export default TrendCaret;
