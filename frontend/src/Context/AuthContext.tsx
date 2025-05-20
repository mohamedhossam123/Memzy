'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  userId?: number
  name: string
  email: string
  profilePictureUrl?: string
  bio?: string
  humorTypeId?: number
  token: string
  createdAt?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  updateUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  
  useEffect(() => {
    const checkAuth = async () => {
  try {
    const res = await fetch('/api/auth/check', {
      credentials: 'include', 
    });
    if (res.ok) {
      const { authenticated, user: serverUser } = await res.json();
      if (authenticated && serverUser) {
        setUser({
          userId: serverUser.UserId,
          name: serverUser.Name,
          email: serverUser.Email,
          token: serverUser.Token,
          profilePictureUrl: serverUser.ProfilePictureUrl || undefined,
          bio: serverUser.Bio || undefined,
          humorTypeId: serverUser.HumorTypeId || undefined,
          createdAt: serverUser.CreatedAt || undefined,
        });
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  } finally {
    setLoading(false);
  }
};

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const { user } = await response.json();
    
    setUser({
      userId: user.userId,
      name: user.name,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      bio: user.bio,
      token: '', // Will come from cookie
    });

    router.push('/');
  } catch (error) {
    console.error('Login error:', error);
    throw error instanceof Error ? error : new Error('Login failed');
  }
};

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
    updateUser: setUser,
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
