// components/Header.tsx
'use client'

import { useAuth } from '../Context/AuthContext';
import Image from 'next/image';

export function Header() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="col-span-full flex justify-between items-center py-5 px-8 bg-[rgba(10,10,10,0.7)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.1)] z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#a569bd] grid place-items-center overflow-hidden border-2 border-[#f5f5f5]">
              {user.profilePic ? (
                <Image
                  src={user.profilePic}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-white font-bold">
    {user.name?.charAt(0).toUpperCase() ?? '?'}
  </span>
              )}
            </div>
            <span className="text-[#f5f5f5]">{user.name}</span>
          </div>
        ) : (
          <div className="text-[#f5f5f5]">Please log in</div>
        )}
      </div>
      
      <div className="relative flex-grow max-w-[400px] mx-8">
        <input 
          type="text" 
          placeholder="Search for people, memories, or topics..."
          className="w-full py-3 px-4 pl-12 rounded-full bg-[rgba(255,255,255,0.1)] text-[#f5f5f5] text-base transition-all border border-transparent focus:outline-none focus:bg-[rgba(0,0,0,0.3)] focus:border-[#c56cf0] focus:ring-1 focus:ring-[rgba(197,108,240,0.3)]"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#dee2e6] text-base pointer-events-none">🔍</span>
      </div>
      
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#c56cf0] relative overflow-hidden">
  <Image
    src="/memzyiconcopyyy.jpg"
    alt="Memzy Logo"
    fill
    className="object-cover"
  />
</div>
  <h1 className="text-3xl text-[#c56cf0] font-bold drop-shadow-[0_0_15px_rgba(197,108,240,0.3)]">
    Memzy
  </h1>
</div>
    </header>
  );
}