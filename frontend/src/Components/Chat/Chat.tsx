'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useReducer, useRef, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useMediaQuery } from 'react-responsive'
import {
  fetchMessages,
  deleteMessage
} from '@/lib/api/messaging/client'
import {
  createConnection,
  startConnection,
  setupMessageHandler,
  sendMessageViaSignalR
} from '@/lib/api/messaging/signalR'
import {
  Message,
  PendingMessage,
  ExtendedMessage,
  messageReducer,
  formatTime
} from '@/lib/api/messaging/type'

interface Props {
  contactId: number
  contactName?: string
}

const Chat = ({ contactId }: Props) => {
  const { user, token } = useAuth()
  const [messages, dispatch] = useReducer(messageReducer, [])
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const listRef = useRef<List>(null)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  const loadMessages = async (pageNum = 1) => {
    if (!token) return

    try {
      const { messages: fetchedMessages, hasMore: moreMessages } = await fetchMessages(
        token,
        contactId,
        pageNum,
        50
      )

      const formatted = fetchedMessages.map((msg) => ({
        ...msg,
        formattedTime: formatTime(msg.timestamp)
      }))

      if (pageNum === 1) {
        dispatch({ type: 'set', payload: formatted })
      } else {
        dispatch({ type: 'prepend', payload: formatted })
      }

      setHasMore(moreMessages)

      if (pageNum === 1 && formatted.length > 0) {
        setTimeout(() => {
          listRef.current?.scrollToItem(formatted.length - 1, 'end')
        }, 0)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }

  const loadMoreMessages = () => {
    if (!hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    loadMessages(nextPage)
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!token || !user) return

    try {
      dispatch({ type: 'remove', payload: messageId })
      await deleteMessage(token, messageId)
    } catch (err) {
      console.error('Error deleting message:', err)
      const messageToRestore = messages.find((m) => m.messageId === messageId)
      if (messageToRestore) {
        dispatch({ type: 'add', payload: [messageToRestore] })
      }
    }
  }

  const sendMessage = async () => {
    if (isSending || !newMessage.trim() || !connectionRef.current || !user) return

    setIsSending(true)
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const now = new Date().toISOString()

    const pendingMessage: PendingMessage = {
      messageId: -1,
      content: newMessage,
      timestamp: now,
      formattedTime: formatTime(now),
      senderId: user.userId,
      receiverId: contactId,
      isPending: true,
      tempId
    }

    console.log('Adding pending message:', pendingMessage);
    setPendingMessages((prev) => [...prev, pendingMessage])
    const messageContent = newMessage
    setNewMessage('')

    try {
      await sendMessageViaSignalR(connectionRef.current, contactId, messageContent, tempId)
      console.log('Message sent successfully via SignalR');
    } catch (err) {
      console.error('Failed to send:', err)
      setPendingMessages((prev) => prev.filter((m) => m.tempId !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (!token || !user) return
    dispatch({ type: 'set', payload: [] })
    setPendingMessages([])
    setPage(1)
    setHasMore(true)

    const connection = createConnection(token)

    const handleReceiveMessage = (message: Message & { tempId?: string }) => {
      const isRelevant =
        (message.senderId === contactId && message.receiverId === user.userId) ||
        (message.senderId === user.userId && message.receiverId === contactId)

      if (!isRelevant) {
        console.log('❌ Message not relevant, ignoring');
        return;
      }

      if (message.senderId === user.userId) {
        console.log('🔄 This is our own message, removing from pending');
        setPendingMessages((prev) => {
          console.log('📝 Current pending messages before filtering:', prev);
          
          if (message.tempId) {
            const filtered = prev.filter((p) => p.tempId !== message.tempId);
            console.log('✅ Filtered by tempId:', filtered);
            return filtered;
          } else {
            const filtered = prev.filter(
              (p) => {
                const contentMatch = p.content.trim() === message.content.trim();
                const receiverMatch = p.receiverId === message.receiverId;
                const shouldRemove = contentMatch && receiverMatch;
                
                console.log(`🔍 Checking pending message:`, {
                  pendingContent: p.content.trim(),
                  receivedContent: message.content.trim(),
                  pendingReceiverId: p.receiverId,
                  messageReceiverId: message.receiverId,
                  contentMatch,
                  receiverMatch,
                  shouldRemove
                });
                
                return !shouldRemove;
              }
            );
            return filtered;
          }
        })
      } else {
        console.log('📨 This is a message from contact, not removing pending');
      }

      dispatch({
        type: 'add',
        payload: [{
          ...message,
          formattedTime: formatTime(message.timestamp)
        }]
      })

      setTimeout(() => {
        const total = messages.length + pendingMessages.length + 1
        if (listRef.current && total > 0) {
          listRef.current.scrollToItem(total - 1, 'end')
        }
      }, 0)
    }

    const cleanup = setupMessageHandler(connection, handleReceiveMessage)

    connection.onreconnected(() => setIsConnected(true))
    connection.onclose(() => setIsConnected(false))

    startConnection(connection).then(success => {
      setIsConnected(success)
      if (success) loadMessages(1)
    })

    connectionRef.current = connection

    return () => {
      cleanup()
      connection.stop()
    }
  }, [contactId, token, user])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const allMessages: ExtendedMessage[] = [...messages, ...pendingMessages]
    const msg = allMessages[index]
    const isOwn = msg.senderId === user?.userId
    const isPending = 'isPending' in msg && msg.isPending
    const [showDelete, setShowDelete] = useState(false)
    const touchTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleTouchStart = () => {
      if (!isOwn || isPending) return
      touchTimerRef.current = setTimeout(() => {
        setShowDelete(true)
      }, 500)
    }

    const handleTouchEnd = () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current)
      }
    }

    const handleDelete = async () => {
      if (isPending) return
      await handleDeleteMessage(msg.messageId)
      setShowDelete(false)
    }

    return (
      <div
        style={style}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative group`}
        onMouseEnter={() => isOwn && !isPending && setShowDelete(true)}
        onMouseLeave={() => isOwn && setShowDelete(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
            {msg.content}
            {isPending && <span className="text-xs opacity-60 ml-2">Sending...</span>}
          </div>
          <div className={`text-xs mt-2 ${isOwn ? 'text-white/70 text-right' : 'text-light/50 text-left'}`}>
            {msg.formattedTime}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-glass/10 backdrop-blur-lg rounded-2xl shadow-glow overflow-hidden">
          <div className="h-[60vh] overflow-y-auto p-6 bg-gradient-to-b from-transparent to-glass/5">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={messages.length + pendingMessages.length}
                  itemSize={100}
                  width={width}
                  ref={listRef}
                  onScroll={({ scrollOffset }) => {
                    if (scrollOffset < 100 && hasMore) loadMoreMessages()
                  }}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>

          <div className="border-t border-glass/30 p-6 bg-glass/5">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  className="w-full bg-glass/20 border border-glass/30 rounded-xl px-4 py-3 text-light placeholder-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none backdrop-blur-sm transition-all duration-200"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px', height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = target.scrollHeight + 'px'
                  }}
                />
              </div>
              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md ${
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
      </div>
    </div>
  )
}

export default Chat