'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

interface Message {
  messageId: number
  content: string
  timestamp: string
  senderId: number
  receiverId: number
}

interface Props {
  contactId: number
}

const Chat = ({ contactId }: Props) => {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)


  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/Messaging/GetMessages`, {
        params: { contactId, page: 1, pageSize: 50 },
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data.messages.reverse()) 
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      await axios.post('/api/Messaging/SendMessage', {
        receiverId: contactId,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const setupWebSocket = () => {
    if (!token || !user) {
      console.log('No token or user available for WebSocket connection')
      return
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close()
    }

    try {
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:5001'

const wsUrl = backendUrl.replace(/^http/, (match) => match === 'http' ? 'ws' : 'wss') + `/ws?access_token=${encodeURIComponent(token)}`
      
      console.log('Attempting WebSocket connection to:', wsUrl.replace(token, '[TOKEN]'))
      
      const ws = new WebSocket(wsUrl)
      socketRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected successfully')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data)
          console.log('Received WebSocket message:', message)
          
          // Only add messages relevant to current conversation
          if (
            (message.senderId === contactId && message.receiverId === user?.userId) ||
            (message.senderId === user?.userId && message.receiverId === contactId)
          ) {
            setMessages(prev => [...prev, message])
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        
        // Only attempt to reconnect if it wasn't a normal closure and we still have auth
        if (event.code !== 1000 && token && user) {
          console.log('WebSocket closed unexpectedly, attempting to reconnect in 3 seconds...')
          reconnectTimeoutRef.current = setTimeout(() => {
            setupWebSocket()
          }, 3000)
        }
      }

    } catch (error) {
      console.error('Error setting up WebSocket:', error)
      setIsConnected(false)
    }
  }

  useEffect(() => {
    if (token && user) {
      fetchMessages()
      setupWebSocket()
    }

    return () => {
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      // Close WebSocket connection
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting')
      }
    }
  }, [contactId, token, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[80vh] border rounded-md overflow-hidden">
      {/* Connection status indicator */}
      <div className={`px-2 py-1 text-xs text-center ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.messageId}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.senderId === user?.userId ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-300 text-black'
            }`}
          >
            <div>{msg.content}</div>
            <div className="text-xs text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={!isConnected}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat