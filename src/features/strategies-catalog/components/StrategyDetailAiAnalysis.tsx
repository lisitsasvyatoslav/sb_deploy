import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/client';

// TODO [MOCK] — aiAnalysis будет генерироваться LLM на бэкенде
const MOCK_AI_ANALYSIS =
  'Стратегия показывает лучшую устойчивость к падениям рынка благодаря хеджированию через фьючерсы. Ваш портфель имеет большую корреляцию с индексом.';

const StrategyDetailAiAnalysis: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="rounded-lg bg-[linear-gradient(135deg,rgba(139,92,246,0.15),rgba(139,92,246,0.05))] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-accent">
          {t('strategiesCatalog.detail.aiAnalysisTitle')}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-text-secondary">
        {MOCK_AI_ANALYSIS}
      </p>
    </div>
  );
};

export default StrategyDetailAiAnalysis;
