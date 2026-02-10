import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

// GET - Récupérer les étudiants inscrits à un cours avec leurs notes
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const courseId = parseInt(params.courseId)

    // Vérifier que l'enseignant est bien assigné à ce cours
    const assignmentCheck = await query(
      `SELECT ca.id 
       FROM course_assignments ca
       JOIN teachers t ON ca.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE u.id = $1 AND ca.course_id = $2`,
      [session.userId, courseId]
    )

    if (assignmentCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Accès non autorisé à ce cours' }, { status: 403 })
    }

    // Récupérer les étudiants inscrits avec leurs notes
    const studentsResult = await query(
      `SELECT 
         s.id,
         s.student_id,
         s.matricule,
         u.first_name,
         u.last_name,
         u.email,
         g.tp_score,
         g.exam_score,
         g.final_score,
         g.grade_letter as grade,
         CASE 
           WHEN g.validated_at IS NOT NULL THEN 'validated'
           WHEN g.id IS NOT NULL THEN 'submitted'
           ELSE 'pending'
         END as status
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN grades g ON g.student_id = s.id AND g.course_id = e.course_id
       WHERE e.course_id = $1
       AND e.status = 'active'
       ORDER BY u.last_name, u.first_name`,
      [courseId]
    )

    return NextResponse.json({
      success: true,
      students: studentsResult.rows
    })

  } catch (error) {
    console.error('Erreur récupération étudiants:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
