import {
  invalidateAllStatisticsQueries,
  useSyncAllMutation,
} from '@/features/statistics/queries';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { apiClient } from '@/services/api/client';
import { logger } from '@/shared/utils/logger';
import { useQueryClient } from '@tanstack/react-query';
import {
  showErrorToast,
  showUiToast,
  showWarningToast,
} from '@/shared/utils/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAvailableBrokers } from '../constants';
import {
  brokerQueryKeys,
  useCreateBrokerConnectionMutation,
  useDeleteBrokerConnectionMutation,
  useSnapTradeCallbackMutation,
  useSnapTradeRegisterMutation,
  useUpdateBrokerConnectionMutation,
  useValidateBrokerConnectionMutation,
} from '../queries';
import type { DiscoveredAccount, TradingAccount } from '@/types/broker';
import type { PortfolioResponse } from '@/types/portfolio';
import type { PortfolioFormData } from '../components/CreatePortfoliosStep';
import { mapBrokerCodeToYmBrokerName } from '../utils/ymBrokerName';
import { ymBrokerNameFromPortfolioFillRule } from '@/features/portfolio-catalog/utils/ymPortfolioAnalytics';

const SYNC_DEPTH = 10;

export type WizardStep =
  | 'select-broker'
  | 'enter-token'
  | 'portal-connect'
  | 'create-portfolios';

interface UseBrokerWizardConfig {
  onClose?: () => void;
  onCanCloseChange?: (canClose: boolean) => void;
}

