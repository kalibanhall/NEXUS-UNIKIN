import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { query, queryOne } from '@/lib/db'

interface Grade {
  studentId: number
  tpScore: number | null
  examScore: number | null
}

// POST - Enregistrer les notes en masse pour un cours
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, grades } = body as { courseId: number; grades: Grade[] }

    if (!courseId || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Vérifier que l'enseignant est bien affecté à ce cours
    const teacherAssignment = await queryOne<{ id: number }>(
      `SELECT ca.id FROM course_assignments ca
       JOIN teachers t ON ca.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE u.id = $1 AND ca.course_id = $2`,
      [session.userId, courseId]
    )

    if (!teacherAssignment) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à noter ce cours' },
        { status: 403 }
      )
    }

    // Obtenir l'année académique courante
    const currentYear = await queryOne<{ id: number }>(
      "SELECT id FROM academic_years WHERE is_current = true"
    )

    if (!currentYear) {
      return NextResponse.json(
        { error: 'Aucune année académique active' },
        { status: 400 }
      )
    }

    const savedGrades = []
    const errors = []

    for (const grade of grades) {
      try {
        const { studentId, tpScore, examScore } = grade

        // Calcul de la note finale: TP 30% + Exam 70%
        let finalScore: number | null = null
        if (tpScore !== null && examScore !== null) {
          finalScore = Math.round((tpScore * 0.3 + examScore * 0.7) * 100) / 100
        }

        // Calculer la lettre de la note
        let gradeLetter: string | null = null
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
          [studentId, courseId, currentYear.id]
        )

        if (existingGrade) {
          // Mettre à jour
          await query(
            `UPDATE grades SET
              tp_score = $1,
              exam_score = $2,
              final_score = $3,
              grade_letter = $4,
              is_validated = FALSE,
              updated_at = NOW()
             WHERE id = $5`,
            [tpScore, examScore, finalScore, gradeLetter, existingGrade.id]
          )
          savedGrades.push({ studentId, gradeId: existingGrade.id, action: 'updated' })
        } else {
          // Créer
          const result = await queryOne<{ id: number }>(
            `INSERT INTO grades (student_id, course_id, academic_year_id, tp_score, exam_score, final_score, grade_letter)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [studentId, courseId, currentYear.id, tpScore, examScore, finalScore, gradeLetter]
          )
          savedGrades.push({ studentId, gradeId: result?.id, action: 'created' })
        }
      } catch (err) {
        errors.push({ studentId: grade.studentId, error: 'Erreur lors de l\'enregistrement' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedGrades.length} notes enregistrées`,
      savedGrades,
      errors
    })

  } catch (error) {
    console.error('Error saving grades:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement des notes' },
      { status: 500 }
    )
  }
}

// GET - Obtenir les notes d'un cours pour un enseignant
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID du cours requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'enseignant est bien affecté à ce cours
    const teacherAssignment = await queryOne<{ id: number }>(
      `SELECT ca.id FROM course_assignments ca
       JOIN teachers t ON ca.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE u.id = $1 AND ca.course_id = $2`,
      [session.userId, courseId]
    )

    if (!teacherAssignment) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à voir ce cours' },
        { status: 403 }
      )
    }

    // Obtenir l'année académique courante
    const currentYear = await queryOne<{ id: number }>(
      "SELECT id FROM academic_years WHERE is_current = true"
    )

    // Obtenir les étudiants inscrits et leurs notes
    const students = await query(
      `SELECT 
        s.id as student_id,
        s.matricule,
        u.first_name,
        u.last_name,
        g.id as grade_id,
        g.tp_score,
        g.exam_score,
        g.final_score,
        g.grade_letter,
        g.is_validated
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN grades g ON g.student_id = s.id 
         AND g.course_id = $1 
         AND g.academic_year_id = $2
       WHERE e.course_id = $1 
         AND e.status = 'active'
       ORDER BY u.last_name, u.first_name`,
      [courseId, currentYear?.id]
    )

    return NextResponse.json(students)

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    )
  }
}
