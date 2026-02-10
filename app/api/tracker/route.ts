import { NextResponse } from 'next/server'
import { query, queryOne, queryMany } from '@/lib/db'
import { ProjectSummary, ProjectPhase, WeekProgress } from '@/types/tracking'

// GET - Obtenir le résumé du projet
export async function GET() {
  try {
    // Résumé global du projet
    const summaryData = await queryOne<any>(`
      SELECT 
        (SELECT COUNT(*) FROM project_phases) as total_phases,
        (SELECT COUNT(*) FROM project_phases WHERE status = 'completed') as completed_phases,
        (SELECT COUNT(*) FROM project_weeks) as total_weeks,
        (SELECT COUNT(*) FROM project_weeks WHERE status = 'completed') as completed_weeks,
        (SELECT COUNT(*) FROM project_tasks) as total_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE client_validated = TRUE) as validated_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE status = 'pending') as pending_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE status = 'in_progress') as in_progress_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE status = 'blocked') as blocked_tasks,
        (SELECT COUNT(*) FROM deployment_faculties) as total_faculties,
        (SELECT COUNT(*) FROM deployment_faculties WHERE status = 'completed') as completed_faculties,
        (SELECT COALESCE(AVG(progress_percentage), 0)::integer FROM project_phases) as overall_progress
    `)

    // Dates du projet (30 janvier 2026 - 30 avril 2026)
    const projectStartDate = new Date('2026-01-30')
    const projectEndDate = new Date('2026-04-30')
    const today = new Date()
    
    const daysElapsed = Math.max(0, Math.floor((today.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)))
    const daysRemaining = Math.max(0, Math.floor((projectEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Semaine courante
    const currentWeek = await queryOne<{ week_number: number }>(`
      SELECT week_number FROM project_weeks 
      WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
      LIMIT 1
    `)

    // Phases du projet avec progression
    const phases = await queryMany<ProjectPhase>(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM project_tasks WHERE phase_id = p.id) as tasks_count,
        (SELECT COUNT(*) FROM project_tasks WHERE phase_id = p.id AND status = 'completed') as completed_tasks_count
      FROM project_phases p
      ORDER BY p.order_index
    `)

    // Progression par semaine
    const weekProgress = await queryMany<WeekProgress>(`
      SELECT 
        w.id as week_id,
        w.week_number,
        w.name as week_name,
        w.status,
        (SELECT COUNT(*) FROM project_tasks WHERE week_id = w.id) as total_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE week_id = w.id AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE week_id = w.id AND client_validated = TRUE) as validated_tasks,
        w.progress_percentage
      FROM project_weeks w
      ORDER BY w.week_number
    `)

    // Statistiques par catégorie
    const taskStats = await queryMany<any>(`
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM project_tasks
      WHERE category IS NOT NULL
      GROUP BY category
    `)

    // Tâches récentes
    const recentTasks = await queryMany<any>(`
      SELECT 
        t.id, t.title, t.status, t.priority, t.category, t.due_date,
        t.client_validated, t.prestataire_completed,
        w.name as week_name
      FROM project_tasks t
      LEFT JOIN project_weeks w ON t.week_id = w.id
      ORDER BY t.updated_at DESC
      LIMIT 10
    `)

    // Notifications non lues
    const unreadNotifications = await queryMany<any>(`
      SELECT * FROM project_notifications 
      WHERE is_read = FALSE
      ORDER BY created_at DESC
      LIMIT 5
    `)

    const summary: ProjectSummary = {
      ...summaryData,
      current_week: currentWeek?.week_number || 1,
      days_remaining: daysRemaining,
      days_elapsed: daysElapsed,
      project_start_date: projectStartDate.toISOString(),
      project_end_date: projectEndDate.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        phases,
        weekProgress,
        taskStats: taskStats.map((s: any) => ({
          ...s,
          percentage: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
        })),
        recentTasks,
        unreadNotifications
      }
    })
  } catch (error) {
    console.error('Erreur API tracker dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement du tableau de bord' },
      { status: 500 }
    )
  }
}
