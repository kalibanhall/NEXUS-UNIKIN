import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// POST - Validate all grades for a course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { course_id, validated_by } = body

    if (!course_id) {
      return NextResponse.json(
        { error: 'Course ID requis' },
        { status: 400 }
      )
    }

    // Get current academic year
    const currentYear = await queryOne<{ id: number }>('SELECT id FROM academic_years WHERE is_current = TRUE')
    const academicYearId = currentYear?.id || 1

    // Update all grades for this course
    const result = await query(
      `UPDATE grades SET
        is_validated = TRUE,
        validated_by = $1,
        validated_at = CURRENT_TIMESTAMP
       WHERE course_id = $2 
         AND academic_year_id = $3
         AND final_score IS NOT NULL
         AND is_validated = FALSE
         AND student_id NOT IN (
           SELECT id FROM students WHERE payment_status = 'BLOCKED'
         )`,
      [validated_by || null, course_id, academicYearId]
    )

    return NextResponse.json({
      success: true,
      message: 'Notes validées avec succès'
    })
  } catch (error) {
    console.error('Error validating grades:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation des notes' },
      { status: 500 }
    )
  }
}
