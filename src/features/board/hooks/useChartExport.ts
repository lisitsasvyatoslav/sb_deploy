import { useCallback, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getChartHandler } from '@/services/chartHandlerRegistry';
import { chartExportApi } from '@/services/api/chartExport';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { logger } from '@/shared/utils/logger';

export type ExportFormat = 'png' | 'json' | 'csv';

/** Read the live pitch (timeframe) from the chart handler's current state */
function getLivePitch(cardId: number): string | undefined {
  try {
    const handler = getChartHandler(cardId);
    if (!handler) return undefined;
    const state = handler.getJson();
    if (state?.pitch && typeof state.pitch === 'string') return state.pitch;
  } catch {
    /* best effort */
  }
  return undefined;
}

export function useChartExport(cardId: number) {
  const { t } = useTranslation('board');
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const exportChart = useCallback(
    async (format: ExportFormat) => {
      if (!cardId) return;
      setExporting(format);
      const pitch = getLivePitch(cardId);
      try {
        switch (format) {
          case 'png': {
            const handler = getChartHandler(cardId);
            if (!handler) throw new Error('Chart handler not available');

            const containerEl = document.getElementById(
              `chart-widget-${cardId}`
            );
            const width = containerEl?.clientWidth || 1920;
            const height = containerEl?.clientHeight || 1080;

            const canvas = handler.takeSnapshot(width, height, {
              drawLegend: true,
              drawWatermark: true,
              drawAxisX: true,
              drawAxisY: true,
              drawMinMaxLabels: true,
            });

            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (b) =>
                  b
                    ? resolve(b)
                    : reject(new Error('PNG blob creation failed')),
                'image/png'
              );
            });

            triggerDownload(
              URL.createObjectURL(blob),
              `chart_${cardId}${pitch ? '_' + pitch : ''}_${today()}.png`
            );
            break;
          }

          case 'json': {
            const data = await chartExportApi.exportJson(cardId, pitch);
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: 'application/json',
            });
            triggerDownload(
              URL.createObjectURL(blob),
              `chart_${cardId}${data.timeframe ? '_' + data.timeframe : ''}_${today()}.json`
            );
            break;
          }

          case 'csv': {
            const { blob } = await chartExportApi.exportCsv(cardId, pitch);
            triggerDownload(
              URL.createObjectURL(blob),
              `chart_${cardId}${pitch ? '_' + pitch : ''}_${today()}.csv`
            );
            break;
          }
        }

        showSuccessToast(t('export.success'));
      } catch (err) {
        logger.error('useChartExport', `Export ${format} failed`, err);
        showErrorToast(t('export.error'));
      } finally {
        setExporting(null);
      }
    },
    [cardId, t]
  );

  return { exportChart, exporting };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoke so the browser finishes reading the blob before it's freed
  if (url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 1000);
}
