// API Départements - CRUD complet
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des départements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('faculty_id')

    let sql = `
      SELECT d.id, d.code, d.name, d.description, d.is_active, d.created_at,
             d.faculty_id, f.name as faculty_name, f.code as faculty_code,
             u.first_name || ' ' || u.last_name as head_name,
             (SELECT COUNT(*) FROM promotions WHERE department_id = d.id AND is_active = TRUE) as promotions_count,
             (SELECT COUNT(*) FROM teachers WHERE department_id = d.id) as teachers_count
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN users u ON d.head_id = u.id
    `
    const params: any[] = []

    if (facultyId) {
      sql += ' WHERE d.faculty_id = $1'
      params.push(facultyId)
    }

    sql += ' ORDER BY f.name, d.name'

    const result = await query(sql, params)
    return NextResponse.json({ departments: result.rows })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des départements' }, { status: 500 })
  }
}

// POST - Créer un département
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, description, facultyId, headId } = body

    if (!code || !name || !facultyId) {
      return NextResponse.json({ error: 'Code, nom et faculté requis' }, { status: 400 })
    }

    // Vérifier si le code existe
    const existing = await queryOne('SELECT id FROM departments WHERE code = $1', [code])
    if (existing) {
      return NextResponse.json({ error: 'Ce code de département existe déjà' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO departments (code, name, description, faculty_id, head_id, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [code.toUpperCase(), name, description || null, facultyId, headId || null]
    )

    return NextResponse.json({
      message: 'Département créé avec succès',
      department: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du département' }, { status: 500 })
  }
}
