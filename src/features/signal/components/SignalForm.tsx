/**
 * SignalForm Component
 * Form for creating and editing TradingView signals
 * Can be used inside modal or standalone
 */

import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import Image from 'next/image';
import { formatSignalTime } from '@/features/board/utils/signalHelpers';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import type { Signal } from '@/types';
import { Icon } from '@/shared/ui/Icon';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Form field limits
const MAX_DESCRIPTION_LENGTH = 200;

export type SignalFormMode = 'create' | 'edit' | 'view';

interface SignalFormProps {
  mode: SignalFormMode;

  // Form values
  description: string;
  showToastNotification: boolean;
  webhookUrl: string | null;

  // Callbacks
  onDescriptionChange: (value: string) => void;
  onShowToastNotificationChange: (value: boolean) => void;

  // Signal history (for edit/view modes)
  signalHistory?: {
    data: Signal[];
    total: number;
  };
  isLoadingHistory?: boolean;
  historyError?: Error | null;

  // Loading states
  isGeneratingUrl?: boolean;
}

const SignalForm: React.FC<SignalFormProps> = ({
  mode,
  description,
  showToastNotification,
  webhookUrl,
  onDescriptionChange,
  onShowToastNotificationChange,
  signalHistory,
  isLoadingHistory = false,
  historyError = null,
  isGeneratingUrl = false,
}) => {
  const { t, i18n } = useTranslation('signal');
  const locale = getLocaleTag(i18n.language);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const copyToClipboard = useCopyToClipboard();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyUrl = useCallback(() => {
    if (webhookUrl) {
      copyToClipboard(webhookUrl, t('toast.urlCopied'));
      setCopiedUrl(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout with ref for cleanup
      timeoutRef.current = setTimeout(() => {
        setCopiedUrl(false);
        timeoutRef.current = null;
      }, 2000);
    }
  }, [webhookUrl, copyToClipboard, t]);

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
      onDescriptionChange(value);
    },
    [onDescriptionChange]
  );

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      {/* Show toast notification toggle */}
      <div className="flex gap-5 items-center w-full">
        <p className="font-inter font-semibold text-sm leading-5 theme-text-primary tracking-[-0.2px] w-[216px]">
          {t('form.showNotifications')}
        </p>
        <div className="flex gap-2 items-center">
          <button
            onClick={() =>
              onShowToastNotificationChange(!showToastNotification)
            }
            disabled={mode === 'view'}
            className={`flex items-center rounded-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-9 h-5 py-1 ${
              showToastNotification
                ? 'bg-primary-500 pl-4 pr-1'
                : 'bg-switch-off pl-1 pr-4'
            }`}
            aria-label={t('form.notificationsAriaLabel', {
              state: showToastNotification
                ? t('form.notificationsOn')
                : t('form.notificationsOff'),
            })}
            role="switch"
            aria-checked={showToastNotification}
          >
            <div
              className={`rounded-[1px] transition-all duration-200 w-5 h-3 bg-white ${
                showToastNotification ? 'shadow-none' : 'shadow-switch-thumb'
              }`}
            />
          </button>
          <p className="font-inter font-normal text-xs leading-4 theme-text-secondary tracking-[-0.2px]">
            {showToastNotification ? t('form.yes') : t('form.no')}
          </p>
        </div>
      </div>

      {/* Webhook URL section */}
      <div className="flex gap-5 items-start w-full">
        <div className="flex flex-col items-start w-[216px]">
          <p className="font-inter font-semibold text-sm leading-5 theme-text-primary tracking-[-0.2px] mb-1">
            Webhook url
          </p>
          <a
            href="https://www.tradingview.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-1 items-center"
          >
            <Image
              src="/images/trading-view-white-logo.svg"
              alt="TradingView"
              className="w-[24px] h-[24px] theme-icon-invert"
              width={24}
              height={24}
            />
            <p className="font-inter font-normal text-xs leading-4 text-primary-500 tracking-[-0.2px]">
              add to trading view
            </p>
          </a>
        </div>

        <div className="flex-1 flex flex-col items-start justify-center">
          <div className="flex gap-2 items-center w-full">
            <p className="font-inter font-normal text-sm leading-5 theme-text-primary tracking-[-0.2px] truncate">
              {isGeneratingUrl
                ? t('form.generatingUrl')
                : webhookUrl || t('form.urlNotGenerated')}
            </p>
            <Button
              onClick={handleCopyUrl}
              disabled={!webhookUrl || isGeneratingUrl}
              variant="ghost"
              size="sm"
              icon={
                <Icon
                  variant="copy"
                  size={16}
                  className="text-text-secondary"
                />
              }
              className="opacity-100 shrink-0 !p-1 !rounded disabled:opacity-50"
              aria-label={
                copiedUrl ? t('form.urlCopied') : t('form.copyWebhookUrl')
              }
            />
          </div>
        </div>
      </div>

      {/* Comment input */}
      <Input
        type="text"
        value={description}
        onChange={handleDescriptionChange}
        placeholder={t('form.commentPlaceholder')}
        disabled={mode === 'view'}
        maxLength={MAX_DESCRIPTION_LENGTH}
        size="md"
        containerClassName="w-full"
        hint={
          mode !== 'view' && description.length > 0
            ? `${description.length}/${MAX_DESCRIPTION_LENGTH}`
            : undefined
        }
      />

      {/* List of signals - in edit and view modes */}
      {mode !== 'create' && (
        <div className="flex flex-col gap-2 items-start w-full">
          {/* Title */}
          <div className="flex gap-5 items-start w-full">
            <div className="flex flex-col items-start w-[216px]">
              <p className="font-inter font-semibold text-sm leading-5 theme-text-primary tracking-[-0.2px]">
                {t('form.signalList')}
              </p>
            </div>
            <div className="flex-1 h-5" />
          </div>

          {/* Signal history list */}
          {isLoadingHistory ? (
            <p className="font-inter font-normal text-sm theme-text-secondary py-2">
              {t('form.loadingSignals')}
            </p>
          ) : historyError ? (
            <p className="font-inter font-normal text-sm text-red-500 py-2">
              {t('form.loadError')}
            </p>
          ) : signalHistory &&
            signalHistory.data &&
            signalHistory.data.length > 0 ? (
            <div className="flex flex-col gap-2 w-full">
              {signalHistory.data.map((signal) => {
                // Format date and time as in signal card: DD.MM.YYYY HH:MM
                const formattedDateTime = formatSignalTime(
                  signal.createdAt,
                  locale
                );

                // Get text from payload
                const signalText = String(
                  signal.payload?.text || JSON.stringify(signal.payload)
                );

                return (
                  <div
                    key={signal.id}
                    className="flex gap-5 items-start w-full"
                  >
                    <div className="flex flex-col items-start w-[216px] shrink-0">
                      <p className="font-inter font-normal text-sm leading-5 theme-text-secondary tracking-[-0.2px]">
                        {formattedDateTime}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-inter font-normal text-sm leading-5 theme-text-primary tracking-[-0.2px] whitespace-pre-wrap">
                        {signalText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-inter font-normal text-sm theme-text-secondary py-2">
              {t('form.noSignals')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SignalForm;
