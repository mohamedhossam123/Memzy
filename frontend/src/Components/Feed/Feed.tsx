'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import PostCard, { PostProps } from '@/Components/Feed/PostCard'
import { useAuth } from '@/Context/AuthContext'

interface ApiPost {
  postId: number
  mediaType: number 
  name: string 
  description: string
  filePath: string
  createdAt: string
  likeCounter: number
  profileImageUrl?: string
  isApproved: boolean
  humorTypeIds: number[]
  userName: string
  isLiked: boolean
  authorName?: string 
  userId?: number 
  onLikeUpdate?: (postId: number, isLiked: boolean, likeCount: number) => void 
}

interface ApiPostsResponse {
  posts: ApiPost[]
}

const humorMap: Record<number, 'Dark Humor' | 'Friendly Humor'> = {
  1: 'Dark Humor',
  2: 'Friendly Humor',
}

function mapApiPostToPostProps(apiPost: ApiPost): PostProps {
  return {
    id: apiPost.postId,
    author: apiPost.userName || apiPost.name || 'Anonymous', 
    authorName: apiPost.name,
    authorId: apiPost.userId?.toString() || undefined,
    content: apiPost.description,
    mediaType: apiPost.mediaType === 0 ? 'image' : apiPost.mediaType === 1 ? 'video' : null,
    mediaUrl: apiPost.filePath || null,
    timestamp: new Date(apiPost.createdAt).toLocaleString(),
    humorType: humorMap[apiPost.humorTypeIds[0]] || 'Friendly Humor', 
    likes: apiPost.likeCounter,
    isLiked: apiPost.isLiked || false,
    profileImageUrl: apiPost.profileImageUrl || null,
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

    if (observerRef.current) {
        observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(callback, {
      root: null, 
      rootMargin: '100px', 
      threshold: 0.1 
    })

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
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
  const [initialLoad, setInitialLoad] = useState(true) 
  const { user, api } = useAuth() 

  const onLoadMoreCallback = useCallback(() => {
    if (!loading && hasMore) { 
      setPage(prev => prev + 1)
    }
  }, [loading, hasMore])

  const { sentinelRef } = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: onLoadMoreCallback,
  })

  useEffect(() => {
    if (user !== undefined) { 
      setPage(1)
      setPosts([])
      setHasMore(true)
      setError(null)
      setInitialLoad(true)
    }
  }, [user])

  const endpoint = useMemo(() =>
    user
      ? `/api/Posts/GetFirst6BasedOnUser`
      : `/api/Posts/GetFirst6`,
    [user]
  )

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!hasMore && page > 1) { 
        setLoading(false);
        return;
      }

      const response = await api.post(endpoint, { page, pageSize: 6 })

      if (!response || !response.ok) {
        const errorText = await response?.text().catch(() => 'Unknown error')
        throw new Error(`Failed to fetch feed: ${response?.status} ${errorText}`)
      }
      const data: ApiPostsResponse = await response.json()

      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid response format from server: posts array not found or not an array.')
      }

      const newPosts = data.posts.map(mapApiPostToPostProps)

      setPosts(prev => {
        if (page === 1) {
          return newPosts
        } else {
          const existingIds = new Set(prev.map(p => p.id))
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id))
          return [...prev, ...uniqueNewPosts]
        }
      })

      setHasMore(newPosts.length === 6) 
      setInitialLoad(false)
    } catch (err) {
      console.error('Feed fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load feed.')
      setHasMore(false) 
    } finally {
      setLoading(false)
    }
  }, [user, api, page, endpoint, hasMore]) 
  useEffect(() => {
    if (api) { 
        fetchPosts()
    }
  }, [fetchPosts, api])
  const updatePostLike = useCallback((postId: number, isLiked: boolean, likeCount: number) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked, likes: likeCount }
        : post
    ))
  }, [])
  if (loading && initialLoad) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        <p className="text-light/60 mt-4">
          {user ? 'Loading your personalized feed...' : 'Loading posts...'}
        </p>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">😵</div>
        <p className="text-red-400 mb-4">Error loading feed: {error}</p>
        <button
          onClick={() => {
            setPage(1)
            setPosts([]) 
            setHasMore(true) 
            setError(null)
            setInitialLoad(true) 
          }}
          className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome message for logged-in users */}
      {user && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-glow mb-2">
            Welcome back, {user.name}!
          </h2>
        </div>
      )}

      {/* Login prompt for guests */}
      {!user && (
        <div className="text-center mb-6 bg-glass/5 rounded-2xl p-6">
          <div className="text-4xl mb-2">👋</div>
          <h3 className="text-xl font-semibold text-light mb-2">Welcome to Memzy!</h3>
          <p className="text-light/60 mb-4">
            Login to get personalized content based on your humor preferences
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
          >
            Login
          </a>
        </div>
      )}

      {/* No posts found message */}
      {posts.length === 0 && !loading ? (
        <div className="text-center py-12 bg-glass/5 rounded-2xl">
          <div className="text-6xl mb-4">😅</div>
          <h3 className="text-xl font-semibold text-light mb-2">No posts found</h3>
          <p className="text-light/60">
            {user
              ? "We couldn't find posts matching your humor preferences. Try updating your humor settings!"
              : "No posts available at the moment. Check back later!"}
          </p>
          {user && (
            <button
              onClick={() => {
                setPage(1)
                setPosts([])
                setHasMore(true)
                setInitialLoad(true)
              }}
              className="mt-4 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
            >
              Refresh Feed
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Render the posts */}
          {posts.map((post) => (
            <PostCard
              key={`${post.id}-${post.isLiked}`} // Using isLiked in key for re-render on like state change
              {...post}
              onLikeUpdate={updatePostLike}
            />
          ))}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="text-center py-4">
            {loading && hasMore && ( 
              <>
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                <p className="text-light/60 mt-2 text-sm">Loading more posts...</p>
              </>
            )}
          </div>

          {/* End of feed message */}
          {!hasMore && posts.length > 0 && ( 
            <div className="text-center py-6 bg-glass/5 rounded-2xl">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-light/60">You've reached the end of the feed</p>
              <button
                onClick={() => {
                  setPage(1)
                  setPosts([])
                  setHasMore(true)
                  setInitialLoad(true)
                }}
                className="mt-3 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors text-sm"
              >
                Refresh Feed
              </button>
            </div>
          )}

          {/* Error message for subsequent loads */}
          {error && posts.length > 0 && (
            <div className="text-center py-4 bg-red-500/10 rounded-lg border border-red-400/30">
              <p className="text-red-400 text-sm">Failed to load more posts</p>
              <button
                onClick={() => {
                  setError(null)
                }}
                className="mt-2 px-3 py-1 bg-red-400/20 text-red-400 rounded text-sm hover:bg-red-400/30 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}