import Image from 'next/image';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import AnimatedSendButton from './SendButton';
import StopButton from './StopButton';
import { ChipLink, ChipsGroup } from './Attachments';
import TickerIcon from '@/shared/ui/TickerIcon';
import ChatInputRichContent, {
  ChatInputRichContentRef,
  generateChipId,
  extractDomain,
} from './ChatInputRichContent';
import { InlineChipData } from './InlineChip';
import './ChatInput.css'; // Minimal CSS for pseudo-elements only
import {
  FileAttachment,
  isImageMimeType,
  isImageFilename,
} from '../hooks/useChatFileAttachments';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { useChatStore } from '@/stores/chatStore';
import { useChatAttachedTrades } from '../hooks/useChatAttachedTrades';

export interface Attachment {
  id: number | string;
  type: 'card' | 'file';
  name: string;
}

export interface ChatInputRef {
  insertChip: (chipData: InlineChipData) => void;
  clear: () => void;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  onAttachClick?: () => void;
  /** Attached files */
  attachedFiles?: (Attachment & Partial<FileAttachment>)[];
  /** Callback to remove an attachment */
  onRemoveAttachment?: (id: number | string, type: 'card' | 'file') => void;
  /** Minimal mode - hides attachments, model settings (for welcome page) */
  minimal?: boolean;
  /** Show disclaimer above input (defaults to true) */
  showDisclaimer?: boolean;
  /** Extra class for input container (e.g., rounded-t-none) */
  containerClassName?: string;
  /** Callback when attachment chips are clicked to open attachments list */
  onAttachmentsChipClick?: () => void;
  /** Callback when file is pasted */
  onPasteFile?: (file: File) => void;
  /** Inline chips in the text input */
  inlineChips?: InlineChipData[];
  /** Callback when inline chips change */
  onInlineChipsChange?: (chips: InlineChipData[]) => void;
  /** Callback for microphone button click */
  onMicClick?: () => void;
}

const ChatInput: React.FC<
  ChatInputProps & { ref?: React.Ref<ChatInputRef> }
> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  isLoading = false,
  placeholder,
  onAttachClick,
  attachedFiles = [],
  onRemoveAttachment,
  minimal = false,
  showDisclaimer = true,
  containerClassName = '',
  onAttachmentsChipClick,
  onPasteFile,
  inlineChips = [],
  onInlineChipsChange,
  onMicClick: _onMicClick,
  ref,
}) => {
  const { t } = useTranslation('chat');
  const stopGeneration = useChatStore((state) => state.stopGeneration);
  const removeAllTrades = useChatStore((state) => state.removeAllTrades);
  const {
    trades: attachedTrades,
    labelType: tradesLabelType,
    selectedCount: tradesSelectedCount,
  } = useChatAttachedTrades();
  const richContentRef = useRef<ChatInputRichContentRef>(null);

  // Expose insertChip and clear methods via ref
  useImperativeHandle(
    ref,
    () => ({
      insertChip: (chipData: InlineChipData) => {
        richContentRef.current?.insertChip(chipData);
      },
      clear: () => {
        richContentRef.current?.clear();
      },
    }),
    []
  );
  const [, setIsFocused] = useState(false);
  // Track inline chips locally when parent doesn't manage them
  const [localInlineChips, setLocalInlineChips] =
    useState<InlineChipData[]>(inlineChips);

  // Sync local state when parent prop changes (e.g., after deletion from attachments list)
  useEffect(() => {
    setLocalInlineChips((prev) => {
      // Find chips that were removed (in local but not in prop)
      const removedChips = prev.filter(
        (localChip) =>
          !inlineChips.some((propChip) => propChip.id === localChip.id)
      );

      // Remove each chip from the editor
      removedChips.forEach((chip) => {
        richContentRef.current?.removeChip(chip.id);
      });

      return inlineChips;
    });
  }, [inlineChips]);

  const handleContentChange = useCallback(
    (text: string, chips: InlineChipData[]) => {
      onChange(text);
      onInlineChipsChange?.(chips);
      setLocalInlineChips(chips);
    },
    [onChange, onInlineChipsChange]
  );

  const handleSend = useCallback(() => {
    const hasAnything =
      value.trim() ||
      attachedFiles.length > 0 ||
      attachedTrades.length > 0 ||
      localInlineChips.length > 0;
    if (hasAnything && !disabled && !isLoading) {
      onSend();
      // Clear the rich content editor after sending
      richContentRef.current?.clear();
    }
  }, [
    value,
    attachedFiles.length,
    attachedTrades.length,
    localInlineChips.length,
    disabled,
    isLoading,
    onSend,
  ]);

  const handlePasteUrl = useCallback((url: string) => {
    // Insert as link chip
    richContentRef.current?.insertChip({
      id: generateChipId(),
      type: 'link',
      label: extractDomain(url),
      url,
    });
  }, []);

  const hasText = value.trim().length > 0;

  // Get image attachments for preview
  const imageAttachments = attachedFiles.filter(
    (file) => isImageMimeType(file.mimeType) || isImageFilename(file.name)
  );

  // Cards and non-image files are now inline chips, so only count images for file attachments
  const hasAttachments =
    imageAttachments.length > 0 ||
    attachedTrades.length > 0 ||
    localInlineChips.length > 0;
  // Use localInlineChips for hasContent since parent may not sync inlineChips prop
  const hasContent = hasText || hasAttachments;
  const canSend = hasContent && !disabled && !isLoading;
  const totalAttachmentCount =
    imageAttachments.length + attachedTrades.length + localInlineChips.length;

  return (
    <div className="relative w-full">
      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="text-center py-1 px-[10px] text-[6px] font-normal uppercase text-text-secondary tracking-[0.02em]">
          {t('disclaimer.shortUpper')}
        </div>
      )}

      {/* Main input container */}
      <div
        className={`
          chat-input-container
          relative bg-chat-input-bg border-t border-border-medium overflow-hidden
          ${disabled ? 'opacity-60' : ''}
          ${containerClassName}
        `}
      >
        <div className="relative z-[1]">
          {/* Image previews - above the text area (max 4 shown, rest in attachments list) */}
          {!minimal && imageAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-[9px] pt-[10px]">
              {imageAttachments.slice(0, 4).map((file) => (
                <div
                  key={file.id}
                  className="relative w-[48px] h-[48px] rounded-[2px] overflow-hidden bg-bg-card group"
                >
                  {file.previewUrl && (
                    <Image
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-[48px] h-[48px] object-cover"
                      width={48}
                      height={48}
                    />
                  )}
                  <button
                    type="button"
                    className="absolute top-0.5 left-0.5 w-[12px] h-[12px] rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none p-0 cursor-pointer"
                    onClick={() => onRemoveAttachment?.(file.id, 'file')}
                    aria-label="Remove image"
                  >
                    <Image
                      src="/images/close.svg"
                      alt={t('input.deleteAlt')}
                      width={12}
                      height={12}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Top chips area — ticker chips from portfolio + other attachment chips */}
          {!minimal && attachedTrades.length > 0 && (
            <div
              className={`flex items-center gap-2 px-2 pt-2.5 ${disabled || isLoading ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
            >
              {/* Portfolio tickers: 1 ticker = individual ChipLink, 2+ = grouped */}
              {attachedTrades.length === 1 && tradesSelectedCount <= 1 ? (
                <ChipLink
                  type="chart"
                  label={attachedTrades[0].ticker}
                  customIcon={
                    <TickerIcon
                      symbol={attachedTrades[0].ticker}
                      securityId={attachedTrades[0].securityId}
                      size={12}
                      className="w-4 h-4 flex items-center justify-center"
                    />
                  }
                  onClick={onAttachmentsChipClick}
                  onRemove={removeAllTrades}
                />
              ) : (
                <ChipLink
                  type="group"
                  label={t(`attachments.tradesCount.${tradesLabelType}`, {
                    count: tradesSelectedCount,
                  })}
                  onClick={onAttachmentsChipClick}
                  onRemove={removeAllTrades}
                />
              )}
            </div>
          )}

          {/* Text input area */}
          <div
            className={`px-[9px] pt-[10px] ${disabled || isLoading ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
          >
            <ChatInputRichContent
              ref={richContentRef}
              value={value}
              onChange={handleContentChange}
              onSend={handleSend}
              onFocusChange={setIsFocused}
              placeholder={placeholder ?? t('input.placeholder')}
              disabled={disabled || isLoading}
              chips={inlineChips}
              onPasteFile={onPasteFile}
              onPasteUrl={handlePasteUrl}
              hasAttachments={hasAttachments}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-[8px] pt-[6px] pb-[15px] min-h-[57px]">
            {/* Left side spacer */}
            <div className="flex items-center" />

            {/* Right side - Attach, Attachments count, Mic/Send */}
            <div className="flex items-center">
              {/* Attachments count chip - opens attachments list */}
              {!minimal && hasAttachments && (
                <ChipsGroup
                  count={totalAttachmentCount}
                  label={t('attachments.added')}
                  onClick={onAttachmentsChipClick}
                />
              )}

              {/* Attach button */}
              {onAttachClick && (
                <button
                  type="button"
                  onClick={onAttachClick}
                  disabled={disabled || isLoading}
                  className="w-9 h-9 flex items-center justify-center bg-transparent border-none rounded-[2px] cursor-pointer text-text-secondary transition-colors hover:bg-overlay-light hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('input.attachTitle')}
                >
                  <Icon variant="attachement" size={20} />
                </button>
              )}

              {/* Mic or Send button */}
              <AnimatePresence mode="wait">
                {
                  isLoading && stopGeneration ? (
                    <StopButton
                      key="stop-button"
                      onClick={stopGeneration}
                      label={t('input.stopGeneration')}
                    />
                  ) : hasText || hasAttachments ? (
                    <AnimatedSendButton
                      key="send-button"
                      onClick={handleSend}
                      loading={isLoading}
                      disabled={!canSend}
                      label={t('input.send')}
                    />
                  ) : null /* mic button temporarily hidden */
                }
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
