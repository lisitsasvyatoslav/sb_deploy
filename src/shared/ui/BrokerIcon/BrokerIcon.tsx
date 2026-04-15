import React from 'react';
import BaseImage from '@/shared/ui/BaseImage';

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

interface BrokerIconProps {
  broker: string;
  size?: number;
  alt?: string;
}

const BROKER_ICONS: Record<string, string> = {
  finam: '/icons/brokers/finam.svg',
  't-invest': '/icons/brokers/tinkoff.svg',
  snaptrade: '/icons/brokers/snaptrade.svg',
  bybit: '/icons/brokers/bybit.svg',
  kucoin: '/icons/brokers/kucoin.svg',
  demo: '/icons/brokers/demo.svg',
};

const BrokerIcon: React.FC<BrokerIconProps> = ({ broker, size = 32, alt }) => {
  const iconSrc = BROKER_ICONS[broker];
  const altText = alt || broker.charAt(0).toUpperCase() + broker.slice(1);

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <BaseImage
        src={iconSrc}
        alt={altText}
        width={size}
        height={size}
        optimized
        fallback={
          <span className="text-xs font-medium text-black-a64">
            {broker.charAt(0).toUpperCase()}
          </span>
        }
        className="w-full h-full rounded-full"
      />
    </div>
  );
};

export default BrokerIcon;
