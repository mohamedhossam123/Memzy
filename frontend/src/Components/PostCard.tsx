// Component: PostCard 
'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/Context/AuthContext'

export interface PostProps {
  id: number
  author: string
  content: string
  mediaType?: 'image' | 'video' | null
  mediaUrl?: string | null
  timestamp: string
  humorType: 'Dark Humor' | 'Friendly Humor' 
  likes: number
  isLiked?: boolean 
  onLikeUpdate?: (postId: number, isLiked: boolean, likes: number) => void;
}

export default function PostCard({
  id,
  author,
  content,
  mediaType,
  mediaUrl,
  timestamp,
  humorType,
  likes: initialLikes,
  isLiked: initialIsLiked = false,
}: PostProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  
  const { api, user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const getOptimizedMediaUrl = (url: string, type: 'image' | 'video') => {
    if (!url.includes('cloudinary.com')) return url
    
    if (type === 'image') {
      return url.replace('/upload/', '/upload/q_auto,f_auto,w_800,c_limit/')
    } else if (type === 'video') {
      return url.replace('/upload/', '/upload/q_auto,w_800,c_limit/')
    }
    
    return url
  }

  const handleLikeToggle = async () => {
    if (isLikeLoading || !user) return
    setIsLikeLoading(true)
    const newIsLiked = !isLiked
    const newLikes = newIsLiked ? likes + 1 : likes - 1
    setIsLiked(newIsLiked)
    setLikes(newLikes)
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Posts/${id}/like`
      const response = newIsLiked 
        ? await api.post(endpoint, {})
        : await api.delete(endpoint)
      if (!response || !response.ok) {
        setIsLiked(!newIsLiked)
        setLikes(newIsLiked ? likes : likes + 1)
        throw new Error('Failed to update like status')
      }
            const data = await response.json().catch(() => null)
      if (data) {
        setLikes(data.likeCount || newLikes)
        setIsLiked(data.isLiked !== undefined ? data.isLiked : newIsLiked)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      setIsLiked(!newIsLiked)
      setLikes(newIsLiked ? likes : likes + 1)
    } finally {
      setIsLikeLoading(false)
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

  return (
    <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow hover:shadow-glow/50 transition-all space-y-4">
      {/* Top: Author + Timestamp */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-glow">{author}</h3>
        <p className="text-sm text-light/50">{timestamp}</p>
      </div>

      {/* Content */}
      <p className="text-light/90 whitespace-pre-line">{content}</p>

      {/* Media */}
      {mediaType === 'image' && mediaUrl && !imageError && (
        <div className="relative">
          {!imageLoaded && (
            <div className="w-full h-64 bg-glass/5 rounded-xl border border-glass flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}
          <img
            src={getOptimizedMediaUrl(mediaUrl, 'image')}
            alt="Post media"
            className={`w-full max-h-96 object-cover rounded-xl border border-glass shadow-inner transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute top-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              console.error('Failed to load image:', mediaUrl)
            }}
            loading="lazy"
          />
        </div>
      )}

      {mediaType === 'video' && mediaUrl && !videoError && (
        <video
          ref={videoRef}
          controls
          className="w-full max-h-96 rounded-xl border border-glass shadow-inner"
          preload="auto"
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={() => {
            setVideoError(true)
            console.error('Failed to load video:', mediaUrl)
          }}
        >
          <source src={getOptimizedMediaUrl(mediaUrl, 'video')} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Media Error States */}
      {imageError && mediaType === 'image' && (
        <div className="w-full h-32 bg-glass/5 rounded-xl border border-red-400/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-red-400 text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {videoError && mediaType === 'video' && (
        <div className="w-full h-32 bg-glass/5 rounded-xl border border-red-400/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🎥</div>
            <p className="text-red-400 text-sm">Video failed to load</p>
          </div>
        </div>
      )}

      {/* Humor Type Tag */}
      <div className="flex justify-start">
        <span
          className={`px-3 py-1 text-sm rounded-full font-medium bg-glass/20 backdrop-blur-md border ${
            humorType === 'Dark Humor'
              ? 'text-red-400 border-red-400/30'
              : 'text-green-300 border-green-300/30'
          }`}
        >
          {humorType}
        </span>
      </div>

      {/* Like Counter */}
      <div className="flex items-center gap-2 pt-2 border-t border-glass/30">
        <button 
          className={`transition-all duration-200 text-xl ${
            isLiked 
              ? 'text-accent scale-110 hover:scale-105' 
              : 'text-light/50 hover:text-accent hover:scale-105'
          } ${isLikeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            !user ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleLikeToggle}
          disabled={isLikeLoading || !user}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
          title={!user ? 'Login to like posts' : undefined}
        >
          {isLikeLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
          ) : (
            '😂'
          )}
        </button>
        <span className="text-light/70">
          {likes} {likes === 1 ? 'like' : 'likes'}
        </span>
      </div>
    </div>
  )
}