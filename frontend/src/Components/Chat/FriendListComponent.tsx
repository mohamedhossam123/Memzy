// FriendListComponent.tsx
'use client'

import { useAuth } from '@/Context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { fetchFriendsApi, Friend } from '@/lib/api/friends/friendsApi' 

interface Props {
  onSelectFriend: (
    chatType: 'individual',
    chatId: number,
    chatName: string,
    username: string,
    profilePictureUrl?: string
  ) => void;
  selectedFriendId?: number;
}

const FriendsList = ({ onSelectFriend, selectedFriendId }: Props) => {
  const { token } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadFriends = useCallback(async () => {
    if (!token) { 
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await fetchFriendsApi(token);
      setFriends(data || []);
      setFilteredFriends(data || []);
    } catch (err: any) {
      console.error('Error in FriendsList component:', err);
      setError(err.message || 'Failed to load friends. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]); 

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = friends.filter(friend =>
        friend.name.toLowerCase().includes(term) ||
        friend.username.toLowerCase().includes(term)
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friends);
    }
  }, [searchTerm, friends]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-7 bg-glass/20 rounded w-32 animate-pulse"></div>
              <div className="flex space-x-2">
                <div className="w-9 h-9 bg-glass/20 rounded-full animate-pulse"></div>
                <div className="w-9 h-9 bg-glass/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 bg-glass/20 rounded-lg animate-pulse"></div>
          </div>

          {/* Loading Content */}
          <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 shadow-glow">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-glass/10 backdrop-blur-lg rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-glass/20 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-glass/20 rounded w-3/4" />
                      <div className="h-3 bg-glass/20 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-darker p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-glass/10 backdrop-blur-lg rounded-2xl p-6 text-light shadow-glow">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-glow">
              Friends {friends.length > 0 && (
                <span className="text-accent">({friends.length})</span>
              )}
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={loadFriends} 
                disabled={loading} 
                className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light hover:text-accent disabled:opacity-50"
                aria-label="Refresh friends list"
                title="Refresh friends list"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

            </div>
          </div>

          <p className="text-light/70 mb-4">chat with your friends</p>


        </div>

        {/* Content Area for Friends List or Messages */}
        <div className="bg-glass/10 backdrop-blur-lg rounded-2xl shadow-glow overflow-hidden">
          {error ? (
            // Error display
            <div className="p-6 border border-red-400/30 text-red-400 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium mb-2">Couldn't load friends</h3>
              <p className="text-red-400/70 mb-4">{error}</p>
              <button
                onClick={loadFriends} 
                className="bg-red-500/90 hover:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
              >
                Try Again
              </button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-6 text-light text-center py-16">
              {searchTerm ? (
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium mb-2">No matches found</h3>
                  <p className="text-light/70">We couldn't find any friends matching "<span className="text-accent">{searchTerm}</span>"</p>
                  <button
                    onClick={() => setSearchTerm('')} 
                    className="mt-4 bg-glass/20 hover:bg-glass/30 text-light px-4 py-2 rounded-lg border border-glass/30 transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-medium mb-2">Your friends list is empty</h3>
                  <p className="text-light/70 mb-6">Add friends to start chatting and connecting</p>

                </>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.userId}
                    onClick={() => onSelectFriend(
                      'individual', 
                      friend.userId,
                      friend.name,
                      friend.username,
                      friend.profilePictureUrl 
                    )}
                    className={`bg-glass/10 backdrop-blur-lg rounded-xl p-4 cursor-pointer transition-all duration-300 border hover:shadow-md ${
                      selectedFriendId === friend.userId
                        ? 'border-accent/50 shadow-glow bg-glass/20 shadow-accent/20'
                        : 'border-glass/30 hover:bg-glass/20 hover:border-glass/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {friend.profilePictureUrl ? (
                          <img
                            src={friend.profilePictureUrl} 
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-glass/30 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-2 border-glass/30 shadow-lg">
                            <span className="text-light font-bold text-lg shadow-sm">
                              {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                        )}

                      </div>

                      {/* Friend Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-light truncate text-lg">
                            {friend.name}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-light/70 truncate">
                            @{friend.username}
                          </p>
                        </div>
                      </div>

                      {/* Chat Arrow Indicator */}
                      <div className="text-light/40 group-hover:text-light/60 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsList