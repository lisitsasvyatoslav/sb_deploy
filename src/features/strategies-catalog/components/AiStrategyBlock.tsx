import { Bot, WandSparkles } from 'lucide-react';
import { CatalogIcon } from '@/features/strategies-catalog/components/CatalogIcon';
import { Icon } from '@/shared/ui/Icon';
import { useChatStore } from '@/stores/chatStore';
import { useTranslation } from '@/shared/i18n/client';
import CardStackIllustration from './CardStackIllustration';

export const AiStrategyBlock = () => {
  const { t } = useTranslation('common');
  const { openSidebar } = useChatStore();

  return (
    <section className="flex items-center justify-center mx-auto w-full min-h-screen max-w-[400px]">
      <div className="flex flex-col items-center gap-2 text-text-primary">
        <div className="relative flex justify-center w-full flex-col pb-16">
          <CardStackIllustration className="w-full h-auto" />
          <div className="flex flex-col self-end gap-2 items-center absolute bottom-[23px] right-[23px]">
            <div
              className="w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-lg z-10"
              style={{
                background: `linear-gradient(to bottom right, var(--brand-primary-glow), var(--brand-primary))`,
              }}
            >
              <Bot className="w-7 h-7" />
            </div>
            <div className="border border-border-light inline-flex items-center bg-background-card text-text-primary rounded px-3 py-2 gap-2 text-[9px] shadow-[0_4px_24px_var(--brand-primary-light)] font-medium">
              {t('strategiesCatalog.aiBlock.bubbleText')} <span>🔍</span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-full px-4 py-[6px] text-[10px] font-normal"
          style={{
            background: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
          }}
        >
          <CatalogIcon
            className="text-sm"
            style={{ color: 'var(--brand-primary)' }}
          />
          {t('strategiesCatalog.aiBlock.catalogBadge')}
        </div>

        <h2 className="text-xl font-bold text-center leading-tight text-text-primary">
          {t('strategiesCatalog.aiBlock.title')}
        </h2>

        <p className="text-xs text-center text-text-secondary leading-7 max-w-xl">
          {t('strategiesCatalog.aiBlock.description')}
        </p>

        <button
          className="flex items-center gap-2 text-sm transition rounded px-8 py-4 mt-4"
          style={{
            background: 'var(--brand-primary)',
            boxShadow: '0 8px 32px 0 var(--brand-primary-light)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--brand-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--brand-primary)';
          }}
          onClick={() => {
            openSidebar();
          }}
        >
          <WandSparkles className="text-xl " />
          {t('strategiesCatalog.aiBlock.pickWithAi')}
          <Icon variant="ai" className="text-xl " />
        </button>

        <div className="text-text-muted text-[10px] mt-2 text-center">
          {t('strategiesCatalog.aiBlock.questionsHint')}
        </div>
      </div>
    </section>
  );
};
