import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/Context/AuthContext'
import { AuthLayout } from '@/Components/Authlayout'
import { SearchProvider } from '@/Context/SearchContext'
import { SidebarProvider } from '@/Context/SidebarContext'

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
      <link rel="icon" href="/memzyiconcopyyy.jpg" />
      <link rel="apple-touch-icon" href="/memzyiconcopyyy.jpg" />
      <body className={`${inter.className} bg-gradient-to-br from-darker to-primary-dark text-light min-h-screen leading-relaxed overflow-x-hidden`}>
        <AuthProvider>
          <SearchProvider>
            <SidebarProvider>
              <AuthLayout>{children}</AuthLayout>
            </SidebarProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  )
}