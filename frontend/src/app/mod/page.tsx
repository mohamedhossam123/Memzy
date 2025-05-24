// components/ModeratorDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/Context/AuthContext'
import { useSearch } from '@/Context/SearchContext'

interface PendingPost {
  id: number
  author?: string
  userName?: string
  content: string
  mediaType?: 'image' | 'video' | null
  mediaUrl?: string | null
  timestamp: string
  humorType: string
  likes: number
  status: 'pending' | 'approved' | 'rejected'
  userId: number
}

interface User {
  id: number
  name: string
  email: string
  userName: string
  status: string
  profilePictureUrl?: string
}

export default function ModeratorDashboard() {
  const { user: currentUser, api } = useAuth()
  const { searchTerm, setSearchTerm } = useSearch()
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (activeTab === 'posts') {
          const postsResponse = await api.get('/api/moderator/pendingPosts')
          if (postsResponse?.ok) {
            const posts = await postsResponse.json()
            // Transform posts to include mediaType based on URL and remove unnecessary user data
            const transformedPosts = posts.map((post: any) => ({
              id: post.id,
              author: post.author,
              userName: post.userName,
              content: post.content,
              mediaType: post.mediaUrl?.includes('.mp4') ? 'video' : 
                        post.mediaUrl?.includes('.jpg') || post.mediaUrl?.includes('.png') ? 'image' : null,
              mediaUrl: post.mediaUrl,
              timestamp: post.timestamp,
              humorType: post.humorType,
              likes: post.likes,
              status: post.status,
              userId: post.userId
            }))
            setPendingPosts(transformedPosts)
          }
        } else {
          const usersResponse = await api.get('/api/users')
          if (usersResponse?.ok) {
            const users = await usersResponse.json()
            setAllUsers(users.filter((u: User) => u.id !== currentUser?.userId))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, api, currentUser?.userId])

  const handlePostAction = async (postId: number, action: 'approve' | 'reject' | 'delete') => {
    try {
      const modId = currentUser?.userId
      if (!modId) throw new Error('Moderator ID missing')

      let response
      switch (action) {
        case 'approve':
          response = await api.post('/api/moderator/approvePost', { postId, modId })
          break
        case 'reject':
          response = await api.post('/api/moderator/rejectPost', { postId, modId })
          break
        case 'delete':
          response = await api.delete('/api/moderator/deletePost', {
            body: JSON.stringify({ postId, modId }),
            headers: { 'Content-Type': 'application/json' }
          })
          break
      }

      if (response?.ok) {
        setPendingPosts(posts => posts.filter(post => post.id !== postId))
        showMessage('success', `Post ${action}d successfully`)
      } else {
        throw new Error(`Failed to ${action} post`)
      }
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Action failed')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const modId = currentUser?.userId
      if (!modId) throw new Error('Moderator ID missing')

      const response = await api.delete('/api/moderator/deleteUser', {
        body: JSON.stringify({ id: userId, modId }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response?.ok) {
        setAllUsers(users => users.filter(user => user.id !== userId))
        showMessage('success', 'User deleted successfully')
      } else {
        throw new Error('Failed to delete user')
      }
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Action failed')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text })
    setTimeout(() => setActionMessage(null), 5000)
  }

  const filteredUsers = allUsers.filter(user => 
    [user.name, user.userName, user.email].some(field => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const getOptimizedMediaUrl = (url: string, type: 'image' | 'video') => {
    if (!url.includes('cloudinary.com')) return url
    
    if (type === 'image') {
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/')
    } else if (type === 'video') {
      return url.replace('/upload/', '/upload/q_auto,w_800,c_limit/')
    }
    
    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow">
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow">
          <h1 className="text-2xl font-bold text-glow mb-2">Moderator Dashboard</h1>
          <p className="text-light/70">Welcome back, {currentUser?.name}</p>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className={`bg-glass/10 backdrop-blur-lg rounded-2xl p-4 border ${
            actionMessage.type === 'success' 
              ? 'border-green-400/30 text-green-400' 
              : 'border-red-400/30 text-red-400'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-4 border border-red-400/30 text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-glass/30">
          <button
            onClick={() => {
              setActiveTab('posts')
              setSearchTerm('')
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === 'posts' 
                ? 'text-accent border-b-2 border-accent' 
                : 'text-light/70 hover:text-light'
            }`}
          >
            Pending Posts ({pendingPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users' 
                ? 'text-accent border-b-2 border-accent' 
                : 'text-light/70 hover:text-light'
            }`}
          >
            User Management ({allUsers.length})
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'posts' ? (
          pendingPosts.length === 0 ? (
            <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow text-center py-16">
              <p className="text-xl">🎉</p>
              <p className="mt-4">No pending posts to review!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingPosts.map(post => (
                <div key={post.id} className="relative bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow">
                  {/* Post Header - Simplified */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-glass/20 flex items-center justify-center">
                        {post.author?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{post.author || 'Unknown user'}</h3>
                        <p className="text-xs text-light/50">@{post.userName || 'unknown'}</p>
                        <p className="text-xs text-light/50">{new Date(post.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePostAction(post.id, 'approve')}
                        className="bg-green-500/90 hover:bg-green-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handlePostAction(post.id, 'reject')}
                        className="bg-red-500/90 hover:bg-red-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handlePostAction(post.id, 'delete')}
                        className="bg-glass/90 hover:bg-glass/70 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="mb-4 whitespace-pre-line">{post.content}</p>

                  {/* Media Display */}
                  {post.mediaType === 'image' && post.mediaUrl && (
                    <div className="mb-4">
                      <img
                        src={getOptimizedMediaUrl(post.mediaUrl, 'image')}
                        alt="Post media"
                        className="w-full max-h-96 object-contain rounded-xl border border-glass shadow-inner"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {post.mediaType === 'video' && post.mediaUrl && (
                    <div className="mb-4">
                      <video
                        controls
                        className="w-full max-h-96 rounded-xl border border-glass shadow-inner"
                        preload="auto"
                        muted
                        playsInline
                      >
                        <source src={getOptimizedMediaUrl(post.mediaUrl, 'video')} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {/* Post Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-glass/30">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      post.humorType === 'Dark Humor' 
                        ? 'bg-red-400/20 text-red-400' 
                        : 'bg-green-400/20 text-green-400'
                    }`}>
                      {post.humorType}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-light/70">{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow">
            {/* User Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-glass/20 border border-glass/30 rounded-lg px-4 py-2 text-light focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl">👤</p>
                <p className="mt-4">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-glass/30">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Username</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-glass/10 hover:bg-glass/5">
                        <td className="py-3 px-4 flex items-center gap-3">
                          {user.profilePictureUrl ? (
                            <img 
                              src={user.profilePictureUrl} 
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-glass/20 flex items-center justify-center">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          {user.name}
                        </td>
                        <td className="py-3 px-4">@{user.userName}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'moderator' 
                              ? 'bg-blue-400/20 text-blue-400' 
                              : 'bg-glass/20 text-light'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-500/90 hover:bg-red-400 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md transition-colors"
                            disabled={user.status === 'moderator'}
                            title={user.status === 'moderator' ? "Cannot delete moderators" : ""}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}