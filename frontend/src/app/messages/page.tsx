'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/Context/AuthContext'
import Image from 'next/image'

interface Friend {
  id: number
  name: string
  userName: string
  profilePictureUrl: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  timestamp: string
  isRead: boolean
}

// Mock data
const mockFriends: Friend[] = [
  {
    id: 1,
    name: 'John Doe',
    userName: 'johndoe',
    profilePictureUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    lastMessage: 'Hey, how are you doing?',
    lastMessageTime: '2h ago',
    unreadCount: 3
  },
  {
    id: 2,
    name: 'Jane Smith',
    userName: 'janesmith',
    profilePictureUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    lastMessage: 'Let me know when you are free',
    lastMessageTime: '1d ago',
    unreadCount: 0
  },
  {
    id: 3,
    name: 'Mike Johnson',
    userName: 'mikej',
    profilePictureUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    lastMessage: 'The project is due tomorrow!',
    lastMessageTime: '3d ago',
    unreadCount: 5
  },
]

const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      receiverId: 0, // your user id
      content: 'Hey there!',
      timestamp: '2023-05-01T10:00:00',
      isRead: true
    },
    {
      id: 2,
      senderId: 0,
      receiverId: 1,
      content: 'Hi John! How are you?',
      timestamp: '2023-05-01T10:05:00',
      isRead: true
    },
    {
      id: 3,
      senderId: 1,
      receiverId: 0,
      content: 'I\'m good, thanks for asking!',
      timestamp: '2023-05-01T10:10:00',
      isRead: true
    },
    {
      id: 4,
      senderId: 1,
      receiverId: 0,
      content: 'Hey, how are you doing?',
      timestamp: '2023-05-02T14:30:00',
      isRead: false
    }
  ],
  2: [
    {
      id: 1,
      senderId: 2,
      receiverId: 0,
      content: 'Hello!',
      timestamp: '2023-05-01T09:00:00',
      isRead: true
    },
    {
      id: 2,
      senderId: 0,
      receiverId: 2,
      content: 'Hi Jane! What\'s up?',
      timestamp: '2023-05-01T09:05:00',
      isRead: true
    },
    {
      id: 3,
      senderId: 2,
      receiverId: 0,
      content: 'Let me know when you are free',
      timestamp: '2023-05-01T09:10:00',
      isRead: true
    }
  ],
  3: [
    {
      id: 1,
      senderId: 3,
      receiverId: 0,
      content: 'Hey, about the project...',
      timestamp: '2023-05-01T08:00:00',
      isRead: true
    },
    {
      id: 2,
      senderId: 0,
      receiverId: 3,
      content: 'Yes, what about it?',
      timestamp: '2023-05-01T08:05:00',
      isRead: true
    },
    {
      id: 3,
      senderId: 3,
      receiverId: 0,
      content: 'The project is due tomorrow!',
      timestamp: '2023-05-01T08:10:00',
      isRead: false
    }
  ]
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [friends, setFriends] = useState<Friend[]>(mockFriends)

  useEffect(() => {
    if (selectedFriend) {
      // In a real app, you would fetch messages for the selected friend
      setMessages(mockMessages[selectedFriend.id] || [])
      
      // Mark messages as read when opening chat
      const updatedFriends = friends.map(friend => {
        if (friend.id === selectedFriend.id) {
          return { ...friend, unreadCount: 0 }
        }
        return friend
      })
      setFriends(updatedFriends)
    }
  }, [selectedFriend])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return

    const newMsg: Message = {
      id: messages.length + 1,
      senderId: 0, // Your user id
      receiverId: selectedFriend.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false
    }

    setMessages([...messages, newMsg])
    setNewMessage('')

    // Update last message in friends list
    const updatedFriends = friends.map(friend => {
      if (friend.id === selectedFriend.id) {
        return {
          ...friend,
          lastMessage: newMessage,
          lastMessageTime: 'Just now'
        }
      }
      return friend
    })
    setFriends(updatedFriends)
  }

  const getProfileImageUrl = (url: string) => {
    if (!url) return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
    return url.startsWith('http') ? url : `https://${url}`
  }

  return (
    <div className="flex h-screen bg-[#121212] text-[#f5f5f5]">
      {/* Sidebar */}
      <div className="w-80 border-r border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.7)] backdrop-blur-sm">
        <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-60px)]">
          {friends.map(friend => (
            <div
              key={friend.id}
              className={`flex items-center p-4 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] ${
                selectedFriend?.id === friend.id ? 'bg-[rgba(197,108,240,0.1)]' : ''
              }`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                <img
                  src={getProfileImageUrl(friend.profilePictureUrl)}
                  alt={friend.name}
                  className="w-full h-full object-cover"
                />
                {friend.unreadCount ? (
                  <div className="absolute -top-1 -right-1 bg-[#c56cf0] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {friend.unreadCount}
                  </div>
                ) : null}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold truncate">{friend.name}</h3>
                  <span className="text-xs text-[#f5f5f5]/70">{friend.lastMessageTime}</span>
                </div>
                <p className="text-sm text-[#f5f5f5]/70 truncate">{friend.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.7)] backdrop-blur-sm flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <img
                  src={getProfileImageUrl(selectedFriend.profilePictureUrl)}
                  alt={selectedFriend.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{selectedFriend.name}</h3>
                <p className="text-xs text-[#f5f5f5]/70">@{selectedFriend.userName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === 0 ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 0
                          ? 'bg-[#c56cf0] rounded-tr-none'
                          : 'bg-[#2d1b3a] rounded-tl-none'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.7)] backdrop-blur-sm">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#2d1b3a] border-none rounded-full px-4 py-3 text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#c56cf0]"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 bg-[#c56cf0] text-white rounded-full p-3 hover:bg-[#a569bd] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#121212]">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#2d1b3a] rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#c56cf0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-[#f5f5f5]/70">
                Choose a friend to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}