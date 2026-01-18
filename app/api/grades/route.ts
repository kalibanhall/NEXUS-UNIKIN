import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query, transaction } from '@/lib/db'

// GET - Liste des notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || searchParams.get('student_id')
    const courseId = searchParams.get('courseId') || searchParams.get('course_id')
    const promotionId = searchParams.get('promotionId')
    const academicYearId = searchParams.get('academicYearId')

    // If fetching grades for a course, return all enrolled students with their grades
    if (courseId && !studentId) {
      const grades = await queryMany(
        `SELECT 
           s.id as student_id, s.matricule, s.payment_status,
           u.first_name, u.last_name,
           g.id as grade_id, g.tp_score, g.td_score, g.exam_score, g.final_score, g.grade_letter, g.is_validated
         FROM enrollments e
         JOIN students s ON e.student_id = s.id
         JOIN users u ON s.user_id = u.id
         LEFT JOIN grades g ON g.student_id = s.id AND g.course_id = e.course_id
         WHERE e.course_id = $1
         ORDER BY u.last_name, u.first_name`,
        [parseInt(courseId)]
      )

      return NextResponse.json({ grades })
    }

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
              s.id as student_id, s.matricule, s.payment_status,
              u.first_name as student_first_name, u.last_name as student_last_name,
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
    const {
      student_id,
      studentId,
      course_id,
      courseId,
      academic_year_id,
      academicYearId,
      tp_score,
      tpScore,
      td_score,
      tdScore,
      exam_score,
      examScore,
      final_score,
      finalScore,
      grade_letter,
      gradeLetter,
      remarks
    } = body

    // Support both naming conventions
    const sId = student_id || studentId
    const cId = course_id || courseId
    const tp = tp_score !== undefined ? tp_score : tpScore
    const td = td_score !== undefined ? td_score : tdScore
    const exam = exam_score !== undefined ? exam_score : examScore
    const final = final_score !== undefined ? final_score : finalScore
    const letter = grade_letter || gradeLetter

    if (!sId || !cId) {
      return NextResponse.json(
        { error: 'Étudiant et cours requis' },
        { status: 400 }
      )
    }

    // Get current academic year if not provided
    let ayId = academic_year_id || academicYearId
    if (!ayId) {
      const currentYear = await queryOne<{ id: number }>('SELECT id FROM academic_years WHERE is_current = TRUE')
      ayId = currentYear?.id || 1
    }

    // Calculate final score if not provided
    let calculatedFinal = final
    if (calculatedFinal === undefined || calculatedFinal === null) {
      if (exam !== null && exam !== undefined) {
        const tpVal = tp || 0
        const tdVal = td || 0
        calculatedFinal = Math.round((tpVal * 0.2 + tdVal * 0.2 + exam * 0.6) * 100) / 100
      }
    }

    // Calculate grade letter if not provided
    let calculatedLetter = letter
    if (!calculatedLetter && calculatedFinal !== null && calculatedFinal !== undefined) {
      if (calculatedFinal >= 16) calculatedLetter = 'A'
      else if (calculatedFinal >= 14) calculatedLetter = 'B'
      else if (calculatedFinal >= 12) calculatedLetter = 'C'
      else if (calculatedFinal >= 10) calculatedLetter = 'D'
      else calculatedLetter = 'E'
    }

    // Check if grade exists
    const existingGrade = await queryOne<{ id: number }>(
      'SELECT id FROM grades WHERE student_id = $1 AND course_id = $2 AND academic_year_id = $3',
      [sId, cId, ayId]
    )

    if (existingGrade) {
      // Update
      await query(
        `UPDATE grades SET
          tp_score = $1,
          td_score = $2,
          exam_score = $3,
          final_score = $4,
          grade_letter = $5,
          remarks = $6,
          is_validated = FALSE
         WHERE id = $7`,
        [tp, td, exam, calculatedFinal, calculatedLetter, remarks, existingGrade.id]
      )

      return NextResponse.json({
        success: true,
        gradeId: existingGrade.id,
        message: 'Note mise à jour avec succès'
      })
    } else {
      // Create
      const result = await queryOne<{ id: number }>(
        `INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, td_score, exam_score, final_score, grade_letter, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [sId, cId, ayId, tp, td, exam, calculatedFinal, calculatedLetter, remarks]
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
