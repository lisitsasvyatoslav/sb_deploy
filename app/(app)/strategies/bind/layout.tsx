'use client';

import type { ReactNode } from 'react';
import { StrategyBindingFeatureGate } from '@/features/strategy-binding/components/StrategyBindingFeatureGate';

export default function StrategiesBindLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StrategyBindingFeatureGate>{children}</StrategyBindingFeatureGate>;
}
