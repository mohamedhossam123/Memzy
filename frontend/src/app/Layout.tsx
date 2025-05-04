import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {Header} from '@/Components/Header'
import {Sidebar} from '@/Components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Memzy',
  description: 'Your memory sharing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-darker to-primary-dark text-light min-h-screen leading-relaxed overflow-x-hidden`}>
        {/* Background effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[500px] h-[500px] -top-24 -left-24 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl animate-float-15" />
          <div className="absolute w-[700px] h-[700px] -bottom-48 -right-48 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl animate-float-20-reverse" />
          <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 rounded-full bg-radial-gradient from-primary to-transparent opacity-30 blur-xl animate-pulse" />
        </div>
        
        <div className="grid grid-cols-[280px_1fr] grid-rows-[auto_1fr] h-screen relative z-10">
          <Header />
          <Sidebar />
          <main className="row-start-2 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}