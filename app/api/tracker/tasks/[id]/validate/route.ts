import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { ProjectTask, ValidateTaskInput } from '@/types/tracking'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Valider une tâche (prestataire ou client)
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id)
    const body: ValidateTaskInput = await request.json()

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    if (!body.validated_by || !body.user_type) {
      return NextResponse.json(
        { success: false, error: 'Les champs validated_by et user_type sont requis' },
        { status: 400 }
      )
    }

    const task = await queryOne<ProjectTask>(`
      SELECT * FROM project_tasks WHERE id = $1
    `, [taskId])

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    let updateQuery = ''
    let params: any[] = []

    if (body.user_type === 'prestataire') {
      // Validation prestataire (marquer comme terminé)
      updateQuery = `
        UPDATE project_tasks SET
          prestataire_completed = TRUE,
          prestataire_completed_at = CURRENT_TIMESTAMP,
          prestataire_completed_by = $1,
          status = 'completed',
          completed_date = CURRENT_TIMESTAMP,
          progress_percentage = 100,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `
      params = [body.validated_by, taskId]
    } else if (body.user_type === 'client') {
      // Validation client
      if (!task.prestataire_completed) {
        return NextResponse.json(
          { success: false, error: 'La tâche doit d\'abord être validée par le prestataire' },
          { status: 400 }
        )
      }
      updateQuery = `
        UPDATE project_tasks SET
          client_validated = TRUE,
          client_validated_at = CURRENT_TIMESTAMP,
          client_validated_by = $1,
          client_validation_notes = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `
      params = [body.validated_by, body.validation_notes || null, taskId]
    } else {
      return NextResponse.json(
        { success: false, error: 'Type d\'utilisateur invalide' },
        { status: 400 }
      )
    }

    const result = await queryOne<ProjectTask>(updateQuery, params)

    // Enregistrer dans l'historique
    await query(`
      INSERT INTO project_history (entity_type, entity_id, action, old_value, new_value, changed_by, user_type, notes)
      VALUES ('task', $1, 'validated', $2, $3, $4, $5, $6)
    `, [taskId, JSON.stringify(task), JSON.stringify(result), body.validated_by, body.user_type, body.validation_notes])

    // Créer une notification si c'est une validation prestataire
    if (body.user_type === 'prestataire') {
      await query(`
        INSERT INTO project_notifications (user_type, title, message, notification_type, related_entity_type, related_entity_id)
        VALUES ('client', $1, $2, 'validation_required', 'task', $3)
      `, [
        `Tâche à valider: ${task.title}`,
        `La tâche "${task.title}" a été marquée comme terminée par le prestataire et attend votre validation.`,
        taskId
      ])
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: body.user_type === 'prestataire' 
        ? 'Tâche marquée comme terminée' 
        : 'Tâche validée par le client'
    })
  } catch (error) {
    console.error('Erreur API task validate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la validation de la tâche' },
      { status: 500 }
    )
  }
}

// DELETE - Annuler la validation
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('user_type')

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: 'ID invalide' },
        { status: 400 }
      )
    }

    const task = await queryOne<ProjectTask>(`
      SELECT * FROM project_tasks WHERE id = $1
    `, [taskId])

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    let updateQuery = ''

    if (userType === 'prestataire') {
      updateQuery = `
        UPDATE project_tasks SET
          prestataire_completed = FALSE,
          prestataire_completed_at = NULL,
          prestataire_completed_by = NULL,
          client_validated = FALSE,
          client_validated_at = NULL,
          client_validated_by = NULL,
          client_validation_notes = NULL,
          status = 'in_progress',
          completed_date = NULL,
          progress_percentage = 50,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `
    } else if (userType === 'client') {
      updateQuery = `
        UPDATE project_tasks SET
          client_validated = FALSE,
          client_validated_at = NULL,
          client_validated_by = NULL,
          client_validation_notes = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `
    } else {
      return NextResponse.json(
        { success: false, error: 'Type d\'utilisateur invalide' },
        { status: 400 }
      )
    }

    const result = await queryOne<ProjectTask>(updateQuery, [taskId])

    // Enregistrer dans l'historique
    await query(`
      INSERT INTO project_history (entity_type, entity_id, action, old_value, new_value, changed_by, user_type)
      VALUES ('task', $1, 'validation_cancelled', $2, $3, 'system', $4)
    `, [taskId, JSON.stringify(task), JSON.stringify(result), userType])

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Validation annulée'
    })
  } catch (error) {
    console.error('Erreur API task validate DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'annulation de la validation' },
      { status: 500 }
    )
  }
}
