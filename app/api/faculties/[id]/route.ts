// API Faculté par ID
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Détails d'une faculté
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faculty = await queryOne(
      `SELECT f.*, u.first_name || ' ' || u.last_name as dean_name
       FROM faculties f
       LEFT JOIN users u ON f.dean_id = u.id
       WHERE f.id = $1`,
      [params.id]
    )

    if (!faculty) {
      return NextResponse.json({ error: 'Faculté non trouvée' }, { status: 404 })
    }

    // Récupérer les départements
    const departments = await query(
      `SELECT d.*, u.first_name || ' ' || u.last_name as head_name,
              (SELECT COUNT(*) FROM promotions WHERE department_id = d.id) as promotions_count
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       WHERE d.faculty_id = $1
       ORDER BY d.name`,
      [params.id]
    )

    return NextResponse.json({
      faculty,
      departments: departments.rows
    })
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de la faculté' }, { status: 500 })
  }
}

// PUT - Modifier une faculté
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, deanId, isActive } = body

    const existing = await queryOne('SELECT id FROM faculties WHERE id = $1', [params.id])
    if (!existing) {
      return NextResponse.json({ error: 'Faculté non trouvée' }, { status: 404 })
    }

    const result = await query(
      `UPDATE faculties 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           dean_id = COALESCE($3, dean_id),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING *`,
      [name, description, deanId, isActive, params.id]
    )

    return NextResponse.json({
      message: 'Faculté modifiée avec succès',
      faculty: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de la faculté' }, { status: 500 })
  }
}

// DELETE - Supprimer une faculté
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier s'il y a des départements
    const deptCount = await queryOne(
      'SELECT COUNT(*) as count FROM departments WHERE faculty_id = $1',
      [params.id]
    )
    if (parseInt(deptCount?.count || '0') > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une faculté avec des départements' },
        { status: 400 }
      )
    }

    await query('DELETE FROM faculties WHERE id = $1', [params.id])
    return NextResponse.json({ message: 'Faculté supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de la faculté' }, { status: 500 })
  }
}
