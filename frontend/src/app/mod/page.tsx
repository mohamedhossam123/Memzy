// components/ModeratorDashboard.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/Context/AuthContext'
import { useSearch } from '@/Context/SearchContext'
import { ModeratorAPI } from '@/lib/api/moderator'
import { PendingPost, User } from '@/lib/api/types' 
import { detectMediaType, getOptimizedMediaUrl } from '@/lib/api/utils'

export default function ModeratorDashboard() {
  const { user: currentUser, token } = useAuth() 
  const { searchTerm, setSearchTerm } = useSearch()
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [moderatorApi, setModeratorApi] = useState<ModeratorAPI | null>(null)

  useEffect(() => {
    if (currentUser && token) { 
      setModeratorApi(new ModeratorAPI(token))
    }
  }, [currentUser, token])

  useEffect(() => {
    const fetchData = async () => {
      if (!moderatorApi) return
      
      try {
        setLoading(true)
        setError(null)
        
        if (activeTab === 'posts') {
          const posts = await moderatorApi.fetchPendingPosts()
          const transformedPosts = posts.map((post: any) => {
            const mediaType = detectMediaType(post.mediaUrl)
            
            return {
              id: post.id,
              content: post.content || '[No content available]',
              mediaType,
              mediaUrl: post.mediaUrl,
              timestamp: post.timestamp || new Date().toISOString(),
              humorType: post.humorType || 'General',
              likes: post.likes || 0,
              status: post.status || 'pending',
              userId: post.userId,
              user: {
                userId: post.user?.userId || post.user?.id || post.userId,
                name: post.user?.name || post.author || 'Unknown user',
                username: post.user?.username || post.user?.userName || post.username || 'unknown',
                email: post.user?.email || '',
                status: post.user?.status || 'user',
                profilePictureUrl: post.user?.profilePictureUrl
              }
            }
          })
          
          setPendingPosts(transformedPosts)
        } else {
          const users = await moderatorApi.fetchAllUsers()
          const transformedUsers = users.map((user: any) => ({
            userId: user.id || user.userId,
            name: user.name,
            email: user.email,
            username: user.userName || user.username,
            status: user.status,
            profilePictureUrl: user.profilePictureUrl
          }))
          setAllUsers(transformedUsers.filter((u: User) => u.userId !== currentUser?.userId))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, moderatorApi, currentUser?.userId])

  const handlePostAction = async (postId: number, action: 'approve' | 'reject') => {
    if (!moderatorApi || !currentUser?.userId) return
    
    try {
      const modId = currentUser.userId
      
      if (action === 'approve') {
        await moderatorApi.approvePost({ postId, modId })
      } else {
        await moderatorApi.rejectPost({ postId, modId })
      }
      
      setPendingPosts(posts => posts.filter(post => post.id !== postId))
      showMessage('success', `Post ${action}d successfully`)
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Action failed')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!moderatorApi || !currentUser?.userId) return
    
    try {
      const modId = currentUser.userId
      await moderatorApi.deleteUser({ id: userId, modId })
      
      setAllUsers(users => users.filter(user => user.userId !== userId))
      showMessage('success', 'User deleted successfully')
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Action failed')
    }
  }

  const handleMakeModerator = async (userId: number) => {
    if (!moderatorApi || !currentUser?.userId) return
    
    try {
      const requestedById = currentUser.userId
      await moderatorApi.makeModerator({ userId, requestedById })
      
      showMessage('success', 'User promoted to moderator successfully')
      setAllUsers(users =>
        users.map(user =>
          user.userId === userId ? { ...user, status: 'moderator' } : user
        )
      )
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Action failed')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text })
    setTimeout(() => setActionMessage(null), 5000)
  }

  const filteredUsers = allUsers.filter(user => 
    [user.name, user.username, user.email].some(field => 
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const MediaDisplay = ({ post }: { post: PendingPost }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [videoError, setVideoError] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleVideoEnd = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    }

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (videoRef.current) {
              if (entry.isIntersecting) {
                videoRef.current.play()
              } else {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
              }
            }
          })
        },
        { threshold: 0.75 }
      )

      if (videoRef.current) {
        observer.observe(videoRef.current)
      }

      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current)
        }
      }
    }, [])

    if (!post.mediaUrl) return null

    if (post.mediaType === 'image') {
      return (
        <div className="mb-4 relative">
          {!imageLoaded && !imageError && (
            <div className="w-full h-64 bg-glass/5 rounded-xl border border-glass flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}
          {!imageError && (
            <img
              src={getOptimizedMediaUrl(post.mediaUrl, 'image')}
              alt="Post media"
              className={`w-full max-h-96 object-contain rounded-xl border border-glass shadow-inner transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute top-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}
          {imageError && (
            <div className="w-full h-32 bg-glass/5 rounded-xl border border-red-400/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">🖼️</div>
                <p className="text-red-400 text-sm">Image failed to load</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (post.mediaType === 'video') {
      return (
        <div className="mb-4">
          {!videoError ? (
            <video
              ref={videoRef}
              controls
              className="w-full max-h-96 rounded-xl border border-glass shadow-inner"
              preload="auto"
              muted
              playsInline
              onEnded={handleVideoEnd}
              onError={() => setVideoError(true)}
            >
              <source src={post.mediaUrl} type="video/mp4" />
              <source src={getOptimizedMediaUrl(post.mediaUrl!, 'video')} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-32 bg-glass/5 rounded-xl border border-red-400/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-2">🎥</div>
                <p className="text-red-400 text-sm">Video failed to load</p>
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="mb-4">
        <div className="text-center p-4 bg-glass/5 rounded-xl border border-yellow-400/30">
          <div className="text-2xl mb-2">❓</div>
          <p className="text-yellow-400 text-sm">Unknown media type</p>
        </div>
      </div>
    )
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
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {post.user.profilePictureUrl ? (
                      <img 
                        src={post.user.profilePictureUrl} 
                        alt={post.user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-glass/20 flex items-center justify-center">
                        {post.user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{post.user.name}</h3>
                      <p className="text-xs text-light/50">@{post.user.username}</p>
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
                  </div>
                </div>

                {/* Post Content */}
                <p className="mb-4 whitespace-pre-line">{post.content}</p>

                {/* Media Display */}
                <MediaDisplay post={post} />

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

          {/* Users Grid with Make Moderator and Delete Buttons */}
          <div className="grid gap-4">
            {filteredUsers.map(user => (
              <div key={user.userId} className="flex items-center justify-between p-4 bg-glass/10 rounded-xl shadow-glow">
                <div className="flex items-center gap-3">
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold text-light">
                      {user.name[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-light/70">{user.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                  disabled={user.status === 'moderator'}
                  onClick={() => handleMakeModerator(user.userId)}
                  className={`px-3 py-1 rounded text-white text-sm ${
                    user.status === 'moderator' ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Make Moderator
                </button>

                  <button
                    onClick={() => handleDeleteUser(user.userId)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)
}