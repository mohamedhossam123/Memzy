// static page
'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { HumorModal } from '@/Components/ProfilePageModels/HumorModal'
import { ProfilePictureModal } from '@/Components/ProfilePageModels/ProfilePictureModal'
import { NameModal } from '@/Components/ProfilePageModels/NameModal'
import { BioModal } from '@/Components/ProfilePageModels/BioModal'
import { PasswordModal } from '@/Components/ProfilePageModels/PasswordModal'
import PostForm from '@/Components/ProfilePageModels/CreatePostComponent'
import PostFeed, { Post } from '@/Components/ProfilePageModels/ProfilePostsComponent'
import PostsModal from '@/Components/Moderator/ModPostsModal'


export default function UserProfile() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  interface FullUser {
    profilePic?: string
    name?: string
    bio?: string
    friendCount?: number
    postCount?: number
    humorTypes?: string[] 
    userName?: string 
  }

  const [userData, setUserData] = useState<FullUser | null>(null)
  const [activeModal, setActiveModal] = useState<
    'humor' | 'profilePic' | 'name' | 'bio' | 'password' | 'friends' | 'createPost' | 'posts' | null
  >(null)
  const [passwordError, setPasswordError] = useState('')
  const [profileImageError, setProfileImageError] = useState(false)
  
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([])

  const friendTabs = ["friends", "requests"] as const
  const [activeFriendsTab, setActiveFriendsTab] = useState<'friends' | 'requests'>('friends')
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [friendsList, setFriendsList] = useState<any[]>([])
  const [availableHumorTypes, setAvailableHumorTypes] = useState<string[]>([])

  useEffect(() => {
    console.log('User humor types:', userData?.humorTypes)
    console.log('Available humor types:', availableHumorTypes)
  }, [userData, availableHumorTypes])

  useEffect(() => {
  const fetchHumorTypes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/UserHumor/GetAllHumorTypes`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch humor types');
      const data = await response.json();
      const humorTypeNames = data.humorTypes || [];
      console.log('Available humor types:', humorTypeNames); 
      setAvailableHumorTypes(humorTypeNames);
    } catch (error) {
      console.error('Error fetching humor types:', error);
      setAvailableHumorTypes([]); 
    }
  };
  
  if (token) fetchHumorTypes();
}, [token]);

  
  useEffect(() => {
    setProfileImageError(false)
  }, [userData?.profilePic])
  
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchUserDetails()
    }
  }, [user, router])

  useEffect(() => {
    if (activeModal === 'posts') {
      fetchPendingPosts()
      fetchApprovedPosts()
    }
  }, [activeModal])

  const fetchPendingPosts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/GetPendingPosts`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error('Failed to fetch pending posts')
      setPendingPosts(await response.json())
    } catch (error) {
      console.error('Error fetching pending posts:', error)
    }
  }

  const fetchApprovedPosts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/User/GetApprovedPosts`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error('Failed to fetch approved posts')
      setApprovedPosts(await response.json())
    } catch (error) {
      console.error('Error fetching approved posts:', error)
    }
  }

  const handleApprovePost = async (postId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Posts/ApprovePost/${postId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (!response.ok) throw new Error('Failed to approve post')
      fetchPendingPosts()
      fetchApprovedPosts()
    } catch (error) {
      console.error('Error approving post:', error)
    }
  }

  const handleRejectPost = async (postId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Posts/RejectPost/${postId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      if (!response.ok) throw new Error('Failed to reject post')
      fetchPendingPosts()
    } catch (error) {
      console.error('Error rejecting post:', error)
    }
  }
  const fetchUserHumor = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/UserHumor/GetUserHumor`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.ok) throw new Error('Failed to fetch user humor');
    const data = await response.json();
    
    console.log('User humor data:', data); 
    const userHumorTypes = Array.isArray(data) 
      ? data 
      : data.humorTypes || data.HumorTypes || [];
    
    setUserData(prev => ({
      ...prev,
      humorTypes: userHumorTypes
    }));
  } catch (error) {
    console.error('Error fetching user humor:', error);
    setUserData(prev => ({
      ...prev,
      humorTypes: []
    }));
  }
};

  const fetchUserDetails = async () => {
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    setFetchError(null);
    const [userResponse, friendsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/getCurrentUser`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/friend-post-count`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userDataResponse = await userResponse.json();
    const userData = userDataResponse.user || userDataResponse; 
    
    let friendCount = 0;
    let postCount = 0;

    if (friendsResponse.ok) {
      const friendsData = await friendsResponse.json();
      friendCount = friendsData.friendCount || friendsData.FriendCount || 0;
      postCount = friendsData.postCount || friendsData.PostCount || 0;
    }
    const mappedUserData: FullUser = {
      profilePic: userData.profilePictureUrl,
      name: userData.name,
      bio: userData.bio || userData.Bio || '', 
      friendCount,
      postCount,
      humorTypes: [],
      userName: userData.userName || userData.UserName || ''
    };
    
    setUserData(mappedUserData);
    await fetchUserHumor();
    
  } catch (err) {
    console.error('Error in fetchUserDetails:', err);
    setFetchError(err instanceof Error ? err.message : 'Unknown error occurred');
  } finally {
    setIsLoading(false);
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
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/UserHumor/SetHumor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ humorTypes: selectedHumor })
        }
      )
      
      if (!res.ok) {
        throw new Error('Failed to update humor preferences')
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchUserHumor()
      
    } catch (err) {
      console.error('Error updating humor:', err)
      await fetchUserHumor() 
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
    } catch (err: any) {
      console.error(err)
      setPasswordError(err.message)
    }
  }

  const getProfileImageUrl = (profilePic?: string) => {
    const imageUrl = profilePic || user?.profilePictureUrl
    
    if (profileImageError || !imageUrl) {
      return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
    }
    return imageUrl.startsWith('http')
      ? imageUrl
      : `https://${imageUrl}`
  }

  const getSearchResultImageUrl = (url?: string) => {
    if (!url) return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
    return url.startsWith('http') ? url : `https://${url}`
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <div className="text-red-500 mb-4">Error loading profile data:</div>
      <div className="text-red-400 mb-4">{fetchError}</div>
      <button 
        onClick={() => fetchUserDetails()} 
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          {/* Profile Picture Section */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow group">
            <img
              src={getProfileImageUrl(userData?.profilePic)}
              alt={userData?.name || user.name || 'User'}
              onError={() => setProfileImageError(true)}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setActiveModal('profilePic')}
              className="absolute bottom-0 right-0 transform -translate-x-2 -translate-y-2 bg-glass/90 backdrop-blur-lg rounded-full p-2 shadow-lg hover:bg-accent/80 transition-all duration-300 hover:scale-110"
              aria-label="Edit profile picture"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-glow">
                {userData?.name || user.name || 'Loading...'}
              </h1>
              <button
                onClick={() => setActiveModal('name')}
                className="text-accent hover:text-accent/80 flex items-center gap-2 text-sm"
              >
                <span>✏️ Edit Name</span>
              </button>
            </div>
            <div className="text-light/70 text-lg">
              @{userData?.userName || user.userName || 'Loading...'}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-light/80">Humor style:</span>
                <button
                  onClick={() => setActiveModal('humor')}
                  className="badge-style bg-glass px-3 py-1 rounded-full hover:bg-glass/80 transition-colors"
                >
                  {userData?.humorTypes && userData.humorTypes.length > 0 ? 
                    userData.humorTypes.join(', ') : 
                    'Click to set humor preferences'
                  }
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
              <button
                onClick={() => setActiveModal('posts')}
                className="flex flex-col items-center transition-transform hover:scale-105"
              >
                <span className="text-3xl font-bold mb-1">
                  {userData?.postCount ?? 0}
                </span>
                <span className="text-sm text-light/70">Posts</span>
              </button>
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
        {activeModal === 'humor' && (
  <HumorModal
    isOpen
    humorTypes={availableHumorTypes}
    onClose={() => setActiveModal(null)}
    initialHumorTypes={userData?.humorTypes || []}
    onConfirm={handleHumorUpdate}
  />
)}

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
  bio={userData?.bio || user?.bio || ''}
  onSave={handleBioUpdate}
/>

        <PasswordModal
          isOpen={activeModal === 'password'}
          onClose={() => setActiveModal(null)}
          onConfirm={handlePasswordChange}
          error={passwordError}
        />
        
        <PostsModal
          isOpen={activeModal === 'posts'}
          onClose={() => setActiveModal(null)}
          pendingPosts={pendingPosts}
          approvedPosts={approvedPosts}
          onApprove={handleApprovePost}
          onReject={handleRejectPost}
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
        <Transition appear show={activeModal === 'friends'} as={Fragment}>
  <Dialog as="div" className="relative z-10" onClose={() => setActiveModal(null)}>
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
    </Transition.Child>

    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-dark p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-light mb-4">
              {activeFriendsTab === 'friends' ? 'Your Friends' : 'Friend Requests'}
            </Dialog.Title>

            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveFriendsTab('friends')}
                className={`px-4 py-2 rounded ${activeFriendsTab === 'friends' ? 'bg-primary' : 'bg-gray-700'}`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveFriendsTab('requests')}
                className={`px-4 py-2 rounded ${activeFriendsTab === 'requests' ? 'bg-primary' : 'bg-gray-700'}`}
              >
                Requests
              </button>
            </div>

            {activeFriendsTab === 'friends' ? (
              <ul className="space-y-2">
                {friendsList.length === 0 ? (
                  <p className="text-sm text-gray-400">You have no friends yet.</p>
                ) : (
                  friendsList.map(friend => (
                    <li key={friend.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img src={getSearchResultImageUrl(friend.profilePictureUrl)} className="w-8 h-8 rounded-full" />
                        <span>{friend.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <ul className="space-y-2">
                {friendRequests.length === 0 ? (
                  <p className="text-sm text-gray-400">No pending friend requests.</p>
                ) : (
                  friendRequests.map(request => (
                    <li key={request.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img src={getSearchResultImageUrl(request.profilePictureUrl)} className="w-8 h-8 rounded-full" />
                        <span>{request.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="text-green-400 hover:text-green-600 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition>

      </div>
    </div>
  )
}