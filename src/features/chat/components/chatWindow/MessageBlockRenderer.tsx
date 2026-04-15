import React from 'react';
import ThinkingIndicator from '@/features/chat/components/ThinkingIndicator';
import ToolProgressIndicator from '@/features/chat/components/ToolProgressIndicator';
import UserMessageBubble from '@/features/chat/components/UserMessageBubble';
import MessageActionBar, {
  AttachmentInfo,
} from '@/features/chat/components/MessageActionBar';
import MessageImagePreviews, {
  ImagePreview,
} from '@/features/chat/components/MessageImagePreviews';
import LlmResponseMessage from '@/features/chat/components/LlmResponseMessage';
import { AttachmentListMode } from '@/features/chat/components/Attachments';
import type { ToolProgressEvent } from '@/services/api/chat';
import PipelineMessageBlock from '@/features/chat/components/pipeline/PipelineMessageBlock';
import {
  WelcomeAckBlock,
  SurveyQaBlock,
  SurveyFeedbackBlock,
} from '@/features/chat/components/chatWindow/DisplayBlockCards';
import {
  getMessageWidgetContent,
  isMessageHaveWidget,
} from '@/features/chat/components/chatWindow/messageWidgets';
import StrategySurveyResults from '@/features/chat/components/chatWindow/strategySurvey/StrategySurveyResults';
import type { DisplayBlock } from '@/features/chat/utils/buildDisplayBlocks';
import type { Message } from '@/types';

const MAX_VISIBLE_IMAGES = 4;

