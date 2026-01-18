'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: number
  userId: string
  email: string
  firstName: string
  lastName: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'EMPLOYEE'
  profile: any
}

interface StudentInfo {
  id: number
  studentId: string
  promotionId?: number
  level?: string
  enrollmentDate?: string
}

interface AuthContextType {
  user: User | null
  studentInfo: StudentInfo | null
  isLoading: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        // Si c'est un étudiant, extraire les infos étudiantes
        if (data.user?.role === 'STUDENT' && data.user?.profile) {
          setStudentInfo({
            id: data.user.profile.id || data.user.id,
            studentId: data.user.profile.student_id || data.user.userId,
            promotionId: data.user.profile.promotion_id,
            level: data.user.profile.level,
            enrollmentDate: data.user.profile.enrollment_date
          })
        }
      } else {
        setUser(null)
        setStudentInfo(null)
      }
    } catch (error) {
      setUser(null)
      setStudentInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setStudentInfo(null)
    router.push('/auth/login')
  }

  useEffect(() => {
    refreshSession()
  }, [pathname])

  return (
    <AuthContext.Provider value={{ user, studentInfo, isLoading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC pour protéger les routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/auth/login')
      }

      if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized')
      }
    }, [user, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
