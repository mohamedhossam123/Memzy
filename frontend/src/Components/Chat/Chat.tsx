// src/Components/Chat/Chat.tsx
'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useReducer, useRef, useState, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useMediaQuery } from 'react-responsive'
import { fetchMessages, deleteGroupMessage, fetchGroupMessages } from '@/lib/api/messaging/client'
import {
  createConnection,
  startConnection,
  setupMessageHandler,
  sendMessageViaSignalR,
  sendGroupMessageViaSignalR,
} from '@/lib/api/messaging/signalR'
import {
  Message,
  PendingMessage,
  ExtendedMessage,
  messageReducer,
  formatTime,
} from '@/lib/api/messaging/type'
import * as signalR from '@microsoft/signalr';
import React from 'react'; 

interface Props {
  chatId: number
  chatName: string
  chatType: 'individual' | 'group'
  groupProfilePictureUrl?: string;
}

const Chat: React.FC<Props> = ({ chatId, chatType }) => {
  const { user, token } = useAuth()
  const [messages, dispatch] = useReducer(messageReducer, [])
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const listRef = useRef<List>(null)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  useEffect(() => {
    if (initialLoadDone && listRef.current) {
      listRef.current.scrollToItem(listRef.current.props.itemCount - 1, 'end');
      setInitialLoadDone(false);
    }
  }, [initialLoadDone, messages.length]);

  const loadMessages = useCallback(async (pageNum = 1) => {
    if (!token) {
      return;
    }
    try {
      let fetchedMessages: Message[];
      let moreMessages: boolean;

      if (chatType === 'group') {
        const result = await fetchGroupMessages(token, chatId, pageNum, 50);
        fetchedMessages = result.messages;
        moreMessages = result.hasMore;
      } else {
        const result = await fetchMessages(token, chatId, pageNum, 50);
        fetchedMessages = result.messages;
        moreMessages = result.hasMore;
      }

      const formatted: ExtendedMessage[] = fetchedMessages.map((msg) => ({
        ...msg,
        messageId: msg.id,
        formattedTime: formatTime(msg.timestamp),
        senderUserName: msg.senderUserName || 'Unknown User'
      }));

      if (pageNum === 1) {
        dispatch({ type: 'set', payload: formatted });
        setInitialLoadDone(true);
      } else {
        dispatch({ type: 'prepend', payload: formatted });
      }
      setHasMore(moreMessages);

      if (pageNum === 1 && formatted.length > 0) {
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollToItem(listRef.current.props.itemCount - 1, 'end');
          }
        }, 0);
      }
    } catch (err) {
    }
  }, [token, chatId, chatType, dispatch]);

  const loadMoreMessages = () => {
    if (!hasMore) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    loadMessages(nextPage);
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!token || !user) {
      return;
    }

    const messageToDelete = messages.find((m) => m.messageId === messageId);
    if (!messageToDelete) {
      return;
    }

    if (messageToDelete.senderId !== user.userId) {
      return;
    }

    try {
      dispatch({ type: 'remove', payload: messageId });
      await deleteGroupMessage(token, messageId);
    } catch (err) {
      if (messageToDelete) {
        dispatch({ type: 'add', payload: [messageToDelete] });
      }
    }
  };

  const sendMessage = async () => {
    if (isSending || !newMessage.trim() || !connectionRef.current || !user) {
      return;
    }

    setIsSending(true);
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const now = new Date().toISOString();

    const pendingMessage: PendingMessage = {
      messageId: -1,
      content: newMessage,
      timestamp: now,
      formattedTime: formatTime(now),
      senderId: user.userId,
      senderUserName: user.userName,
      [chatType === 'group' ? 'groupId' : 'receiverId']: chatId,
      isPending: true,
      tempId,
    };

    setPendingMessages((prev) => [...prev, pendingMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      if (chatType === 'individual') {
        await sendMessageViaSignalR(connectionRef.current, chatId, messageContent, tempId);
      } else {
        await sendGroupMessageViaSignalR(connectionRef.current, chatId, messageContent, tempId);
      }
    } catch (err) {
      setPendingMessages((prev) => prev.filter((m) => m.tempId !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    dispatch({ type: 'set', payload: [] });
    setPendingMessages([]);
    setPage(1);
    setHasMore(true);

    const connection = createConnection(token);
    connectionRef.current = connection;

    const handleReceiveAnyMessage = (message: Message & { tempId?: string }) => {
      const isRelevant =
        (chatType === 'individual' &&
          ((message.senderId === chatId && message.receiverId === user.userId) ||
            (message.senderId === user.userId && message.receiverId === chatId))) ||
        (chatType === 'group' && message.groupId === chatId);

      if (!isRelevant) {
        return;
      }

      if (message.senderId === user.userId && message.tempId) {
        setPendingMessages((prev) => prev.filter((p) => p.tempId !== message.tempId));
      }

      const messageToAdd: ExtendedMessage = {
        ...message,
        messageId: message.id,
        formattedTime: formatTime(message.timestamp),
        senderUserName: message.senderUserName || 'Unknown User'
      };

      dispatch({ type: 'add', payload: [messageToAdd] });

      setTimeout(() => {
        if (listRef.current) {
          const newTotalItemCount = listRef.current.props.itemCount;
          listRef.current.scrollToItem(newTotalItemCount - 1, 'end');
        }
      }, 0);
    };

    const cleanup = setupMessageHandler(connection, handleReceiveAnyMessage, handleReceiveAnyMessage);

    connection.onreconnected(() => {
      setIsConnected(true);
    });
    connection.onclose(() => {
      setIsConnected(false);
    });

    startConnection(connection).then(success => {
      setIsConnected(success);
      if (success) {
        loadMessages(1);
      } else {
      }
    });

    return () => {
      cleanup();
      connection.stop();
    };
  }, [chatId, chatType, token, user, loadMessages]);


  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const allMessages: (ExtendedMessage | PendingMessage)[] = [...messages, ...pendingMessages]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const msg = allMessages[index];

    if (!msg) {
      return null;
    }

    const isOwn = msg.senderId === user?.userId;
    const isPending = 'isPending' in msg && msg.isPending;
    const [showDelete, setShowDelete] = useState(false);
    const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleTouchStart = () => {
      if (!isOwn || isPending) return;
      touchTimerRef.current = setTimeout(() => {
        setShowDelete(true);
      }, 500);
    };

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };

    const handleDelete = async () => {
      if (isPending || !('messageId' in msg) || typeof msg.messageId !== 'number' || msg.messageId === -1) {
        return;
      }
      await handleDeleteMessage(msg.messageId);
      setShowDelete(false);
    };

    const senderDisplayName = msg.senderUserName || msg.senderName || 'Unknown User';
    const profilePictureUrl = 'profilePictureUrl' in msg ? msg.profilePictureUrl : null;
    const hasValidProfilePicture = profilePictureUrl && typeof profilePictureUrl === 'string' && profilePictureUrl.trim() !== '';

    return (
      <div
        style={style}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative group p-1`}
        onMouseEnter={() => isOwn && !isPending && setShowDelete(true)}
        onMouseLeave={() => isOwn && setShowDelete(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!isOwn && (
          <div className="flex-shrink-0 mr-2 mt-1">
            {hasValidProfilePicture ? (
              <img
                src={profilePictureUrl}
                alt={senderDisplayName}
                className="w-8 h-8 rounded-full object-cover border border-glass/30"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border border-glass/30">
                <span className="text-white font-bold text-xs">
                  {senderDisplayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm relative ${
            isOwn
              ? `bg-accent/90 text-white ml-auto shadow-glow ${isPending ? 'opacity-70' : ''}`
              : 'bg-glass/20 text-light border border-glass/30'
          }`}
        >
          {isOwn && showDelete && !isPending && (
            <button
              onClick={handleDelete}
              className={`absolute top-1 right-1 z-10 text-xs rounded-full transition-all duration-150 ${
                isMobile
                  ? 'bg-red-600 hover:bg-red-700 text-white px-3 py-1'
                  : 'bg-transparent hover:bg-red-600 text-red-400 hover:text-white p-1'
              }`}
            >
              🗑️ {isMobile && <span>Delete</span>}
            </button>
          )}

          <div className="whitespace-pre-wrap break-words">
            {!isOwn && chatType === 'group' && (
              <p className="text-xs font-semibold text-light/80 mb-1">
                {senderDisplayName}
              </p>
            )}
            {msg.content}
            {isPending && <span className="text-xs opacity-60 ml-2">Sending...</span>}
          </div>
          <div className={`text-xs mt-2 ${isOwn ? 'text-white/70 text-right' : 'text-light/50 text-left'}`}>
            {msg.formattedTime}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-dark to-darker">
      <div className="flex-grow overflow-hidden p-4">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={messages.length + pendingMessages.length}
              itemSize={120}
              width={width}
              ref={listRef}
              onScroll={({ scrollOffset }) => {
                if (scrollOffset < 100 && hasMore && messages.length > 0) {
                  loadMoreMessages();
                }
              }}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>

      <div className="border-t border-glass/30 p-4 bg-glass/5">
        <div className="flex gap-3 items-end">
          <textarea
            className="w-full bg-glass/20 border border-glass/30 rounded-xl px-4 py-3 text-light placeholder-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none backdrop-blur-sm transition-all duration-200"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md self-end ${
              !isConnected || !newMessage.trim()
                ? 'bg-glass/20 text-light/50 cursor-not-allowed border border-glass/30'
                : 'bg-accent hover:bg-accent/80 text-white shadow-glow hover:shadow-accent/50'
            }`}
            onClick={sendMessage}
            disabled={!isConnected || !newMessage.trim()}
          >
            <div className="flex items-center gap-2">
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;