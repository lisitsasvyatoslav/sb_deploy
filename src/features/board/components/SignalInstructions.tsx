import { SIGNAL_SOURCE_TYPES } from '@/features/board/constants/signalConstants';
import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

interface SignalInstructionsProps {
  sourceType: 'tradingview' | 'telegram';
  compact?: boolean;
}

/**
 * SignalInstructions - Instructions for setting up a webhook to receive signals
 * Supports TradingView and Telegram sources
 */
const SignalInstructions: React.FC<SignalInstructionsProps> = ({
  sourceType,
  compact = false,
}) => {
  const { t } = useTranslation('board');

  if (sourceType === SIGNAL_SOURCE_TYPES.TELEGRAM) {
    // Telegram instructions (placeholder for future use)
    return (
      <div
        className={`font-normal theme-text-primary ${compact ? 'text-10 leading-[14px]' : 'text-12 leading-[16px]'}`}
      >
        <p className={`font-semibold ${compact ? 'mb-1.5' : 'mb-2'}`}>
          {t('signalInstructions.telegramTitle')}
        </p>
        <p className={compact ? 'mb-2' : 'mb-3'}>
          {t('signalInstructions.autoUpdateOnSignal')}
        </p>
        <p className={`font-semibold ${compact ? 'mb-1.5' : 'mb-2'}`}>
          {t('signalInstructions.instructions')}
        </p>
        <ol
          className={`list-decimal ${compact ? 'ml-3 space-y-0.5' : 'ml-4 space-y-1 text-[11px]'}`}
        >
          <li>{t('signalInstructions.copyWebhook')}</li>
          <li>{t('signalInstructions.setupTelegram')}</li>
        </ol>
      </div>
    );
  }

  // TradingView instructions
  return (
    <div
      className={`font-normal theme-text-primary ${compact ? 'text-10 leading-[14px]' : 'text-12 leading-[16px]'}`}
    >
      <p className={compact ? 'mb-2' : 'mb-3'}>
        {t('signalInstructions.autoUpdateNote')}
      </p>

      <p className={`font-semibold ${compact ? 'mb-1.5' : 'mb-2'}`}>
        {t('signalInstructions.instructions')}
      </p>
      <ol
        className={`list-decimal ${compact ? 'ml-3 space-y-0.5' : 'ml-4 space-y-1'}`}
      >
        <li>{t('signalInstructions.copyWebhook')}</li>
        <li>{t('signalInstructions.tvCreateAlert')}</li>
        <li>{t('signalInstructions.tvWriteMessage')}</li>
      </ol>
    </div>
  );
};

export default SignalInstructions;
