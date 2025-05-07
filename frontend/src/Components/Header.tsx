'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useSearch } from '../Context/SearchContext'
import { useAuth } from '../Context/AuthContext'
import Image from 'next/image'

export function Header() {
  const { user } = useAuth()
  const { results, search } = useSearch()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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
    if (value.trim()) {
      search(value)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const handleResultClick = (userName: string) => {
    setQuery(userName)
    setShowResults(false)
  }

  // Safely get profile picture URL
  const getProfilePicUrl = (picPath?: string) => {
    if (!picPath) return null
    // Handle both forward and backward slashes
    const normalizedPath = picPath.replace(/\\/g, '/').replace('uploads/profile_pictures/', '')
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/uploads/profile_pictures/${normalizedPath}`
  }

  return (
    <header className="col-span-full flex justify-between items-center py-5 px-8 bg-[rgba(10,10,10,0.7)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)] z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Left side - User profile */}
      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#a569bd] grid place-items-center overflow-hidden border-2 border-[#f5f5f5]">
              {user.profilePic ? (
                <Image
                  src={getProfilePicUrl(user.profilePic) || ''}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-[#f5f5f5]">Please log in</div>
        )}
      </div>
      
      {/* Center - Search bar */}
      <div ref={searchRef} className="relative flex items-center justify-center">
        <div className="relative">
          {/* Glow effect */}
          <div className="glow absolute -z-10 overflow-hidden blur-[30px] opacity-40 max-h-[130px] max-w-[354px] h-full w-full rounded-[12px]"
            style={{
              backgroundImage: `conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%)`
            }}
          ></div>
          
          {/* Dark border background */}
          <div className="darkBorderBg absolute -z-10 overflow-hidden max-h-[65px] max-w-[312px] h-full w-full rounded-[12px] blur-[3px]"></div>
          
          {/* Border effect */}
          <div className="border absolute -z-10 overflow-hidden max-h-[59px] max-w-[303px] h-full w-full rounded-[11px] blur-[0.5px]"></div>
          
          {/* White effect */}
          <div className="white absolute -z-10 overflow-hidden max-h-[63px] max-w-[307px] h-full w-full rounded-[10px] blur-[2px]"></div>
          
          {/* Input field */}
          <input 
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            className="input bg-[#010201] border-none w-[301px] h-[56px] rounded-[10px] text-white px-[59px] text-[18px] focus:outline-none"
            placeholder="Search..."
          />
          
          {/* Search icon - Simplified */}
          <div className="absolute left-[20px] top-[15px]">
            🔍
          </div>
          
          {/* Input mask */}
          <div className="pointer-events-none w-[100px] h-[20px] absolute top-[18px] left-[70px] bg-gradient-to-r from-transparent to-black"></div>
          
          {/* Pink mask */}
          <div className="pointer-events-none w-[30px] h-[20px] absolute top-[10px] left-[5px] bg-[#cf30aa] blur-[20px] opacity-80 transition-all duration-2000"></div>
          
          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#2d1b3a] rounded-lg shadow-lg border border-[rgba(255,255,255,0.1)] max-h-60 overflow-auto z-50">
              {results.map((result) => (
                <div 
                  key={result.id}
                  className="p-3 hover:bg-[#3a2449] cursor-pointer flex items-center gap-3"
                  onClick={() => handleResultClick(result.name)}
                >
                  {result.profilePic ? (
                    <Image
                      src={result.profilePic}
                      width={32}
                      height={32}
                      alt={result.name}
                      className="rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#3a2449] flex items-center justify-center">
                      {result.name.charAt(0)}
                    </div>
                  )}
                  <span>{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#c56cf0] relative overflow-hidden">
          <Image
            src="/memzyiconcopyyy.jpg"
            alt="Memzy Logo"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative w-[136px] h-[40px] flex items-center">
          <h1 className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold 
                        whitespace-nowrap overflow-hidden animate-smooth-typing
                        border-r-2 border-[#c56cf0] 
                        text-[#c56cf0] drop-shadow-[0_0_15px_rgba(197,108,240,0.3)]">
            Memzy
          </h1>
          <h1 className="text-3xl font-bold invisible">Memzy</h1>
        </div>
      </div>
    </header>
  )
}