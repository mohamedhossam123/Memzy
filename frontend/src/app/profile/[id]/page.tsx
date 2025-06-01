// dyanmic profile
'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FriendsModal } from '@/Components/ProfilePageModels/FriendsModalDynamicPage'
import { APIClient, Post, UserProfileData } from '@/lib/api'

interface UserProfilePageProps {
  params: { id: string }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [profileImageError, setProfileImageError] = useState(false)
  const [activeModal, setActiveModal] = useState<'friends' | null>(null)
  const [friendsList, setFriendsList] = useState<any[]>([])
  const [friendshipLoading, setFriendshipLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiClient, setApiClient] = useState<APIClient | null>(null)

  const userId = params.id

  useEffect(() => {
    if (token) {
      setApiClient(new APIClient(token))
    }
  }, [token])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.userId && userId === user.userId.toString()) {
      router.push('/profile')
      return
    }

    if (apiClient) fetchUserProfile()
  }, [user, userId, router, apiClient])

  useEffect(() => {
    setProfileImageError(false)
  }, [userData?.profilePictureUrl])

  useEffect(() => {
    if (userData && userData.isFriend && apiClient) {
      fetchUserPosts()
    } else if (userData && !userData.isFriend) {
      setUserPosts([])
    }
  }, [userData?.isFriend, userData?.id, apiClient])

  const fetchUserProfile = async () => {
    if (!apiClient) return
    
    try {
      const data = await apiClient.user.getUserById(userId)
      const friendshipStatus = await apiClient.friends.getFriendshipStatus(data.id)
      
      const combinedData: UserProfileData = {
        ...data,
        ...friendshipStatus
      }
      
      setUserData(combinedData)
      if (combinedData.isFriend) {
        fetchUserPosts()
      }
    } catch (err: any) {
      if (err.message.includes('404')) {
        setError('User not found')
      } else {
        setError('Failed to load user profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    if (!apiClient) return
    
    try {
      const posts = await apiClient.user.getUserPosts(userId)
      setUserPosts(posts.map((post: Post) => ({
        ...post,
        postHumors: post.postHumors || [],
      })))
    } catch (err: any) {
      setError('Failed to load posts. Please try again later.')
    }
  }

  const fetchUserFriends = async () => {
    if (!apiClient) return
    
    try {
      const friends = await apiClient.friends.getFriendsAnotherUser(userId)
      setFriendsList(friends)
    } catch (err) {
      console.error('Error fetching user friends:', err)
    }
  }

  const handleSendFriendRequest = async () => {
    if (!apiClient || !userData) return
    
    setFriendshipLoading(true)
    try {
      const result = await apiClient.friends.sendRequest(userData.id)
      setUserData({ 
        ...userData, 
        hasPendingRequest: true,
        requestType: 'sent',
        requestId: result.requestId,
        isFriend: false 
      })
    } catch (err) {
      console.error('Error sending friend request:', err)
    } finally {
      setFriendshipLoading(false)
    }
  }

  const handleCancelFriendRequest = async () => {
    if (!apiClient || !userData || !userData.requestId) return
    
    setFriendshipLoading(true)
    try {
      await apiClient.friends.cancelRequest(userData.requestId)
      setUserData({ 
        ...userData, 
        hasPendingRequest: false,
        requestType: undefined,
        requestId: undefined,
        isFriend: false 
      })
    } catch (err) {
      console.error('Error canceling friend request:', err)
    } finally {
      setFriendshipLoading(false)
    }
  }

  const handleAcceptFriendRequest = async () => {
    if (!apiClient || !userData || !userData.requestId) return
    
    setFriendshipLoading(true)
    try {
      await apiClient.friends.acceptRequest(userData.requestId)
      setUserData({ 
        ...userData, 
        isFriend: true,
        hasPendingRequest: false,
        requestType: undefined,
        requestId: undefined
      })
    } catch (err) {
      console.error('Error accepting friend request:', err)
    } finally {
      setFriendshipLoading(false)
    }
  }

  const handleRejectFriendRequest = async () => {
    if (!apiClient || !userData || !userData.requestId) return
    
    setFriendshipLoading(true)
    try {
      await apiClient.friends.rejectRequest(userData.requestId)
      setUserData({ 
        ...userData, 
        hasPendingRequest: false,
        requestType: undefined,
        requestId: undefined,
        isFriend: false 
      })
    } catch (err) {
      console.error('Error rejecting friend request:', err)
    } finally {
      setFriendshipLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    if (!apiClient || !userData) return
    
    setFriendshipLoading(true)
    try {
      await apiClient.friends.removeFriend(userData.id)
      setUserData({ 
        ...userData, 
        isFriend: false,
        hasPendingRequest: false,
        requestType: undefined,
        requestId: undefined
      })
      setUserPosts([])
    } catch (err) {
      console.error('Error removing friend:', err)
    } finally {
      setFriendshipLoading(false)
    }
  }

  const renderFriendshipButtons = () => {
    if (!userData) return null;
    if (userData.isFriend) {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={friendshipLoading}
          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {friendshipLoading ? 'Removing...' : 'Remove Friend'}
        </button>
      );
    }

    if (userData.hasPendingRequest) {
      if (userData.requestType === 'sent') {
        return (
          <button
            onClick={handleCancelFriendRequest}
            disabled={friendshipLoading}
            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {friendshipLoading ? 'Canceling...' : 'Cancel Request'}
          </button>
        );
      } else if (userData.requestType === 'received') {
        return (
          <div className="flex gap-3">
            <button
              onClick={handleAcceptFriendRequest}
              disabled={friendshipLoading}
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {friendshipLoading ? 'Accepting...' : 'Accept Request'}
            </button>
            <button
              onClick={handleRejectFriendRequest}
              disabled={friendshipLoading}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {friendshipLoading ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        );
      }
    }
    return (
      <button
        onClick={handleSendFriendRequest}
        disabled={friendshipLoading}
        className="bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {friendshipLoading ? 'Sending...' : 'Add Friend'}
      </button>
    );
  };

  const getProfileImageUrl = (profilePic?: string) => {
    if (profileImageError || !profilePic) {
      return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
    }
    return profilePic.startsWith('http') ? profilePic : `https://${profilePic}`
  }

  const isVideoFile = (url: string | null): boolean => {
    if (!url) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv']
    return videoExtensions.some(ext => url.toLowerCase().includes(ext))
  }

  const getOptimizedMediaUrl = (url: string, type: 'image' | 'video') => {
    if (!url.includes('cloudinary.com')) return url
    const transformations = type === 'image' 
      ? 'q_auto,f_auto,w_800,c_limit' 
      : 'q_auto,w_800,c_limit'
    return url.replace('/upload/', `/upload/${transformations}/`)
  }

  const getHumorLabelById = (id?: number, fallback?: string) => {
    if (!id && fallback) return fallback
    switch (id) {
      case 1:
        return 'Dark Humor'
      case 2:
        return 'Friendly Humor'
      default:
        return fallback || 'Unknown Humor'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">{error}</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-accent hover:bg-accent/80 px-6 py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!userData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow">
            <img
              src={getProfileImageUrl(userData?.profilePictureUrl)} 
              alt={userData?.name || 'User'}
              onError={() => setProfileImageError(true)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-glow">{userData?.name}</h1>
              <div className="flex gap-3">
                {renderFriendshipButtons()}
              </div>
            </div>
            
            <div className="text-light/70 text-lg">
              @{userData?.userName || 'username'}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-light/80">Humor style:</span>
                <div className="badge-style bg-glass px-3 py-1 rounded-full">
                  {userData?.humorTypes?.map(ht => ht.humorTypeName).join(', ') || 'Not set'}
                </div>
              </div>

              {userData?.bio && (
                <div className="mt-4 max-w-2xl mx-auto md:mx-0">
                  <p className="text-light/90 text-lg italic p-4 bg-glass/20 rounded-xl">
                    {userData.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 shadow-glow hover:shadow-glow/50 transition-all">
            <h3 className="text-xl font-semibold mb-4 text-accent border-b border-glass pb-2">
              Social Stats
            </h3>
            <div className="flex justify-around">
              {userData?.isFriend ? (
                <button
                  onClick={() => {
                    setActiveModal('friends')
                    fetchUserFriends()
                  }}
                  className="flex flex-col items-center transition-transform hover:scale-105 cursor-pointer"
                >
                  <span className="text-3xl font-bold mb-1">{userData.friendsCount ?? 0}</span> 
                  <span className="text-sm text-light/70">Friends</span>
                </button>
              ) : (
                <div className="flex flex-col items-center cursor-default">
                  <span className="text-3xl font-bold mb-1">{userData?.friendsCount ?? 0}</span> 
                  <span className="text-sm text-light/70">Friends</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold mb-1">{userData?.postsCount ?? 0}</span> 
                <span className="text-sm text-light/70">Posts</span>
              </div>
            </div>
          </div>

          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 shadow-glow hover:shadow-glow/50 transition-all">
            <h3 className="text-xl font-semibold mb-4 text-accent border-b border-glass pb-2">
              Profile Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <span className="text-light/90">
                  Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'joining'}
                </span>
              </div>
              {userData?.status && (
                <div className="flex items-center gap-3">
                  <span className="text-xl">📝</span>
                  <span className="text-light/90">{userData.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="border-t border-glass/30 pt-16">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-glow">{userData?.name}'s Posts</h2>
          </div>

          {!userData?.isFriend ? (
            <div className="text-center py-12">
              <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-accent mb-4">Posts are Private</h3>
                <p className="text-light/70 mb-6">
                  You need to be friends with {userData?.name} to see their posts.
                </p>
                {userData?.hasPendingRequest ? (
                  <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg">
                    Friend request pending...
                  </div>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={friendshipLoading}
                    className="bg-accent hover:bg-accent/80 px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {friendshipLoading ? 'Sending...' : 'Send Friend Request'}
                  </button>
                )}
              </div>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="grid gap-6">
              {userPosts.map((post) => (
                <div
                  key={post.postId}
                  className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 shadow-glow hover:shadow-glow/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent/50">
                      <img
                        src={getProfileImageUrl(userData.profilePictureUrl)} 
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-light">{userData.name}</h3>
                        <span className="text-light/60 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {post.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-light/90 mb-3">{post.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.postHumors.map((humor, index) => (
                          <span
                            key={index}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              humor.humorType.id === 1
                                ? 'bg-red-400/10 text-red-300'
                                : 'bg-green-300/10 text-green-200'
                            }`}
                          >
                            {getHumorLabelById(humor.humorType.id, humor.humorType.name)}
                          </span>
                        ))}
                      </div>
                      
                      {post.filePath && (
                        <div className="mb-3">
                          {isVideoFile(post.filePath) ? (
                            <video
                              src={getOptimizedMediaUrl(post.filePath, 'video')}
                              controls
                              className="max-w-full h-auto rounded-lg max-h-96"
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={getOptimizedMediaUrl(post.filePath, 'image')}
                              alt={post.description}
                              className="max-w-full h-auto rounded-lg max-h-96 object-cover"
                            />
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-light/70">
                        <span>😂 {post.likeCount || 0} likes</span>
                        <span className="text-xs">
                          {post.mediaType} • {new Date(post.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-light/60 py-12">
              <p className="text-xl">No posts yet</p>
            </div>
          )}
        </div>

{/* Friends Modal */}
<FriendsModal 
  isOpen={activeModal === 'friends'}
  onClose={() => setActiveModal(null)}
  friendsList={friendsList}
/>


      </div>
    </div>
  )
}
