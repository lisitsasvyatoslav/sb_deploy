'use client';

import { Icon } from '@/shared/ui/Icon/Icon';
import Button from '@/shared/ui/Button';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { useTranslation } from '@/shared/i18n/client';
import React, { useState } from 'react';

export interface ConfirmAddNewsToBoardProps {
  isOpen: boolean;
  boardName: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const ConfirmAddNewsToBoard: React.FC<ConfirmAddNewsToBoardProps> = ({
  isOpen,
  boardName,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      maxWidth="sm"
    >
      <ModalHeader className="!px-6 !pb-6">
        <div className="flex flex-col gap-8">
          <div className="flex size-16 items-center justify-center rounded-full bg-[var(--blackinverse-a4)]">
            <Icon
              variant="bookmark"
              size={24}
              className="text-[var(--text-primary)]"
            />
          </div>
          <div className="space-y-2">
            <ModalTitle>{t('confirmAddNewsToBoard.title')}</ModalTitle>
            <p className="text-[var(--text-secondary)] text-xl leading-6 tracking-[-0.2px]">
              {t('confirmAddNewsToBoard.subtitle', { boardName })}
            </p>
          </div>
        </div>
      </ModalHeader>
      <ModalFooter align="between" className="!px-6 !py-6">
        <Button
          onClick={onClose}
          variant="secondary"
          size="md"
          className="!w-[180px]"
        >
          {t('modal.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          variant="primary"
          size="md"
          className="!w-[180px]"
        >
          {t('modal.confirm')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
