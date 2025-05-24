// AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { useRouter } from 'next/navigation'

type User = {
  userId: number
  name: string
  email: string
  profilePictureUrl?: string
  bio?: string
  humorTypeId?: number
  createdAt?: string
  userName?: string
  status?: string
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
    if (token) localStorage.setItem('auth_token', token)
    else localStorage.removeItem('auth_token')
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/validate`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      )

      if (res.ok) {
        const response = await res.json()
        console.log('Validate response:', response)
        const userData =
          response.Data || response.data || response.user || response

        if (userData?.userId) {
          setUser({
            userId: userData.userId,
            name: userData.name || '',
            email: userData.email || '',
            profilePictureUrl: userData.profilePictureUrl,
            bio: userData.bio,
            userName: userData.userName || userData.UserName || '',
            humorTypeId: userData.humorTypeId,
            createdAt: userData.createdAt,
            status: userData.status
          })
        } else {
          console.warn('Invalid user data structure in token validation')
          setToken(null)
          setStoredToken(null)
        }
      } else {
        console.warn('Token validation failed')
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      console.log('Login response data:', data)
      if (!data.token || !data.user?.userId) {
        throw new Error('Invalid server response format')
      }

      const newToken = data.token
      setToken(newToken)
      setStoredToken(newToken)
      setUser({
        userId: data.user.userId,
        name: data.user.name,
        email: data.user.email,
        profilePictureUrl: data.user.profilePictureUrl,
        bio: data.user.bio,
        userName: data.user.userName || data.user.UserName || '',
        humorTypeId: data.user.humorTypeId,
        createdAt: data.user.createdAt,
        status: data.user.status
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
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
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

  const api = useMemo(
    () => ({
      fetch: async (url: string, options: ApiOptions = {}) => {
        const { authenticated = true, headers = {}, ...rest } = options
        const requestHeaders = { ...headers }

        if (authenticated && token) {
          requestHeaders['Authorization'] = `Bearer ${token}`
        }

        try {
          const response = await fetch(url, {
            ...rest,
            headers: requestHeaders,
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
      get: (url: string, options?: ApiOptions) =>
        api.fetch(url, { ...options, method: 'GET' }),
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
        api.fetch(url, { ...options, method: 'DELETE' }),
    }),
    [token, logout]
  )

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      loading,
      updateUser: setUser,
      api,
    }),
    [user, token, loading, login, logout, api]
  )

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
