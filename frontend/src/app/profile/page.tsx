'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  HumorModal,} from '@/Components/SettingsModals/HumorModal'
import {
  ProfilePictureModal,
} from '@/Components/SettingsModals/ProfilePictureModal'
import {
  NameModal,
} from '@/Components/SettingsModals/NameModal'
import {
  BioModal,
} from '@/Components/SettingsModals/BioModal'
import {
  PasswordModal,
} from '@/Components/SettingsModals/PasswordModal'


export default function UserProfile() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  interface FullUser {
    profilePic?: string
    name?: string
    bio?: string
    token?: string
    friendCount?: number
    postCount?: number
    humorTypes?: { humorTypeName: string }[]
  }

  const [userData, setUserData] = useState<FullUser | null>(null)
  const [activeModal, setActiveModal] = useState<
    'humor' | 'profilePic' | 'name' | 'bio' | 'password' | 'friends' | null
  >(null)
  const [passwordError, setPasswordError] = useState('')

  const friendTabs = ["friends", "requests"] as const
  const [activeFriendsTab, setActiveFriendsTab] = useState<'friends' | 'requests'>('friends')
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [friendsList, setFriendsList] = useState<any[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchUserDetails()
    }
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
      if (data.humorTypes?.length) {
        setHumorPreferences(data.humorTypes.map((ht: any) => ht.humorTypeName))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/GetFriends`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      if (!response.ok) throw new Error('Failed to fetch friends')
      const data = await response.json()
      setFriendsList(data)
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/get-received-requests`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      )
      if (!response.ok) throw new Error('Failed to fetch requests')
      const data = await response.json()
      setFriendRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  useEffect(() => {
    if (activeModal === 'friends') {
      if (activeFriendsTab === 'friends') {
        fetchFriends()
      } else {
        fetchFriendRequests()
      }
    }
  }, [activeModal, activeFriendsTab])

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/acceptRequest/${requestId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      )
      if (!response.ok) throw new Error('Failed to accept request')
      fetchFriendRequests()
      fetchUserDetails()
    } catch (error) {
      console.error('Error accepting request:', error)
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/rejectrequest/${requestId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      )
      if (!response.ok) throw new Error('Failed to reject request')
      fetchFriendRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const handleRemoveFriend = async (friendId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/RemoveFriend?friendId=${friendId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user?.token}` }
        }
      )
      if (!response.ok) throw new Error('Failed to remove friend')
      fetchFriends()
      fetchUserDetails()
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

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
          body: JSON.stringify({ 
            currentPassword,  
            newPassword
          })
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Password update failed')
      }
      alert('Password changed successfully')
      return true
    } catch (err: any) {
      console.error(err)
      setPasswordError(err.message)
      return false
    }
  }

  const getProfilePicUrl = (picPath?: string) => {
    if (!picPath) return '/default-avatar.png'
    if (picPath.startsWith('http')) return picPath
    const cleanPath = picPath.replace(/^[\/]/, '')
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${cleanPath}?t=${Date.now()}`
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
        {/* Centered Profile Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Profile Picture */}
          <div className="relative w-40 h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow">
            {userData?.profilePic ? (
              <Image
                src={getProfilePicUrl(userData.profilePic)}
                alt="Profile"
                width={160}
                height={160}
                className="object-cover w-full h-full"
                priority
                unoptimized={process.env.NODE_ENV !== 'production'}
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
            <h1 className="text-3xl font-bold text-glow">{user.name}</h1>
            <p className="text-light/80 text-lg">@{user.name}</p>
            <div className="text-lg font-semibold text-light/90">
  {userData?.humorTypes?.length
    ? `Humor Types: ${userData.humorTypes.map(ht => ht?.humorTypeName ?? 'Unknown').join(', ')}`
    : 'Humor Type: Not Set'}
</div>
            <div className="py-4 max-w-2xl mx-auto">
              <p className="text-light/90 text-base italic">
                {userData?.bio || 'No bio yet. Tell us about yourself!'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-glass/50 w-full mx-auto my-8" />

        {/* Social Connections */}
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-glow">Social Connections</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setActiveModal('friends')}
              className="bg-glass rounded-xl p-4 min-w-[160px] transition hover:scale-105 flex flex-col items-center"
            >
              <div className="text-2xl font-bold mb-2">{userData?.friendCount ?? 0}</div>
              <div className="text-light/80 text-sm">Friends</div>
            </button>

            <button
              onClick={() => router.push('/posts')}
              className="bg-glass rounded-xl p-4 min-w-[160px] transition hover:scale-105 flex flex-col items-center"
            >
              <div className="text-2xl font-bold mb-2">{userData?.postCount ?? 0}</div>
              <div className="text-light/80 text-sm">Posts</div>
            </button>
          </div>
        </div>

        <div className="border-t border-glass/50 w-full mx-auto my-8" />

        {/* Settings */}
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-glow">Profile Settings</h2>
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
  onConfirm={async (current, next) => {
    await handlePasswordChange(current, next); 
  }}
  error={passwordError}
/>

      {/* Friends Modal */}
      {activeModal === 'friends' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              aria-hidden="true"
              onClick={() => setActiveModal(null)}
            />
            
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-[#c56cf0]">
                  Friends Management
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-light/50 hover:text-light/80 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tab Buttons */}
              <div className="flex gap-2 mb-4">
                {friendTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFriendsTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeFriendsTab === tab
                        ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white'
                        : 'bg-[rgba(255,255,255,0.05)] text-light/80 hover:bg-[rgba(255,255,255,0.1)]'
                    }`}
                  >
                    {tab === 'friends' ? 'Friends' : 'Requests'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="max-h-64 overflow-y-auto space-y-4">
                {activeFriendsTab === 'friends' ? (
                  friendsList.length > 0 ? (
                    friendsList.map(friend => (
                      <div key={friend.userId} className="flex items-center gap-3 p-2 bg-glass/10 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          {friend.profilePic ? (
                            <Image
                              src={getProfilePicUrl(friend.profilePic)}
                              alt={friend.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-white">
                              {friend.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-light/90">{friend.name}</span>
                        <button
                          onClick={() => handleRemoveFriend(friend.userId)}
                          className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-light/60">No friends yet</p>
                  )
                ) : (
                  friendRequests.length > 0 ? (
                    friendRequests.map(request => (
                      <div key={request.requestId} className="flex items-center justify-between p-2 bg-glass/10 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            {request.sender?.profilePic ? (
                              <Image
                                src={getProfilePicUrl(request.sender.profilePic)}
                                alt={request.sender.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-white">
                                {request.sender?.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-light/90">{request.sender?.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAcceptRequest(request.requestId)}
                            className="text-sm px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(request.requestId)}
                            className="text-sm px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-light/60">No pending requests</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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