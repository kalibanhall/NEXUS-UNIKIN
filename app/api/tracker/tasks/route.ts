import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryMany, transaction } from '@/lib/db'
import { ProjectTask, CreateTaskInput, UpdateTaskInput, ValidateTaskInput } from '@/types/tracking'

// GET - Obtenir les tâches avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const week_id = searchParams.get('week_id')
    const phase_id = searchParams.get('phase_id')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const validated = searchParams.get('validated')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (week_id) {
      whereClause += ` AND t.week_id = $${paramIndex++}`
      params.push(parseInt(week_id))
    }
    if (phase_id) {
      whereClause += ` AND t.phase_id = $${paramIndex++}`
      params.push(parseInt(phase_id))
    }
    if (status) {
      whereClause += ` AND t.status = $${paramIndex++}`
      params.push(status)
    }
    if (priority) {
      whereClause += ` AND t.priority = $${paramIndex++}`
      params.push(priority)
    }
    if (category) {
      whereClause += ` AND t.category = $${paramIndex++}`
      params.push(category)
    }
    if (search) {
      whereClause += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }
    if (validated === 'true') {
      whereClause += ` AND t.client_validated = TRUE`
    } else if (validated === 'false') {
      whereClause += ` AND t.client_validated = FALSE`
    }

    // Requête principale avec relations
    const tasks = await queryMany<ProjectTask>(`
      SELECT 
        t.*,
        w.name as week_name,
        w.week_number,
        p.name as phase_name,
        (SELECT COUNT(*) FROM project_subtasks WHERE task_id = t.id) as subtasks_count,
        (SELECT COUNT(*) FROM project_subtasks WHERE task_id = t.id AND completed = TRUE) as completed_subtasks_count,
        (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id) as comments_count
      FROM project_tasks t
      LEFT JOIN project_weeks w ON t.week_id = w.id
      LEFT JOIN project_phases p ON t.phase_id = p.id
      ${whereClause}
      ORDER BY 
        CASE WHEN t.status = 'blocked' THEN 1
             WHEN t.status = 'in_progress' THEN 2
             WHEN t.status = 'pending' THEN 3
             ELSE 4 END,
        CASE t.priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4 END,
        t.due_date ASC NULLS LAST,
        t.order_index
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, limit, offset])

    // Compter le total
    const countResult = await queryOne<{ count: string }>(`
      SELECT COUNT(*) as count FROM project_tasks t ${whereClause}
    `, params)
    const total = parseInt(countResult?.count || '0')

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Erreur API tasks GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle tâche
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskInput = await request.json()
    
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Le titre est requis' },
        { status: 400 }
      )
    }

    // Obtenir l'ordre suivant
    const maxOrder = await queryOne<{ max_order: number }>(`
      SELECT COALESCE(MAX(order_index), 0) + 1 as max_order 
      FROM project_tasks 
      WHERE week_id = $1
    `, [body.week_id])

    const result = await queryOne<ProjectTask>(`
      INSERT INTO project_tasks (
        week_id, phase_id, title, description, category, priority,
        assigned_to, estimated_hours, start_date, due_date,
        is_milestone, dependencies, order_index, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
      RETURNING *
    `, [
      body.week_id || null,
      body.phase_id || null,
      body.title,
      body.description || null,
      body.category || null,
      body.priority || 'medium',
      body.assigned_to || null,
      body.estimated_hours || null,
      body.start_date || null,
      body.due_date || null,
      body.is_milestone || false,
      body.dependencies || null,
      maxOrder?.max_order || 1
    ])

    // Enregistrer dans l'historique
    await query(`
      INSERT INTO project_history (entity_type, entity_id, action, new_value, changed_by, user_type)
      VALUES ('task', $1, 'created', $2, 'system', 'prestataire')
    `, [result?.id, JSON.stringify(result)])

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur API tasks POST:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    )
  }
}
