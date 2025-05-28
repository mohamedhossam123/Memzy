'use client'

import { BaseModal } from './BaseModal'
import { useState } from 'react'

interface NameModalProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  onConfirm: (newName: string) => Promise<void>
}

export const NameModal = ({ 
  isOpen, 
  onClose,
  currentName,
  onConfirm 
}: NameModalProps) => {
  const [newName, setNewName] = useState(currentName)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!newName.trim()) return
    
    setIsLoading(true)
    try {
      await onConfirm(newName.trim())
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Change Your Name">
      <div className="mt-4">
        <label htmlFor="name" className="block text-sm font-medium text-light/80 mb-2">
          New Name
        </label>
        <input
          type="text"
          id="name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                    focus:border-[#c56cf0] outline-none rounded-lg text-light/90"
          placeholder="Enter your new name"
        />
      </div>

      <button
        onClick={handleConfirm}
        disabled={!newName.trim() || isLoading}
        className={`mt-6 w-full py-2 rounded-xl font-semibold transition-all shadow-lg
          ${(newName.trim() && !isLoading) 
            ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]' 
            : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
      >
        {isLoading ? 'Saving...' : 'Confirm'}
      </button>
    </BaseModal>
  )
}