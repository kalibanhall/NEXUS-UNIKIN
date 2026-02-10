import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth/jwt'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    redirect('/auth/login')
  }

  const session = verifySession(sessionCookie.value)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.role !== 'TEACHER') {
    redirect('/unauthorized')
  }

  const profile = session.profile
  const user = {
    id: session.userId,
    name: `${session.firstName || ''} ${session.lastName || ''}`.trim() || 'Enseignant',
    email: session.email,
    role: session.role,
    matricule: profile?.matricule,
  }

  return (
    <DashboardLayout role="teacher" user={user}>
      {children}
    </DashboardLayout>
  )
}
