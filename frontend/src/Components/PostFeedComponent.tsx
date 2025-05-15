'use client'
import { useState } from 'react'
import Link from 'next/link'
// import { useAuth } from '@/Context/AuthContext'

interface Post {
  id: number
  mediaUrl: string
  description: string
  humorTypes: string[]
  createdAt: string
  likes: number
}

export default function PostsPage() {
//   const { user } = useAuth()
  // Example posts data - replace with your actual data fetching logic
  const [posts] = useState<Post[]>([
    {
      id: 1,
      mediaUrl: '/example-image.jpg',
      description: 'Funny meme about programming',
      humorTypes: ['Dark Humor', 'Geek'],
      createdAt: '2024-03-20',
      likes: 42
    },
    // Add more posts...
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">My Posts</h1>
          <p className="text-[#888]">Showing {posts.length} posts</p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[rgba(10,10,10,0.75)] backdrop-blur border border-[rgba(255,255,255,0.1)] rounded-xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:translate-y-[-2px] transition-transform"
            >
              {/* Media */}
              {post.mediaUrl.endsWith('.mp4') ? (
                <video
                  controls
                  className="w-full rounded-lg aspect-video object-cover mb-4 border border-[rgba(255,255,255,0.1)]"
                >
                  <source src={post.mediaUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full rounded-lg aspect-video object-cover mb-4 border border-[rgba(255,255,255,0.1)]"
                  loading="lazy"
                />
              )}

              {/* Description */}
              <p className="text-[#f5f5f5] mb-4">{post.description}</p>

              {/* Humor Types */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.humorTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-gradient-to-r from-[#8e2de2]/30 to-[#4a00e0]/30 text-[#c56cf0] text-xs font-semibold rounded-full border border-[#8e44ad]"
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex justify-between items-center text-[#888] text-sm">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Create Button */}
        <Link
          href="/create-post"
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] flex items-center justify-center text-2xl shadow-lg hover:from-[#9e44f0] hover:to-[#5a10e0] hover:scale-110 transition-all"
          aria-label="Create new post"
        >
          +
        </Link>
      </div>
    </div>
  )
}