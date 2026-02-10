import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth/jwt'

export default async function AdminLayout({
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

  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    redirect('/unauthorized')
  }

  const user = {
    id: session.userId,
    name: `${session.firstName || ''} ${session.lastName || ''}`.trim() || 'Admin',
    email: session.email,
    role: session.role,
  }

  return (
    <DashboardLayout role="admin" user={user}>
      {children}
    </DashboardLayout>
  )
}
