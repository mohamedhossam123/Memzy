// components/AuthLayout.tsx
'use client'

import { useAuth } from '@/Context/AuthContext'
import { Header } from '@/Components/Header'
import { Sidebar } from '@/Components/Sidebar'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c56cf0]"></div>
      </div>
    )
  }

  return (
    <>
      {/* Background effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-24 -left-24 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl animate-float-15" />
        <div className="absolute w-[700px] h-[700px] -bottom-48 -right-48 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl animate-float-20-reverse" />
        <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl animate-pulse" />
      </div>

      {user ? (
        <div className="grid grid-cols-[280px_1fr] grid-rows-[auto_1fr] h-screen relative z-10">
          <Header />
          <Sidebar />
          <main className="row-start-2 overflow-y-auto">
            {children}
          </main>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  )
}