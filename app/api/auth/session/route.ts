import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne } from '@/lib/db'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth/jwt'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Vérifier et décoder le JWT
    const session = verifySession(sessionCookie.value)

    if (!session) {
      // Token invalide ou expiré — supprimer le cookie
      cookieStore.delete(SESSION_COOKIE_NAME)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await queryOne<{ id: number; email: string; role: string; is_active: boolean }>(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [session.userId]
    )

    if (!user || !user.is_active) {
      cookieStore.delete(SESSION_COOKIE_NAME)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        ...session,
        isActive: user.is_active,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
