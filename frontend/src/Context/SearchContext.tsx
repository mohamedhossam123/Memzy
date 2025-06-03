// SearchContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react'
import debounce from 'lodash.debounce'

type SearchResult = {
  id: string
  name: string
  userName?: string
  profilePictureUrl?: string
  bio?: string
}

type SearchContextType = {
  results: SearchResult[]
  loading: boolean
  error: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  search: (query: string) => void
  clearResults: () => void
}

const SearchContext = createContext<SearchContextType>({
  results: [],
  loading: false,
  error: null,
  searchTerm: '',
  setSearchTerm: () => {},
  search: () => {},
  clearResults: () => {}
})

export function SearchProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    setSearchTerm('')
  }, [])

  const searchImplementation = useCallback(async (query: string) => {
    if (!query.trim()) {
      clearResults()
      return
    }

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      const controller = new AbortController()
      abortControllerRef.current = controller
      
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/Search/userSearch?searchTerm=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: unknown = await response.json()
      const normalizedResults = Array.isArray(data) 
        ? data.map(normalizeSearchResult)
        : []

      setResults(normalizedResults)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Search error:', error)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [clearResults])

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchImplementation(query)
    }, 300),
    [searchImplementation]
  )

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
    debouncedSearch(term)
  }, [debouncedSearch])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedSearch])

  return (
    <SearchContext.Provider value={{ 
      results, 
      loading,
      error,
      searchTerm,
      setSearchTerm: handleSetSearchTerm,
      search: debouncedSearch,
      clearResults
    }}>
      {children}
    </SearchContext.Provider>
  )
}

function isSearchResult(obj: any): obj is SearchResult {
  return typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string'
}

function normalizeSearchResult(item: unknown): SearchResult {
  if (!isSearchResult(item)) {
    return {
      id: 'invalid',
      name: 'Invalid result',
      profilePictureUrl: undefined,
      bio: undefined
    }
  }

  return {
    id: item.id,
    name: item.name,
    userName: item.userName,
    profilePictureUrl: item.profilePictureUrl,
    bio: item.bio
  }
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}