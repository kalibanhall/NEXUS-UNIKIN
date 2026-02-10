import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, queryMany } from '@/lib/db'
import { DeploymentFaculty, UpdateFacultyInput } from '@/types/tracking'

// GET - Obtenir toutes les facultés avec leur progression
export async function GET(request: NextRequest) {
  try {
    const faculties = await queryMany<DeploymentFaculty>(`
      SELECT 
        f.*,
        w.name as week_name,
        w.week_number,
        w.status as week_status,
        CASE 
          WHEN f.students_count > 0 
          THEN ROUND((f.students_encoded::decimal / f.students_count) * 100)
          ELSE 0 
        END as students_progress,
        CASE 
          WHEN f.teachers_count > 0 
          THEN ROUND((f.teachers_encoded::decimal / f.teachers_count) * 100)
          ELSE 0 
        END as teachers_progress,
        CASE 
          WHEN f.employees_count > 0 
          THEN ROUND((f.employees_encoded::decimal / f.employees_count) * 100)
          ELSE 0 
        END as employees_progress,
        CASE 
          WHEN (f.students_count + f.teachers_count + f.employees_count) > 0 
          THEN ROUND(
            ((f.students_encoded + f.teachers_encoded + f.employees_encoded)::decimal / 
            (f.students_count + f.teachers_count + f.employees_count)) * 100
          )
          ELSE 0 
        END as overall_progress
      FROM deployment_faculties f
      LEFT JOIN project_weeks w ON f.week_id = w.id
      ORDER BY f.order_index
    `)

    // Statistiques globales
    const stats = await queryOne<any>(`
      SELECT 
        COUNT(*) as total_faculties,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_faculties,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_faculties,
        COUNT(*) FILTER (WHERE status = 'issues') as faculties_with_issues,
        SUM(students_count) as total_students,
        SUM(students_encoded) as encoded_students,
        SUM(teachers_count) as total_teachers,
        SUM(teachers_encoded) as encoded_teachers,
        SUM(employees_count) as total_employees,
        SUM(employees_encoded) as encoded_employees
      FROM deployment_faculties
    `)

    return NextResponse.json({
      success: true,
      data: {
        faculties,
        stats: {
          ...stats,
          students_progress: stats.total_students > 0 
            ? Math.round((stats.encoded_students / stats.total_students) * 100) 
            : 0,
          teachers_progress: stats.total_teachers > 0 
            ? Math.round((stats.encoded_teachers / stats.total_teachers) * 100) 
            : 0,
          employees_progress: stats.total_employees > 0 
            ? Math.round((stats.encoded_employees / stats.total_employees) * 100) 
            : 0
        }
      }
    })
  } catch (error) {
    console.error('Erreur API faculties GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des facultés' },
      { status: 500 }
    )
  }
}
