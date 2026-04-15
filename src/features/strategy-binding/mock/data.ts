import type { TradingStrategyDto } from '@/types/StrategiesCatalog';
import type {
  StrategyBinding,
  StrategyBindingWithDetails,
} from '@/types/strategyBinding';

// TODO [MOCK]: Remove after backend implementation (TD-983, TD-985).
// Strategies will come from comon.ru; bindings from GET /api/strategies/binding/list.

const MOCK_AVATAR_URL = '/images/mocks/avatarStrategy.png';

export const MOCK_COMON_STRATEGIES: TradingStrategyDto[] = [
  {
    id: 1,
    title: 'Bonds money',
    author: 'Mark Denisov',
    authorAvatarUrl: MOCK_AVATAR_URL,
    riskLevel: 'conservative',
    stats: { data: { annualAverageProfit: 17.5 } },
    followersCount: 938,
    minSum: 50000,
    createdAt: '2024-01-15',
    isQualRequired: false,
  },
  {
    id: 2,
    title: 'Alenka Capital Growth',
    author: 'Elena Alyonkina',
    authorAvatarUrl: MOCK_AVATAR_URL,
    riskLevel: 'moderate',
    stats: { data: { annualAverageProfit: 32.4 } },
    followersCount: 1240,
    minSum: 100000,
    createdAt: '2023-06-01',
    isQualRequired: false,
  },
  {
    id: 3,
    title: 'Dollar Barrel',
    author: 'Sergey Tradov',
    authorAvatarUrl: MOCK_AVATAR_URL,
    riskLevel: 'aggressive',
    stats: { data: { annualAverageProfit: 45.2 } },
    followersCount: 567,
    minSum: 200000,
    createdAt: '2024-03-10',
    isQualRequired: true,
  },
  {
    id: 4,
    title: 'RF Dividends',
    author: 'Alexey Dividendov',
    authorAvatarUrl: MOCK_AVATAR_URL,
    riskLevel: 'conservative',
    stats: { data: { annualAverageProfit: 12.8 } },
    followersCount: 2100,
    minSum: 30000,
    createdAt: '2022-09-20',
    isQualRequired: false,
  },
];

// TODO [MOCK]: Bindings are stored in localStorage because mock-comon uses window.location.href
// (OAuth redirect simulation), which resets JS module state on full page reload.
// After backend implementation this file is removed entirely.
const STORAGE_KEY = 'mock-strategy-bindings';

const loadBindings = (): StrategyBinding[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveBindings = (bindings: StrategyBinding[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
};

export const getMockBindings = (): StrategyBinding[] => loadBindings();

export const addMockBindings = (strategyIds: string[]): StrategyBinding[] => {
  const current = loadBindings();
  const newBindings = strategyIds
    .filter((id) => !current.some((b) => b.externalStrategyId === id))
    .map((id, index) => ({
      id: current.length + index + 1,
      externalStrategyId: id,
      comonUserId: 'mock-comon-user-123',
      source: 'comon',
      boundAt: new Date().toISOString(),
    }));
  const updated = [...current, ...newBindings];
  saveBindings(updated);
  return updated;
};

export const getMockBindingsWithDetails = (): StrategyBindingWithDetails[] => {
  return loadBindings().map((binding) => ({
    ...binding,
    strategy: MOCK_COMON_STRATEGIES.find(
      (s) => String(s.id) === binding.externalStrategyId
    ),
  }));
};
