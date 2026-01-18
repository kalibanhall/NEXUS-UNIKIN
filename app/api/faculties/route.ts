// API Facultés - CRUD complet
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des facultés
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') === 'true'

    let sql = `
      SELECT f.id, f.code, f.name, f.description, f.is_active, f.created_at,
             u.first_name || ' ' || u.last_name as dean_name
      FROM faculties f
      LEFT JOIN users u ON f.dean_id = u.id
      ORDER BY f.name
    `

    const result = await query(sql)

    if (includeStats) {
      // Ajouter les statistiques pour chaque faculté
      const facultiesWithStats = await Promise.all(
        result.rows.map(async (faculty: any) => {
          const deptCount = await queryOne(
            'SELECT COUNT(*) as count FROM departments WHERE faculty_id = $1',
            [faculty.id]
          )
          const studentCount = await queryOne(
            `SELECT COUNT(DISTINCT s.id) as count 
             FROM students s
             JOIN promotions p ON s.promotion_id = p.id
             JOIN departments d ON p.department_id = d.id
             WHERE d.faculty_id = $1`,
            [faculty.id]
          )
          const teacherCount = await queryOne(
            `SELECT COUNT(*) as count FROM teachers t
             JOIN departments d ON t.department_id = d.id
             WHERE d.faculty_id = $1`,
            [faculty.id]
          )
          return {
            ...faculty,
            departmentsCount: parseInt(deptCount?.count || '0'),
            studentsCount: parseInt(studentCount?.count || '0'),
            teachersCount: parseInt(teacherCount?.count || '0')
          }
        })
      )
      return NextResponse.json({ faculties: facultiesWithStats })
    }

    return NextResponse.json({ faculties: result.rows })
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des facultés' }, { status: 500 })
  }
}

// POST - Créer une faculté
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, description, deanId } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'Code et nom requis' }, { status: 400 })
    }

    // Vérifier si le code existe
    const existing = await queryOne('SELECT id FROM faculties WHERE code = $1', [code])
    if (existing) {
      return NextResponse.json({ error: 'Ce code de faculté existe déjà' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO faculties (code, name, description, dean_id, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING *`,
      [code.toUpperCase(), name, description || null, deanId || null]
    )

    return NextResponse.json({
      message: 'Faculté créée avec succès',
      faculty: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la faculté' }, { status: 500 })
  }
}
