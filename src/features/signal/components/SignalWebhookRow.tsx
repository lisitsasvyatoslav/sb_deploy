/**
 * SignalWebhookRow Component
 * Single webhook row in the list with URL display, description tooltip, and copy button
 */

import type { SignalWebhook } from '@/types';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { ChatBubbleOutline } from '@mui/icons-material';
import React from 'react';

interface SignalWebhookRowProps {
  webhook: SignalWebhook;
  onCopy: (webhook: SignalWebhook) => void;
  onClick: (webhookId: number) => void;
}

const SignalWebhookRow: React.FC<SignalWebhookRowProps> = ({
  webhook,
  onCopy,
  onClick,
}) => {
  const { t } = useTranslation('signal');

  return (
    <div className="flex items-center gap-4 py-1">
      <div
        className="flex-1 flex flex-col gap-0.5 justify-center min-w-0 cursor-pointer theme-bg-hover rounded px-2 py-1 -mx-2 -my-1 transition-colors"
        onClick={() => onClick(webhook.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(webhook.id);
          }
        }}
      >
        <p
          className={`font-inter font-normal text-sm tracking-[-0.2px] leading-5 truncate ${
            webhook.active ? 'theme-text-primary' : 'theme-text-secondary'
          }`}
          title={
            webhook.webhookUrl
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${webhook.webhookUrl}`
              : ''
          }
        >
          {webhook.webhookUrl
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${webhook.webhookUrl}`
            : t('webhookRow.urlNotGenerated')}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {/* Comment/Description Icon with tooltip on top */}
        {webhook.description && (
          <div className="relative group">
            <button
              className="w-4 h-4 flex items-center justify-center theme-bg-hover rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatBubbleOutline
                sx={{ fontSize: 16 }}
                className="theme-text-secondary"
              />
            </button>
            {/* Tooltip - appears above the icon */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap max-w-xs">
                {webhook.description}
              </div>
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
        {/* Copy Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy(webhook);
          }}
          disabled={!webhook.webhookUrl}
          className="w-4 h-4 flex items-center justify-center theme-bg-hover rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            webhook.webhookUrl
              ? t('webhookRow.copyUrl')
              : t('webhookRow.urlUnavailable')
          }
        >
          <Icon variant="copy" size={16} className="theme-text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default SignalWebhookRow;
