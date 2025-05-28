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
  const socketRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

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
  const ws = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_API_URL!.replace(/^http/, 'ws')}/ws`)
  socketRef.current = ws
  ws.onmessage = (event) => {
    const message: Message = JSON.parse(event.data)
    if (
      (message.senderId === contactId && message.receiverId === user?.userId) ||
      (message.senderId === user?.userId && message.receiverId === contactId)
    ) {
      setMessages(prev => [...prev, message])
    }
  }

  ws.onclose = () => {
    console.log('WebSocket closed, retrying...')
    setTimeout(setupWebSocket, 3000)
  }
}


  useEffect(() => {
    fetchMessages()
    setupWebSocket()

    return () => {
      socketRef.current?.close()
    }
  }, [contactId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[80vh] border rounded-md overflow-hidden">
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
          className="bg-blue-600 text-white px-4 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
