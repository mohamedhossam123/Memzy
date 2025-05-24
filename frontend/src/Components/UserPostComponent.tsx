// UserPostComponent.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'

interface Post {
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
  const [mediaErrors, setMediaErrors] = useState<Set<number>>(new Set())
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, token } = useAuth()

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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }

        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [user, token, router])

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
        <div className="flex justify-center mt-4 space-x-4">
          <button
            className="px-4 py-2 bg-[#8e2de233] text-[#c56cf0] rounded-lg hover:bg-[#8e2de266]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          <button
            className="px-4 py-2 bg-[#8e2de033] text-[#c56cf0] rounded-lg hover:bg-[#8e2de066]"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </button>
        </div>
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
        const isVideo = post.mediaType === 'Video'
        const mediaUrl = post.filePath ?? undefined

        return (
          <div key={post.postId} className="flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            {/* ── Media Container ── */}
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-800">
              {/* Approval Status Badge */}
              <div className="absolute top-2 right-2 z-10">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.isApproved 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {post.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              {mediaUrl ? (
                isVideo ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setMediaErrors((prev) => new Set(prev).add(post.postId))}
                  >
                    <source src={mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={mediaUrl}
                      alt={post.description || 'Post image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => setMediaErrors((prev) => new Set(prev).add(post.postId))}
                      unoptimized
                    />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-light/60">No media available</span>
                </div>
              )}

              {mediaErrors.has(post.postId) && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-light/60 block mb-2">Failed to load media</span>
                    <button
                      className="px-3 py-1 text-xs bg-[#8e2de233] text-[#c56cf0] rounded-full hover:bg-[#8e2de266]"
                      onClick={() =>
                        setMediaErrors((prev) => {
                          const newErrors = new Set(prev)
                          newErrors.delete(post.postId)
                          return newErrors
                        })
                      }
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Post Details ── */}
            <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-light/90 text-sm line-clamp-3">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  {post.postHumors.map((humor, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-[#8e2de233] text-[#c56cf0] text-xs font-medium rounded-full"
                    >
                      {getHumorLabelById(humor.humorType.id, humor.humorType.name)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-light/60">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {!post.isApproved && (
                    <span className="text-xs text-yellow-400">(Under Review)</span>
                  )}
                </div>
                <span className="text-xs text-[#c56cf0]">😂 {post.likeCounter}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}