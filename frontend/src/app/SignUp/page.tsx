'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiUser, FiMail, FiLock, FiArrowRight,
  FiEye, FiEyeOff
} from 'react-icons/fi'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)




  const router = useRouter()
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateUsername = (username: string) =>
    /^[a-zA-Z0-9_]+$/.test(username) && username.length >= 3 && username.length <= 20

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = name.trim()
    const trimmedEmail = email.toLowerCase().trim()
    const trimmedUserName = userName.toLowerCase().trim()

    if (!trimmedName || !trimmedEmail || !trimmedUserName || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    if (!validateUsername(trimmedUserName)) {
      setError('Username must be 3–20 characters, only letters, numbers, underscores')
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          userName: trimmedUserName,
          password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => router.push('/login?registered=true'), 2000)
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darker to-primary-dark p-4 relative overflow-hidden">
      {/* Blurred background elements */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-float-reverse"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-glass-dark backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-glass conic-border-dark">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-accent shadow-glow">
              <FiUser className="text-light text-2xl" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center text-light text-glow">
            Create Your Account
          </h2>
          <p className="text-center text-primary-light mb-6">Join Memzy and start your journey</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start text-red-300 text-sm">
              <span className="mr-3 mt-0.5 text-red-400">
                <FiUser />
              </span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start text-green-300 text-sm">
              <span className="mr-3 mt-0.5 text-green-400">
                <FiUser />
              </span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Username */}
            <div className="grid grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="text-xs font-medium text-primary-light mb-1.5 block">Full Name</label>
                <div className="relative">
                  <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                    <FiUser className="text-primary-light text-sm" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-glass border border-glass rounded-lg text-light text-sm placeholder-primary-light/50 focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-medium text-primary-light mb-1.5 block">Username</label>
                <div className="relative">
                  <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                    <span className="text-primary-light text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="johndoe"
                    minLength={3}
                    maxLength={20}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-glass border border-glass rounded-lg text-light text-sm placeholder-primary-light/50 focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-primary-light mb-1.5 block">Email</label>
              <div className="relative">
                <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                  <FiMail className="text-primary-light text-sm" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-glass border border-glass rounded-lg text-light text-sm placeholder-primary-light/50 focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                />
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              {/* Password */}
              <div>
                <label className="text-xs font-medium text-primary-light mb-1.5 block">Password</label>
                <div className="relative">
                  <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                    <FiLock className="text-primary-light text-sm" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-glass border border-glass rounded-lg text-light text-sm placeholder-primary-light/50 focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  />
                  <button type="button" className="absolute right-0 pr-3 inset-y-0 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff className="text-primary-light" /> : <FiEye className="text-primary-light" />}
                  </button>
                </div>
              </div>
          
              {/* Confirm */}
              <div>
                <label className="text-xs font-medium text-primary-light mb-1.5 block">Confirm</label>
                <div className="relative">
                  <div className="absolute left-0 pl-3 inset-y-0 flex items-center pointer-events-none">
                    <FiLock className="text-primary-light text-sm" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-glass border border-glass rounded-lg text-light text-sm placeholder-primary-light/50 focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  />
                  <button type="button" className="absolute right-0 pr-3 inset-y-0 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FiEyeOff className="text-primary-light" /> : <FiEye className="text-primary-light" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-primary-light/50 text-center">
              Password: min 6 chars • Username: 3-20 chars, letters/numbers/_
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-light font-medium py-3 px-4 rounded-lg transition-all hover:shadow-glow ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up <FiArrowRight />
                </>
              )}
            </button>

            {/* Link to Login */}
            <p className="text-sm text-center text-primary-light mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-accent font-medium hover:underline hover:text-primary-light">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
