import { Modal, ModalBody } from '@/shared/ui/Modal';
import BrokerSelectionWizard from '@/features/broker/components/BrokerSelectionWizard';
import { useStatisticsStore } from '@/stores/statisticsStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const AddBrokerDialog: React.FC = () => {
  const showBrokerDialog = useStatisticsStore(
    (state) => state.showBrokerDialog
  );
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const setBrokerDialogReturnTo = useStatisticsStore(
    (state) => state.setBrokerDialogReturnTo
  );
  const [canClose, setCanClose] = useState(true);
  const onBeforeCloseRef = useRef<(() => void) | null>(null);

  // Auto-open wizard when returning from SnapTrade portal redirect
  useEffect(() => {
    const connectionId = localStorage.getItem('snaptrade_connection_id');
    if (connectionId) {
      setShowBrokerDialog(true);
    }
  }, [setShowBrokerDialog]);

  const handleClose = useCallback(() => {
    if (!canClose) return;
    // Clean up orphaned broker connection if wizard was not completed
    onBeforeCloseRef.current?.();
    setBrokerDialogReturnTo(null);
    setShowBrokerDialog(false);
  }, [canClose, setBrokerDialogReturnTo, setShowBrokerDialog]);

  return (
    <Modal
      open={showBrokerDialog}
      onOpenChange={(open) => !open && handleClose()}
      fullScreen
      zIndex={9999}
      showCloseButton
      floatingCloseButton
    >
      <ModalBody padding="none">
        <BrokerSelectionWizard
          onClose={handleClose}
          onCanCloseChange={setCanClose}
          onBeforeCloseRef={onBeforeCloseRef}
        />
      </ModalBody>
    </Modal>
  );
};

export default AddBrokerDialog;
