/**
 * SignalDropdown Component - Based on Figma design
 * Reusable webhook section for displaying and managing webhook URLs
 */

import Image from 'next/image';
import { useSignalToggle } from '@/features/signal/hooks/useSignalToggle';
import { useSignalWebhooksQuery } from '@/features/signal/queries';
import { useSignalModalStore } from '@/features/signal/stores/signalModalStore';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';
import { useTranslation } from '@/shared/i18n/client';
import { useBoardStore } from '@/stores/boardStore';
import type { SignalWebhook } from '@/types';
import React, { useCallback, useMemo } from 'react';
import Switch from '@/shared/ui/Switch';
import SignalWebhookRow from './SignalWebhookRow';

interface SignalDropdownProps {
  title?: string;
  createButtonText?: string;
  emptyStateText?: string;
  tradingViewLinkText?: string;
}

const SignalDropdown: React.FC<SignalDropdownProps> = ({
  title,
  createButtonText,
  emptyStateText,
  tradingViewLinkText,
}) => {
  const { t } = useTranslation('signal');
  const openSignalModal = useSignalModalStore((state) => state.openModal);
  const copyToClipboard = useCopyToClipboard();

  const boardId = useBoardStore((state) => state.boardId);

  const { data: webhooksData } = useSignalWebhooksQuery(boardId ?? undefined);
  const webhooks = useMemo(() => webhooksData?.signals || [], [webhooksData]);

  const { isSignalsWorking, toggleSignalsState } = useSignalToggle({
    webhooks,
    boardId,
  });

  const handleCopyUrl = useCallback(
    (webhook: SignalWebhook) => {
      const fullUrl = webhook.webhookUrl
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${webhook.webhookUrl}`
        : '';
      if (fullUrl) {
        copyToClipboard(fullUrl, t('toast.urlCopied'));
      }
    },
    [copyToClipboard, t]
  );

  if (boardId === null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex-1 flex flex-col gap-0.5 justify-center">
          <p className="font-inter font-semibold text-sm theme-text-primary tracking-[-0.2px] leading-5">
            {title || t('dropdown.title')}
          </p>
        </div>
        <Switch
          checked={isSignalsWorking}
          onChange={toggleSignalsState}
          size="sm"
          aria-label={
            isSignalsWorking ? t('dropdown.deactivate') : t('dropdown.activate')
          }
          data-testid="signal-toggle"
        />
      </div>

      {/* TradingView Link - always visible */}
      <a
        href="https://www.tradingview.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1"
      >
        <div className="w-[24px] h-[24px] flex items-center justify-center">
          {/* TradingView Logo */}
          <Image
            src="/images/trading-view-white-logo.svg"
            alt="TradingView"
            className="w-[24px] h-[24px]"
            width={24}
            height={24}
          />
        </div>
        <p className="font-inter font-normal text-xs text-primary-500 tracking-[-0.2px] leading-4">
          {tradingViewLinkText || t('dropdown.tradingViewLink')}
        </p>
      </a>

      {/* Content visible only when toggle is active */}
      {isSignalsWorking && (
        <>
          {/* Webhook URLs List */}
          {webhooks.length > 0 ? (
            <div className="flex flex-col">
              {webhooks.map((webhook) => (
                <SignalWebhookRow
                  key={webhook.id}
                  webhook={webhook}
                  onCopy={handleCopyUrl}
                  onClick={(webhookId) => openSignalModal(boardId, webhookId)}
                />
              ))}
            </div>
          ) : (
            <p className="font-inter font-normal text-sm text-blackinverse-a56 py-2">
              {emptyStateText || t('dropdown.emptyState')}
            </p>
          )}

          {/* Create More Button */}
          <button
            onClick={() => boardId && openSignalModal(boardId)}
            disabled={!boardId}
            className="self-start rounded-[6px] px-2 py-1 flex items-center justify-center bg-surface-card hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-inter font-medium text-xs theme-text-secondary tracking-[-0.2px] leading-4">
              {createButtonText || t('dropdown.createButton')}
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default SignalDropdown;
