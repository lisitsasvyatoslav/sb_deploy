import { Modal, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import { Icon } from '@/shared/ui/Icon';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import React, { useState, useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/client';

export interface DeleteProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  userEmail: string;
}

export const DeleteProfileDialog: React.FC<DeleteProfileDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  userEmail,
}) => {
  const { t } = useTranslation('profile');
  const [email, setEmail] = useState('');

  const isEmailMatch = email.toLowerCase() === userEmail.toLowerCase();

  const handleClose = useCallback(() => {
    setEmail('');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    if (!isEmailMatch) return;
    await onConfirm();
  }, [isEmailMatch, onConfirm]);

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      maxWidth="sm"
      zIndex={9999}
    >
      <ModalBody className="!px-6 !pt-0 !pb-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(242,85,85,0.12)]">
          <Icon
            variant="trashBold"
            size={24}
            className="text-colors-status_negative_base"
          />
        </div>

        {/* Title + Subtitle */}
        <div className="flex flex-col gap-2 mt-8">
          <h2 className="font-semibold text-[24px] leading-[32px] tracking-[-0.4px] text-[var(--blackinverse-a100)]">
            {t('myProfile.deleteModal.title')}
          </h2>
          <p className="text-[16px] leading-[24px] tracking-[-0.2px] text-[var(--blackinverse-a56)]">
            {t('myProfile.deleteModal.subtitle')}
          </p>
        </div>

        {/* Email input */}
        <div className="mt-8">
          <Input
            size="lg"
            type="email"
            placeholder={t('myProfile.deleteModal.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </ModalBody>

      <ModalFooter align="between" className="!px-6 !py-6 !gap-4">
        <Button
          variant="secondary"
          size="md"
          onClick={handleClose}
          disabled={isLoading}
          className="flex-1"
        >
          {t('myProfile.deleteModal.cancel')}
        </Button>
        <Button
          variant="negative"
          size="md"
          onClick={handleConfirm}
          disabled={!isEmailMatch || isLoading}
          loading={isLoading}
          className="flex-1"
        >
          {t('myProfile.deleteModal.delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
