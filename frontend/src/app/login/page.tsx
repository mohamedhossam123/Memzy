'use client'
import { useState } from 'react'
import { useAuth } from '@/Context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[rgba(20,20,20,0.8)] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#c56cf0]">
          Login to Memzy
        </h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 text-red-300 rounded text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-[rgba(30,30,30,0.5)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-[rgba(30,30,30,0.5)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#c56cf0] hover:bg-[#a569bd] text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}