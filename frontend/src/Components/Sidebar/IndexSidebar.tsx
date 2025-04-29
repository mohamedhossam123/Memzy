import Link from 'next/link'

export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="nav-section">
        <h2>Main</h2>
        <ul className="nav-links">
          <li className="nav-link active">
            <Link href="/">
              <span className="nav-link-icon">🏠</span>
              <span>Home</span>
            </Link>
          </li>
          <li className="nav-link">
            <Link href="/my-posts">
              <span className="nav-link-icon">📝</span>
              <span>My Posts</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="nav-section">
        <h2>Personal</h2>
        <ul className="nav-links">
          <li className="nav-link">
            <Link href="/profile">
              <span className="nav-link-icon">👤</span>
              <span>Profile</span>
            </Link>
          </li>
          <li className="nav-link">
            <Link href="/messages">
              <span className="nav-link-icon">💬</span>
              <span>Messages</span>
            </Link>
          </li>
          <li className="nav-link">
            <Link href="/settings">
              <span className="nav-link-icon">⚙️</span>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="nav-section">
        <h2>Account</h2>
        <ul className="nav-links">
          <li className="nav-link">
            <Link href="/logout">
              <span className="nav-link-icon">🚪</span>
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}