export function useBrokerWizard({
  onClose,
  onCanCloseChange,
}: UseBrokerWizardConfig) {
  const { t } = useTranslation('broker');
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-broker');
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncDepthYears, setSyncDepthYears] = useState(3);

  // Deferred creation: credentials + discovered accounts held in memory until Save
  const [pendingConnectionName, setPendingConnectionName] = useState<
    string | undefined
  >(undefined);
  const [pendingCredentials, setPendingCredentials] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [discoveredAccountsRaw, setDiscoveredAccountsRaw] = useState<
    DiscoveredAccount[]
  >([]);
  // Account IDs the user had already saved under this same credentials —
  // surfaced from `validate`. Used by CreatePortfoliosStep to disable rows
  // that are already attached to the existing connection.
  const [existingAccountIds, setExistingAccountIds] = useState<string[]>([]);
  // True if `activeConnectionId` points to a pre-existing connection that we
  // reused in this wizard session. In that case we MUST NOT treat it as an
  // orphan on dialog close — deleting it would wipe the user's other accounts.
  const [connectionIsPreExisting, setConnectionIsPreExisting] = useState(false);

  // SnapTrade flow: accounts from DB (TradingAccount[]) after callback
  const [discoveredAccounts, setDiscoveredAccounts] = useState<
    TradingAccount[]
  >([]);

  const [activeConnectionId, setActiveConnectionId] = useState<number | null>(
    null
  );
  const [previousStep, setPreviousStep] = useState<WizardStep>('select-broker');

  // CSV import dialog state
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Portfolio saving state (declared early for canClose effect)
  const [isSavingPortfolios, setIsSavingPortfolios] = useState(false);

  // Portal flow state
  const [portalConnectionId, setPortalConnectionId] = useState<number | null>(
    null
  );
  const [portalOpened, setPortalOpened] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // TODO: Restore once skip-logic for existing connections is finalized
  // const { data: connections } = useBrokerConnectionsQuery();
  // const { data: allAccounts } = useBrokerAccountsQuery();

  const validateConnectionMutation = useValidateBrokerConnectionMutation();
  const createConnectionMutation = useCreateBrokerConnectionMutation();
  const updateConnectionMutation = useUpdateBrokerConnectionMutation();
  const deleteConnectionMutation = useDeleteBrokerConnectionMutation();
  const snapTradeRegisterMutation = useSnapTradeRegisterMutation();
  const snapTradeCallbackMutation = useSnapTradeCallbackMutation();
  const syncAllMutation = useSyncAllMutation();
  const queryClient = useQueryClient();
  const { trackEvent } = useYandexMetrika();

  const showBrokerDialog = useStatisticsStore((s) => s.showBrokerDialog);
  const brokerYmFailureSentRef = useRef(false);
  const brokerYmSuccessRef = useRef(false);
  const prevShowBrokerDialogRef = useRef(false);

  useEffect(() => {
    if (showBrokerDialog && !prevShowBrokerDialogRef.current) {
      brokerYmFailureSentRef.current = false;
      brokerYmSuccessRef.current = false;
    }
    prevShowBrokerDialogRef.current = showBrokerDialog;
  }, [showBrokerDialog]);

  const fireBrokerConnectFailed = useCallback(
    (code: string | null | undefined) => {
      if (brokerYmFailureSentRef.current || brokerYmSuccessRef.current) return;
      brokerYmFailureSentRef.current = true;
      trackEvent('broker_connect_failed', {
        broker_name: mapBrokerCodeToYmBrokerName(code),
      });
    },
    [trackEvent]
  );

  // Refs for stable access in mount-only effect (avoids stale closures)
  const finalizeSyncAndCloseRef = useRef<
    (connectionId: number, overrideSyncDepth?: number) => Promise<void>
  >(null!);
  const snapTradeCallbackMutationRef = useRef(snapTradeCallbackMutation);
  const trackEventRef = useRef(trackEvent);
  const tRef = useRef(t);

  const brokerDialogReturnTo = useStatisticsStore(
    (state) => state.brokerDialogReturnTo
  );
  const setShowBrokerManagementDialog = useStatisticsStore(
    (state) => state.setShowBrokerManagementDialog
  );
  const setBrokerDialogReturnTo = useStatisticsStore(
    (state) => state.setBrokerDialogReturnTo
  );
  const setIsDataSyncInProgress = useStatisticsStore(
    (state) => state.setIsDataSyncInProgress
  );
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );

  // Notify parent when dialog can/cannot be closed
  // Only block close during active API submission, not after success
  useEffect(() => {
    const canClose =
      !validateConnectionMutation.isPending && !isSavingPortfolios;
    onCanCloseChange?.(canClose);
  }, [
    validateConnectionMutation.isPending,
    isSavingPortfolios,
    onCanCloseChange,
  ]);

  /**
   * Finalize: update sync settings, start background sync, close wizard
   */
  const finalizeSyncAndClose = useCallback(
    async (connectionId: number, overrideSyncDepth?: number) => {
      try {
        await updateConnectionMutation.mutateAsync({
          connectionId,
          data: {
            syncDepthYears: overrideSyncDepth ?? syncDepthYears,
            autoSyncEnabled: true,
          },
        });

        setIsDataSyncInProgress(true);

        syncAllMutation
          .mutateAsync()
          .then((response) => {
            invalidateAllStatisticsQueries(queryClient);
            const errorResults = response?.results?.filter(
              (r: { status: string }) => r.status === 'error'
            );
            if (errorResults?.length) {
              const firstError = (errorResults[0] as { error?: string }).error;
              showErrorToast(
                t('wizard.syncError', {
                  error: firstError || t('wizard.error.generic'),
                })
              );
            }
            if (response?.demoDataInjected) {
              showWarningToast(t('wizard.demoDataInjected'));
            }
          })
          .finally(() => setIsDataSyncInProgress(false));

        const availableBrokers = getAvailableBrokers(t);
        const broker = availableBrokers.find((b) => b.type === selectedBroker);
        const brokerName = broker?.name || t('wizard.brokerFallback');
        showUiToast({
          type: 'success',
          title: t('wizard.connectionSuccessTitle', { broker: brokerName }),
          caption: t('wizard.connectionSuccessMessage'),
        });

        brokerYmSuccessRef.current = true;
        trackEvent('broker_connected', {
          broker_name: mapBrokerCodeToYmBrokerName(selectedBroker),
        });

        setBrokerDialogReturnTo(null);
        setShowBrokerDialog(false);
      } catch (error) {
        logger.error('BrokerWizard', 'Failed to save sync settings', error);
        showErrorToast(t('wizard.syncSettingsError'));
        setSuccessMessage(null);
        fireBrokerConnectFailed(selectedBroker);
      }
    },
    [
      syncDepthYears,
      selectedBroker,
      updateConnectionMutation,
      syncAllMutation,
      queryClient,
      t,
      setIsDataSyncInProgress,
      setBrokerDialogReturnTo,
      setShowBrokerDialog,
      trackEvent,
      fireBrokerConnectFailed,
    ]
  );

  // Keep refs in sync for the mount-only effect
  finalizeSyncAndCloseRef.current = finalizeSyncAndClose;
  snapTradeCallbackMutationRef.current = snapTradeCallbackMutation;
  trackEventRef.current = trackEvent;
  tRef.current = t;

  // Auto-process SnapTrade callback when returning from portal redirect
  const snapTradeCallbackProcessed = useRef(false);
  useEffect(() => {
    const savedConnectionId = localStorage.getItem('snaptrade_connection_id');
    if (savedConnectionId && !snapTradeCallbackProcessed.current) {
      snapTradeCallbackProcessed.current = true;
      localStorage.removeItem('snaptrade_connection_id');
      const savedDepth = localStorage.getItem('snaptrade_sync_depth_years');
      localStorage.removeItem('snaptrade_sync_depth_years');
      const restoredDepth = savedDepth ? Number(savedDepth) : undefined;
      if (restoredDepth) {
        setSyncDepthYears(restoredDepth);
      }
      const connectionId = parseInt(savedConnectionId, 10);
      if (!isNaN(connectionId)) {
        setSelectedBroker('snaptrade');
        setCurrentStep('portal-connect');
        setPortalConnectionId(connectionId);
        setPortalOpened(true);
        // Auto-trigger callback (uses refs to avoid stale closures)
        snapTradeCallbackMutationRef.current
          .mutateAsync(connectionId)
          .then((result) => {
            trackEventRef.current('snaptrade_portal_connect', {
              status: 'success',
              accounts_found: result.accounts.length,
            });

            // Transition to portfolio creation instead of closing
            setDiscoveredAccounts(result.accounts);
            setActiveConnectionId(result.connection.id);
            setPreviousStep('portal-connect');
            setCurrentStep('create-portfolios');
            setSuccessMessage(null);
          })
          .catch((error) => {
            logger.error(
              'BrokerWizard',
              'Failed to process SnapTrade callback after redirect',
              error
            );
            setPortalError(tRef.current('portal.error.callbackFailed'));
            if (
              !brokerYmFailureSentRef.current &&
              !brokerYmSuccessRef.current
            ) {
              brokerYmFailureSentRef.current = true;
              trackEventRef.current('broker_connect_failed', {
                broker_name: mapBrokerCodeToYmBrokerName('snaptrade'),
              });
            }
          });
      }
    }
  }, []);

  const handleBrokerSelect = (brokerType: string) => {
    setSelectedBroker(brokerType);
    const availableBrokers = getAvailableBrokers(t);
    const broker = availableBrokers.find((b) => b.type === brokerType);

    // TODO: Restore skip-logic for existing connections once flow is finalized
    // const existingConnection = connections?.find(
    //   (c) => c.brokerCode === brokerType && c.status === 'active'
    // );

    if (broker?.connectionType === 'portal') {
      setCurrentStep('portal-connect');
    } else {
      setCurrentStep('enter-token');
    }
  };

  /**
   * Delete orphaned connection that was created but never finalized with portfolios.
   * Called when the user closes the dialog or navigates away before completing the wizard.
   * Fire-and-forget is acceptable here: the dialog is closing, so there's no subsequent
   * create call that could race with this delete (unlike handleBack — see TD-1378).
   */
  const cleanupOrphanedConnection = useCallback(
    (connectionId: number | null) => {
      if (!connectionId) return;
      deleteConnectionMutation.mutate(connectionId, {
        onError: (err) =>
          logger.error(
            'BrokerWizard',
            'Failed to clean up orphaned connection',
            err
          ),
      });
    },
    [deleteConnectionMutation]
  );

  const handleBack = useCallback(async () => {
    if (deleteConnectionMutation.isPending) return;

    if (currentStep === 'create-portfolios') {
      // SnapTrade flow: connection exists in DB, must delete
      if (activeConnectionId) {
        try {
          await deleteConnectionMutation.mutateAsync(activeConnectionId);
        } catch {
          // Best-effort cleanup
        }
      }
      // Token flow: nothing in DB, just clear memory
      setPendingConnectionName(undefined);
      setPendingCredentials(null);
      setDiscoveredAccountsRaw([]);
      setExistingAccountIds([]);
      setDiscoveredAccounts([]);
      setActiveConnectionId(null);
      setConnectionIsPreExisting(false);
      setSuccessMessage(null);
      // Return to the step we came from
      if (previousStep === 'select-broker') {
        setCurrentStep('select-broker');
        setSelectedBroker(null);
      } else {
        setCurrentStep(previousStep);
      }
    } else if (currentStep === 'enter-token') {
      setCurrentStep('select-broker');
      setSelectedBroker(null);
      setSuccessMessage(null);
    } else if (currentStep === 'portal-connect') {
      setCurrentStep('select-broker');
      setSelectedBroker(null);
      setSuccessMessage(null);
      setPortalConnectionId(null);
      setPortalOpened(false);
      setPortalError(null);
    } else if (
      currentStep === 'select-broker' &&
      brokerDialogReturnTo === 'management'
    ) {
      setBrokerDialogReturnTo(null);
      setShowBrokerManagementDialog(true);
      if (onClose) onClose();
    } else if (onClose) {
      onClose();
    }
  }, [
    currentStep,
    previousStep,
    activeConnectionId,
    brokerDialogReturnTo,
    onClose,
    deleteConnectionMutation,
    setBrokerDialogReturnTo,
    setShowBrokerManagementDialog,
  ]);

  const handleTokenSubmit = async (
    credentials: Record<string, string>,
    connectionName?: string
  ) => {
    if (!selectedBroker) return;
    if (validateConnectionMutation.isPending) return;

    setSuccessMessage(null);

    try {
      // Validate only — no DB writes
      const result = await validateConnectionMutation.mutateAsync({
        brokerCode: selectedBroker,
        credentials,
      });

      trackEvent('finam_token_connect', {
        status: 'success',
        accounts_found: result.accounts.length,
      });

      // Store credentials + name in memory for step 3 Save
      setPendingConnectionName(connectionName);
      setPendingCredentials(credentials);
      setDiscoveredAccountsRaw(result.accounts);
      setExistingAccountIds(result.existingAccountIds ?? []);
      // activeConnectionId stays null — nothing in DB yet
      setPreviousStep('enter-token');
      setCurrentStep('create-portfolios');
      setSuccessMessage(null);
    } catch (error) {
      trackEvent('finam_token_connect', {
        status: 'error',
        accounts_found: 0,
      });

      logger.error(
        'BrokerWizard',
        'Failed to validate broker connection',
        error
      );
      setSuccessMessage(null);
      fireBrokerConnectFailed(selectedBroker);
    }
  };

  const handlePortalOpen = async () => {
    setPortalError(null);
    try {
      const result = await snapTradeRegisterMutation.mutateAsync();
      localStorage.setItem(
        'snaptrade_connection_id',
        String(result.connectionId)
      );
      localStorage.setItem('snaptrade_sync_depth_years', String(SYNC_DEPTH));
      localStorage.setItem('snaptrade_return_path', window.location.pathname);
      window.location.href = result.redirectURI;
    } catch (error) {
      logger.error('BrokerWizard', 'Failed to register SnapTrade', error);
      setPortalError(t('portal.error.registerFailed'));
      fireBrokerConnectFailed('snaptrade');
    }
  };

  const handlePortalCallback = async () => {
    if (!portalConnectionId) return;
    setPortalError(null);
    try {
      const result =
        await snapTradeCallbackMutation.mutateAsync(portalConnectionId);

      const availableBrokers = getAvailableBrokers(t);
      const broker = availableBrokers.find((b) => b.type === selectedBroker);
      const brokerName = broker?.name || t('wizard.brokerFallback');

      trackEvent('snaptrade_portal_connect', {
        status: 'success',
        accounts_found: result.accounts.length,
      });

      const accountsCount = result.accounts.length;
      const accountsText = t('wizard.accounts', { count: accountsCount });
      setSuccessMessage(
        t('wizard.connectionSuccess', { brokerName, accountsText })
      );

      // Transition to portfolio creation step
      setDiscoveredAccounts(result.accounts);
      setActiveConnectionId(result.connection.id);
      setPreviousStep('portal-connect');
      setCurrentStep('create-portfolios');
      setSuccessMessage(null);
    } catch (error) {
      logger.error(
        'BrokerWizard',
        'Failed to process SnapTrade callback',
        error
      );
      setPortalError(t('portal.error.callbackFailed'));
      trackEvent('snaptrade_portal_connect', {
        status: 'error',
        accounts_found: 0,
      });
      fireBrokerConnectFailed('snaptrade');
    }
  };

  /**
   * Save step: create connection + selected accounts + portfolio + board,
   * then finalize sync. For token flow, this is the FIRST DB write.
   * For SnapTrade, connection already exists — just create portfolio.
   */
  const handlePortfoliosSave = useCallback(
    async (formData: PortfolioFormData) => {
      if (!formData.unifiedName.trim()) return;
      setIsSavingPortfolios(true);
      try {
        let connectionId = activeConnectionId;

        // Token flow: create connection + selected accounts now (first DB write)
        if (!connectionId && pendingCredentials && selectedBroker) {
          const result = await createConnectionMutation.mutateAsync({
            brokerCode: selectedBroker,
            connectionName: pendingConnectionName,
            credentials: pendingCredentials,
            selectedAccountIds: Array.from(formData.selectedAccountIds),
          });
          connectionId = result.connection.id;
          setActiveConnectionId(connectionId);
          // When the backend reused an existing connection we must NOT treat it
          // as an orphan on dialog close — otherwise we'd wipe the user's
          // previously saved accounts for this token.
          setConnectionIsPreExisting(result.isExisting === true);
          logger.info(
            'BrokerWizard',
            result.isExisting
              ? 'Accounts merged into existing connection'
              : 'Connection created with selected accounts',
            {
              connectionId,
              accounts: result.accounts.length,
              isExisting: result.isExisting === true,
            }
          );
        }

        if (!connectionId) return;

        // Create default "All assets" portfolio + board
        const { data: wizardBody } = await apiClient.post<{
          created: PortfolioResponse[];
          skipped: string[];
          warnings: string[];
        }>('/portfolio/wizard', {
          defaultPortfolioName: formData.unifiedName,
          portfolios: [],
        });
        for (const p of wizardBody.created ?? []) {
          trackEvent('portfolio_created', {
            portfolio_id: p.id,
            broker_name: ymBrokerNameFromPortfolioFillRule(p.fillRule),
          });
        }
        logger.info('BrokerWizard', 'Default portfolio created');

        // Invalidate queries so pages update without refresh
        queryClient.invalidateQueries({ queryKey: ['portfolios'] });
        queryClient.invalidateQueries({ queryKey: ['boards'] });
        queryClient.invalidateQueries({
          queryKey: brokerQueryKeys.accounts(),
        });

        await finalizeSyncAndClose(connectionId);
      } catch (error) {
        logger.error('BrokerWizard', 'Failed to save', error);
        showErrorToast(t('wizard.createPortfolios.saveError'));
        fireBrokerConnectFailed(selectedBroker);
      } finally {
        setIsSavingPortfolios(false);
      }
    },
    [
      activeConnectionId,
      pendingConnectionName,
      pendingCredentials,
      selectedBroker,
      createConnectionMutation,
      finalizeSyncAndClose,
      queryClient,
      t,
      fireBrokerConnectFailed,
      trackEvent,
    ]
  );

  // Derived values
  const tokenError = (() => {
    if (!validateConnectionMutation.isError) return null;

    const error = validateConnectionMutation.error as Error & {
      response?: { status?: number; data?: { detail?: string } };
    };

    const statusCode = error?.response?.status;

    if (statusCode === 502) return t('wizard.error.serviceUnavailable');

    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;

      if (typeof detail === 'string') {
        if (
          statusCode === 401 ||
          statusCode === 403 ||
          detail.includes('Invalid') ||
          detail.includes('token')
        ) {
          return t('wizard.error.invalidToken');
        }

        return detail;
      }
    }

    return t('wizard.error.generic');
  })();

  /**
   * Clean up orphaned connection when the dialog is being closed
   * (X button or backdrop click). Called by the parent dialog before closing.
   */
  const cleanupOnClose = useCallback(() => {
    if (brokerYmSuccessRef.current) return;
    fireBrokerConnectFailed(selectedBroker);
    // Only clean up connections that were freshly created in this wizard
    // session. Pre-existing connections (reused because the user re-entered
    // the same token) must be left alone — deleting them would wipe previously
    // saved accounts.
    if (activeConnectionId && !connectionIsPreExisting) {
      cleanupOrphanedConnection(activeConnectionId);
    }
  }, [
    activeConnectionId,
    connectionIsPreExisting,
    cleanupOrphanedConnection,
    fireBrokerConnectFailed,
    selectedBroker,
  ]);

  return {
    // Navigation
    currentStep,
    selectedBroker,
    handleBack,
    handleBrokerSelect,
    cleanupOnClose,

    // Token flow
    handleTokenSubmit,
    tokenError,
    isTokenSubmitting: validateConnectionMutation.isPending,

    // Portal flow
    portalOpened,
    isRegistering: snapTradeRegisterMutation.isPending,
    isConfirming: snapTradeCallbackMutation.isPending,
    portalError,
    handlePortalOpen,
    handlePortalCallback,

    // Shared
    successMessage,
    syncDepthYears,
    setSyncDepthYears,

    // Portfolio creation flow
    discoveredAccounts,
    discoveredAccountsRaw,
    existingAccountIds,
    activeConnectionId,
    handlePortfoliosSave,
    isSavingPortfolios,

    // Import dialog
    showImportDialog,
    setShowImportDialog,
  };
}
