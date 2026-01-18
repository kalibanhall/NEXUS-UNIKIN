// API Enseignants - CRUD complet
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, transaction } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - Liste des enseignants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('department_id')
    const grade = searchParams.get('grade')
    const search = searchParams.get('search')

    let conditions = ['u.is_active = TRUE']
    let params: any[] = []
    let paramIndex = 1

    if (departmentId) {
      conditions.push(`t.department_id = $${paramIndex}`)
      params.push(departmentId)
      paramIndex++
    }
    if (grade) {
      conditions.push(`t.grade = $${paramIndex}`)
      params.push(grade)
      paramIndex++
    }
    if (search) {
      conditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR t.matricule ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    const result = await query(
      `SELECT t.id, t.matricule, t.grade, t.specialization, t.hire_date, t.is_permanent,
              u.id as user_id, u.first_name, u.last_name, u.email, u.phone, u.photo_url,
              d.name as department_name, d.id as department_id,
              f.name as faculty_name,
              (SELECT COUNT(*) FROM courses WHERE teacher_id = t.id AND is_active = TRUE) as courses_count
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN departments d ON t.department_id = d.id
       LEFT JOIN faculties f ON d.faculty_id = f.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY u.last_name, u.first_name`,
      params
    )

    return NextResponse.json({ teachers: result.rows })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des enseignants' }, { status: 500 })
  }
}

// POST - Créer un enseignant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, phone, grade, specialization, departmentId, hireDate, isPermanent } = body

    if (!firstName || !lastName || !grade) {
      return NextResponse.json({ error: 'Nom, prénom et grade requis' }, { status: 400 })
    }

    // Générer le matricule
    const year = new Date().getFullYear()
    const countResult = await queryOne(
      "SELECT COUNT(*) as count FROM teachers WHERE matricule LIKE $1",
      [`ENS-${year}-%`]
    )
    const count = parseInt(countResult?.count || '0') + 1
    const matricule = `ENS-${year}-${String(count).padStart(3, '0')}`

    // Email basé sur le matricule
    const email = `${matricule.toLowerCase()}@unikin.ac.cd`
    const defaultPassword = 'Prof@2026'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const result = await transaction(async (client) => {
      // Créer l'utilisateur
      const userResult = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
         VALUES ($1, $2, $3, $4, $5, 'TEACHER', TRUE)
         RETURNING id`,
        [email, hashedPassword, firstName, lastName, phone || null]
      )
      const userId = userResult.rows[0].id

      // Créer le profil enseignant
      const teacherResult = await client.query(
        `INSERT INTO teachers (user_id, matricule, grade, specialization, department_id, hire_date, is_permanent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, matricule, grade, specialization || null, departmentId || null, hireDate || new Date(), isPermanent !== false]
      )

      return { user_id: userId, ...teacherResult.rows[0], email }
    })

    return NextResponse.json({
      message: 'Enseignant créé avec succès',
      teacher: result,
      credentials: { email: result.email, password: 'Prof@2026' }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'enseignant' }, { status: 500 })
  }
}
