// 
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
  const getProfilePicUrl = (picPath?: string) => {
    if (!picPath) return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/default-profile.png`;
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${picPath}`;
  };

  const handleProfilePictureError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/default-profile.png`;
  };

  return (
    <header className="col-span-full flex justify-between items-center py-5 px-8 bg-[rgba(10,10,10,0.7)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)] z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
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
            <span className="text-[#f5f5f5] font-semibold">{user.name}</span> 
          </div>
        ) : (
          <div className="text-[#f5f5f5]">Please log in</div>
        )}
      </div>

      {/* Center - Search bar (moved slightly right) */}
      <div ref={searchRef} className="relative ml-6">
        <div className="flex max-w-[320px] w-[320px] items-center justify-between gap-2 bg-[#2f3640] rounded-[50px] relative">
          <button
            className="text-white absolute right-2 w-[42px] h-[42px] rounded-full bg-gradient-to-r from-[#8e2de2] to-[#4a00e0] border-0 inline-block transition-all duration-300 ease-[cubic-bezier(.23,1,0.32,1)] hover:text-white hover:bg-[#1A1A1A] hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:-translate-y-[3px] active:shadow-none active:translate-y-0"
          >
            🔍
          </button>
          <input
            type="text"
            className="border-none bg-transparent outline-none text-white text-[15px] py-4 px-6 pr-[46px] w-full"
            placeholder="Search..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
          />
        </div>

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