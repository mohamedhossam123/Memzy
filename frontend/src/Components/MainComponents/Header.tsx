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
  const { user} = useAuth()
  const { results, search, loading, error } = useSearch()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [profileImageError, setProfileImageError] = useState(false)
  const [isUploading] = useState(false)
  const [, setMousePos] = useState({ x: 0, y: 0 })
  const [isLogoHovered, setIsLogoHovered] = useState(false)

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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const handleSearchChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value)
  }

  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const ripple = document.createElement('span')
    ripple.className = 'ripple-effect'
    event.currentTarget.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  const handleResultClick = (userId: string | number) => {
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

  const profileImageUrl = getProfileImageUrl( )


  return (
    <>
      <header className="col-span-full flex justify-between items-center py-5 px-8 bg-[rgba(10,10,10,0.7)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)] z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        {/* Left Section - User Profile */}
        <div className="flex items-center gap-6">
          {user ? (
  <div
    className="cursor-pointer"
    onClick={() => router.push('/profile')}
    tabIndex={0}
    onKeyDown={e => {
      if (e.key === 'Enter' || e.key === ' ') router.push('/profile')
    }}
    role="button"
    aria-label="Go to profile"
  >
    <div className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-full bg-[#a569bd] grid place-items-center overflow-hidden border-2 border-[#f5f5f5] relative transition-all duration-300 group-hover:scale-105 group-hover:border-[#c56cf0]">
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        )}
        <img
          src={profileImageUrl}
          alt={user.name || 'User'}
          onError={() => setProfileImageError(true)}
          className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[#f5f5f5] font-semibold transition-colors duration-300 group-hover:text-[#c56cf0]">{user.name}</span>
        <span className="text-[#f5f5f5]/70 text-xs transition-colors duration-300 group-hover:text-[#f5f5f5]/90">
          @{user.userName || 'username'}
        </span>
      </div>
    </div>
  </div>
) : (
  <div className="text-[#f5f5f5]">Please log in</div>
)}
        </div>

        {/* Center Section - Enhanced Search Bar */}
        <div ref={searchRef} className="relative mx-6 flex-1 max-w-2xl">
          <div className="flex items-center bg-[#1e1e2d] rounded-lg relative transition-all duration-300 focus-within:ring-2 focus-within:ring-[#c56cf0] focus-within:bg-[#2a2a3a] focus-within:shadow-[0_0_20px_rgba(197,108,240,0.3)] group">
            <svg
              className="w-5 h-5 text-gray-400 ml-4 transition-colors duration-300 group-focus-within:text-[#c56cf0]"
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
              className="border-none bg-transparent outline-none text-white text-[15px] py-3 px-4 w-full placeholder-gray-400 focus:placeholder-gray-500 transition-all duration-300"
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

          {/* Enhanced Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-[#2d1b3a] rounded-lg shadow-lg border border-[rgba(255,255,255,0.1)] max-h-60 overflow-auto z-50 backdrop-blur-md">
              <SearchStatusIndicator />
              {results.map((result: SearchResult) => {
                const resultImg = getSearchResultImageUrl(result.profilePictureUrl)
                return (
                  <div
                    key={result.id}
                    className="p-3 hover:bg-[#3a2449] cursor-pointer flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_2px_10px_rgba(197,108,240,0.2)]"
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
                      className="rounded-full object-cover transition-transform duration-200 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://i.ibb.co/0pJ97CcF/default-profile.jpg'
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-white transition-colors duration-200 hover:text-[#c56cf0]">{result.name}</span>
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

        {/* Right Section - Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="relative group transform-gpu transition-all duration-700 ease-out cursor-pointer logo-3d"
              onClick={createRipple}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              style={{
                transform: isLogoHovered 
                  ? 'perspective(1000px) rotateY(8deg) rotateX(4deg) scale(1.05)' 
                  : 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)',
              }}
            >
              <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-lg animate-spin-slow"></div>
              </div>
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 glass-morphism rounded-xl animate-pulse-glow"></div>
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-transparent to-cyan-400/30 animate-holographic"></div>
                </div>

                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 overflow-hidden group-hover:scale-110 transition-all duration-500">
                  <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  <Image
                    src="/memzyiconcopyyy.jpg"
                    alt="Memzy Logo"
                    fill
                    className="object-cover relative z-10 group-hover:rotate-[3deg] group-hover:scale-105 transition-all duration-500"
                    priority
                  />
                </div>
                <div className="absolute -inset-0.5 rounded-xl border border-purple-400/50 animate-pulse"></div>
              </div>
            </div>
            <div className="relative group cursor-pointer flex flex-col justify-center translate-y-1">
              <div className="absolute -inset-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700"></div>

              <div className="relative">
                <h1 className="text-3xl font-bold tracking-wide leading-none">
                  {['M', 'e', 'm', 'z', 'y'].map((letter, i) => (
                    <span
                      key={i}
                      className="inline-block text-gradient drop-shadow-lg transition-all duration-500 group-hover:scale-110 magnetic-pull"
                      style={{
                        animation: `bounce 2.5s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                        transformOrigin: 'bottom center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.15) rotate(3deg)'
                        e.currentTarget.style.filter = `hue-rotate(${i * 40}deg) brightness(1.2)`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = ''
                        e.currentTarget.style.filter = ''
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
                <div className="absolute left-0 -bottom-1 h-0.5 w-full overflow-hidden rounded-full">
                  <div className="h-full w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000 ease-out rounded-full shadow-[0_0_10px_currentColor]"></div>
                </div>
              </div>
              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                <p className="text-xs text-purple-300 font-light tracking-wider">
                  Live • Laugh • Love
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}