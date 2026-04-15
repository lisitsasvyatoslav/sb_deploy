import BrokerIcon from '@/shared/ui/BrokerIcon';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import React from 'react';

interface BrokerLogoBadgeProps {
  brokerType: string;
}

/**
 * Broker logo with connection status badge.
 *
 * Figma node: 3096:38025
 */
const BrokerLogoBadge: React.FC<BrokerLogoBadgeProps> = ({ brokerType }) => (
  <div className="relative w-[62px] h-[62px]" data-testid="broker-logo-badge">
    <div
      className={cn(
        'w-full h-full bg-white_low border border-stroke-a4',
        'rounded-radius-6 flex items-center justify-center'
      )}
    >
      <BrokerIcon broker={brokerType} size={36} />
    </div>
    <div
      className={cn(
        'absolute bottom-0 right-0 translate-x-[6px] translate-y-[6px]',
        'w-spacing-24 h-spacing-24 bg-background-white_low backdrop-blur-extra',
        'rounded-radius-6 flex items-center justify-center'
      )}
    >
      <Icon
        variant="textLink"
        size={16}
        className="text-texticon-black_inverse_a100"
      />
    </div>
  </div>
);

export default BrokerLogoBadge;
