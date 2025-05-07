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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Profile Picture */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow shrink-0">
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
                <span className="text-4xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full min-w-0 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold text-glow truncate">
                  {user.name}
                </h1>
                <p className="text-light/80 truncate">@{user.name}</p>
              </div>
            </div>

            <p className="text-light/90 break-words">
              {user.bio || "No bio yet. Tell us about yourself!"}
            </p>

            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2 bg-glass rounded-lg px-4 py-2">
                <span className="font-semibold">1.2K</span>
                <span className="text-light/80">Friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}