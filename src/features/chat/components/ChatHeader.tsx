import Button from '@/shared/ui/Button';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { useAvailableModelsQuery } from '@/features/chat/queries';
import { useTheme } from 'next-themes';
import { Icon } from '@/shared/ui/Icon';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from '@/shared/i18n/client';
import {
  GlowBorder,
  ONBOARDING_SCENES,
  useGlowTarget,
  useOnboardingUIStore,
} from '@/features/onboarding';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  is_active: boolean;
  max_tokens?: number;
  context_window?: number;
}

interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onNewChat: () => void;
  onNewAnalysis?: () => void;
  onShowChatList: () => void;
  /** Whether attachments list is currently shown */
  showAttachmentsList?: boolean;
  /** Number of attachments (shown in title when attachments list is open) */
  attachmentsCount?: number;
  /** Callback when back button is clicked in attachments list mode */
  onBackFromAttachments?: () => void;
  /** Callback to attach file (used when attachments list is shown) */
  onAttachFile?: () => void;
  /** Chat is in fullscreen (expanded) mode */
  isExpanded?: boolean;
  /** Toggle fullscreen (expand/collapse) */
  onToggleExpand?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  onModelChange,
  onNewChat,
  onNewAnalysis,
  onShowChatList,
  showAttachmentsList = false,
  attachmentsCount = 0,
  onBackFromAttachments,
  onAttachFile,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { t } = useTranslation('chat');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const newDropdownRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme: theme } = useTheme();

  const modelSelectorGlow = useGlowTarget('model-selector');
  const modelDropdownGlow = useGlowTarget('model-dropdown');

  const {
    data: models = [],
    isLoading,
    isFetching,
    isError,
  } = useAvailableModelsQuery() as {
    data: AIModel[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
  };

  // In TanStack v5, isLoading is only true on first load with no cache.
  // After an error, isPending=false so isLoading stays false even during refetch.
  // Use isFetching to also show loading state during refetch when models are empty.
  const modelsLoading = isLoading || (isFetching && models.length === 0);

  const selectedModelData =
    models.find((model) => model.id === selectedModel) || models[0];

  const getDisplayModelName = (model?: AIModel) => {
    if (!model) return t('header.loadingModels');
    return model.name;
  };

  // Auto-open model dropdown when onboarding highlights it
  useEffect(() => {
    if (modelDropdownGlow) {
      setIsModelDropdownOpen(true);
    }
  }, [modelDropdownGlow]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
      if (
        newDropdownRef.current &&
        !newDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNewDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModelDropdownOpen(false);
        setIsNewDropdownOpen(false);
      }
    };

    if (isModelDropdownOpen || isNewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModelDropdownOpen, isNewDropdownOpen]);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsModelDropdownOpen(false);
  };

  // Icon color based on theme
  const iconOpacity = theme === 'dark' ? 'opacity-[0.72]' : 'opacity-[0.56]';

  return (
    <div className="h-[53px] px-4 py-4 flex items-center justify-between flex-shrink-0">
      {/* Left side: Back button + Title (attachments mode) OR AI ЧАТ + Model Selector */}
      {showAttachmentsList ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onBackFromAttachments}
            className="p-1 rounded transition-colors hover:bg-whiteinverse-a8"
            title={t('header.back')}
          >
            <Image
              src="/images/arrow-left.svg"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 invert dark:invert-0"
            />
          </button>
          <span className="text-[14px] font-semibold text-text-primary uppercase tracking-wide">
            {t('header.objects', { count: attachmentsCount })}
          </span>
        </div>
      ) : (
        <div className="flex items-center" ref={dropdownRef}>
          {/* Model Selector Dropdown */}
          <div className="relative">
            <GlowBorder
              active={modelSelectorGlow}
              borderRadius={4}
              borderWidth={3}
            >
              <button
                onClick={() => {
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                  // Onboarding: auto-check all model-related steps
                  if (modelSelectorGlow) {
                    const store = useOnboardingUIStore.getState();
                    const si = store.activeSceneIndex;
                    const scene = ONBOARDING_SCENES[si];
                    if (scene) {
                      const next = { ...store.checkedSteps };
                      scene.steps.forEach((s, i) => {
                        if (
                          s.highlightTarget === 'model-selector' ||
                          s.highlightTarget === 'model-dropdown'
                        ) {
                          next[`${si}-${i}`] = true;
                        }
                      });
                      useOnboardingUIStore.setState({ checkedSteps: next });
                    }
                  }
                }}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                disabled={modelsLoading}
              >
                <span className="text-[14px] font-semibold text-text-primary">
                  {t('header.aiChat')}
                </span>
                <span className="text-[14px] font-normal text-text-secondary">
                  {getDisplayModelName(selectedModelData)}
                </span>
                <Icon
                  variant="chevronUp"
                  size={14}
                  className={`text-text-secondary transition-transform ${isModelDropdownOpen ? '' : 'rotate-180'}`}
                />
              </button>
            </GlowBorder>

            {/* Dropdown Menu */}
            {isModelDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <GlowBorder
                  active={modelDropdownGlow}
                  borderRadius={8}
                  borderWidth={3}
                >
                  <div className="min-w-[180px] rounded-[8px] shadow-lg overflow-hidden py-2 bg-surface-low">
                    <div className="max-h-[300px] overflow-auto scrollbar-chat">
                      {modelsLoading ? (
                        <div className="px-3 py-3 text-center">
                          <span className="text-[13px] text-text-secondary">
                            {t('header.loadingModels')}
                          </span>
                        </div>
                      ) : isError ? (
                        <div className="px-3 py-3 text-center">
                          <span className="text-[13px] text-red-500">
                            {t('header.modelsError')}
                          </span>
                        </div>
                      ) : models.length > 0 ? (
                        <>
                          {models.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => handleModelSelect(model.id)}
                              className="w-full px-3 py-2.5 flex items-center justify-between transition-colors text-left bg-transparent hover:bg-overlay-light"
                            >
                              <span className="text-[13px] text-text-primary">
                                {model.name}
                              </span>

                              {selectedModel === model.id && (
                                <CheckIcon
                                  className="text-text-secondary ml-2 flex-shrink-0"
                                  sx={{ fontSize: 16 }}
                                />
                              )}
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-3 text-center">
                          <span className="text-[13px] text-text-secondary">
                            {t('header.noModels')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlowBorder>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right side: Action Icons */}
      <div className="flex items-center gap-3">
        {/* New Chat / Analysis dropdown */}
        <div className="relative" ref={newDropdownRef}>
          <button
            onClick={() => {
              if (showAttachmentsList && onAttachFile) {
                onAttachFile();
              } else if (onNewAnalysis) {
                setIsNewDropdownOpen(!isNewDropdownOpen);
              } else {
                onNewChat();
              }
            }}
            className={`p-1 rounded transition-colors ${iconOpacity} text-text-primary`}
            title={
              showAttachmentsList ? t('header.attachFile') : t('header.newChat')
            }
          >
            <Image
              src="/images/new-chat.svg"
              alt=""
              width={14}
              height={14}
              className="w-[14px] h-[14px] invert dark:invert-0"
            />
          </button>

          {isNewDropdownOpen && onNewAnalysis && (
            <div className="absolute right-0 top-full mt-2 min-w-[160px] rounded-[8px] shadow-lg z-50 overflow-hidden py-2 bg-surface-low">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-none"
                onClick={() => {
                  setIsNewDropdownOpen(false);
                  onNewChat();
                }}
              >
                {t('header.newChat')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-none"
                onClick={() => {
                  setIsNewDropdownOpen(false);
                  onNewAnalysis();
                }}
              >
                {t('header.newAnalysis')}
              </Button>
            </div>
          )}
        </div>

        {/* Chats Folder Icon - hidden when attachments list is shown */}
        {!showAttachmentsList && (
          <button
            onClick={onShowChatList}
            className={`p-1 rounded transition-colors ${iconOpacity} text-text-primary`}
            title={t('header.chatList')}
          >
            <Image
              src="/images/chats-folder.svg"
              alt=""
              width={17}
              height={15}
              className="w-[17px] h-[15px] invert dark:invert-0"
            />
          </button>
        )}

        {/* Fullscreen / Collapse Icon */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className={`p-1 rounded transition-colors ${iconOpacity} text-text-primary`}
            title={isExpanded ? t('header.collapse') : t('header.expand')}
            aria-label={isExpanded ? t('header.collapse') : t('header.expand')}
          >
            <Image
              src="/images/expand.svg"
              alt=""
              width={20}
              height={20}
              className={`w-[20px] h-[20px] invert dark:invert-0 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
