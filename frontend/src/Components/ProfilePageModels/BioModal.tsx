'use client'

import { useState, useEffect } from 'react'
import { BaseModal } from '@/Components/ProfilePageModels/BaseModal'

interface BioModalProps {
  isOpen: boolean
  onClose: () => void
  bio: string
  onSave: (newBio: string) => Promise<void> 
}

export const BioModal = ({ isOpen, onClose, bio, onSave }: BioModalProps) => {
  const [newBio, setNewBio] = useState(bio)
  const [isSaving, setIsSaving] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setNewBio(bio)
      setIsSaving(false)
    }
  }, [isOpen, bio])

  const handleSave = async () => {
    if (!newBio.trim()) return
    
    setIsSaving(true)
    try {
      await onSave(newBio)
      onClose() 
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Change Your Bio">
      <textarea
        value={newBio}
        onChange={(e) => setNewBio(e.target.value)}
        rows={4}
        className="w-full px-4 py-2 mt-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c56cf0] outline-none rounded-lg text-light/90 resize-none"
        placeholder="Write something about yourself..."
      />
      <button
        onClick={handleSave}
        disabled={!newBio.trim() || isSaving}
        className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg ${
          newBio.trim() && !isSaving
            ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]'
            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }`}
      >
        {isSaving ? 'Saving...' : 'Save Bio'}
      </button>
    </BaseModal>
  )
}