// Components/PostFeedComponent.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext' 

interface Post {
  postId: number
  mediaUrl: string | null 
  description: string
  createdAt: string
  likeCounter: number
  postHumors: {
    humorType: {
      name: string
    }
  }[]
}

export default function PostFeed() {
    const [mediaErrors, setMediaErrors] = useState<Set<number>>(new Set());
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth() // Get the user from AuthContext

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        console.log('Attempting to fetch posts...')
        if (!user || !user.token) {
          console.error('No authenticated user or token found in context')
          setError('Authentication required. Please login.')
          setLoading(false)
          
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          
          return
        }
        
        console.log('User authenticated, sending request to API...')
        
        
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include' 
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          let errorMessage = `Server responded with status: ${response.status}`
          try {
            const errorData = await response.json()
            console.error('Error details:', errorData)
            errorMessage = errorData.message || errorData.title || errorMessage
            
            if (response.status === 401) {
              console.log('Unauthorized - token may be invalid or expired')
            }
          } catch (e) {
          }
          
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        console.log('Posts received:', data)
        setPosts(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [user, router])

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
            className="px-4 py-2 bg-[#c56cf033] text-[#c56cf0] rounded-lg hover:bg-[#c56cf066]"
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
      {posts.map((post) => (
        <div
          key={post.postId}
          className="relative bg-[rgba(30,30,30,0.9)] backdrop-blur-md rounded-xl p-4 shadow-xl border border-[rgba(255,255,255,0.1)] hover:border-[#c56cf0] transition-all"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-800">
  {post.mediaUrl ? (
    post.mediaUrl.endsWith('.mp4') ? (
      <video 
        className="w-full h-full object-cover" 
        controls
        onError={() => setMediaErrors(prev => new Set(prev).add(post.postId))}
      >
        <source src={post.mediaUrl} />
        Your browser does not support the video tag.
      </video>
    ) : (
      <div className="relative w-full h-full">
        <Image
          src={post.mediaUrl}
          alt="Post content"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setMediaErrors(prev => new Set(prev).add(post.postId))}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PC9zdmc+"
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
          onClick={() => {
            setMediaErrors(prev => {
              const newErrors = new Set(prev);
              newErrors.delete(post.postId);
              return newErrors;
            });
          }}
        >
          Retry
        </button>
      </div>
    </div>
  )}
</div>

          {/* Content */}
          <div className="space-y-3">
            {/* Description */}
            <p className="text-light/90 text-sm line-clamp-3">
              {post.description}
            </p>

            {/* Humor Tags */}
            <div className="flex flex-wrap gap-2">
              {post.postHumors.map((humor, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-[#8e2de233] text-[#c56cf0] text-xs font-medium rounded-full"
                >
                  {humor.humorType.name}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[rgba(255,255,255,0.05)]">
              <span className="text-xs text-light/60">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#c56cf0]">❤️ {post.likeCounter}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
