'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  name: string
  email: string
  profilePic?: string
  token: string
  bio?: string
  humorTypeId?: number
  createdAt?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizePicPath(path: string) {
  const withSlashes = path.replace(/\\/g, '/')
  return withSlashes.startsWith('/') ? withSlashes : '/' + withSlashes
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' })
        if (res.ok) {
          const { authenticated, user: u } = await res.json()
          if (authenticated) {
            setUser({
              name: u.name,
              email: u.email,
              token: u.token,
              profilePic: u.profilePic ? normalizePicPath(u.profilePic) : undefined,
              bio: u.bio,
              humorTypeId: u.humorTypeId,
              createdAt: u.createdAt,
            })
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      const userData = await response.json()
      setUser({
        name: userData.name,
        email: userData.email,
        token: userData.token,
        profilePic: userData.profilePic ? normalizePicPath(userData.profilePic) : undefined,
        bio: userData.bio,
        humorTypeId: userData.humorTypeId,
        createdAt: userData.createdAt,
      })

      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      throw error instanceof Error ? error : new Error('Login failed')
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Logout request failed')
      }
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
