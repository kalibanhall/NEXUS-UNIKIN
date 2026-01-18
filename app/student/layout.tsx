import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function StudentLayout({
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

  if (session.role !== 'STUDENT') {
    redirect('/unauthorized')
  }

  const profile = session.profile
  const user = {
    name: `${session.firstName || ''} ${session.lastName || ''}`.trim() || 'Étudiant',
    email: session.email,
    role: session.role,
    matricule: profile?.matricule,
  }

  return (
    <DashboardLayout role="student" user={user}>
      {children}
    </DashboardLayout>
  )
}
