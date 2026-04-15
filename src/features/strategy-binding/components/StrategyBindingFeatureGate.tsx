'use client';

import type { ReactNode } from 'react';
import { useDevStrategyCatalog } from '@/shared/hooks/useDevStrategyCatalog';

type Props = { children: ReactNode };

export function StrategyBindingFeatureGate({ children }: Props) {
  const enabled = useDevStrategyCatalog();
  if (!enabled) return null;
  return <>{children}</>;
}
