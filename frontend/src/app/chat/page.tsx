'use client'

import { useState, useEffect, useCallback } from 'react'
import FriendsList from '@/Components/Chat/FriendListComponent'
import GroupsList from '@/Components/Chat/GroupList'
import Chat from '@/Components/Chat/Chat'
import GroupMembersList from '@/Components/Chat/GroupMemberList' 
import GroupProfileSection from '@/Components/Chat/GroupProfileSection' 
import GroupNameEditSection from '@/Components/Chat/GroupNameEditSection' 
import LeaveGroupButton from '@/Components/Chat/LeaveGroupButton'
import { useMediaQuery } from 'react-responsive'

type SelectedChat =
  | { type: 'individual'; id: number; name: string; username: string; profilePictureUrl?: string }
  | { type: 'group'; id: number; name: string; memberCount: number; profilePictureUrl?: string };

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');

  
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const [showEditGroupNameModal, setShowEditGroupNameModal] = useState(false);
  const [showEditGroupPictureModal, setShowEditGroupPictureModal] = useState(false);
  const [showLeaveGroupConfirmModal, setShowLeaveGroupConfirmModal] = useState(false);


  const handleSelectFriend = (chatType: 'individual', friendId: number, friendName: string, username: string, profilePictureUrl?: string) => {
    setSelectedChat({ type: chatType, id: friendId, name: friendName, username, profilePictureUrl });
    if (isMobile) setShowFriendsList(false);
    setShowGroupMembersModal(false);
    setShowEditGroupNameModal(false);
    setShowEditGroupPictureModal(false);
    setShowLeaveGroupConfirmModal(false);
  };

  const handleGroupProfilePictureChanged = useCallback((groupId: number, newUrl: string) => {
    setSelectedChat(prevChat => {
      if (prevChat?.type === 'group' && prevChat.id === groupId) {
        return { ...prevChat, profilePictureUrl: newUrl };
      }
      return prevChat;
    });
    setShowEditGroupPictureModal(false);
  }, []);

  const handleGroupNameChanged = useCallback((groupId: number, newName: string) => {
    setSelectedChat(prevChat => {
      if (prevChat?.type === 'group' && prevChat.id === groupId) {
        return { ...prevChat, name: newName };
      }
      return prevChat;
    });
    setShowEditGroupNameModal(false);
  }, []);

  const handleSelectGroup = (chatType: 'group', groupId: number, groupName: string, memberCount: number, profilePictureUrl?: string) => {
    setSelectedChat({ type: chatType, id: groupId, name: groupName, memberCount, profilePictureUrl });
    if (isMobile) setShowFriendsList(false);
    setShowGroupMembersModal(false);
    setShowEditGroupNameModal(false);
    setShowEditGroupPictureModal(false);
    setShowLeaveGroupConfirmModal(false);
  };

  const handleGroupRemoved = useCallback((removedGroupId: number) => {
    if (selectedChat?.type === 'group' && selectedChat.id === removedGroupId) {
      setSelectedChat(null);
      if (isMobile) setShowFriendsList(true);
      setShowGroupMembersModal(false);
      setShowEditGroupNameModal(false);
      setShowEditGroupPictureModal(false);
      setShowLeaveGroupConfirmModal(false);
    }
  }, [selectedChat, isMobile]);

  const handleBackToChatList = () => {
    setSelectedChat(null);
    if (isMobile) setShowFriendsList(true);
    setShowGroupMembersModal(false);
    setShowEditGroupNameModal(false);
    setShowEditGroupPictureModal(false);
    setShowLeaveGroupConfirmModal(false);
  };

  useEffect(() => {
    if (!isMobile) {
      setShowFriendsList(true); 
    }
  }, [isMobile]);

  useEffect(() => {
    if (selectedChat?.type !== 'group') {
      setShowGroupMembersModal(false);
      setShowEditGroupNameModal(false);
      setShowEditGroupPictureModal(false);
      setShowLeaveGroupConfirmModal(false);
    }
  }, [selectedChat]);

  const renderOverlayModal = (component: React.ReactNode, showModal: boolean, onClose: () => void) => {
    if (!showModal) return null;
    return (
      <div className="absolute inset-0 z-50 flex justify-end">
        <div
          className="absolute inset-0 bg-dark/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        {component}
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-b from-dark to-darker overflow-hidden flex">
      {/* Left Sidebar for Friends and Groups */}
      <div className={`${showFriendsList ? 'block' : 'hidden'} md:block w-full md:w-80 bg-glass/10 backdrop-blur-lg border-r border-glass/30 shadow-glow transition-all duration-300 z-10 flex flex-col`}>
        <div className="p-4 border-b border-glass/30">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-accent text-white shadow-glow'
                  : 'bg-glass/20 text-light hover:bg-glass/30'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'bg-accent text-white shadow-glow'
                  : 'bg-glass/20 text-light hover:bg-glass/30'
              }`}
            >
              Groups
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === 'friends' && (
            <FriendsList
              onSelectFriend={handleSelectFriend}
              selectedFriendId={selectedChat?.type === 'individual' ? selectedChat.id : undefined}
            />
          )}
          {activeTab === 'groups' && (
            <GroupsList
              onSelectGroup={handleSelectGroup}
              selectedChat={selectedChat ? { id: selectedChat.id, type: selectedChat.type } : undefined}
              onGroupRemoved={handleGroupRemoved}
              onGroupProfilePictureChanged={handleGroupProfilePictureChanged}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-glass/5 backdrop-blur-sm">
        {selectedChat ? (
          <>
            {/* Header for the currently selected chat */}
            <div className="bg-glass/10 backdrop-blur-lg border-b border-glass/30 px-4 py-3 md:px-6 md:py-4 shadow-glow flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center">
                {isMobile && (
                  <button
                    onClick={handleBackToChatList}
                    className="mr-3 p-2 rounded-full hover:bg-glass/20 transition-colors text-light focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Back to chat list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {selectedChat.profilePictureUrl ? (
                      <img
                        src={selectedChat.profilePictureUrl}
                        alt={selectedChat.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-glass/30 shadow-md"
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.src = `https://via.placeholder.com/48/4F46E5/FFFFFF?text=${selectedChat.name.charAt(0).toUpperCase()}`; // Fallback placeholder
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-2 border-glass/30 shadow-lg">
                        <span className="text-light font-bold text-md md:text-lg shadow-sm">
                          {selectedChat.name ? selectedChat.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-light text-md md:text-xl truncate text-glow">
                      {selectedChat.name}
                    </h3>
                    {selectedChat.type === 'individual' && selectedChat.username && (
                      <p className="text-xs md:text-sm text-light/70 truncate">
                        @{selectedChat.username}
                      </p>
                    )}
                    {selectedChat.type === 'group' && selectedChat.memberCount !== undefined && (
                      <p className="text-xs md:text-sm text-light/70 truncate">
                        {selectedChat.memberCount} members
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {selectedChat.type === 'group' && (
                  <>
                    <button
                      onClick={() => setShowGroupMembersModal(true)}
                      className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="View group members"
                      title="View Group Members"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m0 0l4 4m-4-4l-4 4m4-4V7a2 2 0 012-2h6a2 2 0 012 2v3m-2-3v4m0 0l-4-4m4 4l4-4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowEditGroupNameModal(true)}
                      className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="Edit group name"
                      title="Rename Group"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowEditGroupPictureModal(true)}
                      className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="Change group profile picture"
                      title="Change Group Picture"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                     <button
                      onClick={() => setShowLeaveGroupConfirmModal(true)}
                      className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Leave group"
                      title="Leave Group"
                    >
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </>
                )}
                {selectedChat.type === 'individual' && (
                  <button className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light focus:outline-none focus:ring-2 focus:ring-accent" aria-label="Individual chat options">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* The main chat messages area */}
            <div className="flex-1">
              <Chat
                chatId={selectedChat.id}
                chatName={selectedChat.name}
                chatType={selectedChat.type}
                groupProfilePictureUrl={selectedChat.type === 'group' ? selectedChat.profilePictureUrl : undefined}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="text-center max-w-md z-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center shadow-glow animate-pulse">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 border border-glass/30 shadow-glow">
                <h3 className="text-xl md:text-2xl font-bold text-light mb-3 text-glow">
                  Welcome to Messages!
                </h3>
                <p className="text-light/70 text-sm md:text-base mb-4 leading-relaxed">
                  Select a friend or group from the sidebar to start chatting.
                </p>
                <p className="text-light/50 text-xs md:text-sm">
                  Your conversations are waiting for you.
                </p>
              </div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse hidden md:block"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse hidden md:block"></div>
          </div>
        )}

        {/* Modals for Group Management */}
        {selectedChat?.type === 'group' && (
          <>
            {renderOverlayModal(
              <GroupMembersList
                groupId={selectedChat.id}
                groupName={selectedChat.name}
                onClose={() => setShowGroupMembersModal(false)}
              />,
              showGroupMembersModal,
              () => setShowGroupMembersModal(false)
            )}

            {renderOverlayModal(
              <GroupNameEditSection
                groupId={selectedChat.id}
                currentGroupName={selectedChat.name}
                onGroupNameChanged={handleGroupNameChanged}
              />,
              showEditGroupNameModal,
              () => setShowEditGroupNameModal(false)
            )}

            {renderOverlayModal(
              <GroupProfileSection
                groupId={selectedChat.id}
                groupName={selectedChat.name}
                groupProfilePictureUrl={selectedChat.profilePictureUrl}
                onGroupProfilePictureChanged={handleGroupProfilePictureChanged}
              />,
              showEditGroupPictureModal,
              () => setShowEditGroupPictureModal(false)
            )}

             {renderOverlayModal(
              <div className="relative z-50 w-full md:w-96 h-fit bg-glass/10 backdrop-blur-lg border-l border-glass/30 shadow-glow flex flex-col p-4 animate-slide-in-right rounded-lg">
                <div className="flex items-center justify-between pb-4 border-b border-glass/30 mb-4">
                  <h2 className="text-xl font-bold text-light">Leave Group</h2>
                  <button
                    onClick={() => setShowLeaveGroupConfirmModal(false)}
                    className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-light mb-6 text-center">Are you sure you want to leave <span className="font-bold">"{selectedChat.name}"</span>? This action cannot be undone.</p>
                <LeaveGroupButton
                  groupId={selectedChat.id}
                  groupName={selectedChat.name}
                  onGroupLeft={handleGroupRemoved}
                  onClose={() => setShowLeaveGroupConfirmModal(false)}
                />
              </div>,
              showLeaveGroupConfirmModal,
              () => setShowLeaveGroupConfirmModal(false)
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;