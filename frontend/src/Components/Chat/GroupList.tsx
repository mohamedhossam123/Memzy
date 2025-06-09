// Components/Chat/GroupsList.tsx
'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { fetchGroupsApi, createGroupApi } from '@/lib/api/group/groupsapi'
import { fetchFriendsApi } from '@/lib/api/friends/friendsApi'
import { Group, Friend } from '@/lib/api/types'
import { BaseModal } from '@/Components/ProfilePageModels/BaseModal'

interface Props {
  onSelectGroup: (
    chatType: 'group',
    chatId: number,
    chatName: string,
    memberCount: number,
    profilePictureUrl?: string
  ) => void
  selectedChat?: { id: number; type: 'individual' | 'group' }
  onGroupRemoved: (groupId: number) => void;
  onGroupProfilePictureChanged?: (groupId: number, newUrl: string) => void;
}

const GroupsList = ({ onSelectGroup, selectedChat }: Props) => {
  const { token, user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedNewGroupMembers, setSelectedNewGroupMembers] = useState<Friend[]>([])
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [allFriends, setAllFriends] = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [friendsError, setFriendsError] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [createGroupError, setCreateGroupError] = useState('')

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

  const loadGroups = useCallback(async () => {
    if (!token || !backendUrl) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await fetchGroupsApi(token);
      setGroups(data || []);
      setFilteredGroups(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  const loadAllFriends = useCallback(async () => {
    if (!token || !backendUrl) {
      setLoadingFriends(false);
      return;
    }
    try {
      setLoadingFriends(true);
      setFriendsError('');
      const data = await fetchFriendsApi(token);
      const friendsWithoutSelf = data.filter(friend => friend.userId !== user?.userId);
      setAllFriends(friendsWithoutSelf || []);
    } catch (err: any) {
      setFriendsError(err.message || 'Failed to load friends.');
    } finally {
      setLoadingFriends(false);
    }
  }, [token, user, backendUrl]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (showCreateGroupModal) {
      loadAllFriends();
    }
  }, [showCreateGroupModal, loadAllFriends]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = groups.filter(group =>
        group.groupName.toLowerCase().includes(term)
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  }, [searchTerm, groups]);

  const handleCreateGroup = async () => {
    if (!token || !newGroupName.trim() || creatingGroup) return;

    setCreatingGroup(true);
    setCreateGroupError('');

    try {
      const memberIds = selectedNewGroupMembers.map(member => member.userId);
      if (user && !memberIds.includes(user.userId)) {
        memberIds.push(user.userId);
      }

      const newGroup = await createGroupApi(token, newGroupName, memberIds);

      const newGroupWithPFP = {
        groupId: newGroup.groupId,
        groupName: newGroup.groupName,
        memberCount: memberIds.length,
        profilePictureUrl: newGroup.profilePictureUrl
      };

      setGroups(prev => [...prev, newGroupWithPFP]);
      setFilteredGroups(prev => [...prev, newGroupWithPFP]);

      setShowCreateGroupModal(false);
      setNewGroupName('');
      setSelectedNewGroupMembers([]);
      setMemberSearchTerm('');
    } catch (err: any) {
      setCreateGroupError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setCreatingGroup(false);
    }
  };

  const toggleMemberSelection = (friend: Friend) => {
    setSelectedNewGroupMembers((prev) => {
      if (prev.some((m) => m.userId === friend.userId)) {
        return prev.filter((m) => m.userId !== friend.userId);
      } else {
        return [...prev, friend];
      }
    });
  };

  const filteredFriendsForSelection = allFriends.filter(friend =>
    friend.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(memberSearchTerm.toLowerCase())
  ).filter(
    (friend) => !selectedNewGroupMembers.some((member) => member.userId === friend.userId)
  );

  const handleGroupProfilePictureChanged = useCallback((groupId: number, newUrl: string) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.groupId === groupId ? { ...group, profilePictureUrl: newUrl } : group
      )
    );
    setFilteredGroups(prevFilteredGroups =>
      prevFilteredGroups.map(group =>
        group.groupId === groupId ? { ...group, profilePictureUrl: newUrl } : group
      )
    );
    if (selectedChat?.type === 'group' && selectedChat.id === groupId) {
      const updatedGroup = groups.find(g => g.groupId === groupId);
      if (updatedGroup) {
        onSelectGroup('group', groupId, updatedGroup.groupName, updatedGroup.memberCount, newUrl);
      }
    }
  }, [groups, selectedChat, onSelectGroup]);


  return (
    <div className="p-4 flex flex-col h-full">
      {/* Header Section */}
      <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-4 text-light shadow-glow mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-glow">
            Groups {groups.length > 0 && (
              <span className="text-accent">({groups.length})</span>
            )}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light hover:text-green-400 disabled:opacity-50"
              aria-label="Create new group"
              title="Create new group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={loadGroups}
              disabled={loading}
              className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light hover:text-accent disabled:opacity-50"
              aria-label="Refresh groups list"
              title="Refresh groups list"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area for Groups List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {error ? (
          <div className="p-4 border border-red-400/30 text-red-400 text-center rounded-xl">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium mb-1">Couldn't load groups</h3>
            <p className="text-red-400/70 mb-3">{error}</p>
            <button
              onClick={loadGroups}
              className="bg-red-500/90 hover:bg-red-400 text-white px-5 py-1.5 rounded-lg font-medium transition-colors shadow-md text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-4 text-light text-center py-8 rounded-xl bg-glass/5">
            {searchTerm ? (
              <>
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg font-medium mb-1">No matches found</h3>
                <p className="text-light/70 text-sm">We couldn't find any groups matching "<span className="text-accent">{searchTerm}</span>"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 bg-glass/20 hover:bg-glass/30 text-light px-3 py-1.5 rounded-lg border border-glass/30 transition-colors text-sm"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                <h3 className="text-lg font-medium mb-1">You aren't in any groups</h3>
                <p className="text-light/70 text-sm mb-4">Create a new group to start collaborating!</p>
                <button
                  onClick={() => setShowCreateGroupModal(true)}
                  className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md text-sm"
                >
                  Create Group
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div
                key={group.groupId}
                onClick={() => {
                  onSelectGroup('group', group.groupId, group.groupName, group.memberCount, group.profilePictureUrl)
                }}
                className={`bg-glass/10 backdrop-blur-lg rounded-xl p-3 cursor-pointer transition-all duration-300 border hover:shadow-md ${
                  selectedChat?.type === 'group' && selectedChat?.id === group.groupId
                    ? 'border-accent/50 shadow-glow bg-glass/20 shadow-accent/20'
                    : 'border-transparent hover:bg-glass/15 hover:border-glass/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {group.profilePictureUrl ? (
                      <img
                        src={group.profilePictureUrl}
                        alt={`${group.groupName} profile`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-glass/30 shadow-lg"
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-glass/30 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2m0 0l-1.588-.845M7.5 19H21m-3-1l.845-.845M12 10V6m0 4v4m0-4h4m-4 0H8" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-light truncate text-md">
                      {group.groupName}
                    </h3>
                    <p className="text-xs text-light/70 truncate">
                      {group.memberCount} members
                    </p>
                  </div>

                  <div className="text-light/40 group-hover:text-light/60 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateGroupModal && (
        <BaseModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          title="Create New Group"
        >
          <div className="p-4">
            {createGroupError && <p className="text-red-400 text-sm mb-3">{createGroupError}</p>}
            <div className="mb-4">
              <label htmlFor="groupName" className="block text-light text-sm font-medium mb-2">Group Name</label>
              <input
                type="text"
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full bg-glass/20 border border-glass/30 rounded-lg px-3 py-2 text-light placeholder-light/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="addMembers" className="block text-light text-sm font-medium mb-2">Add Members</label>
              <input
                type="text"
                id="addMembers"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                placeholder="Filter friends to add..."
                className="w-full bg-glass/20 border border-glass/30 rounded-lg px-3 py-2 text-light placeholder-light/50 focus:outline-none focus:ring-1 focus:ring-accent/50"
              />
              {loadingFriends ? (
                <p className="text-light/70 text-sm mt-2">Loading friends...</p>
              ) : friendsError ? (
                <p className="text-red-400 text-sm mt-2">Error loading friends: {friendsError}</p>
              ) : (
                <div className="mt-2 bg-glass/10 border border-glass/30 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                  {filteredFriendsForSelection.length > 0 ? (
                    filteredFriendsForSelection.map(friend => (
                      <div
                        key={friend.userId}
                        className="flex items-center gap-3 p-2 hover:bg-glass/20 cursor-pointer transition-colors"
                        onClick={() => toggleMemberSelection(friend)}
                      >
                        {friend.profilePictureUrl ? (
                          <img src={friend.profilePictureUrl} alt={friend.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-light text-sm font-bold">
                            {friend.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-light text-sm">{friend.name} (@{friend.username})</span>
                      </div>
                    ))
                  ) : (
                    <p className="p-2 text-light/70 text-sm text-center">No friends available to add, or none matching your filter.</p>
                  )}
                </div>
              )}
            </div>
            {selectedNewGroupMembers.length > 0 && (
              <div className="mb-4">
                <p className="text-light text-sm font-medium mb-2">Selected Members:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNewGroupMembers.map(member => (
                    <span key={member.userId} className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-full flex items-center">
                      {member.name}
                      <button
                        onClick={() => toggleMemberSelection(member)}
                        className="ml-1 text-accent-light hover:text-accent-dark"
                        aria-label={`Remove ${member.name}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || creatingGroup}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !newGroupName.trim() || creatingGroup
                    ? 'bg-glass/20 text-light/50 cursor-not-allowed'
                    : 'bg-accent hover:bg-accent/80 text-white shadow-md'
                }`}
              >
                {creatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  )
}

export default GroupsList