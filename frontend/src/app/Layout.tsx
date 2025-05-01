import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {Header} from "@/Components/Header/Header"
import { Sidebar } from '@/Components/Sidebar/IndexSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Memzy',
  description: 'Live ,Laugh, die',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] min-h-screen bg-glass text-light">
          <Header />
          
          <main className="col-span-full lg:col-span-1 p-4">{children}</main>
          <Sidebar />
        </div>
      </body>
    </html>
  )
}