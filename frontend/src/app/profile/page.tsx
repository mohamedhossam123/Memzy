'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function UserProfile() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) return null

  const getProfilePicUrl = (picPath?: string) => {
    if (!picPath) return null
    const normalizedPath = picPath.replace(/\\/g, '/').replace('uploads/profile_pictures/', '')
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/uploads/profile_pictures/${normalizedPath}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8"> {/* Reduced max-width for better centering */}
        {/* Centered Profile Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Profile Picture */}
          <div className="relative w-48 h-48 rounded-full border-4 border-accent overflow-hidden shadow-glow">
            {user.profilePic ? (
              <Image
                src={getProfilePicUrl(user.profilePic) || ''}
                alt="Profile"
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <span className="text-6xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-glow">
              {user.name}
            </h1>
            <p className="text-light/80 text-xl">@{user.name}</p>
            
            <div className="py-4 max-w-2xl mx-auto">
              <p className="text-light/90 text-lg italic">
                {user.bio || "No bio yet. Tell us about yourself!"}
              </p>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-glass/50 w-3/4 mx-auto my-8" />

        {/* Friends Section */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-glow">Social Connections</h2>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="bg-glass rounded-xl p-6 min-w-[200px] transition hover:scale-105">
              <div className="text-3xl font-bold mb-2">1.2K</div>
              <div className="text-light/80">Friends</div>
            </div>
            <div className="bg-glass rounded-xl p-6 min-w-[200px] transition hover:scale-105">
              <div className="text-3xl font-bold mb-2">356</div>
              <div className="text-light/80">Following</div>
            </div>
            <div className="bg-glass rounded-xl p-6 min-w-[200px] transition hover:scale-105">
              <div className="text-3xl font-bold mb-2">891</div>
              <div className="text-light/80">Followers</div>
            </div>
          </div>
        </div>

        {/* Additional Separator Line */}
        <div className="border-t border-glass/50 w-3/4 mx-auto my-8" />

        {/* Activity Section */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-glow">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-glass rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold mb-2">Latest Memory</h3>
              <p className="text-light/80 italic">"That amazing concert last night!"</p>
            </div>
            <div className="bg-glass rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold mb-2">Recent Achievement</h3>
              <p className="text-light/80 italic">Memory Master Level 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}