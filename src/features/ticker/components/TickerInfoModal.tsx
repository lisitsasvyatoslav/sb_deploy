import CardControls from '@/shared/ui/CardControls';
import { Modal, ModalBody } from '@/shared/ui/Modal';
import { SelectColorWidget } from '@/shared/ui/Modal/SelectColorWidget';
import { getTickerIconUrl } from '@/shared/config/environment';
import { useTickerChartData } from '@/features/ticker/hooks/useTickerChartData';
import { useTickerInfoStore } from '@/features/ticker/stores/tickerInfoStore';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import Button from '@/shared/ui/Button';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useBoardStore } from '@/stores/boardStore';
import { useCardOperations } from '@/features/board/hooks/useCardOperations';
import { useCardHeader } from '@/features/board/hooks/useCardHeader';
import TickerDetailContent from './TickerDetailContent';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const TickerInfoModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    securityId,
    cardId,
    savedPeriod,
    showBackButton,
  } = useTickerInfoStore();
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'D' | 'W' | 'M' | 'Q' | 'Y' | 'all'
  >('all');

  // Get card from boardStore instead of fetching via useQuery
  const card = useBoardStore((s) =>
    cardId ? s.allCards.find((c) => c.id === cardId) : undefined
  );
  const boardId = useBoardStore((s) => s.boardId);

  // Unified card operations (no-op when cardId/boardId is null)
  const { updateTitle, updateColor, updateMeta } = useCardOperations(
    cardId,
    boardId
  );

  // Initialize period from saved value or default to 'all' when ticker changes
  useEffect(() => {
    if (securityId) {
      setSelectedPeriod(
        (savedPeriod as 'D' | 'W' | 'M' | 'Q' | 'Y' | 'all') || 'all'
      );
    }
  }, [securityId, savedPeriod]);

  // Save selected period to card meta when it changes
  useEffect(() => {
    if (cardId && selectedPeriod && selectedPeriod !== savedPeriod) {
      updateMeta({ chartPeriod: selectedPeriod });
    }
  }, [selectedPeriod, cardId, savedPeriod, updateMeta]);

  // Fetch chart data dynamically
  const {
    data: chartData,
    isLoading,
    isError,
  } = useTickerChartData({
    security_id: securityId || undefined,
    period: selectedPeriod,
    enabled: isOpen && !!securityId,
  });

  const periods = useMemo<
    Array<{ key: 'D' | 'W' | 'M' | 'Q' | 'Y' | 'all'; label: string }>
  >(
    () => [
      { key: 'all', label: t('periods.allTime') },
      { key: 'Y', label: t('periods.year') },
      { key: 'Q', label: t('periods.quarter') },
      { key: 'M', label: t('periods.month') },
      { key: 'W', label: t('periods.week') },
      { key: 'D', label: t('periods.day') },
    ],
    [t]
  );

  // ── Editable title state ──
  const [localTitle, setLocalTitle] = useState('');

  // Sync local title from card
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
      tickerLogo={securityId ? getTickerIconUrl(securityId) : undefined}
      ticker={chartData?.ticker}
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

  if (!isOpen || !securityId) return null;

  // Show loading state
  if (isLoading) {
    return (
      <Modal
        open={isOpen}
        onOpenChange={(open) => !open && closeModal()}
        maxWidth="lg"
        expandable={true}
        header={headerElement}
      >
        <ModalBody>
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('info.loadingData')}
              </p>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

  // Show error state
  if (isError || !chartData) {
    return (
      <Modal
        open={isOpen}
        onOpenChange={(open) => !open && closeModal()}
        maxWidth="lg"
        expandable={true}
        header={headerElement}
      >
        <ModalBody>
          <div className="flex items-center justify-center h-[400px] text-status-negative">
            {t('info.errorLoad')}
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      maxWidth="lg"
      expandable={true}
      header={headerElement}
    >
      <ModalBody padding="none">
        <TickerDetailContent
          chartData={chartData}
          periods={periods}
          selectedPeriod={selectedPeriod}
          onPeriodChange={(period) =>
            setSelectedPeriod(period as 'D' | 'W' | 'M' | 'Q' | 'Y' | 'all')
          }
          locale={locale}
          t={t}
        />
      </ModalBody>
    </Modal>
  );
};

export default TickerInfoModal;
