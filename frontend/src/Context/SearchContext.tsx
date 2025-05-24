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
      // Cancel previous request
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
      
      // Validate and normalize response format
      const normalizedResults = Array.isArray(data) 
        ? data.map(normalizeSearchResult)
        : []

      setResults(normalizedResults)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setError('Failed to fetch results. Please try again.')
        console.error('Search error:', error)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [clearResults])

  // Debounced search with 300ms delay
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchImplementation(query)
    }, 300),
    [searchImplementation]
  )

  // Update search term and trigger search
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
    debouncedSearch(term)
  }, [debouncedSearch])

  // Cancel debounce on unmount
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

// Type guard for search result validation
function isSearchResult(obj: any): obj is SearchResult {
  return typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string'
}

// Normalize API response to SearchResult type
function normalizeSearchResult(item: unknown): SearchResult {
  if (!isSearchResult(item)) {
    console.warn('Invalid search result format:', item)
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