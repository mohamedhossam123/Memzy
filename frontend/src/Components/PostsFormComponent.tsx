// Components/PostsFormComponent.tsx
'use client'

import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/Context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function PostForm({ onSuccess }: { onSuccess?: () => void }) {
  const [text, setText] = useState('')
  const [humorType, setHumorType] = useState('Dark')
  const [media, setMedia] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!media) {
      toast.error('Please select a file to upload')
      return
    }

    const formData = new FormData()
    formData.append('File', media)
    formData.append('Description', text)
    formData.append('MediaType', media.type.startsWith('video') ? '1' : '0')
    formData.append('HumorTypeIds', humorType === 'Dark' ? '1' : '2')

    try {
      setLoading(true)

      await axios.post('/api/user/CreatePost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      setText('')
      setMedia(null)

      toast.success('Post created successfully! Closing...', {
        duration: 1500
      })

      onSuccess?.()

      // Auto-close the tab after 1.5 seconds
      setTimeout(() => window.close(), 1500)
    } catch (err) {
      console.error('Post creation failed:', err)
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          'Server error'
        toast.error(`Failed: ${errorMessage}`)
      } else {
        toast.error('Unexpected error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[rgba(20,20,20,0.85)] backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-glass/50"
      >
        <textarea
          className="w-full p-4 bg-glass/5 border border-glass/20 rounded-xl text-light/90 placeholder-light/60 focus:border-[#c56cf0] focus:ring-2 focus:ring-[#c56cf0]/30 outline-none transition"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={3}
        />

        <select
          value={humorType}
          onChange={(e) => setHumorType(e.target.value)}
          className="w-full p-3 border border-glass/20 rounded-xl text-color bg-black/90 focus:border-[#c56cf0] focus:ring-2 focus:ring-[#c56cf0]/30 outline-none transition"
        >
          <option value="Dark">Dark Humor</option>
          <option value="Friendly">Friendly Humor</option>
        </select>

        <label className="block w-full p-3 bg-glass/5 border border-glass/20 rounded-xl cursor-pointer hover:bg-glass/10 transition group">
          <div className="flex items-center gap-3 text-light/90">
            <span className="text-xl">📷</span>
            <span>{media ? media.name : 'Upload Media (Image/Video)'}</span>
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMedia(e.target.files?.[0] || null)}
            className="hidden"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] text-light py-3.5 rounded-xl font-semibold hover:scale-105 hover:shadow-glow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Create Post 🌟'}
        </button>
      </form>
    </>
  )
}
