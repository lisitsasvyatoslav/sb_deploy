import FilePreview from '@/features/board/components/FilePreview';
import { CardContextMenu } from '@/features/board/components/CardContextMenu';
import { TradingIdeaDeploymentNav } from '@/features/board/components/cardContent/TradingIdeaOuterHeader';
import PortColumn from '@/features/board/components/nodes/PortColumn';
import { CardNodeBody } from '@/features/board/components/nodes/CardNodeBody';
import { useCardNodeResize } from '@/features/board/components/nodes/hooks/useCardNodeResize';
import { useCardNodeTitle } from '@/features/board/components/nodes/hooks/useCardNodeTitle';
import { useCardNodeActions } from '@/features/board/components/nodes/hooks/useCardNodeActions';
import { useCardHeader } from '@/features/board/hooks/useCardHeader';
import { useTranslation } from '@/shared/i18n/client';
import { PortConfig } from '@/features/board/ports/types';
import { useUpdateCardMutation } from '@/features/board/queries';
import { useBoardStore } from '@/stores/boardStore';
import { Card } from '@/types';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useEdges } from '@xyflow/react';

interface CardNodeData extends Card {
  showFilePreview?: boolean; // Controlled externally to show file preview
  onCloseFilePreview?: () => void; // Callback to close file preview
  dimensions?: {
    width: number;
    height: number;
  };
  showAiResponseFooter?: boolean;
  isContentLoading?: boolean;
  /** Precomputed port config for widget / strategy cards */
  resolvedPorts?: PortConfig;
  [key: string]: unknown;
}

const RESIZE_HANDLE_CLASS = 'card-resize-handle';

/** Narrowed mutate signature shared with extracted hooks */
type MutateCardFn = (vars: {
  id: number;
  data: Partial<Card>;
  boardId?: number;
  skipInvalidate?: boolean;
}) => void;

