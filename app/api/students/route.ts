import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query, transaction } from '@/lib/db'

// GET - Liste des étudiants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promotionId = searchParams.get('promotionId')
    const facultyId = searchParams.get('facultyId')
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let whereConditions = ['1=1']
    let params: any[] = []
    let paramIndex = 1

    if (promotionId) {
      whereConditions.push(`s.promotion_id = $${paramIndex}`)
      params.push(parseInt(promotionId))
      paramIndex++
    }

    if (facultyId) {
      whereConditions.push(`d.faculty_id = $${paramIndex}`)
      params.push(parseInt(facultyId))
      paramIndex++
    }

    if (departmentId) {
      whereConditions.push(`p.department_id = $${paramIndex}`)
      params.push(parseInt(departmentId))
      paramIndex++
    }

    if (status) {
      whereConditions.push(`s.status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR s.matricule ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    // Compter le total
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN promotions p ON s.promotion_id = p.id
       JOIN departments d ON p.department_id = d.id
       WHERE ${whereClause}`,
      params
    )

    // Récupérer les étudiants
    const students = await queryMany(
      `SELECT s.id, s.matricule, s.status, s.payment_status, s.enrollment_date, s.birth_date, s.gender,
              u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
              p.id as promotion_id, p.name as promotion_name, p.level as promotion_level,
              d.id as department_id, d.name as department_name,
              f.id as faculty_id, f.name as faculty_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN promotions p ON s.promotion_id = p.id
       JOIN departments d ON p.department_id = d.id
       JOIN faculties f ON d.faculty_id = f.id
       WHERE ${whereClause}
       ORDER BY u.last_name, u.first_name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      students,
      pagination: {
        total: parseInt(countResult?.count || '0'),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult?.count || '0') / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des étudiants' },
      { status: 500 }
    )
  }
}

// POST - Créer un étudiant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      matricule,
      promotionId,
      birthDate,
      birthPlace,
      gender,
      nationality,
      parentName,
      parentPhone
    } = body

    // Validation
    if (!email || !password || !firstName || !lastName || !matricule || !promotionId) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // Hash du mot de passe
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Transaction pour créer l'utilisateur et l'étudiant
    const result = await transaction(async (client) => {
      // Créer l'utilisateur
      const userResult = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, 'STUDENT')
         RETURNING id`,
        [email, hashedPassword, firstName, lastName, phone]
      )
      const userId = userResult.rows[0].id

      // Créer l'étudiant
      const studentResult = await client.query(
        `INSERT INTO students (user_id, matricule, promotion_id, enrollment_date, birth_date, birth_place, gender, nationality, parent_name, parent_phone)
         VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [userId, matricule, promotionId, birthDate, birthPlace, gender, nationality || 'Congolaise', parentName, parentPhone]
      )

      return { userId, studentId: studentResult.rows[0].id }
    })

    return NextResponse.json({
      success: true,
      studentId: result.studentId,
      message: 'Étudiant créé avec succès'
    })
  } catch (error: any) {
    console.error('Error creating student:', error)
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Cet email ou ce matricule existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'étudiant' },
      { status: 500 }
    )
  }
}
