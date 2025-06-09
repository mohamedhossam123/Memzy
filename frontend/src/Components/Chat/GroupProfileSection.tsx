'use client';

import React, { useState, ChangeEvent } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { uploadGroupProfilePictureApi } from '@/lib/api/group/groupsapi';

interface GroupProfileSectionProps {
  groupId: number;
  groupName: string;
  groupProfilePictureUrl?: string;
  onGroupProfilePictureChanged?: (groupId: number, newUrl: string) => void;
}

const GroupProfileSection: React.FC<GroupProfileSectionProps> = ({
  groupId,
  groupName,
  groupProfilePictureUrl,
  onGroupProfilePictureChanged,
}) => {
  const { token } = useAuth();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImageFile(event.target.files[0]);
      setUploadError(null);
      setUploadSuccess(false);
    } else {
      setSelectedImageFile(null);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!token) {
      setUploadError('Authentication token missing. Cannot upload picture.');
      return;
    }
    if (!selectedImageFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }

    setUploadingPicture(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const newUrl = await uploadGroupProfilePictureApi(token, groupId, selectedImageFile);
      if (onGroupProfilePictureChanged) {
        onGroupProfilePictureChanged(groupId, newUrl);
      }
      setSelectedImageFile(null); 
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000); 
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-xl bg-glass/5 border border-glass/20 text-center shadow-inner">
      <h3 className="text-lg font-semibold text-light mb-3">Group Picture</h3>
      <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center border-3 border-accent/50 shadow-lg group-profile-picture">
        {groupProfilePictureUrl ? (
          <img src={groupProfilePictureUrl} alt={`${groupName} profile`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
            {groupName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-light/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer mb-2"
      />
      {selectedImageFile && (
        <p className="text-sm text-light/70 mb-3 animate-fade-in">Selected: {selectedImageFile.name}</p>
      )}
      {uploadError && (
        <p className="text-red-400 text-sm mt-2 animate-fade-in">{uploadError}</p>
      )}
      {uploadSuccess && (
        <p className="text-green-400 text-sm mt-2 animate-fade-in">Picture uploaded successfully!</p>
      )}
      <button
        onClick={handleUploadProfilePicture}
        disabled={uploadingPicture || !selectedImageFile}
        className={`w-full py-2 px-4 rounded-lg text-light font-bold transition-all duration-200 ease-in-out transform hover:scale-105
          ${uploadingPicture || !selectedImageFile ? 'bg-green-800/60 text-green-200 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}
        `}
      >
        {uploadingPicture ? 'Uploading...' : 'Upload New Picture'}
      </button>
    </div>
  );
};

export default GroupProfileSection;