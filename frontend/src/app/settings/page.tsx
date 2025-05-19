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
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light"> 
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-glow">Account Settings</h1>
          <div className="border-t border-glass/50 w-full mx-auto my-8" />
        </div>

        <div className="text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-4">
            <SettingsButton
              icon="🖼️"
              label="Change Profile Picture"
              onClick={() => setActiveModal('profilePic')}
            />
            <SettingsButton
              icon="😄"
              label="Change Humor"
              onClick={() => setActiveModal('humor')}
            />
            <SettingsButton
              icon="📝"
              label="Change Bio"
              onClick={() => setActiveModal('bio')}
            />
            <SettingsButton
              icon="✏️"
              label="Change Name"
              onClick={() => setActiveModal('name')}
            />
            <SettingsButton
              icon="🔒"
              label="Change Password"
              onClick={() => setActiveModal('password')}
            />
          </div>
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

const SettingsButton = ({ 
  icon, 
  label, 
  onClick 
}: { 
  icon: string
  label: string
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
  >
    <span className="text-xl">{icon}</span>
    <span className="text-light/90">{label}</span>
  </button>
)