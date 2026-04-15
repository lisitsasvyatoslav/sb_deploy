import React, { useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChatStore } from '@/stores/chatStore';
import { useMessageFileCache } from '@/features/chat/hooks/useMessageFileCache';
import { useMessageEditing } from '@/features/chat/hooks/useMessageEditing';
import { useMessageAttachmentBuilders } from '@/features/chat/hooks/useMessageAttachmentBuilders';
import {
  buildDisplayBlocks,
  type DisplayBlock,
} from '@/features/chat/utils/buildDisplayBlocks';
import {
  renderBlock,
  type MessageBlockRendererProps,
} from '@/features/chat/components/chatWindow/MessageBlockRenderer';
import type { Message } from '@/types';

export type { DisplayBlock };

const ESTIMATE_ROW_HEIGHT = 120;
const VIRTUAL_OVERSCAN = 5;

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

interface ChatMessageListProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  messages: Message[];
  isLoading: boolean;
  renderActions: (
    messageId: number,
    prompt: string | null,
    response: string
  ) => React.ReactNode;
  onEditMessage?: (messageId: number, newContent: string) => void;
  surveyFooter?: React.ReactNode;
  /** Optional pipeline progress rendered at the end of the virtual list */
  pipelineProgress?: React.ReactNode;
  hidePipelinePlans?: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  scrollContainerRef,
  messages,
  isLoading,
  renderActions,
  onEditMessage,
  surveyFooter,
  pipelineProgress,
  hidePipelinePlans,
}) => {
  const toolProgress = useChatStore((state) => state.toolProgress);
  const openAttachmentsList = useChatStore(
    (state) => state.openAttachmentsList
  );
  const onThumbsUp = useChatStore((state) => state.llmActions.onThumbsUp);
  const onThumbsDown = useChatStore((state) => state.llmActions.onThumbsDown);
  const onCopy = useChatStore((state) => state.llmActions.onCopy);
  const onRefresh = useChatStore((state) => state.llmActions.onRefresh);
  const onAddToBoard = useChatStore((state) => state.llmActions.onAddToBoard);
  const showLlmActions = useChatStore((state) => state.llmActions.showActions);
  const showEditToggleProp = useChatStore(
    (state) => state.llmActions.showEditToggle
  );

  const fileInfoCache = useMessageFileCache(messages);

  const {
    editingMessageId,
    editedContent,
    setEditedContent,
    handleStartEdit,
    handleAcceptEdit,
    handleDeclineEdit,
  } = useMessageEditing(onEditMessage);

  const {
    buildAttachments,
    getImagePreviews,
    handleOpenAttachmentsList,
    getSourcesCount,
  } = useMessageAttachmentBuilders({ fileInfoCache, openAttachmentsList });

  const getNearestUserMessage = useCallback(
    (currentIndex: number): Message | null => {
      for (let i = currentIndex - 1; i >= 0; i -= 1) {
        const candidate = messages[i];
        if (candidate?.role === 'user' && candidate.content?.trim()) {
          return candidate;
        }
      }
      return null;
    },
    [messages]
  );

  const blocks = useMemo(() => {
    const messageBlocks = buildDisplayBlocks(messages);
    if (pipelineProgress) {
      messageBlocks.push({
        type: 'pipeline_progress',
        content: pipelineProgress,
      });
    }
    if (surveyFooter) {
      messageBlocks.push({ type: 'survey_footer', content: surveyFooter });
    }
    return messageBlocks;
  }, [messages, surveyFooter, pipelineProgress]);

  const rowVirtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ESTIMATE_ROW_HEIGHT,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => {
      const block = blocks[index];
      if (block.type === 'strategy_results') return `strat-${block.msg.id}`;
      if (block.type === 'survey_footer') return 'survey-footer';
      if (block.type === 'welcome_ack') return `welcome-${block.msg.id}`;
      if (block.type === 'survey_qa') return `sqa-${block.msg.id}`;
      if (block.type === 'survey_feedback') return `sfb-${block.msg.id}`;
      if (block.type === 'user_pair') return `pair-${block.userMsg.id}`;
      if (block.type === 'assistant_only') return `asst-${block.msg.id}`;
      return index;
    },
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const renderBlockForVirtualItem = useCallback(
    (block: DisplayBlock): React.ReactNode => {
      const props: MessageBlockRendererProps = {
        block,
        messages,
        isLoading,
        toolProgress,
        editingMessageId,
        editedContent,
        setEditedContent,
        handleStartEdit,
        handleAcceptEdit,
        handleDeclineEdit,
        buildAttachments,
        getImagePreviews,
        handleOpenAttachmentsList,
        getSourcesCount,
        getNearestUserMessage,
        hidePipelinePlans,
        onThumbsUp,
        onThumbsDown,
        onCopy,
        onRefresh,
        onAddToBoard,
        openAttachmentsList,
        showLlmActions,
        showEditToggleProp,
        renderActions,
      };
      return renderBlock(props);
    },
    [
      messages,
      isLoading,
      toolProgress,
      editingMessageId,
      editedContent,
      buildAttachments,
      getImagePreviews,
      handleStartEdit,
      handleAcceptEdit,
      handleDeclineEdit,
      handleOpenAttachmentsList,
      getNearestUserMessage,
      hidePipelinePlans,
      onThumbsUp,
      onThumbsDown,
      onCopy,
      onRefresh,
      onAddToBoard,
      openAttachmentsList,
      renderActions,
      showLlmActions,
      showEditToggleProp,
      setEditedContent,
      getSourcesCount,
    ]
  );

  if (blocks.length === 0) {
    return null;
  }

  // When the survey is the only block, render outside the virtualizer
  // so the parent flex container can center it vertically
  if (blocks.length === 1 && blocks[0].type === 'survey_footer') {
    return <div className="w-full">{blocks[0].content}</div>;
  }

  return (
    <div className="w-full relative" style={{ height: totalSize }}>
      {virtualItems.map((virtualRow) => {
        const block = blocks[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="absolute top-0 left-0 w-full pb-6"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {renderBlockForVirtualItem(block)}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ChatMessageList);
