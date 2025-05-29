
// ChatPage.tsx
'use client'

import { useState, useEffect } from 'react'
import FriendsList from '@/Components/Friends/FriendListComponent'
import Chat from '@/Components/Friends/Chat'
import { useMediaQuery } from 'react-responsive'

const ChatPage = () => {
  const [selectedFriend, setSelectedFriend] = useState<{
  id: number;
  name: string;
  username: string;
  profilePictureUrl?: string; 
} | null>(null);

  
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const [showFriendsList, setShowFriendsList] = useState(true)

  const handleSelectFriend = (
  friendId: number,
  friendName: string,
  username: string,
  profilePictureUrl?: string
) => {
  setSelectedFriend({ 
    id: friendId, 
    name: friendName, 
    username, 
    profilePictureUrl 
  });
  if (isMobile) setShowFriendsList(false);
};


  


  const handleBackToFriends = () => {
    setSelectedFriend(null)
    if (isMobile) setShowFriendsList(true)
  }

  
  useEffect(() => {
    if (!isMobile) {
      setShowFriendsList(true)
    }
  }, [isMobile])

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker">
      <div className="flex h-screen">
        <div className={`${showFriendsList ? 'block' : 'hidden'} md:block w-full md:w-80 bg-glass/10 backdrop-blur-lg border-r border-glass/30 shadow-glow transition-all duration-300 z-10`}>
          <FriendsList 
            onSelectFriend={handleSelectFriend}
            selectedFriendId={selectedFriend?.id}
          />
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-glass/5 backdrop-blur-sm">
          {selectedFriend ? (
            <>
              <div className="bg-glass/10 backdrop-blur-lg border-b border-glass/30 px-4 py-3 md:px-6 md:py-4 shadow-glow">
                <div className="flex items-center">
                  {isMobile && (
                    <button 
                      onClick={handleBackToFriends}
                      className="mr-3 p-2 rounded-full hover:bg-glass/20 transition-colors text-light"
                      aria-label="Back to friends list"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {/* Profile Avatar with Status */}
                    <div className="relative">
                      {selectedFriend.profilePictureUrl ? (
                        <img
                          src={selectedFriend.profilePictureUrl}
                          alt={selectedFriend.name}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-glass/30 shadow-md"
                        />
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-2 border-glass/30 shadow-lg">
                          <span className="text-light font-bold text-md md:text-lg shadow-sm">
                            {selectedFriend.name ? selectedFriend.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-light text-md md:text-xl truncate text-glow">
                        {selectedFriend.name}
                      </h3>
                      {selectedFriend.username && (
                        <p className="text-xs md:text-sm text-light/70 truncate">
                          @{selectedFriend.username}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="ml-auto flex space-x-2">
                    <button className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages Area - Styled container */}
              <div className="flex-1 bg-glass/5 backdrop-blur-sm">
                <Chat contactId={selectedFriend.id} />
              </div>
            </>
          ) : (
            /* Enhanced Empty State - Matching ModeratorDashboard style */
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="text-center max-w-md z-10">
                {/* Animated Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center shadow-glow animate-pulse">
                    <svg className="w-10 h-10 md:w-12 md:h-12 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                
                {/* Welcome Card - Matching moderator dashboard card style */}
                <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 border border-glass/30 shadow-glow">
                  <h3 className="text-xl md:text-2xl font-bold text-light mb-3 text-glow">
                    Welcome to Messages
                  </h3>
                  <p className="text-light/70 text-sm md:text-base mb-4 leading-relaxed">
                    Select a friend to start chatting, or use the search to find connections
                  </p>
                  
                  {/* Search shortcut for mobile */}
                  {isMobile && (
                    <button 
                      onClick={() => setShowFriendsList(true)}
                      className="w-full bg-gradient-to-r from-primary to-accent text-light font-semibold py-2.5 rounded-lg transition-all duration-300 shadow hover:shadow-glow"
                    >
                      Browse Friends
                    </button>
                  )}
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse hidden md:block"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse hidden md:block"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage