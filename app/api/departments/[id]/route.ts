// API Département par ID
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Détails d'un département
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const department = await queryOne(
      `SELECT d.*, f.name as faculty_name, f.code as faculty_code,
              u.first_name || ' ' || u.last_name as head_name
       FROM departments d
       LEFT JOIN faculties f ON d.faculty_id = f.id
       LEFT JOIN users u ON d.head_id = u.id
       WHERE d.id = $1`,
      [params.id]
    )

    if (!department) {
      return NextResponse.json({ error: 'Département non trouvé' }, { status: 404 })
    }

    // Récupérer les promotions
    const promotions = await query(
      `SELECT p.*, ay.name as academic_year,
              (SELECT COUNT(*) FROM students WHERE promotion_id = p.id) as students_count
       FROM promotions p
       LEFT JOIN academic_years ay ON p.academic_year_id = ay.id
       WHERE p.department_id = $1
       ORDER BY p.level, p.name`,
      [params.id]
    )

    // Récupérer les enseignants
    const teachers = await query(
      `SELECT t.id, t.matricule, t.grade, t.specialization,
              u.first_name, u.last_name, u.email
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE t.department_id = $1
       ORDER BY u.last_name`,
      [params.id]
    )

    return NextResponse.json({
      department,
      promotions: promotions.rows,
      teachers: teachers.rows
    })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du département' }, { status: 500 })
  }
}

// PUT - Modifier un département
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, headId, isActive, facultyId } = body

    const existing = await queryOne('SELECT id FROM departments WHERE id = $1', [params.id])
    if (!existing) {
      return NextResponse.json({ error: 'Département non trouvé' }, { status: 404 })
    }

    const result = await query(
      `UPDATE departments 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           head_id = COALESCE($3, head_id),
           is_active = COALESCE($4, is_active),
           faculty_id = COALESCE($5, faculty_id)
       WHERE id = $6
       RETURNING *`,
      [name, description, headId, isActive, facultyId, params.id]
    )

    return NextResponse.json({
      message: 'Département modifié avec succès',
      department: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification du département' }, { status: 500 })
  }
}

// DELETE - Supprimer un département
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promCount = await queryOne(
      'SELECT COUNT(*) as count FROM promotions WHERE department_id = $1',
      [params.id]
    )
    if (parseInt(promCount?.count || '0') > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un département avec des promotions' },
        { status: 400 }
      )
    }

    await query('DELETE FROM departments WHERE id = $1', [params.id])
    return NextResponse.json({ message: 'Département supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du département' }, { status: 500 })
  }
}
