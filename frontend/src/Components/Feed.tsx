// Components/Feed.tsx
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import PostCard, { PostProps } from '@/Components/PostCard'
import { useAuth } from '@/Context/AuthContext'

interface ApiPost {
  postId: number
  mediaType: number
  description: string
  filePath: string
  createdAt: string
  likeCounter: number
  isApproved: boolean
  humorTypeIds: number[]
  userName?: string
}

interface ApiResponse {
  posts: ApiPost[]
}

const humorMap: Record<number, 'Dark Humor' | 'Friendly Humor'> = {
  1: 'Dark Humor',
  2: 'Friendly Humor',
}

function mapApiPostToPostProps(apiPost: ApiPost): PostProps {
  return {
    author: apiPost.userName || 'Anonymous',
    content: apiPost.description,
    mediaType: apiPost.mediaType === 0 ? 'image' : apiPost.mediaType === 1 ? 'video' : null,
    mediaUrl: apiPost.filePath || null,
    timestamp: new Date(apiPost.createdAt).toLocaleString(),
    humorType: humorMap[apiPost.humorTypeIds[0]] || 'Friendly Humor',
    likes: apiPost.likeCounter,
  }
}

function useInfiniteScroll({ loading, hasMore, onLoadMore }: { 
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void 
}) {
  const observerRef = useRef<IntersectionObserver>()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading || !hasMore) return

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      })
    }

    observerRef.current = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    })

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current)
      }
    }
  }, [loading, hasMore, onLoadMore])

  return { sentinelRef }
}

export default function Feed() {
  const [posts, setPosts] = useState<PostProps[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, api } = useAuth()
  const { sentinelRef } = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage(prev => prev + 1)
  })

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const endpoint = user 
        ? '/api/Posts/GetFirst6BasedOnUser'
        : '/api/Posts/GetFirst6'

      const response = await api.post(
        endpoint,
        { page, pageSize: 6 },
        { authenticated: !!user }
      )
      if (!response || !response.ok) {
        throw new Error('Failed to fetch feed')
      }
      const data: ApiResponse = await response.json()
      const newPosts = data.posts.map(mapApiPostToPostProps)

      setPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts])
      setHasMore(newPosts.length === 6)
    } catch (err) {
      console.error('Feed error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [page, user, api])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (loading && page === 1) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="text-light/60 mt-4">Loading your personalized feed...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error loading feed: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {user && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-glow mb-2">
            Welcome back, {user.name}!
          </h2>
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-glass/5 rounded-2xl">
          <div className="text-6xl mb-4">😅</div>
          <h3 className="text-xl font-semibold text-light mb-2">No posts found</h3>
          <p className="text-light/60">
            {user 
              ? "We couldn't find posts matching your humor preferences. Try updating your humor settings!" 
              : "No posts available at the moment. Check back later!"}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={`post-${post.timestamp}-${post.author}`} {...post} />
          ))}

          <div ref={sentinelRef} className="text-center py-4">
            {hasMore && (
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            )}
          </div>

          {!hasMore && (
            <div className="text-center py-6 text-light/60">
              You've reached the end of the feed
            </div>
          )}
        </>
      )}
    </div>
  )
}