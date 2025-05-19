// BioModal.tsx
'use client'

import { useState } from 'react'
import { BaseModal } from '@/Components/BaseModal'

interface BioModalProps {
  isOpen: boolean
  onClose: () => void
  bio: string
  onSave: (newBio: string) => void
}

export const BioModal = ({ isOpen, onClose, bio, onSave }: BioModalProps) => {
  const [newBio, setNewBio] = useState(bio)

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
        onClick={() => onSave(newBio)}
        disabled={!newBio.trim()}
        className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg ${
          newBio.trim()
            ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]'
            : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }`}
      >
        Save Bio
      </button>
    </BaseModal>
  )
}