'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { useEffect, useState, Fragment } from 'react'
import Image from 'next/image'

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
  const [isHumorModalOpen, setHumorModalOpen] = useState(false)
  const [isProfilePicModalOpen, setProfilePicModalOpen] = useState(false)
  const [isNameModalOpen, setNameModalOpen] = useState(false)
  const [isBioModalOpen, setBioModalOpen] = useState(false)

  const [humorPreferences, setHumorPreferences] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [newBio, setNewBio] = useState('')
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchUserDetails()
    }
  }, [user, router])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/getCurrentUser`,
        {
          headers: {
            Authorization: `Bearer ${user?.token ?? ''}`,
          },
        }
      )
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      console.log("Data from getCurrentUser:", data);
      setUserData(data)
      setNewName(data.name || '')
      setNewBio(data.bio || '')

      if (data.humorTypes?.length) {
        setHumorPreferences(data.humorTypes.map((ht: any) => ht.humorTypeName))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmHumorChange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Humor/ChangeHumor`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token ?? ''}`,
          },
          body: JSON.stringify({ humorTypes: humorPreferences }),
        }
      )
      if (!response.ok) throw new Error('Failed to update humor preferences')
      await fetchUserDetails()
      setHumorModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const confirmNameChange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/UpdateUsername`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token ?? ''}`,
          },
          body: JSON.stringify(newName),
        }
      )
      if (!response.ok) throw new Error('Failed to update name')
      await fetchUserDetails()
      setNameModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewProfilePic(file)
      previewUrl && URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const confirmProfilePicChange = async () => {
    if (!newProfilePic) return
    
    try {
      const formData = new FormData()
      formData.append('ProfilePicture', newProfilePic)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/UpdateProfilePicture`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${user?.token ?? ''}` },
          body: formData,
        }
      )
      if (!response.ok) throw new Error('Failed to update profile picture')
      await fetchUserDetails()
      setProfilePicModalOpen(false)
      setNewProfilePic(null)
      previewUrl && URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    } catch (err) {
      console.error(err)
    }
  }

  const updateBio = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/UpdateUserBio`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify(newBio),
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update bio')
      }
      await fetchUserDetails()
      setBioModalOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleHumorType = (type: string) => {
    setHumorPreferences(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  if (isLoading) return (<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>)
  if (!user) return null

  const getProfilePicUrl = (picPath?: string) => {
  if (!picPath) return null;
  
  // Handle full URLs and local paths correctly
  if (picPath.startsWith('http')) return picPath;
  
  // Add cache busting
  const timestamp = new Date().getTime();
  return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${picPath.replace(/^\\?\/?/, '')}?t=${timestamp}`;
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Centered Profile Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Profile Picture */}
          <div className="relative w-40 h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow">
            {userData?.profilePic ? (
             <Image
  src={getProfilePicUrl(userData?.profilePic) || ''}
  alt="Profile"
  width={160} 
  height={160}
  className="object-cover rounded-full"
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
            <h1 className="text-3xl font-bold text-glow">
              {user.name}
            </h1>
            <p className="text-light/80 text-lg">@{user.name}</p>
            
            {/* Display Humor Type */}
            <div className="text-lg font-semibold text-light/90">
              {humorPreferences.length > 0 ? `Humor Types: ${humorPreferences.join(', ')}` : 'Humor Type: Not Set'}
            </div>

            <div className="py-4 max-w-2xl mx-auto">
              <p className="text-light/90 text-base italic">
  {userData?.bio || user?.bio || "No bio yet. Tell us about yourself!"}
</p>
            </div>
          </div>
        </div>
        <div className="border-t border-glass/50 w-full mx-auto my-8" />

        {/* Social Connections */}
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-glow">Social Connections</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-glass rounded-xl p-4 min-w-[160px] transition hover:scale-105">
              <div className="text-2xl font-bold mb-2">
                {userData?.friendCount || '0'}
              </div>
              <div className="text-light/80 text-sm">Friends</div>
            </div>
            <div className="bg-glass rounded-xl p-4 min-w-[160px] transition hover:scale-105">
              <div className="text-2xl font-bold mb-2">
                {userData?.postCount || '0'}
              </div>
              <div className="text-light/80 text-sm">Posts</div>
            </div>
          </div>
        </div>
        <div className="border-t border-glass/50 w-full mx-auto my-8" />

        {/* Settings */}
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-glow">Account Settings</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setProfilePicModalOpen(true)}
              className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
            >
              <span className="text-xl">🖼️</span>
              <span className="text-light/90">Change Profile Picture</span>
            </button>
            <button
              onClick={() => setHumorModalOpen(true)}
              className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
            >
              <span className="text-xl">😄</span>
              <span className="text-light/90">Change Humor</span>
            </button>
<button
  onClick={() => setBioModalOpen(true)}
  className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"

>
  <span className="text-xl">📝</span>
  <span className="text-light/90">Change Bio</span>
</button>

            <button
              onClick={() => setNameModalOpen(true)}
              className="bg-glass rounded-xl p-4 px-8 transition hover:scale-105 hover:bg-glass/80 flex items-center gap-2"
            >
              <span className="text-xl">✏️</span>
              <span className="text-light/90">Change Name</span>
            </button>
          </div>
        </div>
      </div>

      {/* Humor Modal */}
      <Transition appear show={isHumorModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setHumorModalOpen(false)}
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
              <div
                className="fixed inset-0 bg-black"
                aria-hidden="true"
              />
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
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle
                              bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl
                              transform transition-all">
                <Dialog.Title className="text-2xl font-bold mb-4 text-[#c56cf0]">
                  Select Your Humor Type
                </Dialog.Title>

                <div className="flex flex-col gap-3">
                  {['Dark Humor', 'Friendly Humor'].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleHumorType(type)}
                      className={`
                        w-full text-left px-4 py-2 rounded-lg font-medium transition
                        ${humorPreferences.includes(type)
                          ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white shadow-lg'
                          : 'bg-[rgba(255,255,255,0.05)] text-light/80 hover:bg-[rgba(255,255,255,0.1)]'}
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirmHumorChange}
                  className="mt-6 w-full bg-gradient-to-r from-[#8e2de2] to-[#4a00e0]
                             text-white py-2 rounded-xl font-semibold hover:from-[#9e44f0]
                             hover:to-[#5a10e0] transition-all shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/* Change Bio Modal */}
<Transition appear show={isBioModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setBioModalOpen(false)}
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
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                    Change Your Bio
                  </Dialog.Title>
                  <button
                    onClick={() => setBioModalOpen(false)}
                    className="text-light/50 hover:text-light/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 mt-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c56cf0] outline-none rounded-lg text-light/90 resize-none"
                  placeholder="Write something about yourself..."
                />

                <button
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation(); 
    updateBio();
  }}
  disabled={!newBio.trim()}
  type="button" 
  className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg ${
    newBio.trim()
      ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]'
      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
  }`}
>
  Save Bio
</button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {/* Profile Picture Modal */}
      <Transition appear show={isProfilePicModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setProfilePicModalOpen(false)}
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
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl transform transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                    Change Profile Picture
                  </Dialog.Title>
                  <button
                    onClick={() => setProfilePicModalOpen(false)}
                    className="text-light/50 hover:text-light/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 mt-4">
                  {previewUrl && (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#c56cf0] mb-2">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-[rgba(255,255,255,0.05)] text-light/80 rounded-lg cursor-pointer hover:bg-[rgba(255,255,255,0.1)]">
                    <input 
                      type="file" 
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePicChange} 
                    />
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="mt-2 text-base">Select a file</span>
                  </label>
                </div>

                <button
                  onClick={confirmProfilePicChange}
                  disabled={!newProfilePic}
                  type="button"
                  className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg ${
                    newProfilePic 
                      ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]' 
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Name Change Modal */}
      <Transition appear show={isNameModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setNameModalOpen(false)}
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
              <div
                className="fixed inset-0 bg-black"
                aria-hidden="true"
              />
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
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle
                              bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl shadow-2xl
                              transform transition-all">
                <Dialog.Title className="text-2xl font-bold mb-4 text-[#c56cf0]">
                  Change Your Name
                </Dialog.Title>

                <div className="mt-4">
                  <label htmlFor="name" className="block text-sm font-medium text-light/80 mb-2">
                    New Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                               focus:border-[#c56cf0] outline-none rounded-lg text-light/90"
                    placeholder="Enter your new name"
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    confirmNameChange();
                  }}
                  disabled={!newName.trim()}
                  type="button"
                  className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg
                             ${newName.trim() 
                               ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]' 
                               : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                >
                  Confirm
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}