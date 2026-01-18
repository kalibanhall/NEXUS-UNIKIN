'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface UserSession {
  userId: number
  email: string
  role: string
  firstName: string
  lastName: string
  profile?: any
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    // Check authentication and role
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        
        if (!data.user || data.user.role !== 'EMPLOYEE') {
          router.push('/auth/login')
          return
        }
        
        setUser(data.user)
        setLoading(false)
      } catch (error) {
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <DashboardLayout 
      role="employee"
      user={{
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        matricule: user.profile?.matricule
      }}
    >
      {children}
    </DashboardLayout>
  )
}
