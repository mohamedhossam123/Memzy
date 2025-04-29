export function Header() {
    return (
      <header className="header">
        <div className="user-menu">
          <div className="user-profile">
            <div className="avatar">JD</div>
            <span>John Doe</span>
          </div>
        </div>
        
        <div className="search">
          <input type="text" placeholder="Search for people, memories, or topics..." />
        </div>
        
        <div className="logo">
          <div className="logo-icon">M</div>
          <h1>Memzy</h1>
        </div>
      </header>
    )
  }