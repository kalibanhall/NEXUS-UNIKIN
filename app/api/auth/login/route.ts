import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

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

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

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

    // Créer la session
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      profile,
    }

    // Stocker dans un cookie sécurisé
    const cookieStore = await cookies()
    cookieStore.set('nexus-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

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