function truncateContent(content: string, maxLength = 150): string {
  if (content.length <= maxLength) return content;
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (
    (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
  );
}

export interface MessageBlockRendererProps {
  block: DisplayBlock;
  messages: Message[];
  isLoading: boolean;
  toolProgress: Record<string, ToolProgressEvent>;
  editingMessageId: number | null;
  editedContent: string;
  setEditedContent: (content: string) => void;
  handleStartEdit: (messageId: number, content: string) => void;
  handleAcceptEdit: (messageId: number) => void;
  handleDeclineEdit: () => void;
  buildAttachments: (msg: Message, isEditing: boolean) => AttachmentInfo[];
  getImagePreviews: (msg: Message) => ImagePreview[];
  handleOpenAttachmentsList: (msg: Message, mode: AttachmentListMode) => void;
  getSourcesCount: (msg: Message) => number;
  getNearestUserMessage: (currentIndex: number) => Message | null;
  hidePipelinePlans?: boolean;
  onThumbsUp: ((messageId: number) => void) | null;
  onThumbsDown: ((messageId: number) => void) | null;
  onCopy: ((messageId: number, content: string) => void) | null;
  onRefresh: ((messageId: number) => void) | null;
  onAddToBoard:
    | ((messageId: number, prompt: string | null, response: string) => void)
    | null;
  openAttachmentsList: unknown;
  showLlmActions: boolean;
  showEditToggleProp: boolean;
  renderActions: (
    messageId: number,
    prompt: string | null,
    response: string
  ) => React.ReactNode;
}

export function renderBlock(props: MessageBlockRendererProps): React.ReactNode {
  const {
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
  } = props;

  if (block.type === 'strategy_results') {
    return (
      <StrategySurveyResults
        onThumbsUp={onThumbsUp}
        onThumbsDown={onThumbsDown}
        onCopy={onCopy}
        onRefresh={onRefresh}
        onAddToBoard={onAddToBoard}
        showLlmActions={showLlmActions}
      />
    );
  }
  if (block.type === 'survey_footer') {
    return <div className="pb-6">{block.content}</div>;
  }
  if (block.type === 'pipeline_progress') {
    return <div className="pb-4">{block.content}</div>;
  }
  if (block.type === 'welcome_ack') {
    return <WelcomeAckBlock msg={block.msg} />;
  }
  if (block.type === 'survey_qa') {
    return <SurveyQaBlock msg={block.msg} />;
  }
  if (block.type === 'survey_feedback') {
    return <SurveyFeedbackBlock msg={block.msg} />;
  }
  if (block.type === 'user_pair') {
    const { userMsg: msg, assistantMsg: nextMessage } = block;
    const hasAssistantResponse = !!nextMessage;
    const hasContent =
      hasAssistantResponse &&
      !!nextMessage!.content &&
      nextMessage!.content.trim() !== '';
    const lastMsgIndex = hasAssistantResponse
      ? block.userIndex + 1
      : block.userIndex;
    const isLastUserMessage = lastMsgIndex >= messages.length - 1;
    const isStreamingResponse = isLastUserMessage && isLoading;
    const isEditing = editingMessageId === msg.id;
    const attachments = buildAttachments(msg, isEditing);
    const imagePreviews = getImagePreviews(msg);
    const shouldShowImagePreviews = imagePreviews.length > 0;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-end flex-col gap-1">
          {shouldShowImagePreviews && (
            <MessageImagePreviews
              images={imagePreviews}
              maxVisible={MAX_VISIBLE_IMAGES}
            />
          )}
          <div className="flex flex-col gap-[4px] items-end">
            <UserMessageBubble
              content={isEditing ? editedContent : msg.content}
              messageType={msg.messageType}
              isEditing={isEditing}
              onContentChange={setEditedContent}
            />
            <MessageActionBar
              attachments={attachments}
              isEditing={isEditing}
              onEditClick={() => handleStartEdit(msg.id, msg.content)}
              onAcceptEdit={() => handleAcceptEdit(msg.id)}
              onDeclineEdit={handleDeclineEdit}
              showEditToggle={
                showEditToggleProp &&
                !isStreamingResponse &&
                showLlmActions !== false
              }
            />
          </div>
        </div>
        {hasAssistantResponse ? (
          <div className="flex flex-col gap-2">
            {isStreamingResponse && Object.keys(toolProgress).length > 0 ? (
              <ToolProgressIndicator toolProgress={toolProgress} />
            ) : nextMessage!.toolCalls && nextMessage!.toolCalls.length > 0 ? (
              <ToolProgressIndicator
                toolProgress={Object.fromEntries(
                  nextMessage!.toolCalls.map((tc) => [tc.type, tc])
                )}
              />
            ) : null}
            {!hidePipelinePlans &&
              nextMessage!.plans &&
              nextMessage!.plans.length > 0 && (
                <PipelineMessageBlock plans={nextMessage!.plans} />
              )}
            {hasContent ? (
              <>
                <LlmResponseMessage
                  content={
                    nextMessage!.truncated
                      ? truncateContent(nextMessage!.content)
                      : nextMessage!.content
                  }
                  truncated={nextMessage!.truncated}
                  sourcesCount={getSourcesCount(msg)}
                  onThumbsUp={
                    onThumbsUp ? () => onThumbsUp(nextMessage!.id) : undefined
                  }
                  onThumbsDown={
                    onThumbsDown
                      ? () => onThumbsDown(nextMessage!.id)
                      : undefined
                  }
                  onSourcesClick={
                    openAttachmentsList
                      ? () => handleOpenAttachmentsList(msg, 'sent')
                      : undefined
                  }
                  onCopy={
                    onCopy
                      ? () => onCopy(nextMessage!.id, nextMessage!.content)
                      : undefined
                  }
                  onRefresh={
                    onRefresh ? () => onRefresh(nextMessage!.id) : undefined
                  }
                  onAddToBoard={
                    onAddToBoard
                      ? () =>
                          onAddToBoard(
                            nextMessage!.id,
                            msg.content,
                            nextMessage!.content
                          )
                      : undefined
                  }
                  showActions={
                    !isStreamingResponse &&
                    showLlmActions &&
                    !nextMessage!.truncated
                  }
                />
                {isMessageHaveWidget(nextMessage) && (
                  <div className="max-w-[90%]">
                    {getMessageWidgetContent(nextMessage)}
                  </div>
                )}
                {!isStreamingResponse &&
                  renderActions(
                    nextMessage!.id,
                    msg.content,
                    nextMessage!.content
                  )}
              </>
            ) : isStreamingResponse ? (
              <ThinkingIndicator />
            ) : null}
          </div>
        ) : isStreamingResponse ? (
          <div className="flex flex-col gap-2">
            {Object.keys(toolProgress).length > 0 && (
              <ToolProgressIndicator toolProgress={toolProgress} />
            )}
            <ThinkingIndicator />
          </div>
        ) : null}
      </div>
    );
  }

  // assistant_only block
  const userMessage = getNearestUserMessage(block.index);
  const prompt = userMessage?.content ?? null;
  return (
    <div className="flex flex-col gap-3">
      {block.msg.toolCalls && block.msg.toolCalls.length > 0 && (
        <ToolProgressIndicator
          toolProgress={Object.fromEntries(
            block.msg.toolCalls.map((tc) => [tc.type, tc])
          )}
        />
      )}
      {!hidePipelinePlans && block.msg.plans && block.msg.plans.length > 0 && (
        <PipelineMessageBlock plans={block.msg.plans} />
      )}
      {block.msg.content && block.msg.content.trim() !== '' && (
        <>
          <LlmResponseMessage
            content={
              block.msg.truncated
                ? truncateContent(block.msg.content)
                : block.msg.content
            }
            truncated={block.msg.truncated}
            sourcesCount={userMessage ? getSourcesCount(userMessage) : 0}
            onThumbsUp={onThumbsUp ? () => onThumbsUp(block.msg.id) : undefined}
            onThumbsDown={
              onThumbsDown ? () => onThumbsDown(block.msg.id) : undefined
            }
            onSourcesClick={
              userMessage && openAttachmentsList
                ? () => handleOpenAttachmentsList(userMessage, 'sent')
                : undefined
            }
            onCopy={
              onCopy ? () => onCopy(block.msg.id, block.msg.content) : undefined
            }
            onRefresh={onRefresh ? () => onRefresh(block.msg.id) : undefined}
            onAddToBoard={
              onAddToBoard
                ? () => onAddToBoard(block.msg.id, prompt, block.msg.content)
                : undefined
            }
            showActions={showLlmActions && !block.msg.truncated}
          />
          {isMessageHaveWidget(block.msg) && (
            <div className="max-w-[90%]">
              {getMessageWidgetContent(block.msg)}
            </div>
          )}
          {renderActions(block.msg.id, prompt, block.msg.content)}
        </>
      )}
    </div>
  );
}
