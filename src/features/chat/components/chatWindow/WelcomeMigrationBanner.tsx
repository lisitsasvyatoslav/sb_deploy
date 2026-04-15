import React from 'react';
import { m } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';

interface SeededMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WelcomeMigrationBannerProps {
  preview: string;
  collapsed: boolean;
  seededMessages: SeededMessage[];
  onToggle: () => void;
}

const WelcomeMigrationBanner: React.FC<WelcomeMigrationBannerProps> = ({
  preview,
  collapsed,
  seededMessages,
  onToggle,
}) => {
  const { t } = useTranslation('chat');
  // Find LAST assistant message for preview (to show answer to last question)
  const lastAssistantMessage = [...seededMessages]
    .reverse()
    .find((m) => m.role === 'assistant');
  const assistantPreview = lastAssistantMessage?.content || '';

  // Truncate assistant preview for collapsed view
  const truncatedAssistant =
    assistantPreview.length > 200
      ? `${assistantPreview.slice(0, 200)}...`
      : assistantPreview;

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <CheckCircleOutlineIcon
          className="text-success-brand"
          sx={{ fontSize: 20 }}
        />
        <span className="text-sm font-medium text-success-brand">
          {t('migration.dialogSaved')}
        </span>
      </div>
      <div className="rounded-2xl border border-border-light px-4 py-3">
        {/* Content area */}
        <m.div className={collapsed ? 'overflow-hidden max-h-[140px]' : ''}>
          {collapsed ? (
            /* Collapsed view: preview + truncated assistant */
            <>
              <div className="text-sm font-semibold text-text-primary whitespace-pre-wrap line-clamp-2">
                {preview}
              </div>
              {assistantPreview && (
                <div className="mt-1 text-sm text-text-secondary whitespace-pre-wrap line-clamp-3">
                  {truncatedAssistant}
                </div>
              )}
            </>
          ) : (
            /* Expanded view: all messages */
            <div className="flex flex-col gap-3">
              {seededMessages.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === 'user' ? (
                    <div className="text-sm font-semibold text-text-primary whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </m.div>

        <Button
          type="button"
          onClick={onToggle}
          variant="ghost"
          size="xs"
          className="mt-3 !p-0 !h-auto !text-text-secondary hover:!text-text-primary"
        >
          {collapsed ? t('migration.showAll') : t('migration.hide')}
        </Button>
      </div>
    </>
  );
};

export default WelcomeMigrationBanner;
