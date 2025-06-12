'use client';

import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  }, [selectedImageFile, uploadingPicture, uploadError, uploadSuccess]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImageFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    } else {
      setSelectedImageFile(null);
    }
  };


  const handleUploadProfilePicture = async () => {

    if (!token) {
      setUploadError('Authentication token missing. Cannot upload picture.');
      console.error('DEBUG: Upload aborted: Authentication token missing.');
      return;
    }
    if (!selectedImageFile) {
      setUploadError('Please select an image file to upload.');
      console.error('DEBUG: Upload aborted: No image file selected.');
      return;
    }

    setUploadingPicture(true);
    setUploadError(null);
    setUploadSuccess(false);
    ('DEBUG: Setting uploadingPicture to true.');

    try {
      ('DEBUG: Calling uploadGroupProfilePictureApi...');
      const newUrl = await uploadGroupProfilePictureApi(token, groupId, selectedImageFile);

      if (onGroupProfilePictureChanged) {
        onGroupProfilePictureChanged(groupId, newUrl);
      }

      setSelectedImageFile(null);
      setUploadSuccess(true);
      ('DEBUG: Setting selectedImageFile to null and uploadSuccess to true.');
      setTimeout(() => {
        setUploadSuccess(false);
        ('DEBUG: Hiding upload success message after 3 seconds.');
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload picture. Please try again.';
      setUploadError(errorMessage);
      console.error('DEBUG: Upload API call failed:', errorMessage, err);
    } finally {
      setUploadingPicture(false);
      ('DEBUG: Setting uploadingPicture to false (finally block).');
    }
  };

  const isButtonDisabled = uploadingPicture || !selectedImageFile;
  (`DEBUG: Button 'disabled' state calculation:`);
  (`  uploadingPicture: ${uploadingPicture}`);
  (`  !selectedImageFile: ${!selectedImageFile} (selectedImageFile is ${selectedImageFile ? 'present' : 'null'})`);
  (`  Result (isButtonDisabled): ${isButtonDisabled}`);

  return (
    <div className="mb-6 p-4 rounded-xl bg-glass/5 border border-glass/20 text-center shadow-inner">
      <h3 className="text-lg font-semibold text-light mb-3">Group Picture</h3>

      {/* NEW FIX: Use a <label> to wrap the visual elements and the hidden input */}
      <label
  className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center border-3 border-accent/50 shadow-lg group-profile-picture cursor-pointer relative"
  title="Click to change profile picture"
>
  {groupProfilePictureUrl ? (
    <img src={groupProfilePictureUrl} alt={`${groupName} profile`} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
      {groupName.charAt(0).toUpperCase()}
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    ref={fileInputRef}
    className="hidden"
  />
</label>

      {/* Display selected file name */}
      {selectedImageFile && (
        <p className="text-sm text-light/70 mb-3 animate-fade-in">Selected: {selectedImageFile.name}</p>
      )}

      {/* Upload Status Messages */}
      {uploadError && (
        <p className="text-red-400 text-sm mt-2 animate-fade-in">{uploadError}</p>
      )}
      {uploadSuccess && (
        <p className="text-green-400 text-sm mt-2 animate-fade-in">Picture uploaded successfully!</p>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUploadProfilePicture}
        disabled={isButtonDisabled} // This correctly uses the state variables
        className={`w-full py-2 px-4 rounded-lg text-light font-bold transition-all duration-200 ease-in-out transform hover:scale-105
          ${isButtonDisabled
            ? 'bg-green-800/60 text-green-200 cursor-not-allowed' // Disabled styles
            : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg' // Active styles
          }
        `}
      >
        {uploadingPicture ? 'Uploading...' : 'Upload New Picture'}
      </button>
    </div>
  );
};

export default GroupProfileSection;