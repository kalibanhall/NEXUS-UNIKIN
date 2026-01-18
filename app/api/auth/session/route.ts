import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne } from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('nexus-session')

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)

    // Vérifier que l'utilisateur existe toujours
    const user = await queryOne<{ 
      id: number
      email: string
      first_name: string
      last_name: string 
      role: string
      is_active: boolean 
    }>(
      'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
      [session.userId]
    )

    if (!user || !user.is_active) {
      cookieStore.delete('nexus-session')
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        userId: session.userId,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        profile: session.profile,
        isActive: user.is_active,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
