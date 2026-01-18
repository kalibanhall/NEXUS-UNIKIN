// API Promotions - CRUD complet
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des promotions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('department_id')
    const academicYearId = searchParams.get('academic_year_id')
    const level = searchParams.get('level')

    let conditions = ['p.is_active = TRUE']
    let params: any[] = []
    let paramIndex = 1

    if (departmentId) {
      conditions.push(`p.department_id = $${paramIndex}`)
      params.push(departmentId)
      paramIndex++
    }
    if (academicYearId) {
      conditions.push(`p.academic_year_id = $${paramIndex}`)
      params.push(academicYearId)
      paramIndex++
    }
    if (level) {
      conditions.push(`p.level = $${paramIndex}`)
      params.push(level)
      paramIndex++
    }

    const result = await query(
      `SELECT p.*, d.name as department_name, d.code as department_code,
              f.name as faculty_name, f.code as faculty_code,
              ay.name as academic_year,
              (SELECT COUNT(*) FROM students WHERE promotion_id = p.id AND status = 'ACTIVE') as students_count,
              (SELECT COUNT(*) FROM courses WHERE promotion_id = p.id AND is_active = TRUE) as courses_count
       FROM promotions p
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN faculties f ON d.faculty_id = f.id
       LEFT JOIN academic_years ay ON p.academic_year_id = ay.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY f.name, d.name, p.level`,
      params
    )

    return NextResponse.json({ promotions: result.rows })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des promotions' }, { status: 500 })
  }
}

// POST - Créer une promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, level, departmentId, academicYearId } = body

    if (!code || !name || !level || !departmentId || !academicYearId) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Vérifier si le code existe pour cette année
    const existing = await queryOne(
      'SELECT id FROM promotions WHERE code = $1 AND academic_year_id = $2',
      [code, academicYearId]
    )
    if (existing) {
      return NextResponse.json({ error: 'Ce code de promotion existe déjà pour cette année' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO promotions (code, name, level, department_id, academic_year_id, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [code, name, level, departmentId, academicYearId]
    )

    return NextResponse.json({
      message: 'Promotion créée avec succès',
      promotion: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la promotion' }, { status: 500 })
  }
}
