import Link from 'next/link'

export function Sidebar() {
  return (
    <nav className="row-start-2 bg-[rgba(10,10,10,0.75)] backdrop-blur border-r border-[rgba(255,255,255,0.1)] p-8 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Main</h2>
        <ul className="space-y-2">
          <li className="active">
            <Link href="/" className="flex items-center gap-3 py-3 px-4 rounded-lg bg-[#8e44ad] text-[#f5f5f5] font-semibold">
              <span className="text-xl">🏠</span>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/my-posts" className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all">
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
            <Link href="/profile" className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all">
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link href="/messages" className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>
          </li>
          <li>
            <Link href="/settings" className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all">
              <span className="text-xl">⚙️</span>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xs uppercase text-[#dee2e6] mb-4 pl-4">Account</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/login/page.tsx" className="flex items-center gap-3 py-3 px-4 rounded-lg text-[#e9ecef] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#f5f5f5] hover:translate-x-1 transition-all">
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}