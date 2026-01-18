import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

// GET - Obtenir les détails d'un cours spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id

    if (!courseId) {
      return NextResponse.json({ error: 'ID du cours requis' }, { status: 400 })
    }

    const course = await queryOne(
      `SELECT c.id, c.code, c.name, c.description, c.credits, 
              c.hours_cm, c.hours_td, c.hours_tp, c.semester, c.course_type,
              c.teacher_id,
              u.first_name as teacher_first_name, 
              u.last_name as teacher_last_name,
              u.email as teacher_email,
              p.name as promotion_name, p.level as promotion_level,
              d.name as department_name,
              f.name as faculty_name
       FROM courses c
       JOIN promotions p ON c.promotion_id = p.id
       JOIN departments d ON p.department_id = d.id
       JOIN faculties f ON d.faculty_id = f.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE c.id = $1`,
      [courseId]
    )

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course details:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du cours' },
      { status: 500 }
    )
  }
}
