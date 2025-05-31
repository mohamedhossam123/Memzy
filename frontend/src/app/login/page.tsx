'use client'
import { useState} from 'react'
import { useAuth } from '@/Context/AuthContext'
import Link from 'next/link'
import { FiMail, FiLock, FiLogIn, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    setSuccess('')
    setIsLoading(true)
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }


  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darker to-primary-dark p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      
      <div className="relative z-10 w-full max-w-md" id="poda">
        <div className="bg-glass-dark backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-glass relative overflow-hidden conic-border">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-accent shadow-glow">
              <FiLogIn className="text-light text-2xl" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-center text-light text-glow">
            Welcome Back
          </h2>
          <p className="text-center text-primary-light mb-8">
            Log in to continue to Memzy
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

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start">
              <div className="text-green-400 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
              </div>
              <div className="text-green-300 text-sm flex-1">{success}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-3 bg-glass border border-glass rounded-lg text-light placeholder-primary-light/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-primary-light hover:text-accent transition-colors" />
                  ) : (
                    <FiEye className="text-primary-light hover:text-accent transition-colors" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-xs text-primary-light hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-light font-medium py-3 px-4 rounded-lg transition-all hover:shadow-glow ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <FiArrowRight className="ml-1" />
                </>
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-glass"></div>
              </div>
            </div>
            
            
            <div className="mt-6 text-center text-sm">
              <p className="text-primary-light">
                Don't have an account?{" "}
                <Link 
                  href="/SignUp" 
                  className="text-accent hover:text-primary-light font-medium transition-all hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}