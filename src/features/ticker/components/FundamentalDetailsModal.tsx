import React from 'react';
import { Modal, ModalHeader, ModalBody } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useFundamentalModalStore } from '@/features/ticker/stores/fundamentalModalStore';
import { useTranslation } from '@/shared/i18n/client';
import { ArrowBack } from '@mui/icons-material';
import TickerIcon from '@/shared/ui/TickerIcon';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { REGION } from '@/shared/config/region';
import FundamentalDetailContent from './FundamentalDetailContent';

const FundamentalDetailsModal: React.FC = () => {
  const { isOpen, closeModal, selectedFundamentalData, showBackButton } =
    useFundamentalModalStore();
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);

  if (!selectedFundamentalData) return null;

  const headerContent = (
    <div className="flex gap-3 items-center">
      <TickerIcon
        securityId={selectedFundamentalData.securityId}
        symbol={selectedFundamentalData.tickerSymbol}
        size={48}
      />
      <div className="flex flex-col gap-1 min-w-0 max-w-[464px]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-6 tracking-[-0.216px] overflow-hidden text-ellipsis whitespace-nowrap">
          {REGION === 'us'
            ? selectedFundamentalData.tickerSymbol
            : selectedFundamentalData.tickerName}
        </h2>
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-sm font-normal text-[var(--text-secondary)] tracking-[-0.056px]">
            {selectedFundamentalData.tickerSymbol}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      maxWidth="lg"
      zIndex={1400}
      leftContent={
        showBackButton ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowBack />}
            onClick={closeModal}
            aria-label={t('info.back')}
          />
        ) : undefined
      }
    >
      <ModalHeader className="pt-2">{headerContent}</ModalHeader>
      <ModalBody padding="none">
        <FundamentalDetailContent
          fundamentalData={selectedFundamentalData}
          locale={locale}
          t={t}
        />
      </ModalBody>
    </Modal>
  );
};

export default FundamentalDetailsModal;
