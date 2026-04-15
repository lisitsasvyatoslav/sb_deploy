import { getTickerFromSymbol } from '@/shared/utils/ticker';
import { getTickerIconUrl } from '@/shared/config/environment';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';

interface TickerIconProps {
  symbol: string;
  securityId?: number;
  iconUrl?: string;
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Generates a consistent color based on ticker symbol hash
 * Exported for use in other components that need ticker-based coloring
 */
export const getTickerColor = (symbol: string): string => {
  const colors = [
    '#3B82F6' /* palette-color: from tokens — blue.500 */,
    '#8B5CF6' /* palette-color: from tokens — purple.500 */,
    '#EC4899' /* palette-color: from tokens — pink.500 */,
    '#F59E0B' /* palette-color: from tokens — amber.500 */,
    '#10B981' /* palette-color: from tokens — green.500 */,
    '#06B6D4' /* palette-color: from tokens — cyan.500 */,
    '#6366F1' /* palette-color: from tokens — indigo.500 */,
    '#EF4444' /* palette-color: from tokens — red.500 */,
  ];

  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const TickerIcon: React.FC<TickerIconProps> = ({
  symbol,
  securityId,
  iconUrl,
  size = 24,
  className = '',
  alt,
}) => {
  const [imageError, setImageError] = useState(false);
  const ticker = getTickerFromSymbol(symbol);
  const initials = ticker.slice(0, 2).toUpperCase();
  const backgroundColor = getTickerColor(symbol);

  const handleError = useCallback(() => setImageError(true), []);

  // Resolve image source: iconUrl > securityId > fallback
  const imageSrc =
    iconUrl || (securityId ? getTickerIconUrl(securityId) : null);
  const showFallback = !imageSrc || imageError;

  if (showFallback) {
    return (
      <div
        className={`rounded-full flex items-center justify-center shrink-0 ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          maxWidth: `${size}px`,
          maxHeight: `${size}px`,
          backgroundColor,
        }}
        title={alt || symbol}
      >
        <span
          className="font-semibold text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt || ticker.toUpperCase()}
      className={`rounded-full shrink-0 block ${className}`}
      style={{
        objectFit: 'cover',
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
      }}
      width={size}
      height={size}
      sizes={`${size}px`}
      title={alt || symbol}
      onError={handleError}
    />
  );
};

export default React.memo(TickerIcon);
