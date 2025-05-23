'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearch } from '../Context/SearchContext'
import { useAuth } from '../Context/AuthContext'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import debounce from 'lodash.debounce'

interface SearchResult {
  id: string | number
  name: string
  userName?: string
  profilePictureUrl?: string
}

export function Header() {
  const router = useRouter()
  const { user, updateUser, token } = useAuth()
  const { results, search, loading, error } = useSearch()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [profileImageError, setProfileImageError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [userName, setUserName] = useState<string>('')



  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.trim()) {
        search(searchTerm)
        setShowResults(true)
      }
    }, 300),
    [search]
  )
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (user?.userId && !user.userName) {
      fetchUserName()
    }
  }, [user])

  const fetchUserName = async () => {
    if (!token) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/Auth/getCurrentUser`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const data = await response.json()
      
      setUserName(data.userName)
      if (user && typeof user.userId === 'number') {
  updateUser({ ...user, userName: data.userName })
}

    } catch (err) {
      console.error('Error fetching username:', err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('ProfilePicture', file)

    try {
      const response = await fetch('/api/UpdateProfilePicture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      
      if (data.Url && user) {
        setProfileImageError(false)
        updateUser({ ...user, profilePictureUrl: data.Url })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setProfileImageError(true)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  const handleResultClick = (userId: string | number) => {
    router.push(`/profile/${userId}`)
    setShowResults(false)
    setQuery('')
  }

  const SearchStatusIndicator = () => {
    if (loading) return <div className="text-white/50 text-sm p-2">Searching...</div>
    if (error) return <div className="text-red-400 text-sm p-2">{error}</div>
    if (showResults && !results.length) return <div className="text-white/50 text-sm p-2">No results found</div>
    return null
  }

  const getProfileImageUrl = () => {
    if (profileImageError || !user?.profilePictureUrl) {
      return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
    }
    return user.profilePictureUrl.startsWith('http')
      ? user.profilePictureUrl
      : `https://${user.profilePictureUrl}`
  }

  const getSearchResultImageUrl = (url?: string) => {
    if (!url) return 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
    return url.startsWith('http') ? url : `https://${url}`
  }

  const profileImageUrl = getProfileImageUrl()

  return (
    <header className="col-span-full flex justify-between items-center py-5 px-8 bg-[rgba(10,10,10,0.7)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)] z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Left Section - User Profile */}
      <div className="flex items-center gap-6">
        {user ? (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#a569bd] grid place-items-center overflow-hidden border-2 border-[#f5f5f5] relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
                <img
                  src={profileImageUrl}
                  alt={user.name || 'User'}
                  onError={() => setProfileImageError(true)}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[#f5f5f5] font-semibold">{user.name}</span>
                <span className="text-[#f5f5f5]/70 text-xs">
                  @{userName || user.userName || 'username'}
                </span>
              </div>
            </div>
          </label>
        ) : (
          <div className="text-[#f5f5f5]">Please log in</div>
        )}
      </div>

      {/* Center Section - Search Bar */}
      <div ref={searchRef} className="relative mx-6 flex-1 max-w-2xl">
        <div className="flex items-center bg-[#2f3640] rounded-[50px] relative">
          <input
            type="text"
            className="border-none bg-transparent outline-none text-white text-[15px] py-4 px-6 w-full"
            placeholder="Search users..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            aria-label="Search users"
          />
          {loading && (
            <div className="absolute right-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full mt-2 w-full bg-[#2d1b3a] rounded-lg shadow-lg border border-[rgba(255,255,255,0.1)] max-h-60 overflow-auto z-50">
            <SearchStatusIndicator />
            {results.map((result: SearchResult) => {
              const resultImg = getSearchResultImageUrl(result.profilePictureUrl)
              return (
                <div
                  key={result.id}
                  className="p-3 hover:bg-[#3a2449] cursor-pointer flex items-center gap-3"
                  onClick={() => handleResultClick(result.id)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={resultImg}
                    width={32}
                    height={32}
                    alt={result.name}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-white">{result.name}</span>
                    <span className="text-white/70 text-xs">
                      @{result.userName || 'username'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Section - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#c56cf0] relative overflow-hidden">
          <Image
            src="/memzyiconcopyyy.jpg"
            alt="Memzy Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative w-[136px] h-[40px] flex items-center">
          <h1 className="text-3xl font-bold text-[#c56cf0] drop-shadow-[0_0_15px_rgba(197,108,240,0.3)]">
            Memzy
          </h1>
        </div>
      </div>
    </header>
  )
}