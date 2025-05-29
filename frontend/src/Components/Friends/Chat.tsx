'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import * as signalR from '@microsoft/signalr'

interface Message {
  messageId: number
  content: string
  timestamp: string
  senderId: number
  receiverId: number
}

interface Props {
  contactId: number
  contactName?: string
}

const Chat = ({ contactId, contactName }: Props) => {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:5001'

  const fetchMessages = async () => {
    try {
      console.log('Sending message to receiverId:', contactId, 'content length:', newMessage.length);
      const res = await axios.get(`${backendUrl}/api/Messaging/GetMessages`, {
        params: { contactId, page: 1, pageSize: 50 },
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data.messages.reverse())
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const sendMessage = async () => {
  if (!newMessage.trim() || !connectionRef.current || !user) return;

  const messageToSend = {
    messageId: Date.now(), 
    content: newMessage,
    timestamp: new Date().toISOString(),
    senderId: user.userId,
    receiverId: contactId,
  };

  try {
    await connectionRef.current.invoke('SendMessage', contactId, newMessage);
    setMessages(prev => [...prev, messageToSend]); 
    setNewMessage('');
  } catch (err) {
    console.error('Error sending message via SignalR:', err);
  }
};



  const setupSignalRConnection = () => {
    if (!token || !user) return

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:5001'

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/hub/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveMessage', (message: Message) => {
      if (
        (message.senderId === contactId && message.receiverId === user?.userId) ||
        (message.senderId === user?.userId && message.receiverId === contactId)
      ) {
        setMessages(prev => [...prev, message])
      }
    })

    connection.onreconnected(() => setIsConnected(true))
    connection.onclose(() => setIsConnected(false))

    connection.start()
      .then(() => {
        console.log('SignalR connected')
        setIsConnected(true)
      })
      .catch(err => {
        console.error('SignalR connection error:', err)
        setIsConnected(false)
      })

    connectionRef.current = connection
  }

  useEffect(() => {
    if (token && user) {
      fetchMessages()
      setupSignalRConnection()
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
      }
    }
  }, [contactId, token, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Chat Header */}
        

        {/* Chat Container */}
        <div className="bg-glass/10 backdrop-blur-lg rounded-2xl shadow-glow overflow-hidden">
          {/* Messages Area */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-glass/5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-light/50">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.messageId}
                  className={`flex ${
                    msg.senderId === user?.userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm ${
                      msg.senderId === user?.userId
                        ? 'bg-accent/90 text-white ml-auto shadow-glow'
                        : 'bg-glass/20 text-light border border-glass/30'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    <div className={`text-xs mt-2 ${
                      msg.senderId === user?.userId 
                        ? 'text-white/70 text-right' 
                        : 'text-light/50 text-left'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message Input Area */}
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
                  style={{
                    minHeight: '48px',
                    maxHeight: '120px',
                    height: 'auto'
                  }}
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                    />
                  </svg>
                </div>
              </button>
            </div>
            
            {/* Typing indicator placeholder */}
            <div className="mt-2 h-4">
              <p className="text-xs text-light/40">
                Press Shift+Enter for new line, Enter to send
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat