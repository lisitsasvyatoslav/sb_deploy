'use client';

import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { Icon } from '@/shared/ui/Icon/Icon';
import { useModalContext } from './ModalContext';

export function ModalControls() {
  const {
    showCloseButton,
    floatingCloseButton,
    expandable,
    leftContent,
    onAskAI,
    isExpanded,
    onToggleExpand,
    onExpandToOverlay,
    onClose,
    editor,
  } = useModalContext();
  const { t } = useTranslation('common');
  const hasRichControls = Boolean(
    expandable || onAskAI || leftContent || editor
  );
  const actionButtonSize: 'md' | 'lg' = editor || onAskAI ? 'md' : 'lg';

  if (!hasRichControls) {
    if (!showCloseButton) return null;

    if (floatingCloseButton) {
      return (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('modal.close')}
          className="absolute top-spacing-20 right-spacing-20 z-10 inline-flex size-12 items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Icon variant="close" size={20} />
        </button>
      );
    }

    return (
      <div className="flex h-[42px] items-end justify-end px-[22px]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('modal.close')}
          className="inline-flex size-spacing-20 items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Icon variant="close" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-spacing-64 items-center justify-between px-spacing-8">
      <div className="flex min-h-spacing-40 items-center gap-spacing-8 py-spacing-8 pl-spacing-24 pr-spacing-8">
        {leftContent}
      </div>
      <div
        className={`flex items-center gap-0 ${actionButtonSize === 'lg' ? 'px-spacing-8 py-spacing-8' : 'px-spacing-12 py-spacing-12'}`}
      >
        {onAskAI && (
          <Button
            variant="ghost"
            size="md"
            onClick={onAskAI}
            aria-label={t('modal.askAI')}
          >
            <Icon
              variant="ai"
              size={20}
              className="text-[var(--text-secondary)]"
            />
            <span className="text-14 font-semibold tracking-tight-1 text-[var(--text-secondary)]">
              {t('modal.askAI')}
            </span>
          </Button>
        )}
        {expandable && (
          <Button
            variant="ghost"
            size={actionButtonSize}
            icon={
              <Icon variant={isExpanded ? 'collapse' : 'expand'} size={20} />
            }
            onClick={onExpandToOverlay ?? onToggleExpand}
            aria-label={isExpanded ? t('modal.collapse') : t('modal.expand')}
          />
        )}
        {showCloseButton && (
          <Button
            variant="ghost"
            size={actionButtonSize}
            icon={<Icon variant="close" size={20} />}
            onClick={onClose}
            aria-label={t('modal.close')}
          />
        )}
      </div>
    </div>
  );
}
