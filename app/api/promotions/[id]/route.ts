// API Promotion par ID
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Détails d'une promotion
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await queryOne(
      `SELECT p.*, d.name as department_name, d.code as department_code,
              f.name as faculty_name, f.code as faculty_code, f.id as faculty_id,
              ay.name as academic_year
       FROM promotions p
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN faculties f ON d.faculty_id = f.id
       LEFT JOIN academic_years ay ON p.academic_year_id = ay.id
       WHERE p.id = $1`,
      [params.id]
    )

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion non trouvée' }, { status: 404 })
    }

    // Récupérer les étudiants
    const students = await query(
      `SELECT s.id, s.matricule, s.status, s.payment_status,
              u.first_name, u.last_name, u.email, u.photo_url
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.promotion_id = $1
       ORDER BY u.last_name, u.first_name`,
      [params.id]
    )

    // Récupérer les cours
    const courses = await query(
      `SELECT c.*, 
              u.first_name || ' ' || u.last_name as teacher_name
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE c.promotion_id = $1
       ORDER BY c.semester, c.name`,
      [params.id]
    )

    return NextResponse.json({
      promotion,
      students: students.rows,
      courses: courses.rows
    })
  } catch (error) {
    console.error('Error fetching promotion:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de la promotion' }, { status: 500 })
  }
}

// PUT - Modifier une promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, level, isActive } = body

    const existing = await queryOne('SELECT id FROM promotions WHERE id = $1', [params.id])
    if (!existing) {
      return NextResponse.json({ error: 'Promotion non trouvée' }, { status: 404 })
    }

    const result = await query(
      `UPDATE promotions 
       SET name = COALESCE($1, name),
           level = COALESCE($2, level),
           is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING *`,
      [name, level, isActive, params.id]
    )

    return NextResponse.json({
      message: 'Promotion modifiée avec succès',
      promotion: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de la promotion' }, { status: 500 })
  }
}

// DELETE - Supprimer une promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentCount = await queryOne(
      'SELECT COUNT(*) as count FROM students WHERE promotion_id = $1',
      [params.id]
    )
    if (parseInt(studentCount?.count || '0') > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une promotion avec des étudiants' },
        { status: 400 }
      )
    }

    await query('DELETE FROM promotions WHERE id = $1', [params.id])
    return NextResponse.json({ message: 'Promotion supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de la promotion' }, { status: 500 })
  }
}
