
// page
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
    return null 
  }

  return (
    <div className="p-8">
      {/* Your main app content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memory cards would go here */}
      </div>
    </div>
  )
}