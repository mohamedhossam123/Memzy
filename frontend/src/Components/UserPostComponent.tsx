// UserPostComponent.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'

export interface Post {
  postId: number
  filePath: string | null
  description: string
  createdAt: string
  likeCounter: number
  isApproved: boolean

  mediaType: 'Image' | 'Video'
  postHumors: {
    humorType: {
      id: number
      name: string
    }
  }[]
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set())
  const [imageLoaded, setImageLoaded] = useState<Set<number>>(new Set())
  const [videoLoaded, setVideoLoaded] = useState<Set<number>>(new Set())
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, token } = useAuth()

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
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [user, token, router])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch(console.error)
            video.loop = true // Enable looping
          } else {
            video.pause()
            video.currentTime = 0
          }
        })
      },
      { threshold: 0.75, rootMargin: '0px 0px 100px 0px' }
    )

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) observer.unobserve(video)
      })
    }
  }, [posts])

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

  const handleRetry = (postId: number, isVideo: boolean) => {
    if (isVideo) {
      setVideoErrors(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
      setVideoLoaded(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
      const video = videoRefs.current[postId]
      if (video) {
        video.load()
        video.play().catch(console.error)
      }
    } else {
      setImageErrors(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
      setImageLoaded(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

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
        
        const mediaUrl = post.filePath ? getOptimizedMediaUrl(post.filePath, isVideo ? 'video' : 'image') : null
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
                        ref={(el) => { videoRefs.current[post.postId] = el }}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="auto"
                        onLoadedData={() => setVideoLoaded(prev => new Set(prev).add(post.postId))}
                        onCanPlay={() => {
                          setVideoLoaded(prev => new Set(prev).add(post.postId))
                          const video = videoRefs.current[post.postId]
                          if (video) video.play().catch(console.error)
                        }}
                        onError={(e) => {
                          console.error('Video error:', e)
                          setVideoErrors(prev => new Set(prev).add(post.postId))
                        }}
                      >
                        <source src={mediaUrl} type="video/mp4" />
                        <source src={mediaUrl} type="video/webm" />
                        <source src={mediaUrl} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
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
                        onLoad={() => setImageLoaded(prev => new Set(prev).add(post.postId))}
                        onError={(e) => {
                          console.error('Image error:', e)
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
                  <p className="text-gray-400 text-xs text-center px-4">
                    {isVideo ? 'Check video format and file path' : 'Check image format and file path'}
                  </p>
                  <button
                    onClick={() => handleRetry(post.postId, isVideo)}
                    className="px-3 py-1 text-xs bg-[#8e2de233] text-[#c56cf0] rounded-full hover:bg-[#8e2de266]"
                  >
                    Retry
                  </button>
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
                <span className="text-xs text-[#c56cf0]">😂 {post.likeCounter}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}