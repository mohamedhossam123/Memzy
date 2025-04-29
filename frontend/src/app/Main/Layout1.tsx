import { Header } from '@/Components/Header/IndexHeader'
import { Sidebar } from '@/Components/Sidebar/IndexSidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  )
}