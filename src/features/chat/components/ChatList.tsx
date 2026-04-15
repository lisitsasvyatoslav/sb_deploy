import Button from '@/shared/ui/Button';
import ChatItem from '@/features/chat/components/ChatItem';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import { useInfiniteChatsQuery } from '@/features/chat/queries';
import { useTranslation } from '@/shared/i18n/client';
import { logger } from '@/shared/utils/logger';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface ChatListProps {
  activeChatId: number | null;
  onChatSelect: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
}

interface ChatListChat {
  id: number;
  name: string;
  type?: string;
  status?: string | null;
  createdAt: string;
}

interface ChatGroup {
  label: string;
  chats: ChatListChat[];
}

const groupChatsByDate = (
  chats: ChatListChat[],
  labels: { today: string; yesterday: string; earlier: string }
): ChatGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { [key: string]: ChatGroup } = {
    today: { label: labels.today, chats: [] },
    yesterday: { label: labels.yesterday, chats: [] },
    earlier: { label: labels.earlier, chats: [] },
  };

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  sortedChats.forEach((chat) => {
    const chatDate = new Date(chat.createdAt);
    const chatDay = new Date(
      chatDate.getFullYear(),
      chatDate.getMonth(),
      chatDate.getDate()
    );

    if (chatDay.getTime() === today.getTime()) {
      groups.today.chats.push(chat);
    } else if (chatDay.getTime() === yesterday.getTime()) {
      groups.yesterday.chats.push(chat);
    } else {
      groups.earlier.chats.push(chat);
    }
  });

  return Object.values(groups).filter((group) => group.chats.length > 0);
};

const ChatList: React.FC<ChatListProps> = ({
  activeChatId,
  onChatSelect,
  onDeleteChat,
}) => {
  const { t } = useTranslation('chat');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    chatId: number | null;
    chatName: string;
  }>({ open: false, chatId: null, chatName: '' });

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteChatsQuery(50);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Flatten pages into single chat list
  const chatList = useMemo(() => {
    return data?.pages.flat() ?? [];
  }, [data]);

  const groupedChats = useMemo(
    () =>
      groupChatsByDate(chatList, {
        today: t('list.today'),
        yesterday: t('list.yesterday'),
        earlier: t('list.earlier'),
      }),
    [chatList, t]
  );

  const handleDeleteChat = useCallback((chatId: number, chatName: string) => {
    setDeleteDialog({ open: true, chatId, chatName });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialog.chatId) return;

    try {
      await onDeleteChat(deleteDialog.chatId);
      setDeleteDialog({ open: false, chatId: null, chatName: '' });
    } catch (error) {
      logger.error('ChatList', 'Chat deletion error', error);
    }
  }, [deleteDialog, onDeleteChat]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialog({ open: false, chatId: null, chatName: '' });
  }, []);

  // Infinite scroll: load more when scrolled near bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 200;

      if (scrolledToBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto scrollbar-chat px-2 py-2"
      >
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-[13px] text-text-secondary">
              {t('list.loading')}
            </p>
          </div>
        ) : chatList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[13px] text-text-secondary">
              {t('list.noChats')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedChats.map((group) => (
              <div key={group.label}>
                <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </div>
                <div className="flex flex-col">
                  {group.chats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      title={
                        chat.type === 'pipeline'
                          ? `[A] ${chat.name}`
                          : chat.name
                      }
                      isActive={chat.id === activeChatId}
                      onClick={() => onChatSelect(chat.id)}
                      onDelete={() => handleDeleteChat(chat.id, chat.name)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {isFetchingNextPage && (
          <div className="text-center py-4">
            <p className="text-[13px] text-text-secondary">
              {t('list.loadingMore', { defaultValue: 'Loading more...' })}
            </p>
          </div>
        )}
      </div>

      <Modal
        open={deleteDialog.open}
        onOpenChange={(open) => !open && handleCancelDelete()}
        maxWidth="sm"
        zIndex={1600}
      >
        <ModalHeader>
          <h2 className="text-xl font-semibold theme-text-primary">
            {t('list.deleteTitle')}
          </h2>
        </ModalHeader>
        <ModalBody>
          <p className="theme-text-secondary break-words">
            {t('list.deleteConfirm')} &laquo;
            {deleteDialog.chatName && deleteDialog.chatName.length > 60
              ? deleteDialog.chatName.slice(0, 55) + '…'
              : deleteDialog.chatName}
            &raquo;? {t('list.cannotUndo')}
          </p>
        </ModalBody>
        <ModalFooter align="right">
          <Button onClick={handleCancelDelete} variant="secondary" size="md">
            {t('list.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} variant="negative" size="md">
            {t('list.delete')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ChatList;
