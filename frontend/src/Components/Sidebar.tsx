'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'

export function Sidebar() {
  const { logout } = useAuth() 
  const router = useRouter()
  const pathname = usePathname()
  
  const handleLogout = async () => {
    try {
      await logout() 
      router.push('/login') 
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Helper function to check active route
  const isActive = (path: string) => pathname === path
  
  return (
    <nav className="row-start-2 bg-[rgba(10,10,10,0.75)] backdrop-blur border-r border-[rgba(255,255,255,0.1)] p-6 overflow-y-auto w-[240px]">     <div className="mb-8">
        <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Main</h2>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${isActive('/') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'} hover:translate-x-1 transition-all`}
            >
              <span className="text-xl">🏠</span>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/my-posts" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${isActive('/my-posts') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'} hover:translate-x-1 transition-all`}
            >
              <span className="text-xl">📝</span>
              <span>My Posts</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Personal</h2>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/profile" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${isActive('/profile') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'} hover:translate-x-1 transition-all`}
            >
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/messages" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${isActive('/messages') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'} hover:translate-x-1 transition-all`}
            >
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>
          </li>
          
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Account</h2>
        <ul className="space-y-2">
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all w-full text-left"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}