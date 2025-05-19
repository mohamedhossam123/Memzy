'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  BioModal
} from '@/Components/SettingsModals/BioModal'
import { 
  HumorModal
} from '@/Components/SettingsModals/HumorModal'
import { 
  NameModal
} from '@/Components/SettingsModals/NameModal'
import { 
  PasswordModal
} from '@/Components/SettingsModals/PasswordModal'
import { 
  ProfilePictureModal
} from '@/Components/SettingsModals/ProfilePictureModal'

interface FullUser {
  profilePic?: string
  name?: string
  bio?: string
  token?: string
  humorTypes?: { humorTypeName: string }[]
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<FullUser | null>(null)
  const [activeModal, setActiveModal] = useState<
    'humor' | 'profilePic' | 'name' | 'bio' | 'password' | null
  >(null)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (!user) router.push('/login')
    else fetchUserDetails()
  }, [user, router])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/getCurrentUser`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setUserData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handlers for different modals
  const handleHumorUpdate = async (selectedHumor: string[]) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Humor/ChangeHumor`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ humorTypes: selectedHumor })
        }
      )
      if (!res.ok) throw new Error('Failed to update humor preferences')
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handleNameUpdate = async (newName: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/UpdateUsername`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify(newName)
        }
      )
      if (!res.ok) throw new Error('Failed to update name')
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handleProfilePicUpdate = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('ProfilePicture', file)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/UpdateProfilePicture`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user?.token}` },
          body: formData
        }
      )
      if (!res.ok) throw new Error('Failed to update profile picture')
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handleBioUpdate = async (newBio: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/UpdateUserBio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify(newBio)
        }
      )
      if (!res.ok) throw new Error('Failed to update bio')
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    setPasswordError('')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Password update failed')
      }
      alert('Password changed successfully')
    } catch (err: any) {
      console.error(err)
      setPasswordError(err.message)
      throw err // Re-throw to keep modal open
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-darker to-primary-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light pl-4 pr-4 md:pl-8 md:pr-8">
      <div className="max-w-5xl mx-auto py-8 relative z-10">
        {/* Profile Summary Card */}
        <div className="bg-glass/20 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-glass/30">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-400/50 shadow-inner">
                {userData?.profilePic ? (
                  <img 
                    src={userData.profilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-dark flex items-center justify-center text-4xl">
                    {userData?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <button 
                  onClick={() => setActiveModal('profilePic')}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-light transition-colors"
                >
                  <span>📷</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {userData?.name || 'User'}
                </h2>
                <button 
                  onClick={() => setActiveModal('name')}
                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors inline-flex items-center"
                >
                  <span className="text-sm">✏️</span>
                  <span className="ml-1">Edit</span>
                </button>
              </div>
              <div className="mt-2 max-w-lg">
                <p className="text-gray-300 line-clamp-2">
                  {userData?.bio || 'No bio yet. Add something about yourself!'}
                </p>
                <button 
                  onClick={() => setActiveModal('bio')}
                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors mt-1 inline-flex items-center"
                >
                  <span className="text-sm">📝</span>
                  <span className="ml-1">Edit bio</span>
                </button>
              </div>
              
              {userData?.humorTypes && userData.humorTypes.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {userData.humorTypes.map((humor, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 text-xs bg-purple-900/40 text-purple-200 rounded-full"
                      >
                        {humor.humorTypeName}
                      </span>
                    ))}
                    <button 
                      onClick={() => setActiveModal('humor')}
                      className="px-2 py-1 text-xs bg-purple-900/20 text-purple-300 rounded-full hover:bg-purple-900/40 transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-purple-100 mb-6">Account Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsCard
            icon="🖼️"
            title="Profile Picture"
            description="Update your profile image"
            onClick={() => setActiveModal('profilePic')}
          />
          
          <SettingsCard
            icon="😄"
            title="Humor Preferences"
            description="Set your humor style"
            onClick={() => setActiveModal('humor')}
          />
          
          <SettingsCard
            icon="📝"
            title="Bio Information"
            description="Update your personal bio"
            onClick={() => setActiveModal('bio')}
          />
          
          <SettingsCard
            icon="✏️"
            title="Display Name"
            description="Change how your name appears"
            onClick={() => setActiveModal('name')}
          />
          
          <SettingsCard
            icon="🔒"
            title="Password"
            description="Update your security credentials"
            onClick={() => setActiveModal('password')}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Modals */}
      <HumorModal
        isOpen={activeModal === 'humor'}
        onClose={() => setActiveModal(null)}
        initialHumorTypes={userData?.humorTypes?.map(ht => ht.humorTypeName) || []}
        onConfirm={handleHumorUpdate}
      />

      <ProfilePictureModal
        isOpen={activeModal === 'profilePic'}
        onClose={() => setActiveModal(null)}
        currentProfilePic={userData?.profilePic}
        onConfirm={handleProfilePicUpdate}
      />

      <NameModal
        isOpen={activeModal === 'name'}
        onClose={() => setActiveModal(null)}
        currentName={userData?.name || ''}
        onConfirm={handleNameUpdate}
      />

      <BioModal
        isOpen={activeModal === 'bio'}
        onClose={() => setActiveModal(null)}
        bio={userData?.bio || ''}
        onSave={handleBioUpdate}
      />

      <PasswordModal
        isOpen={activeModal === 'password'}
        onClose={() => setActiveModal(null)}
        onConfirm={handlePasswordChange}
        error={passwordError}
      />
    </div>
  )
}

const SettingsCard = ({ 
  icon, 
  title,
  description,
  onClick,
  className = ""
}: { 
  icon: string
  title: string
  description: string
  onClick: () => void
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`bg-glass/30 backdrop-blur-sm hover:bg-glass/40 rounded-xl p-6 transition-all transform hover:scale-[1.02] shadow-md border border-glass/20 text-left flex items-center gap-4 relative z-10 ${className}`}
  >
    <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center text-2xl">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  </button>
)