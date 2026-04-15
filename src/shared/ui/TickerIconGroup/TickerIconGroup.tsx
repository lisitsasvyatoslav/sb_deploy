import TickerIcon from '@/shared/ui/TickerIcon';
import type { BoardTicker } from '@/types';
import React from 'react';

interface TickerIconGroupProps {
  tickers: BoardTicker[];
  size?: number;
  overlap?: number;
  maxVisible?: number;
  className?: string;
}

const TickerIconGroup: React.FC<TickerIconGroupProps> = ({
  tickers,
  size = 20,
  overlap = -2,
  maxVisible = 5,
  className = '',
}) => {
  if (!tickers || tickers.length === 0) return null;

  const visible = tickers.slice(0, maxVisible);

  return (
    <div className={`flex items-center pr-[2px] ${className}`}>
      {visible.map((ticker, index) => (
        <div
          key={ticker.symbol}
          style={{ marginRight: index < visible.length - 1 ? overlap : 0 }}
          className="shrink-0"
        >
          <TickerIcon
            symbol={ticker.symbol}
            securityId={ticker.securityId}
            size={size}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(TickerIconGroup);
