export function Header() {
    return (
      <header className="col-span-full flex justify-between items-center py-5 px-8 bg-[rgba(10,10,10,0.7)] backdrop-blur-sm border-b border-glass z-[100] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary-light grid place-items-center font-bold border-2 border-light">
              JD
            </div>
            <span>John Doe</span>
          </div>
        </div>
        <div className="relative flex-grow max-w-[400px] mx-8">
          <input 
            type="text" 
            placeholder="Search for people, memories, or topics..."
            className="w-full py-3 px-4 pl-12 rounded-full bg-glass text-light text-base transition-all border border-transparent focus:outline-none focus:bg-glass-dark focus:border-accent focus:ring-1 focus:ring-accent-glow"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">🔍</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent grid place-items-center text-2xl text-light shadow-[0_0_10px_var(--accent-glow)]">
            M
          </div>
          <h1 className="text-3xl text-accent font-bold drop-shadow-[0_0_15px_var(--accent-glow)]">
            Memzy
          </h1>
        </div>
      </header>
    )
  }