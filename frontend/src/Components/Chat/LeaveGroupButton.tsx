'use client';

import React, { useState } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { leaveGroup } from '@/lib/api/messaging/client';

interface LeaveGroupButtonProps {
  groupId: number;
  groupName: string;
  onGroupLeft?: (groupId: number) => void;
  onClose: () => void; 
}

const LeaveGroupButton: React.FC<LeaveGroupButtonProps> = ({ groupId, groupName, onGroupLeft, onClose }) => {
  const { token } = useAuth();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeaveGroup = async () => {
    if (!window.confirm(`Are you sure you want to leave "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    if (!token) {
      setError('Authentication token missing. Cannot leave group.');
      return;
    }

    setIsLeaving(true);
    setError(null);
    try {
      await leaveGroup(token, groupId);
      alert(`You have successfully left "${groupName}".`);
      if (onGroupLeft) {
        onGroupLeft(groupId);
      } else {
        onClose(); 
      }
    } catch (err: any) {
      setError(err.message || 'Failed to leave group. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-glass/30">
      {error && (
        <p className="text-red-400 text-sm mb-3 text-center animate-fade-in">{error}</p>
      )}
      <button
        onClick={handleLeaveGroup}
        disabled={isLeaving}
        className={`w-full py-3 px-4 rounded-lg text-light font-bold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg
          ${isLeaving ? 'bg-red-800/60 text-red-200 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}
        `}
      >
        {isLeaving ? 'Leaving Group...' : 'Leave Group'}
      </button>
    </div>
  );
};

export default LeaveGroupButton;