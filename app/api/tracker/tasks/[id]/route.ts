import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryMany, transaction } from '@/lib/db'
import { ProjectTask, UpdateTaskInput, ValidateTaskInput } from '@/types/tracking'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Obtenir une tâche spécifique
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id)
    
    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    const task = await queryOne<ProjectTask>(`
      SELECT 
        t.*,
        w.name as week_name,
        w.week_number,
        p.name as phase_name
      FROM project_tasks t
      LEFT JOIN project_weeks w ON t.week_id = w.id
      LEFT JOIN project_phases p ON t.phase_id = p.id
      WHERE t.id = $1
    `, [taskId])

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    // Sous-tâches
    const subtasks = await queryMany(`
      SELECT * FROM project_subtasks 
      WHERE task_id = $1 
      ORDER BY order_index
    `, [taskId])

    // Commentaires avec réponses
    const comments = await queryMany(`
      SELECT * FROM task_comments 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `, [taskId])

    // Pièces jointes
    const attachments = await queryMany(`
      SELECT * FROM task_attachments 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `, [taskId])

    // Historique
    const history = await queryMany(`
      SELECT * FROM project_history 
      WHERE entity_type = 'task' AND entity_id = $1 
      ORDER BY created_at DESC
      LIMIT 20
    `, [taskId])

    return NextResponse.json({
      success: true,
      data: {
        ...task,
        subtasks,
        comments,
        attachments,
        history
      }
    })
  } catch (error) {
    console.error('Erreur API task GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la tâche' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour une tâche
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id)
    const body: UpdateTaskInput = await request.json()

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'ancienne valeur pour l'historique
    const oldTask = await queryOne<ProjectTask>(`
      SELECT * FROM project_tasks WHERE id = $1
    `, [taskId])

    if (!oldTask) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    // Construire les champs à mettre à jour
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    const allowedFields = [
      'title', 'description', 'category', 'priority', 'assigned_to',
      'estimated_hours', 'actual_hours', 'start_date', 'due_date',
      'status', 'progress_percentage', 'is_milestone'
    ]

    for (const field of allowedFields) {
      if (body[field as keyof UpdateTaskInput] !== undefined) {
        updateFields.push(`${field} = $${paramIndex++}`)
        params.push(body[field as keyof UpdateTaskInput])
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      )
    }

    // Ajouter la date de complétion si la tâche est terminée
    if (body.status === 'completed' && !oldTask.completed_date) {
      updateFields.push(`completed_date = CURRENT_TIMESTAMP`)
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(taskId)

    const result = await queryOne<ProjectTask>(`
      UPDATE project_tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, params)

    // Enregistrer dans l'historique
    await query(`
      INSERT INTO project_history (entity_type, entity_id, action, old_value, new_value, changed_by, user_type)
      VALUES ('task', $1, 'updated', $2, $3, 'system', 'prestataire')
    `, [taskId, JSON.stringify(oldTask), JSON.stringify(result)])

    // Mettre à jour la progression de la semaine
    if (result?.week_id) {
      await updateWeekProgress(result.week_id)
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Erreur API task PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la tâche' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une tâche
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id)

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'ancienne valeur pour l'historique
    const oldTask = await queryOne<ProjectTask>(`
      SELECT * FROM project_tasks WHERE id = $1
    `, [taskId])

    if (!oldTask) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    await query(`DELETE FROM project_tasks WHERE id = $1`, [taskId])

    // Enregistrer dans l'historique
    await query(`
      INSERT INTO project_history (entity_type, entity_id, action, old_value, changed_by, user_type)
      VALUES ('task', $1, 'deleted', $2, 'system', 'prestataire')
    `, [taskId, JSON.stringify(oldTask)])

    // Mettre à jour la progression de la semaine
    if (oldTask.week_id) {
      await updateWeekProgress(oldTask.week_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Tâche supprimée avec succès'
    })
  } catch (error) {
    console.error('Erreur API task DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la tâche' },
      { status: 500 }
    )
  }
}

// Fonction utilitaire pour mettre à jour la progression d'une semaine
async function updateWeekProgress(weekId: number) {
  const stats = await queryOne<{ total: string; completed: string }>(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'completed') as completed
    FROM project_tasks
    WHERE week_id = $1
  `, [weekId])

  if (stats) {
    const total = parseInt(stats.total)
    const completed = parseInt(stats.completed)
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    
    let status = 'pending'
    if (progress === 100) status = 'completed'
    else if (progress > 0) status = 'in_progress'

    await query(`
      UPDATE project_weeks 
      SET progress_percentage = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [progress, status, weekId])
  }
}
