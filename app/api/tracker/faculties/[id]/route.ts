import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryMany } from '@/lib/db'
import { DeploymentFaculty, UpdateFacultyInput } from '@/types/tracking'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtenir une faculté spécifique avec détails
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const facultyId = parseInt(id)

    if (isNaN(facultyId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    const faculty = await queryOne<DeploymentFaculty>(`
      SELECT 
        f.*,
        w.name as week_name,
        w.week_number,
        w.start_date as week_start,
        w.end_date as week_end
      FROM deployment_faculties f
      LEFT JOIN project_weeks w ON f.week_id = w.id
      WHERE f.id = $1
    `, [facultyId])

    if (!faculty) {
      return NextResponse.json(
        { success: false, error: 'Faculté non trouvée' },
        { status: 404 }
      )
    }

    // Points focaux
    const focalPoints = await queryMany(`
      SELECT * FROM focal_points 
      WHERE faculty_id = $1 
      ORDER BY created_at
    `, [facultyId])

    // Tâches liées à cette faculté (via la semaine)
    const tasks = faculty.week_id ? await queryMany(`
      SELECT * FROM project_tasks 
      WHERE week_id = $1 
      ORDER BY order_index
    `, [faculty.week_id]) : []

    // Historique
    const history = await queryMany(`
      SELECT * FROM project_history 
      WHERE entity_type = 'faculty' AND entity_id = $1 
      ORDER BY created_at DESC
      LIMIT 20
    `, [facultyId])

    return NextResponse.json({
      success: true,
      data: {
        ...faculty,
        focal_points: focalPoints,
        tasks,
        history
      }
    })
  } catch (error) {
    console.error('Erreur API faculty GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la faculté' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour une faculté
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const facultyId = parseInt(id)
    const body: UpdateFacultyInput = await request.json()

    if (isNaN(facultyId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'ancienne valeur pour l'historique
    const oldFaculty = await queryOne<DeploymentFaculty>(`
      SELECT * FROM deployment_faculties WHERE id = $1
    `, [facultyId])

    if (!oldFaculty) {
      return NextResponse.json(
        { success: false, error: 'Faculté non trouvée' },
        { status: 404 }
      )
    }

    // Construire les champs à mettre à jour
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    const allowedFields = [
      'status', 'students_count', 'teachers_count', 'employees_count',
      'students_encoded', 'teachers_encoded', 'employees_encoded',
      'focal_point_name', 'focal_point_contact', 'focal_point_trained', 'notes'
    ]

    for (const field of allowedFields) {
      if (body[field as keyof UpdateFacultyInput] !== undefined) {
        updateFields.push(`${field} = $${paramIndex++}`)
        params.push(body[field as keyof UpdateFacultyInput])
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      )
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(facultyId)

    const result = await queryOne<DeploymentFaculty>(`
      UPDATE deployment_faculties 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params)

    // Vérifier si la faculté est complète
    if (result) {
      const totalCount = (result.students_count || 0) + (result.teachers_count || 0) + (result.employees_count || 0)
      const totalEncoded = (result.students_encoded || 0) + (result.teachers_encoded || 0) + (result.employees_encoded || 0)
      
      if (totalCount > 0 && totalEncoded >= totalCount && result.status !== 'completed') {
        await query(`
          UPDATE deployment_faculties SET status = 'completed', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [facultyId])
        result.status = 'completed'
      }
    }

    // Enregistrer dans l'historique
    await query(`
      INSERT INTO project_history (entity_type, entity_id, action, old_value, new_value, changed_by, user_type)
      VALUES ('faculty', $1, 'updated', $2, $3, 'system', 'prestataire')
    `, [facultyId, JSON.stringify(oldFaculty), JSON.stringify(result)])

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Erreur API faculty PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la faculté' },
      { status: 500 }
    )
  }
}
