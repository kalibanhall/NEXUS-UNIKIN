// API Users - Gestion complète des utilisateurs
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - Liste des utilisateurs avec filtres et pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const isActive = searchParams.get('is_active')
    const offset = (page - 1) * limit

    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    if (role) {
      whereConditions.push(`role = $${paramIndex}`)
      params.push(role)
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    if (isActive !== null && isActive !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`)
      params.push(isActive === 'true')
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Count total
    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].total)

    // Get users
    const usersResult = await query(
      `SELECT id, email, first_name, last_name, phone, role, is_active, photo_url, last_login, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 })
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, role, matricule } = body

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await queryOne('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Générer l'email basé sur le matricule si fourni
    let finalEmail = email
    if (matricule) {
      const domain = role === 'STUDENT' ? 'student.unikin.ac.cd' : 'unikin.ac.cd'
      finalEmail = `${matricule.toLowerCase()}@${domain}`
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       RETURNING id, email, first_name, last_name, phone, role, is_active, created_at`,
      [finalEmail, hashedPassword, firstName, lastName, phone || null, role]
    )

    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 })
  }
}
