import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne } from '@/lib/db'

// GET - Obtenir les sessions de délibération
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYearId')

    // Récupérer l'année académique courante si non spécifiée
    let yearId: string | null = academicYearId
    if (!yearId) {
      const currentYear = await queryOne<{ id: number }>(
        'SELECT id FROM academic_years WHERE is_current = TRUE'
      )
      yearId = currentYear?.id?.toString() || null
    }

    if (!yearId) {
      return NextResponse.json(
        { error: 'Année académique non trouvée' },
        { status: 400 }
      )
    }

    // Récupérer les sessions de délibération
    const sessions = await queryMany(
      `SELECT 
        d.id, 
        d.name, 
        d.semester, 
        d.status,
        d.start_date,
        d.end_date,
        d.pass_threshold,
        d.created_at,
        p.id as promotion_id,
        p.code as promotion_code,
        p.name as promotion_name,
        p.level,
        dep.name as department_name,
        f.name as faculty_name,
        ay.name as academic_year,
        t1.id as president_teacher_id,
        u1.first_name as president_first_name,
        u1.last_name as president_last_name,
        t2.id as secretary_teacher_id,
        u2.first_name as secretary_first_name,
        u2.last_name as secretary_last_name
       FROM deliberations d
       JOIN promotions p ON d.promotion_id = p.id
       JOIN departments dep ON p.department_id = dep.id
       JOIN faculties f ON dep.faculty_id = f.id
       JOIN academic_years ay ON d.academic_year_id = ay.id
       LEFT JOIN teachers t1 ON d.president_id = t1.id
       LEFT JOIN users u1 ON t1.user_id = u1.id
       LEFT JOIN teachers t2 ON d.secretary_id = t2.id
       LEFT JOIN users u2 ON t2.user_id = u2.id
       WHERE d.academic_year_id = $1
       ORDER BY d.created_at DESC`,
      [parseInt(yearId)]
    )

    // Pour chaque session, compter les étudiants et calculer les stats
    const sessionsWithStats = await Promise.all(sessions.map(async (session: any) => {
      // Compter les étudiants
      const studentCount = await queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM students WHERE promotion_id = $1 AND status = $2',
        [session.promotion_id, 'ACTIVE']
      )

      // Compter les étudiants avec notes validées
      const processedCount = await queryOne<{ count: number }>(
        `SELECT COUNT(DISTINCT s.id) as count 
         FROM students s
         JOIN grades g ON s.id = g.student_id AND g.is_validated = TRUE
         WHERE s.promotion_id = $1 AND g.academic_year_id = $2`,
        [session.promotion_id, parseInt(yearId!)]
      )

      // Calculer le taux de réussite
      const passedCount = await queryOne<{ count: number }>(
        `SELECT COUNT(DISTINCT s.id) as count 
         FROM students s
         JOIN grades g ON s.id = g.student_id
         WHERE s.promotion_id = $1 
         AND g.academic_year_id = $2
         AND g.is_validated = TRUE
         GROUP BY s.id
         HAVING AVG(g.final_score) >= 10`,
        [session.promotion_id, parseInt(yearId!)]
      )

      const totalStudents = parseInt(studentCount?.count?.toString() || '0')
      const processedStudents = parseInt(processedCount?.count?.toString() || '0')
      const passedStudents = parseInt(passedCount?.count?.toString() || '0')

      return {
        id: session.id.toString(),
        name: session.name,
        faculty: session.faculty_name,
        department: session.department_name,
        promotion: session.promotion_name,
        promotionId: session.promotion_id,
        academicYear: session.academic_year,
        semester: session.semester,
        status: session.status.toLowerCase().replace('_', '-'),
        startDate: session.start_date,
        endDate: session.end_date,
        totalStudents,
        processedStudents,
        passRate: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0,
        president: session.president_first_name ? `Prof. ${session.president_last_name}` : 'Non assigné',
        secretary: session.secretary_first_name ? `Dr. ${session.secretary_last_name}` : 'Non assigné',
      }
    }))

    return NextResponse.json({ sessions: sessionsWithStats })
  } catch (error) {
    console.error('Error fetching deliberation sessions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    )
  }
}
