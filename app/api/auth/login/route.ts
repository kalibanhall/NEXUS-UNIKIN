import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { signSession, SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/lib/auth/jwt'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rate-limit'

interface UserRow {
  id: number
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string | null
  role: string
  is_active: boolean
  last_login: Date | null
}

interface StudentRow {
  id: number
  matricule: string
  status: string
  payment_status: string
  promotion_id: number
  promotion_name: string
  promotion_level: string
  department_name: string
  faculty_name: string
}

interface TeacherRow {
  id: number
  matricule: string
  grade: string
  specialization: string | null
  department_name: string
}

interface EmployeeRow {
  id: number
  matricule: string
  position: string
  department: string | null
  service: string | null
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting basé sur l'IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip') 
      || 'unknown'
    
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil(rateLimit.retryAfterMs / 1000)
      return NextResponse.json(
        { error: `Trop de tentatives de connexion. Réessayez dans ${Math.ceil(retryAfterSeconds / 60)} minute(s).` },
        { 
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) }
        }
      )
    }

    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Recherche de l'utilisateur
    let user: UserRow | null
    try {
      user = await queryOne<UserRow>(
        'SELECT id, email, password, first_name, last_name, phone, role, is_active, last_login FROM users WHERE email = $1',
        [email]
      )
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données. Veuillez vérifier votre configuration.' },
        { status: 500 }
      )
    }

    if (!user) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérification du statut
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Votre compte est inactif. Contactez l\'administration.' },
        { status: 403 }
      )
    }

    // Vérifier si le compte est activé (pas de mot de passe = pas encore activé)
    if (!user.password || user.password === '') {
      return NextResponse.json(
        { error: 'Votre compte n\'est pas encore activé. Veuillez d\'abord activer votre compte.', needsActivation: true },
        { status: 403 }
      )
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Login réussi — réinitialiser le rate limit
    resetRateLimit(ip)

    // Récupérer le profil selon le rôle
    let profile: any = null
    
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        profile = await queryOne(
          'SELECT id, admin_type, faculty_id, department_id FROM admins WHERE user_id = $1',
          [user.id]
        )
        break
        
      case 'TEACHER':
        profile = await queryOne<TeacherRow>(
          `SELECT t.id, t.matricule, t.grade, t.specialization, d.name as department_name
           FROM teachers t
           LEFT JOIN departments d ON t.department_id = d.id
           WHERE t.user_id = $1`,
          [user.id]
        )
        break
        
      case 'STUDENT':
        profile = await queryOne<StudentRow>(
          `SELECT s.id, s.matricule, s.status, s.payment_status, 
                  p.id as promotion_id, p.name as promotion_name, p.level as promotion_level,
                  d.name as department_name, f.name as faculty_name
           FROM students s
           JOIN promotions p ON s.promotion_id = p.id
           JOIN departments d ON p.department_id = d.id
           JOIN faculties f ON d.faculty_id = f.id
           WHERE s.user_id = $1`,
          [user.id]
        )
        break
        
      case 'EMPLOYEE':
        profile = await queryOne<EmployeeRow>(
          'SELECT id, matricule, position, department, service FROM employees WHERE user_id = $1',
          [user.id]
        )
        break
    }

    // Mise à jour de la dernière connexion
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      )
    } catch (e) {
      // Non bloquant
      console.error('Failed to update lastLogin:', e)
    }

    // Créer le JWT signé
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      profile,
    }

    const token = signSession(sessionData)

    // Stocker le JWT dans un cookie httpOnly sécurisé
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        profile,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
