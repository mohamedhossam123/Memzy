'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useReducer, useRef, useState } from 'react'
import axios from 'axios'
import * as signalR from '@microsoft/signalr'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useMediaQuery } from 'react-responsive'

interface Message {
  messageId: number
  content: string
  timestamp: string
  senderId: number
  receiverId: number
  formattedTime?: string
}

interface Props {
  contactId: number
  contactName?: string
}

type MessageAction = 
  | { type: 'add'; payload: Message[] }
  | { type: 'prepend'; payload: Message[] }
  | { type: 'set'; payload: Message[] }
  | { type: 'remove'; payload: number }

const messageReducer = (state: Message[], action: MessageAction): Message[] => {
  switch (action.type) {
    case 'remove':
      return state.filter(msg => msg.messageId !== action.payload)
    case 'add':
      return [...state, ...action.payload]
    case 'prepend':
      return [...action.payload, ...state]
    case 'set':  
      return action.payload
    default:
      return state
  }
}

const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const Chat = ({ contactId }: Props) => {
  const { user, token } = useAuth()
  const [messages, dispatch] = useReducer(messageReducer, [])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const listRef = useRef<List>(null)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:5001'

  const fetchMessages = async (pageNum: number = 1) => {
    try {
      const res = await axios.get(`${backendUrl}/api/Messaging/GetMessages`, {
        params: { contactId, page: pageNum, pageSize: 50 },
        headers: { Authorization: `Bearer ${token}` }
      })

      const fetchedMessages = res.data.messages
      const formatted = fetchedMessages.map((msg: Message) => ({
        ...msg,
        formattedTime: formatTime(msg.timestamp)
      }))
      
      if (pageNum === 1) {
        dispatch({ type: 'set', payload: formatted })
      } else {
        dispatch({ type: 'prepend', payload: formatted })
      }
      
      setHasMore(fetchedMessages.length === 50)
      if (pageNum === 1 && listRef.current && formatted.length > 0) {
        setTimeout(() => {
          listRef.current?.scrollToItem(formatted.length - 1, 'end')
        }, 0)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const loadMoreMessages = () => {
    if (!hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchMessages(nextPage)
  }

  const deleteMessage = async (messageId: number) => {
    try {
      await axios.delete(`${backendUrl}/api/Messaging/DeleteMessage`, {
        params: { messageId },
        headers: { Authorization: `Bearer ${token}` }
      })
      dispatch({ type: 'remove', payload: messageId })
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }

  const sendMessage = async () => {
    if (isSending || !newMessage.trim() || !connectionRef.current || !user) return

    setIsSending(true)
    try {
      await connectionRef.current.invoke('SendMessage', contactId, newMessage)
      dispatch({
        type: 'add',
        payload: [{
          messageId: Date.now(),
          content: newMessage,
          timestamp: new Date().toISOString(),
          formattedTime: formatTime(new Date().toISOString()),
          senderId: user.userId,
          receiverId: contactId
        }]
      })
      setNewMessage('')
      setTimeout(() => {
        if (listRef.current && messages.length > 0) {
          listRef.current.scrollToItem(messages.length, 'end')
        }
      }, 0)
    } catch (err) {
      console.error('Error sending message via SignalR:', err)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (!token || !user) return
    dispatch({ type: 'set', payload: [] })
    setPage(1)
    setHasMore(true)

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/hub/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build()

    const handleReceiveMessage = (message: Message) => {
      if (
        (message.senderId === contactId && message.receiverId === user.userId) ||
        (message.senderId === user.userId && message.receiverId === contactId)
      ) {
        dispatch({
          type: 'add',
          payload: [{
            ...message,
            formattedTime: formatTime(message.timestamp)
          }]
        })
        setTimeout(() => {
          if (listRef.current && messages.length > 0) {
            listRef.current.scrollToItem(messages.length, 'end')
          }
        }, 0)
      }
    }

    connection.on('ReceiveMessage', handleReceiveMessage)
    connection.onreconnected(() => setIsConnected(true))
    connection.onclose(() => setIsConnected(false))

    connection
      .start()
      .then(() => {
        setIsConnected(true)
        fetchMessages(1)
      })
      .catch(err => {
        console.error('SignalR connection error:', err)
        setIsConnected(false)
      })

    connectionRef.current = connection

    return () => {
      connection.off('ReceiveMessage', handleReceiveMessage)
      connection.stop()
    }
  }, [contactId, token, user])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const msg = messages[index]
    const isOwn = msg.senderId === user?.userId
    const [showDelete, setShowDelete] = useState(false)
    const touchTimerRef = useRef<NodeJS.Timeout | null>(null)

    const handleTouchStart = () => {
      if (!isOwn) return
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
      await deleteMessage(msg.messageId)
      setShowDelete(false)
    }

    return (
      <div 
        style={style} 
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative group`}
        onMouseEnter={() => isOwn && setShowDelete(true)}
        onMouseLeave={() => isOwn && setShowDelete(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm relative ${
            isOwn
              ? 'bg-accent/90 text-white ml-auto shadow-glow'
              : 'bg-glass/20 text-light border border-glass/30'
          }`}
        >
          {isOwn && showDelete && (
  <button
    onClick={handleDelete}
    className={`absolute top-1 right-1 z-10 flex items-center gap-1 text-xs rounded-full shadow-lg
      ${isMobile 
        ? 'bg-red-600 hover:bg-red-700 text-white px-3 py-1' 
        : 'bg-transparent hover:bg-red-600 text-red-400 hover:text-white p-1'
      } 
      transition-all duration-150`}
    aria-label="Delete message"
    title="Delete message"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
    {isMobile && <span>Delete</span>}
  </button>
)}

          
          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
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
                  itemCount={messages.length}
                  itemSize={100}
                  width={width}
                  ref={listRef}
                  onScroll={({ scrollOffset }) => {
                    if (scrollOffset < 100 && hasMore) {
                      loadMoreMessages()
                    }
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