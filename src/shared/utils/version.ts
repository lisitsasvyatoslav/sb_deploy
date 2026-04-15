// Утилита для работы с версиями

import { logger } from '@/shared/utils/logger';

export interface VersionInfo {
  version: string;
  release_name: string;
  release_date: string;
  description: string;
  features: string[];
  bugfixes: string[];
  technical_improvements: string[];
  breaking_changes: string[];
  deprecated: string[];
  authors: string[];
  repository: string;
}

// Загрузка версии из локального файла (для development)
export const loadLocalVersion = (): VersionInfo => {
  try {
    // В production это будет заменено на данные с сервера
    return {
      version: '0.8.0',
      release_name: 'OAuth 2.0, JWT Bearer и Postgres',
      release_date: '2025-10-03',
      description:
        'JWT Bearer с refresh, OAuth Plan B, Postgres миграции, фронт на Bearer',
      features: [
        'Интерактивная карточка результата стратегии',
        'Упрощенная навигация с интеграцией функций',
        'Постоянная карточка промта на доске',
        'Поддержка множественных LLM провайдеров',
        'Изменяемые размеры карточек с сохранением',
        'Исправление взаимодействия с ReactFlow',
      ],
      bugfixes: [
        'Карточки больше не исчезают после создания',
        'Исправлена интерактивность LLM селектора',
        'Убрана перезагрузка доски при изменении размеров',
        'Исправлено дублирование контекста в промте',
      ],
      technical_improvements: [
        'Оптимизация состояния компонентов',
        'Улучшенная обработка ошибок',
        'Подробное логирование процессов',
        'Graceful fallback для LLM провайдеров',
      ],
      breaking_changes: [],
      deprecated: [],
      authors: ['Trading Diary Team'],
      repository: 'https://github.com/your-repo/trading-diary',
    };
  } catch (error) {
    logger.warn('version', 'Failed to load local version', error);
    return {
      version: 'unknown',
      release_name: 'Unknown Release',
      release_date: 'unknown',
      description: 'Версия не определена',
      features: [],
      bugfixes: [],
      technical_improvements: [],
      breaking_changes: [],
      deprecated: [],
      authors: [],
      repository: '',
    };
  }
};

// Загрузка версии с сервера
export const loadServerVersion = async (): Promise<VersionInfo> => {
  try {
    const { api } = await import('@/services/api');
    return await api.getVersion();
  } catch (error) {
    logger.warn('version', 'Failed to load server version', error);
    return loadLocalVersion();
  }
};

// Вывод информации о версии в консоль
export const logVersionInfo = (versionInfo: VersionInfo) => {
  console.log('='.repeat(60));
  console.log(`🚀 Trading Diary Frontend v${versionInfo.version}`);
  console.log(
    `📅 Release: ${versionInfo.release_name} (${versionInfo.release_date})`
  );
  console.log(`📝 Description: ${versionInfo.description}`);
  console.log('='.repeat(60));

  if (versionInfo.features.length > 0) {
    console.log('✨ Features:');
    versionInfo.features.forEach((feature) => console.log(`  • ${feature}`));
  }

  if (versionInfo.bugfixes.length > 0) {
    console.log('🐛 Bugfixes:');
    versionInfo.bugfixes.forEach((bugfix) => console.log(`  • ${bugfix}`));
  }

  if (versionInfo.technical_improvements.length > 0) {
    console.log('🔧 Technical Improvements:');
    versionInfo.technical_improvements.forEach((improvement) =>
      console.log(`  • ${improvement}`)
    );
  }

  console.log('='.repeat(60));
};
