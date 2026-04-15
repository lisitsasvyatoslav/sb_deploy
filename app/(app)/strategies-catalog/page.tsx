'use client';
import { AiStrategyBlock } from '@/features/strategies-catalog/components/AiStrategyBlock';
import StrategiesCatalogPage from '@/views/StrategiesCatalogPage';
import { useSearchParams } from 'next/navigation';

export default function StrategiesCatalog() {
  const searchParams = useSearchParams();
  const strategyIds = searchParams.getAll('strategyId');
  const hasStrategyId = strategyIds.length > 0;

  return hasStrategyId ? (
    <StrategiesCatalogPage strategiesIds={strategyIds} />
  ) : (
    <AiStrategyBlock />
  );
}
