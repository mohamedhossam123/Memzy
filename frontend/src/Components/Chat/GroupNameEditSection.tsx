'use client';

import React, { useState } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { updateGroupNameApi } from '@/lib/api/group/groupsapi';

interface GroupNameEditSectionProps {
  groupId: number;
  currentGroupName: string;
  onGroupNameChanged?: (groupId: number, newName: string) => void;
}

const GroupNameEditSection: React.FC<GroupNameEditSectionProps> = ({
  groupId,
  currentGroupName,
  onGroupNameChanged,
}) => {
  const { token } = useAuth();
  const [newGroupName, setNewGroupName] = useState(currentGroupName);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleUpdateGroupName = async () => {
    if (!token) {
      setError('Authentication token missing. Cannot update group name.');
      return;
    }
    if (newGroupName.trim() === '' || newGroupName === currentGroupName) {
      setError('Please enter a new group name that is not empty or the same as the current name.');
      return;
    }

    setIsUpdatingName(true);
    setError(null);
    setSuccess(false);

    try {
      await updateGroupNameApi(token, groupId, newGroupName);
      setSuccess(true);
      if (onGroupNameChanged) {
        onGroupNameChanged(groupId, newGroupName);
      }
      setTimeout(() => setSuccess(false), 3000); 
    } catch (err: any) {
      setError(err.message || 'Failed to update group name. Please try again.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl bg-glass/5 border border-glass/20 shadow-inner">
      <h3 className="text-lg font-semibold text-light mb-3">Rename Group</h3>
      <input
        type="text"
        value={newGroupName}
        onChange={(e) => {
          setNewGroupName(e.target.value);
          setError(null); 
        }}
        placeholder="Enter new group name"
        className="w-full p-2 rounded-md bg-glass/10 text-light border border-glass/30 focus:outline-none focus:ring-2 focus:ring-accent mb-3 placeholder:text-light/50"
      />
      {error && (
        <p className="text-red-400 text-sm mt-2 mb-2 animate-fade-in">{error}</p>
      )}
      {success && (
        <p className="text-green-400 text-sm mt-2 mb-2 animate-fade-in">Group name updated successfully!</p>
      )}
      <button
        onClick={handleUpdateGroupName}
        disabled={isUpdatingName || newGroupName.trim() === '' || newGroupName === currentGroupName}
        className={`w-full py-2 px-4 rounded-lg text-light font-bold transition-all duration-200 ease-in-out transform hover:scale-105
          ${isUpdatingName || newGroupName.trim() === '' || newGroupName === currentGroupName ? 'bg-blue-800/60 text-blue-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
        `}
      >
        {isUpdatingName ? 'Updating Name...' : 'Update Name'}
      </button>
    </div>
  );
};

export default GroupNameEditSection;