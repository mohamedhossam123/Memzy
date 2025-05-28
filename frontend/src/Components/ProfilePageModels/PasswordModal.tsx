'use client'

import { BaseModal } from './BaseModal'
import { useState } from 'react'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (currentPassword: string, newPassword: string) => Promise<void>
  error?: string
}

export const PasswordModal = ({ 
  isOpen, 
  onClose,
  onConfirm,
  error 
}: PasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onConfirm(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Change Password">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light/80 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c56cf0] outline-none rounded-lg text-light/90"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light/80 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c56cf0] outline-none rounded-lg text-light/90"
            placeholder="Enter new password (min 6 characters)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light/80 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c56cf0] outline-none rounded-lg text-light/90"
            placeholder="Confirm new password"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          className={`w-full py-2 rounded-xl font-semibold transition-all shadow-lg ${
            (currentPassword && newPassword && confirmPassword && !isLoading)
              ? 'bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-white hover:from-[#9e44f0] hover:to-[#5a10e0]'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </BaseModal>
  )
}