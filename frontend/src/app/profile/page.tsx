'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import toast, { Toaster } from 'react-hot-toast'
import { HumorModal } from '@/Components/ProfilePageModels/HumorModal'
import { ProfilePictureModal } from '@/Components/ProfilePageModels/ProfilePictureModal'
import { NameModal } from '@/Components/ProfilePageModels/NameModal'
import { BioModal } from '@/Components/ProfilePageModels/BioModal'
import { PasswordModal } from '@/Components/ProfilePageModels/PasswordModal'
import PostForm from '@/Components/ProfilePageModels/CreatePostComponent'
import PostFeed, { Post } from '@/Components/ProfilePageModels/ProfilePostsComponent' 
import PostsModal from '@/Components/ProfilePageModels/ProfileInsiderPostsModal'
import { APIClient, FullUser, FriendRequestDTO, Friend } from '@/lib/api'

export default function UserProfile() {
  const { user, token } = useAuth()
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [userData, setUserData] = useState<FullUser | null>(null)
  const [activeModal, setActiveModal] = useState<
    'humor' | 'profilePic' | 'name' | 'bio' | 'password' | 'friends' | 'createPost' | 'posts' | null
  >(null)
  const [passwordError, setPasswordError] = useState('')
  const [, setProfileImageError] = useState(false)
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([])
  const [activeFriendsTab, setActiveFriendsTab] = useState<'friends' | 'requests'>('friends')
  const [friendRequests, setFriendRequests] = useState<FriendRequestDTO[]>([])
  const [friendsList, setFriendsList] = useState<Friend[]>([])
  const [availableHumorTypes, setAvailableHumorTypes] = useState<string[]>([])
  const [apiClient, setApiClient] = useState<APIClient | null>(null)
  const [refreshPostsFlag, setRefreshPostsFlag] = useState(false); // New state to trigger PostFeed refresh

  useEffect(() => {
    if (token) {
      setApiClient(new APIClient(token))
    }
  }, [token])

  useEffect(() => {
    setProfileImageError(false)
  }, [userData?.profilePic])
  
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (apiClient) {
      fetchUserDetails()
    }
  }, [user, router, apiClient])

  useEffect(() => {
    if (activeModal === 'posts' && apiClient) {
      fetchPendingPosts()
      fetchApprovedPosts()
    }
  }, [activeModal, apiClient])

  const fetchPendingPosts = async () => {
    if (!apiClient) return
    
    try {
      const posts = await apiClient.user.getPendingPosts()
      setPendingPosts(posts)
    } catch (error) {
      console.error('Error fetching pending posts:', error)
    }
  }

  const fetchApprovedPosts = async () => {
    if (!apiClient) return
    
    try {
      const posts = await apiClient.user.getApprovedPosts()
      setApprovedPosts(posts)
    } catch (error) {
      console.error('Error fetching approved posts:', error)
    }
  }

  const fetchHumorTypes = async () => {
    if (!apiClient) return
    
    try {
      const types = await apiClient.humor.getAllHumorTypes()
      setAvailableHumorTypes(types)
    } catch (error) {
      console.error('Error fetching humor types:', error)
      setAvailableHumorTypes([])
    }
  }

  const fetchUserHumor = async () => {
    if (!apiClient) return
    
    try {
      const userHumorTypes = await apiClient.humor.getUserHumor()
      setUserData(prev => ({
        ...prev,
        humorTypes: userHumorTypes
      } as FullUser));
    } catch (error) {
      console.error('Error fetching user humor:', error)
      setUserData(prev => ({
        ...prev,
        humorTypes: []
      } as FullUser));
    }
  }

  const fetchUserDetails = async () => {
    if (!apiClient) {
      return
    }

    try {
      setIsLoading(true)
      setFetchError(null)
      
      const [userResponse, countResponse] = await Promise.all([
        apiClient.user.getCurrentUser(),
        apiClient.user.getFriendPostCount()
      ])
      
      console.log('User Response:', userResponse);
      console.log('userResponse.profilePictureUrl from API:', userResponse.profilePictureUrl);
      const mappedUserData: FullUser = {
        profilePic: userResponse.user?.profilePictureUrl, 
        name: userResponse.name,
        bio: userResponse.user?.bio || userResponse.bio || userResponse.Bio || '', 
        friendCount: countResponse.friendCount || countResponse.FriendCount || 0,
        postCount: countResponse.postCount || countResponse.PostCount || 0,
        humorTypes: [], 
        userName: userResponse.userName || userResponse.UserName || userResponse.user?.userName || ''
      };
      
      setUserData(mappedUserData)
      await fetchUserHumor()
    } catch (err) {
      console.error('Error in fetchUserDetails:', err)
      setFetchError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
      setIsInitialLoadComplete(true) 
    }
  }

  const fetchFriends = async () => {
    if (!apiClient) return
    
    try {
      const friends = await apiClient.friends.getFriends()
      setFriendsList(friends)
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchFriendRequests = async () => {
    if (!apiClient) return
    
    try {
      const requests = await apiClient.friends.getFriendRequests()
      setFriendRequests(requests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  useEffect(() => {
    if (apiClient) {
      fetchHumorTypes()
    }
  }, [apiClient])

  useEffect(() => {
    if (activeModal === 'friends' && apiClient) {
      if (activeFriendsTab === 'friends') {
        fetchFriends()
      } else {
        fetchFriendRequests()
      }
    }
  }, [activeModal, activeFriendsTab, apiClient])

  const handleAcceptRequest = async (requestId: number) => {
    if (!apiClient) return
    
    try {
      await apiClient.friends.acceptRequest(requestId)
      fetchFriendRequests()
      fetchUserDetails()
    } catch (error) {
      console.error('Error accepting request:', error)
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    if (!apiClient) return
    
    try {
      await apiClient.friends.rejectRequest(requestId)
      fetchFriendRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const handleRemoveFriend = async (friendId: number) => {
    if (!apiClient) return
    
    try {
      await apiClient.friends.removeFriend(friendId)
      fetchFriends()
      fetchUserDetails()
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

  const handleHumorUpdate = async (selectedHumor: string[]) => {
    if (!apiClient) return
    
    try {
      await apiClient.humor.setHumor(selectedHumor)
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchUserHumor()
    } catch (err) {
      console.error('Error updating humor:', err)
      await fetchUserHumor()
    }
  }

  const handleNameUpdate = async (newName: string) => {
    if (!apiClient) return
    
    try {
      await apiClient.user.updateUsername(newName)
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handleProfilePicUpdate = async (file: File) => {
    if (!apiClient) return
    
    try {
      await apiClient.user.updateProfilePicture(file)
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handleBioUpdate = async (newBio: string) => {
    if (!apiClient) return
    
    try {
      await apiClient.user.updateBio(newBio)
      await fetchUserDetails()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!apiClient) return
    
    setPasswordError('')
    try {
      await apiClient.user.changePassword(currentPassword, newPassword)
      alert('Password changed successfully')
    } catch (err: any) {
      console.error(err)
      setPasswordError(err.message)
    }
  }

  const getImageUrl = (url?: string | null) => {
    if (!url) {
      return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg';
    }
    if (url.startsWith('http')) {
      return url; 
    }
    else {
      return `${url}`; 
    }
  };

  const handlePostSuccess = () => {
    toast.success('Post created and submitted for review!', {
      duration: 3000,
      position: 'top-center',
      style: {
        zIndex: 9999,
        background: 'rgba(20, 20, 20, 0.9)',
        color: '#fff',
        border: '1px solid rgba(196, 108, 240, 0.3)',
      },
    });
    setTimeout(() => {
      setActiveModal(null);
      fetchUserDetails();
      setRefreshPostsFlag(prev => !prev);
    }, 1000);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (apiClient) {
      setProfileImageError(false); 
      fetchUserDetails();
    }
  }, [user, router, apiClient]);

  if (!isInitialLoadComplete && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="text-red-500 mb-4">Error loading profile data:</div>
        <div className="text-red-400 mb-4">{fetchError}</div>
        <button 
          onClick={() => {
            setFetchError(null);
            fetchUserDetails();
          }} 
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-primary-dark text-light">
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(20, 20, 20, 0.9)',
            color: '#fff',
            border: '1px solid rgba(196, 108, 240, 0.3)',
            zIndex: 9999,
          },
        }}
      />

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-accent overflow-hidden shadow-glow group">
            <img
              src={getImageUrl(userData?.profilePic)} 
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

        <div className="border-t border-glass/30 pt-16">
          <button
            onClick={() => setActiveModal('createPost')}
            className="fixed bottom-8 right-8 z-50 bg-glass rounded-xl p-5 shadow-2xl transition hover:scale-105 hover:shadow-glow group"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">➕</span>
              <span className="text-light/90 hidden md:block">Create Post</span>
            </div>
          </button>

          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-glow">My Posts</h2>
          </div>

          <PostFeed triggerRefresh={refreshPostsFlag} />
        </div>

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
          onApprove={undefined}
          onReject={undefined}
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
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                {/* Changed Dialog.Overlay to a div with the overlay styling */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-50"
                  onClick={() => setActiveModal(null)}
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
                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle bg-[rgba(20,20,20,0.95)] backdrop-blur-2xl rounded-2xl shadow-2xl transform transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-2xl font-bold text-[#c56cf0]">
                      Create New Post
                    </Dialog.Title>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="text-light/50 hover:text-light/80 transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                  <PostForm onSuccess={handlePostSuccess} />
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
    
        {/* Friends Modal */}
        <Transition appear show={activeModal === 'friends'} as={Fragment}>
  <Dialog as="div" className="relative z-50" onClose={() => setActiveModal(null)}>
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
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
          <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-dark glass-morphism p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-xl font-semibold text-light mb-6 text-glow">
              {activeFriendsTab === 'friends' ? 'Your Friends' : 'Friend Requests'}
            </Dialog.Title>

            <div className="flex space-x-3 mb-6">
              <button
                onClick={() => setActiveFriendsTab('friends')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeFriendsTab === 'friends'
                    ? 'bg-primary text-light shadow-glow'
                    : 'bg-glass-dark text-gray-300 hover:bg-primary-light hover:text-white'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveFriendsTab('requests')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeFriendsTab === 'requests'
                    ? 'bg-primary text-light shadow-glow'
                    : 'bg-glass-dark text-gray-300 hover:bg-primary-light hover:text-white'
                }`}
              >
                Requests
              </button>
            </div>

            {activeFriendsTab === 'friends' ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {friendsList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center">You have no friends yet.</p>
                ) : (
                  friendsList.map(friend => (
                    <li
                      key={friend.id}
                      className="flex justify-between items-center p-3 rounded-md bg-glass-dark hover:bg-dark transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(friend.profilePictureUrl)}
                          className="w-10 h-10 rounded-full border border-primary shadow-glow"
                          alt={friend.name}
                        />
                        <span className="text-light">{friend.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="text-red-400 hover:text-red-600 text-sm transition"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {friendRequests.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center">No incoming friend requests.</p>
                ) : (
                  friendRequests.map(req => (
                    <li
                      key={req.requestId}
                      className="flex justify-between items-start p-4 rounded-md bg-glass-dark hover:bg-dark transition-all duration-200"
                    >
                      <div className="flex space-x-3">
                        <img
                          src={getImageUrl(req.senderProfileImageUrl)}
                          alt={req.senderUserName}
                          className="w-12 h-12 rounded-full border border-accent shadow-glow"
                        />
                        <div className="text-light">
                          <div className="font-semibold">{req.senderName}</div>
                          <div className="text-sm text-gray-400">@{req.senderUserName}</div>
                          <div className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</div>
                          {req.message && (
                            <div className="text-sm italic mt-1 text-accent">"{req.message}"</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => handleAcceptRequest(req.requestId)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.requestId)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
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