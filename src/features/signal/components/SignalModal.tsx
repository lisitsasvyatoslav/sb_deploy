/**
 * SignalModal Component - Based on Figma design
 * Modal wrapper for creating and editing TradingView signals
 */

import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import React from 'react';
import { useSignalModalStore } from '../stores/signalModalStore';
import { useSignalWebhook } from '../hooks/useSignalWebhook';
import SignalForm from './SignalForm';

const SignalModal: React.FC = () => {
  const { t } = useTranslation('signal');
  const { isOpen, boardId, signalId, mode, closeModal } = useSignalModalStore();

  const signal = useSignalWebhook({
    signalWebhookId: signalId || 0,
    boardId: boardId || 0,
    mode,
    enabled: isOpen,
  });

  const handleClose = () => {
    signal.resetState();
    closeModal();
  };

  const handleSave = async () => {
    await signal.handleSave();
    handleClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      maxWidth="lg"
      zIndex={1500}
      expandable={mode === 'edit' && !!signalId}
    >
      <ModalHeader className="pt-2">
        <ModalTitle>{t('modal.title')}</ModalTitle>
      </ModalHeader>
      <ModalBody padding="none">
        <div
          className={`flex flex-col gap-5 items-start pb-0 pt-2 px-8 relative shrink-0 w-full overflow-y-auto ${mode !== 'create' ? 'h-[580px]' : 'h-[420px]'}`}
        >
          <SignalForm
            mode={mode}
            description={signal.description}
            showToastNotification={signal.showToastNotification}
            webhookUrl={signal.generatedUrl?.webhookUrl || null}
            onDescriptionChange={signal.setDescription}
            onShowToastNotificationChange={signal.setShowToastNotification}
            signalHistory={signal.signalHistoryData}
            isLoadingHistory={signal.isLoadingHistory}
            historyError={signal.historyError}
            isGeneratingUrl={signal.isGeneratingUrl}
          />
        </div>
      </ModalBody>
      <ModalFooter align="right">
        {mode === 'view' ? (
          <Button variant="accent" size="md" onClick={handleClose}>
            {t('modal.close')}
          </Button>
        ) : (
          <Button
            variant="accent"
            size="md"
            onClick={handleSave}
            disabled={signal.isSaveDisabled}
            loading={signal.isSaving}
          >
            {mode === 'create' ? t('modal.create') : t('modal.save')}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default SignalModal;
