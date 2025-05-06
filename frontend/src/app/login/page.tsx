//login/page.tsx

'use client'
import { useState } from 'react'
import { useAuth } from '@/Context/AuthContext'
import Link from 'next/link'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2d1b3a] to-[#201429]">
      <div className="bg-[#121212] p-8 rounded-lg shadow-lg w-full max-w-md border border-[rgba(255,255,255,0.05)]">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#c56cf0] drop-shadow-[0_0_10px_rgba(197,108,240,0.3)]">
          Login to Memzy
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#c56cf0] focus:ring-1 focus:ring-[rgba(197,108,240,0.3)] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#c56cf0] focus:ring-1 focus:ring-[rgba(197,108,240,0.3)] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#c56cf0] hover:bg-[#a569bd] text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            Login
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link 
                href="/SignUp" 
                className="text-[#c56cf0] hover:text-[#a569bd] font-medium transition-all hover:underline"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}