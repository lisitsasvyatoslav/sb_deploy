import { useTranslation } from '@/shared/i18n/client';

interface ChatDropOverlayProps {
  isVisible: boolean;
  cardCount?: number;
}

const ChatDropOverlay = ({ isVisible, cardCount }: ChatDropOverlayProps) => {
  const { t } = useTranslation('chat');

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 rounded-lg pointer-events-none z-[1000] bg-brand-a8 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
      <span className="text-sm font-medium text-white">
        {t('dropOverlay.dropToAdd')}
      </span>
      {cardCount !== undefined && cardCount > 0 && (
        <span className="text-xs text-white/80">
          {t('dropOverlay.cardsCount', { count: cardCount })}
        </span>
      )}
    </div>
  );
};

export default ChatDropOverlay;
