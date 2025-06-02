'use client'

import { BaseModal } from './BaseModal'
import { useRouter } from 'next/navigation'
interface Friend {
  userId: string 
  name: string
  userName: string
  profilePictureUrl?: string
}

interface FriendsModalProps {
  isOpen: boolean
  onClose: () => void
  friendsList: Friend[]
}

export const FriendsModal = ({
  isOpen,
  onClose,
  friendsList,
}: FriendsModalProps) => {
  const router = useRouter() 
  const handleFriendClick = (friendId: string) => {
    router.push(`/profile/${friendId}`) 
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Friends">
      <div className="max-h-96 overflow-y-auto space-y-3">
        {friendsList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-light/60 text-lg">No friends found.</p>
          </div>
        ) : (
          friendsList.map((friend) => (
            <div
              key={friend.userId}
              className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.05)]
                         hover:bg-[rgba(255,255,255,0.1)] transition-all cursor-pointer
                         border border-[rgba(255,255,255,0.1)] shadow-md"
              onClick={() => handleFriendClick(friend.userId)} 
            >
              <img
                src={
                  friend.profilePictureUrl?.startsWith('http')
                    ? friend.profilePictureUrl
                    : 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
                }
                alt={`${friend.name}'s profile`}
                className="w-12 h-12 rounded-full object-cover border-2 border-[rgba(255,255,255,0.2)]"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-lg truncate">
                  {friend.name}
                </p>
                <p className="text-sm text-[#c56cf0] truncate">
                  @{friend.userName}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </BaseModal>
  )
}