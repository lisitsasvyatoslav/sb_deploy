import { logger } from '@/shared/utils/logger';

/**
 * API Service - модульная архитектура с TanStack Query
 *
 * Всё в одной директории services/api/:
 * - client.ts - axios instance и interceptors
 * - auth.ts, boards.ts, cards.ts, etc. - модули по доменам
 * - index.ts - главный экспорт (этот файл)
 */

// Импортируем все API модули
import { analysisApi } from '@/services/api/analysis';
import { authApi } from '@/services/api/auth';
import { boardApi } from '@/services/api/boards';
import { cardsApi } from '@/services/api/cards';
import { chatApi } from '@/services/api/chat';
import { edgeApi } from '@/services/api/edges';
import { filesApi } from '@/services/api/files';
import { signalApi } from '@/services/api/signals';
import { sparkleApi } from '@/services/api/sparkle';
import { statisticsApi } from '@/services/api/statistics';
import { strategyApi } from '@/services/api/strategies';
import { strategyBindingApi } from '@/services/api/strategyBinding';
import { deploymentApi } from '@/services/api/deployments';

// Экспортируем client
export {
  API_BASE_URL_EXPORT as API_BASE_URL,
  apiClient,
  authTokens,
  currentBoard,
  ensureBoardInitialized,
} from '@/services/api/client';

// Реэкспортируем все модули по отдельности
export {
  analysisApi,
  authApi,
  boardApi,
  cardsApi,
  chatApi,
  deploymentApi,
  edgeApi,
  strategyBindingApi,
  filesApi,
  signalApi,
  sparkleApi,
  statisticsApi,
  strategyApi,
};

// Backward compatibility: объединенный api объект (как было раньше).
// strategyBinding — отдельное свойство, не spread (избегаем init/list на корне).
export const api = {
  ...authApi,
  ...boardApi,
  ...cardsApi,
  ...filesApi,
  ...edgeApi,
  ...chatApi,
  ...statisticsApi,
  ...analysisApi,
  ...signalApi,
  ...sparkleApi,
  ...strategyApi,
  strategyBinding: strategyBindingApi,
  ...deploymentApi,
};

// Backward compatibility: auth функции
export const auth = authApi;

// Backward compatibility: старые функции
export const setAuthCredentials = async (
  username: string,
  password: string
) => {
  try {
    await authApi.login(username, password);
  } catch (e) {
    logger.error('auth', 'Login failed', e);
    throw e;
  }
};

export const clearAuthCredentials = () => {
  authApi.logout().catch(() => undefined);
};

export const restoreAuthCredentials = () => {
  const email = localStorage.getItem('current_user_email');
  const access = localStorage.getItem('access_token');
  if (email && access) {
    return { username: email, password: '' };
  }
  return null;
};

// Экспортируем formatters
export {
  formatCurrency,
  formatDate,
  formatPercent,
} from '@/shared/utils/formatters';
