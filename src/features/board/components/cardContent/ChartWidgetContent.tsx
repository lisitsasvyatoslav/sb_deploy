import React from 'react';
import * as Sentry from '@sentry/react';
import { Card } from '@/types';
import { useTranslation } from '@/shared/i18n/client';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useChartWidget } from '@/features/board/hooks/useChartWidget';
import type { ChartErrorCode } from '@/services/chartWidgetController';

const CHART_ERROR_I18N: Record<ChartErrorCode, string> = {
  load_timeout: 'chart.loadTimeout',
  auth_error: 'chart.finamAuthError',
  load_failed: 'chart.loadFailed',
};

interface ChartWidgetContentProps {
  card: Card;
}

const ChartWidgetContentInner: React.FC<ChartWidgetContentProps> = ({
  card,
}) => {
  const { t } = useTranslation('common');
  const containerId = `chart-widget-${card.id}`;
  const { containerRef, loading, mounted, error } = useChartWidget({
    card,
    containerId,
  });

  if (error) {
    const i18nKey = CHART_ERROR_I18N[error.code];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = t(i18nKey as any, {
      message: error.detail || t('chart.finamAuthErrorDefault'),
    });
    return <ErrorState message={message} />;
  }

  return (
    <div className="relative h-full w-full min-h-[200px]">
      {/* Container MUST be first child so React never removes it
          when the loading overlay disappears (position-based reconciliation). */}
      <div ref={containerRef} id={containerId} className="h-full w-full" />
      {loading && !mounted && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center text-sm text-[var(--text-secondary)]">
          <span>{t('chart.loading')}</span>
        </div>
      )}
    </div>
  );
};

export const ChartWidgetContent: React.FC<ChartWidgetContentProps> = ({
  card,
}) => {
  const { t } = useTranslation('common');

  return (
    <Sentry.ErrorBoundary
      fallback={<ErrorState message={t('chart.loadFailed')} />}
      beforeCapture={(scope) => {
        scope.setTag('boundary', 'chart-widget');
      }}
    >
      <ChartWidgetContentInner card={card} />
    </Sentry.ErrorBoundary>
  );
};

export default ChartWidgetContent;
