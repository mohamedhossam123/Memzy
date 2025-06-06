// src/Components/ProfilePageModels/ProfilePostsComponent.tsx
'use client'

import { useEffect,useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'

// Define the props interface for PostFeed
interface PostFeedProps {
  triggerRefresh: boolean; // Add this prop
}

export interface Post {
  postId: number
  filePath: string | null
  description: string
  createdAt: string
  likeCount: number
  isApproved: boolean
  mediaType: 'Image' | 'Video'
  postHumors: {
    humorType: {
      id: number
      name: string
    }
  }[]
  userId: string
}

// Update the component's functional signature to accept PostFeedProps
export default function PostFeed({ triggerRefresh }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set())
  const [imageLoaded, setImageLoaded] = useState<Set<number>>(new Set())
  const [videoLoaded, setVideoLoaded] = useState<Set<number>>(new Set())
  const [fullscreenImage, setFullscreenImage] = useState<{postId: number, url: string} | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, token } = useAuth()

  const isVideoFile = (url: string | null): boolean => {
    if (!url) return false
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv']
    return videoExtensions.some(ext => url.toLowerCase().includes(ext))
  }

const handleDeletePost = async (postId: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/DeleteMyPost/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error('Failed to delete post.')
    }

    setPosts(prev => prev.filter(post => post.postId !== postId))
  } catch (err) {
    console.error(err)
    alert('Failed to delete post.')
  }
}


  const getOptimizedMediaUrl = (url: string | null, type: 'image' | 'video') => {
    if (!url) return ''
    
    if (url.startsWith('http')) return url
    if (url.includes('cloudinary.com')) {
      const transformations = type === 'image' 
        ? 'q_auto,f_auto,w_800,c_limit' 
        : 'q_auto,w_800,c_limit'
      return url.replace('/upload/', `/upload/${transformations}/`)
    }
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${url}`
  }
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const videos = document.querySelectorAll('video')
        videos.forEach(video => {
          if (!video.paused) {
            video.pause()
            console.log('Video paused due to fullscreen exit')
          }
        })
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange) // Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange) // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange) // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        if (!user || !token) {
          setError('Authentication required. Please login.')
          setLoading(false)
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user`, { 
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }

        const data = await response.json()
        console.log('Raw API response for user posts:', data)
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [user, token, router, triggerRefresh])

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

  const handleVideoPlay = (postId: number) => {
    const video = document.getElementById(`video-${postId}`) as HTMLVideoElement | null
    if (!video) return
    
    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => {
        video.play().catch(error => {
          console.error('Failed to play video after fullscreen:', error);
        });
      }).catch(error => {
        console.error('Fullscreen request failed:', error)
        video.play().catch(playError => {
          console.error('Failed to play video:', playError);
        })
      })
    } else {
      video.play().catch(error => {
        console.error('Failed to play video:', error);
      })
    }
  }

  const openImageFullscreen = (postId: number, url: string) => {
    setFullscreenImage({postId, url})
  }

  const closeImageFullscreen = () => {
    setFullscreenImage(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        closeImageFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [fullscreenImage])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c56cf0]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-light/70 text-lg">No posts found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {posts.map((post) => {
        const isVideoByType = post.mediaType === 'Video'
        const isVideoByExtension = isVideoFile(post.filePath)
        const isVideo = isVideoByType || isVideoByExtension
        
        const mediaUrl = post.filePath 
          ? getOptimizedMediaUrl(post.filePath, isVideo ? 'video' : 'image') 
          : null
        const imageFailed = imageErrors.has(post.postId)
        const videoFailed = videoErrors.has(post.postId)
        const imageLoadedState = imageLoaded.has(post.postId)
        const videoLoadedState = videoLoaded.has(post.postId)
        const mediaFailed = isVideo ? videoFailed : imageFailed

        return (
          <div key={post.postId} className="flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
              <div className="absolute top-2 right-2 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {post.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              {mediaUrl && !mediaFailed && (
                <>
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      {!videoLoadedState && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c56cf0]"></div>
                        </div>
                      )}
                      <video
                        id={`video-${post.postId}`}
                        className="w-full h-full object-cover"
                        playsInline
                        preload="metadata"
                        onClick={() => handleVideoPlay(post.postId)}
                        onLoadedData={() => {
                          setVideoLoaded(prev => new Set(prev).add(post.postId))
                          console.log('Video metadata loaded:', mediaUrl)
                        }}
                        onCanPlay={() => {
                          setVideoLoaded(prev => new Set(prev).add(post.postId))
                          console.log('Video can play:', mediaUrl)
                        }}
                        onError={(e) => {
                          console.error('Video error:', e, mediaUrl)
                          setVideoErrors(prev => new Set(prev).add(post.postId))
                        }}
                      >
                        <source src={mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Play Button Overlay */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => handleVideoPlay(post.postId)}
                      >
                        <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm hover:bg-black/60 transition-all">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-12 w-12 text-white" 
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => openImageFullscreen(post.postId, mediaUrl)}
                    >
                      {!imageLoadedState && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c56cf0]"></div>
                        </div>
                      )}
                      <img
                        src={mediaUrl}
                        alt={post.description || 'Post image'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          imageLoadedState ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setImageLoaded(prev => new Set(prev).add(post.postId))
                          console.log('Image loaded:', mediaUrl)
                        }}
                        onError={(e) => {
                          console.error('Image error:', e, mediaUrl)
                          setImageErrors(prev => new Set(prev).add(post.postId))
                        }}
                        loading="lazy"
                      />
                    </div>
                  )}
                </>
              )}

              {mediaFailed && (
                <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center gap-2">
                  <div className="text-2xl mb-2">
                    {isVideo ? '🎥' : '🖼️'}
                  </div>
                  <p className="text-red-400 text-sm">
                    {isVideo ? 'Video' : 'Image'} failed to load
                  </p>
                  <p className="text-gray-400 text-xs text-center px-4 break-all">
                    {mediaUrl ? mediaUrl.substring(0, 50) + '...' : 'No URL provided'}
                  </p>
                </div>
              )}

              {!mediaUrl && (
                <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center gap-2">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-gray-400 text-sm">No media available</p>
                </div>
              )}
            </div>

            <div className="px-4 pb-4 pt-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-light/90 text-sm line-clamp-3">{post.description}</p>
                <div className="flex flex-wrap gap-2">
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
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[rgba(255,255,255,0.05)]">
              <span className="text-xs text-light/60">{new Date(post.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#c56cf0]">
                  😂 {post.likeCount ?? 0}
                </span>
                <button
                  onClick={() => handleDeletePost(post.postId)}
                  className="text-red-400 hover:text-red-500 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
            </div>
          </div>
        )
      })}

      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={closeImageFullscreen}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <img
              src={getOptimizedMediaUrl(fullscreenImage.url, 'image')}
              alt="Fullscreen media"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-all"
              onClick={closeImageFullscreen}
              aria-label="Close fullscreen"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}