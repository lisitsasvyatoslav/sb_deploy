import React, { useCallback } from 'react';
import { useDeploymentsQuery } from '@/features/strategy/queries';
import { useDeploymentNavStore } from '@/stores/deploymentNavStore';
import { DeploymentNavigator } from './DeploymentNavigator';

interface TradingIdeaDeploymentNavProps {
  strategyId: number | undefined;
}

/**
 * TradingIdeaDeploymentNav — deployment navigator for Trading Ideas cards.
 * Renders only the navigator (prev/next arrows), intended for use as
 * rightContent in CardControls.
 */
export const TradingIdeaDeploymentNav: React.FC<
  TradingIdeaDeploymentNavProps
> = ({ strategyId }) => {
  const { data: deployments = [] } = useDeploymentsQuery(strategyId);
  const currentIndex = useDeploymentNavStore((s) =>
    strategyId != null ? (s.indices[strategyId] ?? -1) : -1
  );
  const setIndex = useDeploymentNavStore((s) => s.setIndex);

  const handlePrev = useCallback(() => {
    if (strategyId == null) return;
    setIndex(strategyId, Math.max(0, currentIndex - 1));
  }, [strategyId, currentIndex, setIndex]);

  const handleNext = useCallback(() => {
    if (strategyId == null) return;
    setIndex(strategyId, Math.min(deployments.length - 1, currentIndex + 1));
  }, [strategyId, currentIndex, deployments.length, setIndex]);

  if (deployments.length === 0 || currentIndex < 0) return null;

  return (
    <div className="nodrag">
      <DeploymentNavigator
        deployments={deployments}
        currentIndex={currentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
};
