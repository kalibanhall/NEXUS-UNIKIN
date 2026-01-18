import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('nexus-session')

  if (!sessionCookie) {
    redirect('/auth/login')
  }

  let session
  try {
    session = JSON.parse(sessionCookie.value)
  } catch {
    redirect('/auth/login')
  }

  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    redirect('/unauthorized')
  }

  const user = {
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
