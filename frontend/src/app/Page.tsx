'use client'

import { useAuth } from '@/Context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null // Redirect will happen
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {user.name}</h1>
      {/* Your main app content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memory cards would go here */}
      </div>
    </div>
  )
}