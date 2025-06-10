'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';

type User = {
  userId: number;
  name: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
  humorTypeId?: number;
  createdAt?: string;
  userName?: string;
  status?: string;
};

interface ApiOptions extends RequestInit {
  authenticated?: boolean;
  headers?: Record<string, string>;
}

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    userName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updater: (prev: User | null) => User | null) => void;
  api: {
    fetch: (url: string, options?: ApiOptions) => Promise<Response | null>;
    get: (url: string, options?: ApiOptions) => Promise<Response | null>;
    post: (url: string, data: any, options?: ApiOptions) => Promise<Response | null>;
    put: (url: string, data: any, options?: ApiOptions) => Promise<Response | null>;
    delete: (url: string, options?: ApiOptions) => Promise<Response | null>;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('auth_token');
  return null;
};

const setStoredToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const updateUser = useCallback((updater: (prev: User | null) => User | null) => {
    setUser(updater);
  }, []);

  const checkAuth = useCallback(async (currentToken: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/Auth/validate`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const response = await res.json();
        const userData = response?.user || response?.User || response?.data || response;

        if (userData?.userId) {
          setUser({
  userId: userData.userId,
  name: userData.name || '',
  email: userData.email || '',
  profilePictureUrl: userData.profilePictureUrl,
  bio: userData.bio || '',
  userName: userData.userName || userData.UserName || userData.username || '', // <--- add .username
  humorTypeId: userData.humorTypeId,
  createdAt: userData.createdAt,
  status: userData.status,
});
          return true;
        }
      }

      setToken(null);
      setStoredToken(null);
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setToken(null);
      setStoredToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      checkAuth(storedToken);
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BACKEND_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Login failed');
    }

    const newToken = data.token;
    const userData = data.user || data.User || data;

    if (!userData?.userId || !newToken) {
      throw new Error('Invalid login response');
    }

    setToken(newToken);
    setStoredToken(newToken);
    setUser({
  userId: userData.userId,
  name: userData.name || '',
  email: userData.email || '',
  profilePictureUrl: userData.profilePictureUrl,
  bio: userData.bio || '',
  userName: userData.userName || userData.UserName || userData.username || '', // <--- add .username
  humorTypeId: userData.humorTypeId,
  createdAt: userData.createdAt,
  status: userData.status,
});

    router.push('/');
  }, [BACKEND_URL, router]);

  const signup = useCallback(
    async (userData: { name: string; email: string; password: string; userName: string }) => {
      const res = await fetch(`${BACKEND_URL}/api/Auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Signup failed');
      }
      await login(userData.email, userData.password);
    },
    [BACKEND_URL, login]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        await fetch(`${BACKEND_URL}/api/Auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setStoredToken(null);
      setLoading(false);
      router.push('/login');
    }
  }, [BACKEND_URL, token, router]);

  const api = useMemo(
    () => ({
      fetch: async (url: string, options: ApiOptions = {}) => {
        const { authenticated = true, headers = {}, ...rest } = options;
        const requestHeaders = { ...headers };

        if (authenticated && token) {
          requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        try {
          const response = await fetch(url, {
            ...rest,
            headers: requestHeaders,
          });

          if (response.status === 401) {
            logout();
            return null;
          }

          return response;
        } catch (error) {
          console.error('API request failed:', error);
          throw error;
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
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      updateUser,
      api,
    }),
    [user, token, loading, login, signup, logout, updateUser, api]
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
