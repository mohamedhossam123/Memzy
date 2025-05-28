// components/AuthLayout.tsx
'use client'

import React from 'react'
import { useAuth } from '@/Context/AuthContext'
import { Header } from '@/Components/MainComponents/Header'
import { Sidebar } from '@/Components/MainComponents/Sidebar'
import { motion } from 'framer-motion'
import { useSidebar } from '@/Context/SidebarContext'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { isCollapsed } = useSidebar()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#2d1b3a] to-[#201429]">
        <motion.div
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c56cf0]"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }
  
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] -top-24 -left-24 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] -bottom-48 -right-48 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] top-1/2 left-1/2 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      
      {user ? (
        <div
          className="grid grid-rows-[auto_1fr] h-screen relative z-10 transition-all duration-300"
          style={{ gridTemplateColumns: `${isCollapsed ? 80 : 280}px 1fr` }}
        >
          <Header />
          <Sidebar />
          <main className="row-start-2 overflow-y-auto ">
            {children}
          </main>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2d1b3a] to-[#201429]">
          {children}
        </div>
      )}
    </>
  )
}
