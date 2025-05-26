'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate inputs
    if (!name || !email || !userName || !password || !confirmPassword) {
      setError('All fields are required')
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
          name, 
          email, 
          userName, 
          password 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }
      
      // Redirect to login page after successful signup
      router.push('/login?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darker to-primary-dark p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-float-reverse"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-glass-dark backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-glass relative overflow-hidden conic-border-dark">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-accent shadow-glow">
              <FiUser className="text-light text-2xl" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-center text-light text-glow">
            Create Your Account
          </h2>
          <p className="text-center text-primary-light mb-8">
            Join Memzy and start your journey
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
              <div className="text-red-400 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="text-red-300 text-sm flex-1">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-primary-light text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-primary-light" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-glass border border-glass rounded-lg text-light placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-primary-light text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-primary-light">@</span>
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-glass border border-glass rounded-lg text-light placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="johndoe"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9]+"
                  required
                />
              </div>
              <p className="text-xs text-primary-light/50 mt-1">3-20 characters, letters and numbers only</p>
            </div>
            
            <div>
              <label className="block text-primary-light text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-primary-light" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-glass border border-glass rounded-lg text-light placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-primary-light text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-primary-light" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-glass border border-glass rounded-lg text-light placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-primary-light/50 mt-1">Minimum 6 characters</p>
            </div>
            
            <div>
              <label className="block text-primary-light text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-primary-light" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-glass border border-glass rounded-lg text-light placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-light font-medium py-3 px-4 rounded-lg transition-all hover:shadow-glow ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up <FiArrowRight className="ml-1" />
                </>
              )}
            </button>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-primary-light">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-accent hover:text-primary-light font-medium transition-all hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}