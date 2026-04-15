'use client';
import { useChatStore } from '@/stores/chatStore';
import { StrategyCard } from './StrategyCard';

interface StrategiesListProps {
  strategiesIds: string[];
}

export const StrategiesList = ({ strategiesIds }: StrategiesListProps) => {
  const { openSidebar } = useChatStore();
  const onDiscuss = () => {
    openSidebar();
    // todo добавить реализацию
  };
  return (
    <div
      className="
        flex
        gap-5
        flex-col
        items-center
      "
    >
      {strategiesIds.map((strategyId) => (
        <StrategyCard
          key={strategyId}
          strategyId={strategyId}
          onDiscuss={onDiscuss}
        />
      ))}
    </div>
  );
};
