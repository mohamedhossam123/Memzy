'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter} from 'next/navigation'
import Link from 'next/link'
import { Dialog } from '@headlessui/react'

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
const [isHumorModalOpen, setHumorModalOpen] = useState(false)
const [humorPreferences, setHumorPreferences] = useState<string[]>([])

const toggleHumorType = (type: string) => {
  setHumorPreferences((prev) =>
    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
  )
}

const confirmHumorChange = () => {
  console.log("Selected Humor Types:", humorPreferences)
  setHumorModalOpen(false)
  // TODO: Send to backend here
}
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
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Centered Profile Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Profile Picture */}
          <div className="relative w-40 h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow">
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
                <span className="text-5xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-glow">
              {user.name}
            </h1>
            <p className="text-light/80 text-lg">@{user.name}</p>
            
            <div className="py-4 max-w-2xl mx-auto">
              <p className="text-light/90 text-base italic">
                {user.bio || "No bio yet. Tell us about yourself!"}
              </p>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-glass/50 w-full mx-auto my-8" />

        {/* Social Connections */}
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-glow">Social Connections</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-glass rounded-xl p-4 min-w-[160px] transition hover:scale-105">
              <div className="text-2xl font-bold mb-2">1.2K</div>
              <div className="text-light/80 text-sm">Friends</div>
            </div>
            <div className="bg-glass rounded-xl p-4 min-w-[160px] transition hover:scale-105">
              <div className="text-2xl font-bold mb-2">891</div>
              <div className="text-light/80 text-sm">Posts</div>
            </div>
          </div>
        </div>

        {/* Additional Separator Line */}
        <div className="border-t border-glass/50 w-full mx-auto my-8" />

        {/* Settings */}
<div className="text-center space-y-6">
  <h2 className="text-xl font-semibold text-glow">Account Settings</h2>
  <div className="flex flex-wrap justify-center gap-4">
    <Link
      href="/change-profile-picture"
      className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
    >
      <span className="text-xl">🖼️</span>
      <span className="text-light/90">Change Profile Picture</span>
    </Link>
    <button
  onClick={() => setHumorModalOpen(true)}
  className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
>
  <span className="text-xl">😄</span>
  <span className="text-light/90">Change Humor</span>
</button>

    <Link
      href="/change-name"
      className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
    >
      <span className="text-xl">✏️</span>
      <span className="text-light/90">Change Name</span>
    </Link>
  </div>
</div>

      </div>
      <Dialog open={isHumorModalOpen} onClose={() => setHumorModalOpen(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="bg-glass p-6 rounded-2xl shadow-lg text-center w-[90%] max-w-md">
      <Dialog.Title className="text-xl font-bold mb-4 text-glow">Select Your Humor Type</Dialog.Title>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => toggleHumorType('Dark Humor')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            humorPreferences.includes('Dark Humor') ? 'bg-accent text-white' : 'bg-glass/50 text-light/80'
          }`}
        >
          Dark Humor
        </button>
        <button
          onClick={() => toggleHumorType('Friendly Humor')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            humorPreferences.includes('Friendly Humor') ? 'bg-accent text-white' : 'bg-glass/50 text-light/80'
          }`}
        >
          Friendly Humor
        </button>
      </div>

      <button
        onClick={confirmHumorChange}
        className="mt-6 bg-accent text-white px-6 py-2 rounded-xl hover:bg-accent/80 transition"
      >
        Confirm
      </button>
    </Dialog.Panel>
  </div>
</Dialog>


    </div>
  )
}