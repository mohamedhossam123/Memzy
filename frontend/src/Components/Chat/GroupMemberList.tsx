'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { fetchGroupMembers, GroupMember } from '@/lib/api/messaging/client';

interface GroupMembersListProps {
  groupId: number;
  groupName: string; 
  onClose: () => void;
}

const GroupMembersList: React.FC<GroupMembersListProps> = ({
  groupId,
  groupName,
  onClose,
}) => {
  const { token } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroupMembers = useCallback(async () => {
    if (!token) {
      setError('Authentication token missing. Cannot load members.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedMembers = await fetchGroupMembers(token, groupId);
      setMembers(fetchedMembers);
    } catch (err) {
      setError('Failed to load group members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, groupId]);

  useEffect(() => {
    loadGroupMembers();
  }, [loadGroupMembers]);

  return (
    <div className="relative z-50 w-full md:w-96 h-full bg-glass/10 backdrop-blur-lg border-l border-glass/30 shadow-glow flex flex-col p-4 animate-slide-in-right">
      <div className="flex items-center justify-between pb-4 border-b border-glass/30 mb-4">
        <h2 className="text-xl font-bold text-light">Members of "{groupName}"</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-glass/20 transition-colors text-light"
          aria-label="Close members list"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-full text-light">
          <p>Loading members...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-full text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <div className="flex justify-center items-center h-full text-light/70">
          <p>No members found for this group.</p>
        </div>
      )}

      {!loading && !error && members.length > 0 && (
        <ul className="flex-1 overflow-y-auto custom-scrollbar">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center py-2 px-3 rounded-lg hover:bg-glass/10 transition-colors mb-2">
              <div className="relative">
                {member.profilePictureUrl ? (
                  <img
                    src={member.profilePictureUrl}
                    alt={member.userName || member.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-glass/30"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-light text-md font-bold border-2 border-glass/30">
                    {member.userName ? member.userName.charAt(0).toUpperCase() : (member.name ? member.name.charAt(0).toUpperCase() : '?')}
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-light font-semibold truncate">{member.name || member.userName || 'Unknown User'}</p>
                {member.userName && <p className="text-sm text-light/70 truncate">@{member.userName}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupMembersList;