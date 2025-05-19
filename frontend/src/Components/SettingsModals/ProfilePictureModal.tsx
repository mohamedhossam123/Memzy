'use client'

import { BaseModal } from '../BaseModal'
import { useState, useEffect } from 'react'

interface ProfilePictureModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfilePic?: string
  onConfirm: (file: File) => Promise<void>
}

export const ProfilePictureModal = ({ 
  isOpen, 
  onClose,
  currentProfilePic,
  onConfirm 
}: ProfilePictureModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(currentProfilePic || null)
      return
    }
    
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile, currentProfilePic])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleConfirm = async () => {
    if (!selectedFile) return
    
    setIsLoading(true)
    try {
      await onConfirm(selectedFile)
      setSelectedFile(null)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Change Profile Picture">
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#c56cf0] mb-2">
          <img 
            src={previewUrl || '/default-avatar.png'} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <label className="w-full flex flex-col items-center px-4 py-6 bg-[rgba(255,255,255,0.05)] text-light/80 rounded-lg cursor-pointer hover:bg-[rgba(255,255,255,0.1)]">
          <input 
            type="file" 
            className="hidden"
            accept="image/*"
            onChange={handleFileChange} 
          />
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="mt-2 text-base">
            {selectedFile ? 'File selected' : 'Select a file'}
          </span>
        </label>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedFile || isLoading}
        className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg ${
          selectedFile && !isLoading
            ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]' 
            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Uploading...' : 'Confirm'}
      </button>
    </BaseModal>
  )
}