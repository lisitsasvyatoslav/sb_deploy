import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ModalBody } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useTechAnalysisModalStore } from '@/features/ticker/stores/techAnalysisModalStore';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import { TechnicalAnalysisData } from '@/types/ticker';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CardControls from '@/shared/ui/CardControls';
import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';
import { getTickerIconUrl } from '@/shared/config/environment';
import { useBoardStore } from '@/stores/boardStore';
import { useCardOperations } from '@/features/board/hooks/useCardOperations';
import { useCardHeader } from '@/features/board/hooks/useCardHeader';
import TechnicalDetailContent from './TechnicalDetailContent';

const TechAnalysisDetailsModal: React.FC = () => {
  const { isOpen, closeModal, selectedTechData, showBackButton, cardId } =
    useTechAnalysisModalStore();
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);
  const tFn = t as TranslateFn;

  // Get card from boardStore instead of fetching via useQuery
  const card = useBoardStore((s) =>
    cardId ? s.allCards.find((c) => c.id === cardId) : undefined
  );
  const boardId = useBoardStore((s) => s.boardId);

  // Unified card operations (no-op when cardId/boardId is null)
  const { updateTitle, updateColor } = useCardOperations(cardId, boardId);

  const [localTitle, setLocalTitle] = useState('');

  useEffect(() => {
    if (card?.title != null) {
      setLocalTitle(card.title);
    }
  }, [card?.title]);

  const handleTitleChange = useCallback((value: string) => {
    setLocalTitle(value);
  }, []);

  const handleTitleConfirm = useCallback(() => {
    if (!cardId) return;
    updateTitle(localTitle);
  }, [cardId, localTitle, updateTitle]);

  const handleColorChange = useCallback(
    (color: string) => {
      updateColor(color);
    },
    [updateColor]
  );

  // Resolve technical data: prefer boardStore card meta, fall back to modal store payload
  const techData: TechnicalAnalysisData | undefined =
    (card?.meta?.technicalData as unknown as TechnicalAnalysisData) ||
    selectedTechData ||
    undefined;

  // ── Build header props via useCardHeader ──
  const isPreview = cardId === null;

  const colorWidget = !isPreview ? (
    <SelectColorWidget
      currentColor={card?.color || ''}
      onColorChange={handleColorChange}
    />
  ) : undefined;

  const { headerProps } = useCardHeader(
    card,
    'modal',
    {
      onClose: closeModal,
    },
    !isPreview
      ? {
          value: localTitle,
          onChange: handleTitleChange,
          onConfirm: handleTitleConfirm,
        }
      : undefined,
    colorWidget
  );

  if (!techData) return null;

  // Augment headerProps with ticker-specific props not handled by useCardHeader
  const backButton = showBackButton ? (
    <Button
      onClick={closeModal}
      variant="ghost"
      size="sm"
      icon={<NavigateBeforeIcon />}
      aria-label={t('info.back')}
    />
  ) : undefined;

  const headerElement = (
    <CardControls
      {...headerProps}
      tickerLogo={
        techData.securityId ? getTickerIconUrl(techData.securityId) : undefined
      }
      ticker={techData.tickerSymbol}
      leftContent={backButton}
      editableLabel={
        headerProps.editableLabel
          ? {
              ...headerProps.editableLabel,
              placeholder: t('info.loading'),
            }
          : undefined
      }
    />
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      maxWidth="lg"
      zIndex={1400}
      expandable={true}
      header={headerElement}
    >
      <ModalBody padding="none">
        <TechnicalDetailContent techData={techData} locale={locale} t={tFn} />
      </ModalBody>
    </Modal>
  );
};

export default TechAnalysisDetailsModal;
