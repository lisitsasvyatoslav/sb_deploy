import CircularProgress from '@mui/material/CircularProgress';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/shared/ui/Icon';
import { InputBadge } from '@/shared/ui/InputBadge';
import { useTranslation } from '@/shared/i18n/client';
import { useLocale } from '@/shared/i18n/locale-provider';
import { formatTime } from '@/shared/utils/timeUtils';
import type { TranslateFn } from '@/shared/i18n/settings';
import {
  useStrategyQuery,
  useUpdateStrategyMutation,
  useDeploymentsQuery,
  deploymentQueryKeys,
} from '@/features/strategy/queries';
import { PublishToMarketplaceModal } from '@/features/strategy/components/PublishToMarketplaceModal';
import { useDevStrategyCatalog } from '@/shared/hooks/useDevStrategyCatalog';
import {
  boardQueryKeys,
  usePositionedCreateCardMutation,
} from '@/features/board/queries';
import { deploymentApi } from '@/services/api/deployments';
import { edgeApi } from '@/services/api/edges';
import { useBoardStore } from '@/stores/boardStore';
import { useDeploymentNavStore } from '@/stores/deploymentNavStore';
import { showErrorToast } from '@/shared/utils/toast';
import type { DeploySSEEvent } from '@/types';

const MAX_PROMPT_CHARS = 4000;

interface StrategyContentProps {
  cardId: number;
  strategyId?: number;
  title?: string;
  labelColor?: string;
  createdAt?: string;
}

const STRATEGY_BADGE_COLOR = '#4DCFE7';

