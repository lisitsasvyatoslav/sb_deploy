'use client';

import type { ReactNode } from 'react';
import { StrategyBindingFeatureGate } from '@/features/strategy-binding/components/StrategyBindingFeatureGate';

export default function StrategiesBoundLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StrategyBindingFeatureGate>{children}</StrategyBindingFeatureGate>;
}
