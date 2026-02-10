import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query, transaction } from '@/lib/db'

// GET - Liste des notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const promotionId = searchParams.get('promotionId')
    const academicYearId = searchParams.get('academicYearId')

    let whereConditions = ['1=1']
    let params: any[] = []
    let paramIndex = 1

    if (studentId) {
      whereConditions.push(`g.student_id = $${paramIndex}`)
      params.push(parseInt(studentId))
      paramIndex++
    }

    if (courseId) {
      whereConditions.push(`g.course_id = $${paramIndex}`)
      params.push(parseInt(courseId))
      paramIndex++
    }

    if (promotionId) {
      whereConditions.push(`s.promotion_id = $${paramIndex}`)
      params.push(parseInt(promotionId))
      paramIndex++
    }

    if (academicYearId) {
      whereConditions.push(`g.academic_year_id = $${paramIndex}`)
      params.push(parseInt(academicYearId))
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    const grades = await queryMany(
      `SELECT g.id, g.tp_score, g.td_score, g.exam_score, g.final_score, g.grade_letter,
              g.is_validated, g.validated_at, g.remarks,
              s.id as student_id, s.matricule, u.first_name as student_first_name, u.last_name as student_last_name,
              c.id as course_id, c.code as course_code, c.name as course_name, c.credits,
              ay.name as academic_year
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN courses c ON g.course_id = c.id
       JOIN academic_years ay ON g.academic_year_id = ay.id
       WHERE ${whereClause}
       ORDER BY u.last_name, u.first_name, c.name`,
      params
    )

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour une note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both camelCase and snake_case formats
    const studentId = body.studentId || body.student_id
    const courseId = body.courseId || body.course_id
    let academicYearId = body.academicYearId || body.academic_year_id
    const tpScore = body.tpScore ?? body.tp_score
    const tdScore = body.tdScore ?? body.td_score
    const examScore = body.examScore ?? body.exam_score
    const remarks = body.remarks

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Étudiant et cours requis' },
        { status: 400 }
      )
    }

    // Si pas d'année académique fournie, récupérer l'année courante
    if (!academicYearId) {
      const currentYear = await queryOne<{ id: number }>(
        "SELECT id FROM academic_years WHERE is_current = true"
      )
      if (!currentYear) {
        return NextResponse.json(
          { error: 'Aucune année académique active' },
          { status: 400 }
        )
      }
      academicYearId = currentYear.id
    }

    // Calculer la note finale (pondération: TP 30%, Exam 70%)
    let finalScore = null
    if (examScore !== null && examScore !== undefined && tpScore !== null && tpScore !== undefined) {
      finalScore = Math.round((tpScore * 0.3 + examScore * 0.7) * 100) / 100
    } else if (examScore !== null && examScore !== undefined) {
      // Si seulement examen, utiliser 100% examen
      finalScore = examScore
    }

    // Calculer la lettre de la note
    let gradeLetter = null
    if (finalScore !== null) {
      if (finalScore >= 16) gradeLetter = 'A'
      else if (finalScore >= 14) gradeLetter = 'B'
      else if (finalScore >= 12) gradeLetter = 'C'
      else if (finalScore >= 10) gradeLetter = 'D'
      else gradeLetter = 'E'
    }

    // Vérifier si une note existe déjà
    const existingGrade = await queryOne<{ id: number }>(
      'SELECT id FROM grades WHERE student_id = $1 AND course_id = $2 AND academic_year_id = $3',
      [studentId, courseId, academicYearId]
    )

    if (existingGrade) {
      // Mettre à jour
      await query(
        `UPDATE grades SET
          tp_score = $1,
          td_score = $2,
          exam_score = $3,
          final_score = $4,
          grade_letter = $5,
          remarks = $6,
          is_validated = FALSE,
          updated_at = NOW()
         WHERE id = $7`,
        [tpScore, tdScore, examScore, finalScore, gradeLetter, remarks, existingGrade.id]
      )

      return NextResponse.json({
        success: true,
        gradeId: existingGrade.id,
        message: 'Note mise à jour avec succès'
      })
    } else {
      // Créer
      const result = await queryOne<{ id: number }>(
        `INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, td_score, exam_score, final_score, grade_letter, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [studentId, courseId, academicYearId, tpScore, tdScore, examScore, finalScore, gradeLetter, remarks]
      )

      return NextResponse.json({
        success: true,
        gradeId: result?.id,
        message: 'Note créée avec succès'
      })
    }
  } catch (error) {
    console.error('Error saving grade:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la note' },
      { status: 500 }
    )
  }
}

// PUT - Valider des notes
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { gradeIds, validatedBy } = body

    if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs des notes requis' },
        { status: 400 }
      )
    }

    // Créer les placeholders pour la requête
    const placeholders = gradeIds.map((_, i) => `$${i + 3}`).join(', ')

    await query(
      `UPDATE grades SET
        is_validated = TRUE,
        validated_by = $1,
        validated_at = CURRENT_TIMESTAMP
       WHERE id IN (${placeholders})`,
      [validatedBy, ...gradeIds]
    )

    return NextResponse.json({
      success: true,
      message: `${gradeIds.length} note(s) validée(s) avec succès`
    })
  } catch (error) {
    console.error('Error validating grades:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation des notes' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la note requis' },
        { status: 400 }
      )
    }

    await query('DELETE FROM grades WHERE id = $1', [parseInt(id)])

    return NextResponse.json({
      success: true,
      message: 'Note supprimée avec succès'
    })
  } catch (error) {
    console.error('Error deleting grade:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la note' },
      { status: 500 }
    )
  }
}
