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

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (path: string) => pathname === path
  const isModerator = user?.status?.toLowerCase() === 'moderator'

  const navLinkBaseStyle =
    'flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 group'
  const navLinkHover =
    'hover:bg-white/10 hover:text-white hover:translate-x-1'
  const activeLinkStyle =
    'bg-[#8e44ad] text-white font-semibold shadow-sm'
  const defaultLinkStyle = 'text-[#e9ecef]'

  return (
    <nav
      className={`row-start-2 bg-[rgba(10,10,10,0.75)] backdrop-blur-md border-r border-white/10 p-4 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-[80px]' : 'w-[240px]'
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={toggleSidebar}
          className="text-[#e9ecef] hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="flex flex-col gap-1.5 items-center justify-center w-5 h-5">
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
            <span className="w-5 h-0.5 bg-current rounded-full"></span>
          </div>
        </button>
      </div>

      {/* Main */}
      <div className="mb-8">
        {!isCollapsed && (
          <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4 tracking-wider">
            Main
          </h2>
        )}
        <ul className="space-y-1.5">
          <li>
            <Link
              href="/feed"
              className={`${navLinkBaseStyle} ${
                isActive('/') ? activeLinkStyle : defaultLinkStyle
              } ${navLinkHover} ${isCollapsed ? 'justify-center' : ''}`}
              aria-label={isCollapsed ? 'Home' : undefined}
            >
              <span className="text-lg">🏠</span>
              {!isCollapsed && <span className="text-sm">Home</span>}
            </Link>
          </li>
          {isModerator && (
            <li>
              <Link
                href="/mod"
                className={`${navLinkBaseStyle} ${
                  isActive('/mod') ? activeLinkStyle : defaultLinkStyle
                } ${navLinkHover} ${isCollapsed ? 'justify-center' : ''}`}
                aria-label={isCollapsed ? 'Mod' : undefined}
              >
                <span className="text-lg">🛡️</span>
                {!isCollapsed && <span className="text-sm">Mod</span>}
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Personal */}
      <div className="mb-8">
        {!isCollapsed && (
          <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4 tracking-wider">
            Personal
          </h2>
        )}
        <ul className="space-y-1.5">
          <li>
            <Link
              href="/profile"
              className={`${navLinkBaseStyle} ${
                isActive('/profile') ? activeLinkStyle : defaultLinkStyle
              } ${navLinkHover} ${isCollapsed ? 'justify-center' : ''}`}
              aria-label={isCollapsed ? 'Profile' : undefined}
            >
              <span className="text-lg">👤</span>
              {!isCollapsed && <span className="text-sm">Profile</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/chat"
              className={`${navLinkBaseStyle} ${
                isActive('/messages') ? activeLinkStyle : defaultLinkStyle
              } ${navLinkHover} ${isCollapsed ? 'justify-center' : ''}`}
              aria-label={isCollapsed ? 'Messages' : undefined}
            >
              <span className="text-lg">💬</span>
              {!isCollapsed && <span className="text-sm">Messages</span>}
            </Link>
          </li>
        </ul>
      </div>

      {/* Account */}
      <div className="mb-8">
        {!isCollapsed && (
          <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4 tracking-wider">
            Account
          </h2>
        )}
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={handleLogout}
              className={`${navLinkBaseStyle} ${defaultLinkStyle} ${navLinkHover} w-full ${
                isCollapsed ? 'justify-center' : 'text-left'
              }`}
              aria-label={isCollapsed ? 'Logout' : undefined}
            >
              <span className="text-lg">🚪</span>
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
