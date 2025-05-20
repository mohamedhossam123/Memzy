'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  userId?: number
  name: string
  email: string
  profilePictureUrl?: string
  bio?: string
  humorTypeId?: number
  createdAt?: string
}

interface ApiOptions extends RequestInit {
  authenticated?: boolean
  headers?: Record<string, string>
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  updateUser: (user: User | null) => void
  api: {
    fetch: (url: string, options?: ApiOptions) => Promise<Response | null>
    get: (url: string, options?: ApiOptions) => Promise<Response | null>
    post: (url: string, data: any, options?: ApiOptions) => Promise<Response | null>
    put: (url: string, data: any, options?: ApiOptions) => Promise<Response | null>
    delete: (url: string, options?: ApiOptions) => Promise<Response | null>
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('auth_token')
  return null
}

const setStoredToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    token ? localStorage.setItem('auth_token', token) : localStorage.removeItem('auth_token')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = getStoredToken()
    if (storedToken) {
      setToken(storedToken)
      checkAuth(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuth = async (currentToken: string) => {
    try {
      const res = await fetch('http://localhost:5001/api/Auth/validate', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser({
            userId: data.user.userId,
            name: data.user.name,
            email: data.user.email,
            profilePictureUrl: data.user.profilePictureUrl,
            bio: data.user.bio,
            humorTypeId: data.user.humorTypeId,
            createdAt: data.user.createdAt,
          })
        } else {
          setToken(null)
          setStoredToken(null)
        }
      } else {
        setToken(null)
        setStoredToken(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setToken(null)
      setStoredToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')
      
      const data = await response.json()
      const newToken = data.token
      
      setToken(newToken)
      setStoredToken(newToken)
      setUser({
        userId: data.user.userId,
        name: data.user.name,
        email: data.user.email,
        profilePictureUrl: data.user.profilePictureUrl,
        bio: data.user.bio,
      })

      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      if (token) {
        await fetch('http://localhost:5001/api/Auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      setStoredToken(null)
      setLoading(false)
      router.push('/login')
    }
  }, [router, token])

  const api = useMemo(() => ({
    fetch: async (url: string, options: ApiOptions = {}) => {
      const { authenticated = true, headers = {}, ...rest } = options
      const requestHeaders = { ...headers }

      if (authenticated && token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }

      try {
        const response = await fetch(url, {
          ...rest,
          headers: requestHeaders
        })

        if (response.status === 401) {
          logout()
          return null
        }

        return response
      } catch (error) {
        console.error('API request failed:', error)
        throw error
      }
    },
    get: (url: string, options?: ApiOptions) => api.fetch(url, { ...options, method: 'GET' }),
    post: (url: string, data: any, options?: ApiOptions) => 
      api.fetch(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
      }),
    put: (url: string, data: any, options?: ApiOptions) => 
      api.fetch(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
      }),
    delete: (url: string, options?: ApiOptions) => 
      api.fetch(url, { ...options, method: 'DELETE' })
  }), [token, logout])

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    updateUser: setUser,
    api
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}