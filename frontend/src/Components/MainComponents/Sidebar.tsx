// Component: Sidebar
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/Context/AuthContext'
import { useSidebar } from '@/Context/SidebarContext'

export function Sidebar() {
  const { logout, user } = useAuth() 
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()
  console.log('Current user status:', user?.status);
  const handleLogout = async () => {
    try {
      await logout() 
      router.push('/login') 
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => pathname === path

  const isModerator = user?.status?.toLowerCase() === 'moderator';
  
  return (
    <nav 
      className={`row-start-2 bg-[rgba(10,10,10,0.75)] backdrop-blur border-r border-[rgba(255,255,255,0.1)] p-6 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-[80px]' : 'w-[240px]'
      }`}
    >
      <div className="flex justify-end mb-6">
        <button 
          onClick={toggleSidebar} 
          className="text-[#e9ecef] hover:text-[#f5f5f5] transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex flex-col gap-1.5 items-center justify-center w-5 h-5">
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
          </div>
        </button>
      </div>

      <div className="mb-8">
        {!isCollapsed && (
          <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Main</h2>
        )}
        <ul className="space-y-2">
          <li>
            <Link 
              href="/feed" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${
                isActive('/') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'
              } hover:translate-x-1 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
              aria-label={isCollapsed ? "Home" : undefined}
            >
              <span className="text-xl">🏠</span>
              {!isCollapsed && <span>Home</span>}
            </Link>
          </li>
          
          {/* Add Mod button for moderators */}
          {isModerator && (
            <li>
              <Link 
                href="/mod" 
                className={`flex items-center gap-3 py-3 px-4 rounded-lg ${
                  isActive('/mod') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'
                } hover:translate-x-1 transition-all ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                aria-label={isCollapsed ? "Mod" : undefined}
              >
                <span className="text-xl">🛡️</span>
                {!isCollapsed && <span>Mod</span>}
              </Link>
            </li>
          )}
        </ul>
      </div>
      
      <div className="mb-8">
        {!isCollapsed && (
          <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Personal</h2>
        )}
        <ul className="space-y-2">
          <li>
            <Link 
              href="/profile" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${
                isActive('/profile') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'
              } hover:translate-x-1 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
              aria-label={isCollapsed ? "Profile" : undefined}
            >
              <span className="text-xl">👤</span>
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </li>
          <li>
            <Link 
              href="/chat" 
              className={`flex items-center gap-3 py-3 px-4 rounded-lg ${
                isActive('/messages') ? 'bg-[#8e44ad] text-[#f5f5f5] font-semibold' : 'text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5]'
              } hover:translate-x-1 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
              aria-label={isCollapsed ? "Messages" : undefined}
            >
              <span className="text-xl">💬</span>
              {!isCollapsed && <span>Messages</span>}
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="mb-8">
        {!isCollapsed && (
          <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Account</h2>
        )}
        <ul className="space-y-2">
          
          <li>
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all w-full ${
                isCollapsed ? 'justify-center' : 'text-left'
              }`}
              aria-label={isCollapsed ? "Logout" : undefined}
            >
              <span className="text-xl">🚪</span>
              {!isCollapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}