const CardNode: React.FC<{
  data: CardNodeData;
  id: string;
  selected?: boolean;
}> = memo(({ data, id, selected }) => {
  const showFilePreview = data.showFilePreview || false;
  const setNodes = useBoardStore((state) => state.setNodes);
  const updateCardMutation = useUpdateCardMutation();
  const mutateCardRef = useRef<MutateCardFn>(updateCardMutation.mutate);
  mutateCardRef.current = updateCardMutation.mutate;
  const { t } = useTranslation('board');

  // ─── Extracted hooks ────────────────────────────────────────
  const { size, handleResizeStart, handleResize, handleResizeStop } =
    useCardNodeResize({ data, id, setNodes, mutateCardRef });

  const {
    editTitle,
    setEditTitle,
    titleFocusTrigger,
    setTitleFocusTrigger,
    handleTitleConfirm,
  } = useCardNodeTitle({ data, id, setNodes, mutateCardRef });

  const {
    contextMenuPos,
    setContextMenuPos,
    handleMoreClick,
    handleAskAI,
    handleDelete,
    colorWidget,
  } = useCardNodeActions({ data, id, setNodes, mutateCardRef });

  // ─── Header ─────────────────────────────────────────────────
  const { headerProps } = useCardHeader(
    data,
    'card',
    { onTitleChange: handleTitleConfirm, onMore: handleMoreClick },
    {
      value: editTitle,
      onChange: setEditTitle,
      onConfirm: handleTitleConfirm,
      focusTrigger: titleFocusTrigger,
    },
    colorWidget
  );

  // ─── Type flags ─────────────────────────────────────────────
  const isWidget = data.type === 'widget';
  const isInteractiveContent = isWidget || data.type === 'chart';
  const isStrategy = data.type === 'strategy';
  const isTradingIdea = data.type === 'trading_idea';
  const isAiScreener = isWidget && data.meta?.widgetType === 'ai_screener';
  const isTickerAdder = isWidget && data.meta?.widgetType === 'ticker_adder';
  const isNewsFeed = isWidget && data.meta?.widgetType === 'news_feed';

  // ─── Selection ──────────────────────────────────────────────
  const selectedCount = useBoardStore(
    (state) => state.nodes.filter((n) => n.selected).length
  );
  const showIndividualBorder = selected && selectedCount <= 1;

  // ─── Port system ────────────────────────────────────────────
  const resolvedPorts = data.resolvedPorts;
  const hasPorts =
    resolvedPorts &&
    (resolvedPorts.inputs.length > 0 || resolvedPorts.outputs.length > 0);

  const rfEdges = useEdges();
  const connectedHandleIds = useMemo(() => {
    if (!hasPorts) return undefined;
    const ids = new Set<string>();
    const nodeId = `card-${data.id}`;
    for (const edge of rfEdges) {
      if (edge.source === nodeId && edge.sourceHandle)
        ids.add(edge.sourceHandle);
      if (edge.target === nodeId && edge.targetHandle)
        ids.add(edge.targetHandle);
    }
    return ids;
  }, [hasPorts, rfEdges, data.id]);

  // ─── Mouse event guards ─────────────────────────────────────
  const handleWrapperMouseDown = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isResizeHandle = target.closest(`.${RESIZE_HANDLE_CLASS}`);

    if (isResizeHandle) {
      if (event.button !== 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      return;
    }

    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  const handleWrapperContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  // ─── Trading idea nav ───────────────────────────────────────
  const tradingIdeaNav = isTradingIdea ? (
    <TradingIdeaDeploymentNav
      strategyId={data.meta?.strategyId as number | undefined}
    />
  ) : undefined;

  // ─── Render branches ───────────────────────────────────────

  if (isTickerAdder) {
    return (
      <div
        onMouseDown={handleWrapperMouseDown}
        onContextMenu={handleWrapperContextMenu}
        className="inline-flex items-stretch"
      >
        <div className="card-drag-handle card-select-zone flex flex-col items-center justify-center rounded-[4px] bg-background-bgthin________ cursor-pointer w-[104px] h-[104px] pt-1 px-1 pb-3">
          <span className="text-[20px] leading-none text-blackinverse-a56">
            +
          </span>
          <span className="text-[13px] leading-tight text-blackinverse-a56 text-center mt-1">
            {t('cardNode.addTicker')}
          </span>
        </div>
        {resolvedPorts && resolvedPorts.outputs.length > 0 && (
          <PortColumn
            direction="output"
            ports={resolvedPorts.outputs}
            connectedHandleIds={connectedHandleIds}
            hideIndicator
          />
        )}
      </div>
    );
  }

  const cardBody = (
    <CardNodeBody
      size={size}
      headerProps={headerProps}
      isStrategy={isStrategy}
      isTradingIdea={isTradingIdea}
      isWidget={isWidget}
      isInteractiveContent={isInteractiveContent}
      isTickerAdder={isTickerAdder}
      isNewsFeed={isNewsFeed}
      isAiScreener={isAiScreener}
      data={data}
      showIndividualBorder={!!showIndividualBorder}
      colorWidget={colorWidget}
      handleResizeStart={handleResizeStart}
      handleResize={handleResize}
      handleResizeStop={handleResizeStop}
      handleMoreClick={handleMoreClick}
      handleAskAI={handleAskAI}
      setTitleFocusTrigger={setTitleFocusTrigger}
      tradingIdeaNav={tradingIdeaNav}
    />
  );

  return (
    <>
      {hasPorts ? (
        <div
          onMouseDown={handleWrapperMouseDown}
          onContextMenu={handleWrapperContextMenu}
          className="inline-flex items-stretch"
        >
          {resolvedPorts.inputs.length > 0 && (
            <PortColumn
              direction="input"
              ports={resolvedPorts.inputs}
              connectedHandleIds={connectedHandleIds}
            />
          )}
          <div className="inline-flex flex-col">{cardBody}</div>
          {resolvedPorts.outputs.length > 0 && (
            <PortColumn
              direction="output"
              ports={resolvedPorts.outputs}
              connectedHandleIds={connectedHandleIds}
              useArrowOutputs
            />
          )}
        </div>
      ) : (
        <div
          onMouseDown={handleWrapperMouseDown}
          onContextMenu={handleWrapperContextMenu}
          data-selected={selected || undefined}
          className="card-legacy-wrapper relative inline-flex flex-col"
        >
          {cardBody}
        </div>
      )}

      {/* FilePreview for files */}
      <FilePreview
        open={showFilePreview}
        card={data}
        onClose={() => data.onCloseFilePreview?.()}
      />

      {contextMenuPos && (
        <CardContextMenu
          cardId={data.id}
          cardType={data.type}
          anchorPosition={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
          onAskAI={handleAskAI}
          onDelete={handleDelete}
        />
      )}
    </>
  );
});

CardNode.displayName = 'CardNode';

export default CardNode;
