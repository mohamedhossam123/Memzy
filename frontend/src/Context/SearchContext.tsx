// SearchContext.tsx

'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type SearchResult = {
  id: string
  name: string
  profilePic?: string
  profilePictureUrl?: string
  bio?: string
}

type SearchContextType = {
  results: SearchResult[]
  search: (query: string) => Promise<{ success: boolean; message?: string }>
}

const SearchContext = createContext<SearchContextType>({
  results: [],
  search: () => Promise.resolve({ success: false, message: 'Context not initialized' })
})

export function SearchProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SearchResult[]>([])

  const search = async (query: string): Promise<{ success: boolean; message?: string }> => {
    if (!query.trim()) {
      setResults([])
      return { success: true }
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        }
      })

      const payload = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        console.error('Search failed:', payload.message || 'Unknown error')
        setResults([])
        return { 
          success: false, 
          message: payload.message || 'Search failed' 
        }
      }

      const formattedResults = (payload.Results ?? payload.results ?? payload).map((item: any) => ({
        name: item.Name ?? item.name,
        profilePic: item.ProfilePictureUrl ?? item.profilePictureUrl ?? item.profilePic,
        bio: item.Bio ?? item.bio,
      }))

      setResults(formattedResults)
      return { success: true }

    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      return { 
        success: false, 
        message: 'Service unavailable. Please try again later.' 
      }
    }
  }

  return (
    <SearchContext.Provider value={{ results, search }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}