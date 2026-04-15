'use client';

import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon/Icon';
import Input from '@/shared/ui/Input';
import { useTranslation } from '@/shared/i18n/client';
import React, { useState } from 'react';

export interface CreateBoardDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => void | Promise<void>;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  nameLabel?: string;
  namePlaceholder?: string;
}

export const CreateBoardDialog: React.FC<CreateBoardDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  subtitle,
  submitLabel,
  nameLabel,
  namePlaceholder,
}) => {
  const { t } = useTranslation('common');
  const [boardName, setBoardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (boardName.trim()) {
      try {
        setIsSubmitting(true);
        await onSubmit({
          name: boardName.trim(),
        });
        setBoardName('');
        onClose();
      } catch {
        // Keep dialog open so user can retry
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setBoardName('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      maxWidth="sm"
      zIndex={9999}
    >
      <ModalHeader className="!px-6 !pb-6">
        <div className="flex flex-col gap-8">
          <div className="flex size-16 items-center justify-center rounded-full bg-blackinverse-a4">
            <Icon
              variant="editNote"
              size={24}
              className="text-[var(--text-primary)]"
            />
          </div>
          <div className="space-y-2">
            <ModalTitle>
              {title ?? t('boardSections.main.createDialogTitle')}
            </ModalTitle>
            <p className="text-[var(--text-secondary)] text-xl leading-6 tracking-[-0.2px]">
              {subtitle}
            </p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="!px-6 !pt-6 !pb-4">
        <Input
          id="board-name"
          type="text"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder={
            namePlaceholder ??
            t('boardSections.main.createDialogNamePlaceholder')
          }
          aria-label={
            nameLabel ?? t('boardSections.main.createDialogNameLabel')
          }
          size="md"
          autoFocus
        />
      </ModalBody>
      <ModalFooter align="between" className="!px-6 !pt-6 !pb-6 gap-4">
        <Button onClick={handleClose} variant="secondary" size="md" fullWidth>
          {t('modal.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!boardName.trim() || isSubmitting}
          variant="primary"
          size="md"
          fullWidth
        >
          {submitLabel ?? t('modal.create')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
