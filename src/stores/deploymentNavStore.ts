import { create } from 'zustand';

interface DeploymentNavState {
  indices: Record<number, number>;
  deploying: Record<number, boolean>;
  setIndex: (strategyId: number, index: number) => void;
  setDeploying: (strategyId: number, active: boolean) => void;
}

export const useDeploymentNavStore = create<DeploymentNavState>((set) => ({
  indices: {},
  deploying: {},
  setIndex: (strategyId, index) =>
    set((state) => ({
      indices: { ...state.indices, [strategyId]: index },
    })),
  setDeploying: (strategyId, active) =>
    set((state) => ({
      deploying: { ...state.deploying, [strategyId]: active },
    })),
}));
