import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

// GET - Récupérer les cours de l'enseignant connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer le teacher_id depuis la session
    const userResult = await query(
      `SELECT t.id as teacher_id 
       FROM teachers t 
       JOIN users u ON t.user_id = u.id 
       WHERE u.id = $1`,
      [session.userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    const teacherId = userResult.rows[0].teacher_id

    // Récupérer les cours assignés à cet enseignant
    const coursesResult = await query(
      `SELECT 
         c.id,
         c.code,
         c.name,
         c.credits,
         c.semester,
         ay.name as academic_year,
         (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') as student_count
       FROM courses c
       JOIN course_assignments ca ON ca.course_id = c.id
       JOIN academic_years ay ON c.academic_year_id = ay.id
       WHERE ca.teacher_id = $1
       AND ay.is_current = true
       ORDER BY c.code`,
      [teacherId]
    )

    return NextResponse.json({
      success: true,
      courses: coursesResult.rows
    })

  } catch (error) {
    console.error('Erreur récupération cours enseignant:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