export const StrategyContent: React.FC<StrategyContentProps> = ({
  cardId,
  strategyId,
  title,
  labelColor,
  createdAt,
}) => {
  const boardId = useBoardStore((state) => state.boardId);
  const { t } = useTranslation('board');
  const { t: tCommon } = useTranslation('common');
  const { locale } = useLocale();

  const time = useMemo(
    () =>
      createdAt
        ? formatTime(createdAt, tCommon as TranslateFn, locale)
        : undefined,
    [createdAt, tCommon, locale]
  );
  const { data: strategy, isLoading: isStrategyLoading } =
    useStrategyQuery(strategyId);
  const updateMutation = useUpdateStrategyMutation();
  const queryClient = useQueryClient();
  const createCardMutation = usePositionedCreateCardMutation();
  const { nodes } = useBoardStore();
  const setDeploying = useDeploymentNavStore((s) => s.setDeploying);

  const [promptText, setPromptText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const isFeatureEnabled = useDevStrategyCatalog();
  const { data: deployments } = useDeploymentsQuery(strategyId);
  const hasDeployments = (deployments?.length ?? 0) > 0;
  const showPublishButton = isFeatureEnabled && hasDeployments;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const pendingValueRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (strategy && !initializedRef.current) {
      setPromptText(strategy.promptText || '');
      initializedRef.current = true;
    }
  }, [strategy]);

  const flushPrompt = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
      // Flush pending save instead of discarding
      if (strategyId && pendingValueRef.current !== null) {
        updateMutation.mutate({
          id: strategyId,
          data: { promptText: pendingValueRef.current },
        });
        pendingValueRef.current = null;
      }
    }
  }, [strategyId, updateMutation]);

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setPromptText(value);

      flushPrompt();

      pendingValueRef.current = value;
      debounceRef.current = setTimeout(() => {
        if (strategyId) {
          updateMutation.mutate({
            id: strategyId,
            data: { promptText: value },
          });
          pendingValueRef.current = null;
        }
      }, 800);
    },
    [strategyId, updateMutation, flushPrompt]
  );

  useEffect(() => {
    return () => {
      flushPrompt();
    };
  }, [flushPrompt]);

  const findExistingIdeaCard = useCallback(() => {
    return nodes.find(
      (n) =>
        n.data?.type === 'trading_idea' &&
        (n.data?.meta as Record<string, unknown> | undefined)?.strategyId ===
          strategyId
    );
  }, [nodes, strategyId]);

  const ensureIdeaCard = useCallback(async () => {
    if (!boardId) return;
    const existing = findExistingIdeaCard();
    if (existing) return;

    const strategyNode = nodes.find((n) => n.id === `card-${cardId}`);
    const x = (strategyNode?.position?.x ?? 0) + 550;
    const y = strategyNode?.position?.y ?? 0;

    try {
      const newCard = await createCardMutation.mutateAsync({
        boardId,
        title: t('tradingIdea.title'),
        content: '',
        type: 'trading_idea',
        meta: { strategyId },
        x: Math.round(x),
        y: Math.round(y),
        zIndex: 0,
        width: 700,
        height: 520,
      });

      await edgeApi.createEdge({
        sourceCardId: cardId,
        targetCardId: newCard.id,
        edgeType: 'strategy_ideas',
        meta: {
          sourceHandle: 'output_signal_0',
          targetHandle: 'input_signal_0',
        },
      });

      // Cancel stale in-flight edges request (triggered by createCard invalidation)
      // so refetchQueries actually hits the server and picks up the new edge
      await queryClient.cancelQueries({ queryKey: boardQueryKeys.edges() });
      await queryClient.refetchQueries({ queryKey: boardQueryKeys.edges() });
      await queryClient.invalidateQueries({
        queryKey: boardQueryKeys.boardFull(boardId),
      });
    } catch {
      // Non-critical — card creation failure shouldn't block deployment
    }
  }, [
    findExistingIdeaCard,
    nodes,
    cardId,
    boardId,
    strategyId,
    createCardMutation,
    queryClient,
    t,
  ]);

  const handleRun = useCallback(async () => {
    if (!promptText.trim() || !strategyId) return;

    flushPrompt();
    if (promptText.trim()) {
      await updateMutation.mutateAsync({
        id: strategyId,
        data: { promptText },
      });
    }

    setIsRunning(true);

    try {
      setDeploying(strategyId, true);
      await ensureIdeaCard();

      await deploymentApi.deploy(strategyId, (event: DeploySSEEvent) => {
        switch (event.type) {
          case 'deployment_completed':
            queryClient.invalidateQueries({
              queryKey: deploymentQueryKeys.byStrategy(strategyId),
            });
            break;
          case 'deployment_failed':
            showErrorToast(event.error || t('strategy.runError'));
            break;
        }
      });
    } catch {
      showErrorToast(t('strategy.runError'));
    } finally {
      setDeploying(strategyId, false);
      setIsRunning(false);
    }
  }, [
    promptText,
    strategyId,
    queryClient,
    ensureIdeaCard,
    flushPrompt,
    updateMutation,
    t,
    setDeploying,
  ]);

  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  if (isStrategyLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full p-[20px]">
        <CircularProgress
          size={24}
          sx={{ color: 'var(--blackinverse-a100)' }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full nodrag"
      onMouseDown={stopPropagation}
      onPointerDown={stopPropagation}
      onDoubleClick={stopPropagation}
    >
      {/* Inner card-header: title badge + time */}
      <div className="flex items-center justify-between px-spacing-8 pt-spacing-8 pb-spacing-4 shrink-0 card-drag-handle">
        <InputBadge
          label={title || t('fallback.newStrategy')}
          labelColor={labelColor || STRATEGY_BADGE_COLOR}
        />
        {time && (
          <span className="font-normal text-14 leading-20 tracking-tight-1 text-blackinverse-a56 whitespace-nowrap">
            {time}
          </span>
        )}
      </div>

      {/* Settings area: label + textarea */}
      <div className="flex-1 flex flex-col gap-spacing-4 px-spacing-8 py-spacing-4 overflow-hidden">
        {/* Prompt label + character counter */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-12 font-medium leading-16 text-blackinverse-a56">
            {t('strategy.promptLabel')}
          </span>
          <span className="text-12 leading-16 text-blackinverse-a32">
            {promptText.length}/{MAX_PROMPT_CHARS}
          </span>
        </div>

        {/* Textarea */}
        <textarea
          className={`flex-1 w-full resize-none border-none outline-none rounded-radius-4 p-spacing-8 text-12 leading-[16px] text-blackinverse-a100 placeholder:text-blackinverse-a56 nodrag nowheel transition-colors ${
            isRunning
              ? 'bg-transparent cursor-not-allowed opacity-100'
              : 'bg-blackinverse-a6'
          }`}
          placeholder={t('strategy.promptPlaceholder')}
          value={promptText}
          onChange={handlePromptChange}
          onKeyDown={stopPropagation}
          onMouseDown={stopPropagation}
          onPointerDown={stopPropagation}
          maxLength={MAX_PROMPT_CHARS}
          disabled={isRunning}
        />
      </div>

      {/* Button container: Backtest + Run */}
      <div className="flex items-center gap-spacing-8 px-spacing-8 pb-spacing-8 pt-spacing-4 shrink-0">
        <button
          type="button"
          className="flex justify-center items-center gap-2 px-spacing-12 py-spacing-6 rounded-radius-2 text-13 font-medium transition-colors bg-blackinverse-a8 text-blackinverse-a56 cursor-not-allowed opacity-60"
          disabled
          title={t('toast.comingSoon')}
        >
          {t('strategy.backtest')}
        </button>

        <button
          type="button"
          className={`flex justify-center flex-1 items-center gap-2 px-spacing-12 py-spacing-6 rounded-radius-2 text-13 font-medium transition-colors
            disabled:cursor-not-allowed
            ${
              isRunning
                ? 'bg-blackinverse-a8 backdrop-blur-[12px]'
                : 'bg-mind-accent text-white hover:bg-color-accent disabled:opacity-[0.35]'
            }`}
          disabled={!promptText.trim() || isRunning || !strategyId}
          onClick={handleRun}
        >
          {isRunning ? (
            <Icon
              variant="loaderBlock"
              size={20}
              className="animate-spin [animation-direction:reverse] dark:brightness-0 dark:invert"
            />
          ) : (
            <>
              <span className="text-14">&#9654;</span>
              {t('strategy.run')}
            </>
          )}
        </button>
      </div>

      {showPublishButton && (
        <div className="flex items-center px-spacing-8 pb-spacing-8 shrink-0">
          <button
            type="button"
            className="flex justify-center w-full items-center gap-2 px-[16px] py-[6px] rounded-[2px] text-13 font-medium transition-colors bg-blackinverse-a8 text-blackinverse-a72 hover:bg-blackinverse-a12 hover:text-blackinverse-a100"
            onClick={() => setIsPublishModalOpen(true)}
          >
            {t('publishToMarketplace.publishButton', { ns: 'common' })}
          </button>
        </div>
      )}

      {strategy && (
        <PublishToMarketplaceModal
          open={isPublishModalOpen}
          onOpenChange={setIsPublishModalOpen}
          strategyId={strategy.id}
          strategyName={strategy.name}
          strategyDescription={strategy.description}
        />
      )}
    </div>
  );
};
