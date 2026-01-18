import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query } from '@/lib/db'

// GET - Obtenir les données de délibération pour une promotion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promotionId = searchParams.get('promotionId')
    const academicYearId = searchParams.get('academicYearId')

    if (!promotionId) {
      return NextResponse.json(
        { error: 'Promotion requise' },
        { status: 400 }
      )
    }

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

    // Récupérer les étudiants de la promotion avec leurs moyennes
    const students = await queryMany(
      `SELECT 
        s.id, s.matricule, s.status, s.payment_status,
        u.first_name, u.last_name,
        ROUND(AVG(g.final_score)::numeric, 2) as average,
        SUM(c.credits) FILTER (WHERE g.final_score >= 10) as credits_validated,
        SUM(c.credits) as total_credits,
        COUNT(c.id) as courses_count,
        COUNT(g.id) FILTER (WHERE g.final_score >= 10) as courses_passed
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN enrollments e ON s.id = e.student_id AND e.academic_year_id = $2
       LEFT JOIN courses c ON e.course_id = c.id
       LEFT JOIN grades g ON s.id = g.student_id AND g.course_id = c.id AND g.academic_year_id = $2
       WHERE s.promotion_id = $1
       GROUP BY s.id, u.first_name, u.last_name
       ORDER BY average DESC NULLS LAST`,
      [parseInt(promotionId), parseInt(yearId!)]
    )

    // Récupérer les détails des cours de la promotion
    const courses = await queryMany(
      `SELECT c.id, c.code, c.name, c.credits, c.semester
       FROM courses c
       WHERE c.promotion_id = $1 AND c.is_active = TRUE
       ORDER BY c.semester, c.name`,
      [parseInt(promotionId)]
    )

    // Récupérer toutes les notes pour l'affichage détaillé
    const grades = await queryMany(
      `SELECT g.student_id, g.course_id, g.final_score, g.grade_letter, g.is_validated
       FROM grades g
       JOIN students s ON g.student_id = s.id
       WHERE s.promotion_id = $1 AND g.academic_year_id = $2`,
      [parseInt(promotionId), parseInt(yearId!)]
    )

    // Calculer les statistiques
    const passedStudents = students.filter((s: any) => parseFloat(s.average) >= 10).length
    const totalStudents = students.length

    // Calculer la décision de délibération pour chaque étudiant
    const studentsWithDecision = students.map((student: any) => {
      let decision = 'EN_ATTENTE'
      const avg = parseFloat(student.average) || 0
      const creditsValidated = parseInt(student.credits_validated) || 0
      const totalCredits = parseInt(student.total_credits) || 0
      const creditsRatio = totalCredits > 0 ? creditsValidated / totalCredits : 0

      if (student.payment_status === 'BLOCKED') {
        decision = 'BLOQUÉ'
      } else if (avg >= 12 && creditsRatio >= 0.8) {
        decision = 'ADMIS'
      } else if (avg >= 10 && creditsRatio >= 0.6) {
        decision = 'ADMIS_AVEC_DETTE'
      } else if (avg >= 8 && creditsRatio >= 0.5) {
        decision = 'AJOURNÉ'
      } else if (avg < 8 || creditsRatio < 0.5) {
        decision = 'REFUSÉ'
      }

      return {
        ...student,
        decision
      }
    })

    return NextResponse.json({
      students: studentsWithDecision,
      courses,
      grades,
      statistics: {
        totalStudents,
        passedStudents,
        failedStudents: totalStudents - passedStudents,
        passRate: totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching deliberation data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de délibération' },
      { status: 500 }
    )
  }
}

// POST - Valider les délibérations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promotionId, academicYearId, decisions, validatedBy } = body

    if (!promotionId || !decisions || !Array.isArray(decisions)) {
      return NextResponse.json(
        { error: 'Données de délibération incomplètes' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut des étudiants selon les décisions
    for (const decision of decisions) {
      const { studentId, status, newPromotionId } = decision

      // Mettre à jour le statut de l'étudiant
      if (status === 'ADMIS' && newPromotionId) {
        // Promotion vers l'année suivante
        await query(
          'UPDATE students SET promotion_id = $1 WHERE id = $2',
          [newPromotionId, studentId]
        )
      } else if (status === 'REFUSÉ') {
        await query(
          'UPDATE students SET status = $1 WHERE id = $2',
          ['DROPPED', studentId]
        )
      }

      // Valider toutes les notes de l'étudiant pour cette année
      await query(
        `UPDATE grades SET is_validated = TRUE, validated_by = $1, validated_at = CURRENT_TIMESTAMP
         WHERE student_id = $2 AND academic_year_id = $3`,
        [validatedBy, studentId, academicYearId]
      )
    }

    return NextResponse.json({
      success: true,
      message: `${decisions.length} délibération(s) validée(s) avec succès`
    })
  } catch (error) {
    console.error('Error validating deliberations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation des délibérations' },
      { status: 500 }
    )
  }
}
