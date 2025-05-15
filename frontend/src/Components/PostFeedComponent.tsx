// Components/PostFeedComponent.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Post {
  id: number
  mediaUrl: string
  description: string
  humorTypes: string[]
  createdAt: string
  likes: number
}


  // Components/PostFeedComponent.tsx
export default function PostFeed() {
    const [posts] = useState<Post[]>([
    {
      id: 1,
      mediaUrl: '/memzyiconcopyyy.jpg',
      description: 'Funny meme about programming',
      humorTypes: ['Dark Humor', 'Geek'],
      createdAt: '2024-03-20',
      likes: 42
    }
  ])
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative bg-[rgba(30,30,30,0.9)] backdrop-blur-md rounded-xl p-4 shadow-xl border border-[rgba(255,255,255,0.1)] hover:border-[#c56cf0] transition-all"
        >
          {/* Media Container */}
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
            {post.mediaUrl.endsWith('.mp4') ? (
              <video className="w-full h-full object-cover" controls>
                <source src={post.mediaUrl} />
              </video>
            ) : (
              <Image
                src={post.mediaUrl}
                alt="Post content"
                fill
                className="object-cover"
              />
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
              {post.humorTypes.map((type) => (
                <span
                  key={type}
                  className="px-2.5 py-1 bg-[#8e2de233] text-[#c56cf0] text-xs font-medium rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[rgba(255,255,255,0.05)]">
              <span className="text-xs text-light/60">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#c56cf0]">❤️ {post.likes}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
