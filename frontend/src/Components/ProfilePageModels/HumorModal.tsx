'use client'

import { BaseModal } from './BaseModal'
import { useState, useEffect } from 'react'

interface HumorModalProps {
  isOpen: boolean
  onClose: () => void
  initialHumorTypes: string[]
  onConfirm: (selectedHumor: string[]) => Promise<void>
  humorTypes: string[] 
}

export const HumorModal = ({ 
  isOpen, 
  onClose, 
  initialHumorTypes,
  onConfirm,
  humorTypes 
}: HumorModalProps) => {
  const [selectedHumor, setSelectedHumor] = useState<string[]>(initialHumorTypes)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedHumor(initialHumorTypes)
    }
  }, [initialHumorTypes, isOpen])

  const toggleHumorType = (type: string) => {
    setSelectedHumor(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    )
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm(selectedHumor)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Select Your Humor Type">
      <div className="flex flex-col gap-3">
        {humorTypes.map((type, index) => (
          <button
            key={`humor-${index}-${type}`}
            onClick={() => toggleHumorType(type)}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition
              ${selectedHumor.includes(type)
                ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white shadow-lg'
                : 'bg-[rgba(255,255,255,0.05)] text-light/80 hover:bg-[rgba(255,255,255,0.1)]'}
            `}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={`mt-6 w-full bg-gradient-to-r from-[#8e2de2] to-[#4a00e0]
          text-white py-2 rounded-xl font-semibold hover:from-[#9e44f0]
          hover:to-[#5a10e0] transition-all shadow-lg ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? 'Saving...' : 'Confirm'}
      </button>
    </BaseModal>
  )
}
