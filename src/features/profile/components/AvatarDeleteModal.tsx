'use client';

import React from 'react';
import { Modal, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import { Icon } from '@/shared/ui/Icon';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';

/**
 * AvatarDeleteModal — destructive confirmation modal for avatar deletion
 *
 * Figma node: 962:82961
 */

interface AvatarDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

const AvatarDeleteModal: React.FC<AvatarDeleteModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
}) => {
  const { t } = useTranslation('profile');

  return (
    <Modal open={open} onOpenChange={onOpenChange} maxWidth="sm">
      <ModalBody className="flex flex-col gap-spacing-32 pt-spacing-0">
        <div className="flex items-center justify-center w-spacing-64 h-spacing-64 rounded-full bg-colors-status_negative_bg">
          <Icon
            variant="trashBold"
            size={24}
            className="text-colors-status_negative_base"
          />
        </div>

        <div className="flex flex-col gap-spacing-8">
          <p className="text-24 font-semibold leading-32 text-blackinverse-a100">
            {t('myProfile.deleteAvatarModal.title')}
          </p>
          <p className="text-16 font-regular leading-24 text-blackinverse-a56">
            {t('myProfile.deleteAvatarModal.subtitle')}
          </p>
        </div>
      </ModalBody>

      <ModalFooter className="!p-spacing-24 !gap-spacing-16">
        <Button
          variant="secondary"
          size="md"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          fullWidth
        >
          {t('myProfile.deleteAvatarModal.cancel')}
        </Button>
        <Button
          variant="negative"
          size="md"
          onClick={onConfirm}
          loading={loading}
          fullWidth
        >
          {t('myProfile.deleteAvatarModal.delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AvatarDeleteModal;
