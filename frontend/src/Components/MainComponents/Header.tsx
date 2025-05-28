'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearch } from '../../Context/SearchContext'
import { useAuth } from '../../Context/AuthContext'
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
  const [hasFetchedUserName, setHasFetchedUserName] = useState(false)

  useEffect(() => {
    if (user?.userId && !user.userName && !hasFetchedUserName) {
      fetchUserName()
      setHasFetchedUserName(true)
    }
  }, [user, hasFetchedUserName])

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
      
      if (data.userName && user && typeof user.userId === 'number') {
        updateUser(prevUser => prevUser ? { ...prevUser, userName: data.userName } : null)
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
        updateUser(prevUser => prevUser ? { ...prevUser, profilePictureUrl: data.Url } : null)
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
    console.log('Navigating to profile:', userId) // Debug log
    setShowResults(false)
    setQuery('')
    
    router.push(`/profile/${userId}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent, userId: string | number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleResultClick(userId)
    }
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
                  @{user.userName || 'username'}
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
        <div className="flex items-center bg-[#1e1e2d] rounded-lg relative transition-all duration-300 focus-within:ring-2 focus-within:ring-[#c56cf0] focus-within:bg-[#2a2a3a]">
          <svg
            className="w-5 h-5 text-gray-400 ml-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="border-none bg-transparent outline-none text-white text-[15px] py-3 px-4 w-full placeholder-gray-400 focus:placeholder-gray-500"
            placeholder="Search users..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            aria-label="Search users"
          />
          {loading && (
            <div className="absolute right-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#c56cf0]"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full mt-2 w-full bg-[#2d1b3a] rounded-lg shadow-lg border border-[rgba(255,255,255,0.1)] max-h-60 overflow-auto z-50 backdrop-blur-md">
            <SearchStatusIndicator />
            {results.map((result: SearchResult) => {
              const resultImg = getSearchResultImageUrl(result.profilePictureUrl)
              return (
                <div
                  key={result.id}
                  className="p-3 hover:bg-[#3a2449] cursor-pointer flex items-center gap-3 transition-colors duration-200"
                  onClick={() => handleResultClick(result.id)}
                  onKeyDown={(e) => handleKeyDown(e, result.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile of ${result.name}`}
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
  {/* Animated Logo Container */}
  <div className="relative group">
    {/* Glowing orb background */}
    <div className="absolute -inset-2 rounded-lg bg-[#c56cf0] opacity-20 blur-md group-hover:opacity-40 transition-all duration-500"></div>
    
    {/* Main logo container with gradient shine */}
    <div className="relative w-10 h-10 rounded-lg overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c56cf0] via-[#8e44ad] to-[#5d2a7e] animate-[pulse_6s_ease-in-out_infinite]"></div>
      
      {/* Moving shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {/* Subtle particle effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Logo image with 3D tilt effect */}
      <Image
        src="/memzyiconcopyyy.jpg"
        alt="Memzy Logo"
        fill
        className="object-cover relative z-10 group-hover:rotate-[5deg] group-hover:scale-105 transition-all duration-300"
        priority
      />
    </div>
  </div>

  {/* Text logo with enhanced animations */}
  <div className="relative group cursor-pointer">
    {/* Glow effect */}
    <div className="absolute -inset-2 rounded-lg bg-[#c56cf0] opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500"></div>
    
    {/* Text with individual character animations */}
    <h1 className="text-3xl font-bold relative">
      {['M', 'e', 'm', 'z', 'y'].map((letter, i) => (
        <span 
          key={i}
          className="inline-block text-[#c56cf0] drop-shadow-[0_0_8px_rgba(197,108,240,0.5)]"
          style={{
            animation: `bounce 2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            transformOrigin: 'bottom center'
          }}
        >
          {letter}
        </span>
      ))}
    </h1>
    
    {/* Underline effect */}
    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#c56cf0] to-[#ff6b9d] group-hover:w-full transition-all duration-500 ease-out"></div>
    
    {/* Floating sparkles */}
    <div className="absolute -top-2 -right-2 w-16 h-16 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animation: `sparkle ${Math.random() * 3 + 2}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
            left: `${Math.random() * 60}%`,
            top: `${Math.random() * 60}%`,
            opacity: 0
          }}
        />
      ))}
    </div>
  </div>
</div>
    </header>
  )
}