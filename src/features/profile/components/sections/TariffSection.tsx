'use client';

import React from 'react';
import TariffPlanCard from './TariffPlanCard';

import PremiumIcon from './assets/premium.svg';
import ProIcon from './assets/pro.svg';

interface TariffPlan {
  id: 'basic' | 'pro' | 'premium';
  price: number;
  recommended?: boolean;
  active?: boolean;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

const PLAN_CONFIGS: TariffPlan[] = [
  { id: 'basic', price: 2000, active: true },
  { id: 'pro', price: 5000, recommended: true, icon: ProIcon },
  { id: 'premium', price: 10000, icon: PremiumIcon },
];

const FEATURE_KEYS = [
  'unlimitedDataSources',
  'advancedAiAnalysis',
  'customizableDashboards',
  'securityCompliance',
] as const;

const TariffSection: React.FC = () => {
  return (
    <div className="flex flex-col max-w-[800px]">
      <div className="flex gap-spacing-16 flex-wrap">
        {PLAN_CONFIGS.map((plan) => (
          <TariffPlanCard
            key={plan.id}
            id={plan.id}
            price={plan.price}
            recommended={plan.recommended}
            active={plan.active}
            featureKeys={FEATURE_KEYS}
            icon={plan.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default TariffSection;
