'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { HumorModal } from '@/Components/SettingsModals/HumorModal'
import { ProfilePictureModal } from '@/Components/SettingsModals/ProfilePictureModal'
import { NameModal } from '@/Components/SettingsModals/NameModal'
import { BioModal } from '@/Components/SettingsModals/BioModal'
import { PasswordModal } from '@/Components/SettingsModals/PasswordModal'
import PostForm from '@/Components/PostsFormComponent'
import PostFeed from '@/Components/PostFeedComponent'

export default function UserProfile() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  interface FullUser {
    profilePic?: string
    name?: string
    bio?: string
    friendCount?: number
    postCount?: number
    humorTypes?: { humorTypeName: string }[]
  }

  const [userData, setUserData] = useState<FullUser | null>(null)
  const [activeModal, setActiveModal] = useState<
    'humor' | 'profilePic' | 'name' | 'bio' | 'password' | 'friends' | 'createPost' | null
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
        { headers: { Authorization: `Bearer ${token}` }}
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

  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/GetFriends`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Friends/GetFriendRequests`,
        { headers: { Authorization: `Bearer ${token}` } }
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
          headers: { Authorization: `Bearer ${token}` }
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
          headers: { Authorization: `Bearer ${token}` }
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
          headers: { Authorization: `Bearer ${token}` }
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
            Authorization: `Bearer ${token}`
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
            Authorization: `Bearer ${token}`
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
          headers: { Authorization: `Bearer ${token}` },
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
            Authorization: `Bearer ${token}`
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
            Authorization: `Bearer ${token}`
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
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          {/* Profile Picture Section */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow hover:shadow-accent/30 transition-shadow">
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
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
            )}
            <button
              onClick={() => setActiveModal('profilePic')}
              className="absolute bottom-0 right-0 bg-glass/80 backdrop-blur-sm rounded-tl-lg px-3 py-1 text-sm hover:bg-glass transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-glow">{userData?.name || user.name}</h1>
              <button
                onClick={() => setActiveModal('name')}
                className="text-accent hover:text-accent/80 flex items-center gap-2 text-sm"
              >
                <span>✏️ Edit Name</span>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-light/80">Humor style:</span>
                <button
                  onClick={() => setActiveModal('humor')}
                  className="badge-style bg-glass px-3 py-1 rounded-full hover:bg-glass/80 transition-colors"
                >
                  {userData?.humorTypes?.map(ht => ht.humorTypeName).join(', ') || 'Not set'}
                </button>
              </div>

              <div className="mt-4 max-w-2xl mx-auto md:mx-0">
                <div className="group relative">
                  <p className="text-light/90 text-lg italic p-4 bg-glass/20 rounded-xl transition-all">
                    {userData?.bio || 'Click to add a bio...'}
                  </p>
                  <button
                    onClick={() => setActiveModal('bio')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-accent hover:text-accent/80"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Security Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 shadow-glow hover:shadow-glow/50 transition-all">
            <h3 className="text-xl font-semibold mb-4 text-accent border-b border-glass pb-2">
              Social Stats
            </h3>
            <div className="flex justify-around">
              <button
                onClick={() => setActiveModal('friends')}
                className="flex flex-col items-center transition-transform hover:scale-105"
              >
                <span className="text-3xl font-bold mb-1">{userData?.friendCount ?? 0}</span>
                <span className="text-sm text-light/70">Friends</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold mb-1">{userData?.postCount ?? 0}</span>
                <span className="text-sm text-light/70">Posts</span>
              </div>
            </div>
          </div>

          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 shadow-glow hover:shadow-glow/50 transition-all">
            <h3 className="text-xl font-semibold mb-4 text-accent border-b border-glass pb-2">
              Account Security
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => setActiveModal('password')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-glass/5 transition-colors hover:bg-glass/20"
              >
                <span className="text-xl">🔒</span>
                <div className="text-left">
                  <p className="text-light/90">Change Password</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="border-t border-glass/30 pt-16">
          {/* Floating Create Button */}
          <button
            onClick={() => setActiveModal('createPost')}
            className="fixed bottom-8 right-8 z-50 bg-glass rounded-xl p-5 shadow-2xl transition hover:scale-105 hover:shadow-glow group"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">➕</span>
              <span className="text-light/90 hidden md:block">Create Post</span>
            </div>
          </button>

          {/* Posts Feed Header */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-glow">My Posts</h2>
          </div>

          {/* Posts Grid */}
          <PostFeed />
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
            await handlePasswordChange(current, next)
          }}
          error={passwordError}
        />

        {/* Create Post Modal */}
        <Transition appear show={activeModal === 'createPost'} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
            onClose={() => setActiveModal(null)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-50"
                leave="ease-in duration-200"
                leaveFrom="opacity-50"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black" aria-hidden="true" />
              </Transition.Child>

              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>

              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.95)] backdrop-blur-2xl rounded-2xl shadow-2xl transform transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                      Create New Post
                    </Dialog.Title>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="text-light/50 hover:text-light/80 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <PostForm onSuccess={() => setActiveModal(null)} />
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

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
    </div>
  )
}