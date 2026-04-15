import type { TradingStrategyDto } from '@/types/StrategiesCatalog';

export interface MockStrategyWithMatch extends TradingStrategyDto {
  matchLabel: string;
}

// TODO [MOCK]: Заменить мок-стратегии на реальные данные из API.
// После интеграции стратегии должны приходить с бэкенда на шаге 6 (results),
// подобранные на основе ответов пользователя в предыдущих шагах опроса.
const MOCK_AVATAR_URL = '/images/mocks/avatarStrategy.png';

export const MOCK_RECOMMENDED_STRATEGIES: MockStrategyWithMatch[] = [
  {
    id: 1,
    title: 'Bonds money',
    followersCount: 938,
    maxDrawDown: 15,
    minSum: 500000,
    riskLevel: 'conservative',
    stats: { data: { annualAverageProfit: 17 } },
    createdAt: '2024-01-01',
    isQualRequired: false,
    hasVerifiedTrackRecord: true,
    isMartingale: false,
    matchLabel: '70% совпадений',
    author: 'Автор стратегии',
    authorAvatarUrl: MOCK_AVATAR_URL,
  },
  {
    id: 2,
    title: 'Alenka Capital Bonds money',
    followersCount: 938,
    maxDrawDown: 15,
    minSum: 500000,
    riskLevel: 'moderate',
    stats: { data: { annualAverageProfit: 32 } },
    createdAt: '2024-01-01',
    isQualRequired: false,
    hasVerifiedTrackRecord: true,
    isMartingale: false,
    matchLabel: '30%-70% совпадений',
    author: 'Автор стратегии',
    authorAvatarUrl: MOCK_AVATAR_URL,
  },
  {
    id: 3,
    title: 'Бочка доллар',
    followersCount: 938,
    maxDrawDown: 15,
    minSum: 500000,
    riskLevel: 'aggressive',
    stats: { data: { annualAverageProfit: 24 } },
    createdAt: '2024-01-01',
    isQualRequired: false,
    hasVerifiedTrackRecord: true,
    isMartingale: false,
    matchLabel: 'до 30% совпадений',
    author: 'Автор стратегии',
    authorAvatarUrl: MOCK_AVATAR_URL,
  },
];
