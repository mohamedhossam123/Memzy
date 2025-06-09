'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { fetchGroupMembers, GroupMember } from '@/lib/api/messaging/client';

interface GroupMembersDisplayProps {
  groupId: number;
}

const GroupMembersDisplay: React.FC<GroupMembersDisplayProps> = ({ groupId }) => {
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
    <>
      <h3 className="text-lg font-semibold text-light mb-3 mt-2">Members</h3>
      {loading && (
        <div className="flex justify-center items-center py-8 text-light">
          <p>Loading members...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center py-8 text-red-400 text-center">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <div className="flex justify-center items-center py-8 text-light/70 text-center">
          <p>No members found for this group.</p>
        </div>
      )}

      {!loading && !error && members.length > 0 && (
        <ul className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center py-2 px-3 rounded-lg hover:bg-glass/10 transition-colors mb-2 group-member-item">
              <div className="relative">
                {member.profilePictureUrl ? (
                  <img
                    src={member.profilePictureUrl}
                    alt={member.userName || member.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-glass/30 shadow-sm"
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
    </>
  );
};

export default GroupMembersDisplay;