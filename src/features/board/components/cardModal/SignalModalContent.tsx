'use client';

import { useTranslation } from '@/shared/i18n/client';
import Button from '@/shared/ui/Button';
import SignalForm from '@/features/signal/components/SignalForm';
import { useSignalWebhook } from '@/features/signal/hooks/useSignalWebhook';
import { useCardModalStore } from '@/stores/cardModalStore';
import type { Card } from '@/types';

interface SignalModalContentProps {
  card: Card;
  boardId: number;
}

export function SignalModalContent({ card, boardId }: SignalModalContentProps) {
  const { t } = useTranslation('signal');

  const signalWebhookId = card.signalWebhookId ?? 0;
  const mode = signalWebhookId ? 'edit' : 'create';

  const signal = useSignalWebhook({ signalWebhookId, boardId, mode });

  const handleSave = async () => {
    await signal.handleSave();
    useCardModalStore.getState().close();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-5 items-start pb-0 pt-2 px-8 relative shrink-0 w-full">
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
      <div className="flex justify-end px-4 py-3">
        <Button
          variant="accent"
          size="md"
          onClick={handleSave}
          disabled={signal.isSaveDisabled}
          loading={signal.isSaving}
        >
          {mode === 'create' ? t('modal.create') : t('modal.save')}
        </Button>
      </div>
    </div>
  );
}
