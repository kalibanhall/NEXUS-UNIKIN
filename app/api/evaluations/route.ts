import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Types d'évaluation
type EvaluationType = 'EXAM' | 'QUIZ' | 'TP' | 'TD' | 'PROJECT' | 'HOMEWORK' | 'ORAL'

// GET - Récupérer les évaluations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const studentId = searchParams.get('student_id')
    const teacherId = searchParams.get('teacher_id')
    const evaluationId = searchParams.get('evaluation_id')

    const client = await pool.connect()

    try {
      // Évaluations disponibles pour un étudiant
      if (action === 'upcoming' && studentId) {
        const result = await client.query(`
          SELECT 
            ev.*,
            c.name as course_name,
            c.code as course_code,
            ea.status as attempt_status,
            ea.score,
            (SELECT COUNT(*) FROM evaluation_attempts WHERE evaluation_id = ev.id AND student_id = $1) as attempts_used
          FROM evaluations ev
          JOIN courses c ON ev.course_id = c.id
          JOIN enrollments e ON e.course_id = c.id AND e.student_id = $1
          LEFT JOIN evaluation_attempts ea ON ea.evaluation_id = ev.id AND ea.student_id = $1
          WHERE ev.is_published = TRUE
            AND (ev.status = 'SCHEDULED' OR ev.status = 'IN_PROGRESS')
          ORDER BY ev.start_time ASC
        `, [studentId])

        return NextResponse.json({ evaluations: result.rows })
      }

      // Évaluations terminées d'un étudiant
      if (action === 'completed' && studentId) {
        const result = await client.query(`
          SELECT 
            ev.*,
            c.name as course_name,
            c.code as course_code,
            ea.status as attempt_status,
            ea.score,
            ea.submitted_at,
            ea.plagiarism_score,
            CASE WHEN ea.score >= (ev.total_points * ev.passing_score / 100) THEN TRUE ELSE FALSE END as is_passed
          FROM evaluations ev
          JOIN courses c ON ev.course_id = c.id
          JOIN evaluation_attempts ea ON ea.evaluation_id = ev.id AND ea.student_id = $1
          WHERE ea.status IN ('SUBMITTED', 'GRADED')
          ORDER BY ea.submitted_at DESC
        `, [studentId])

        return NextResponse.json({ evaluations: result.rows })
      }

      // Évaluations d'un enseignant
      if (action === 'teacher' && teacherId) {
        const result = await client.query(`
          SELECT 
            ev.*,
            c.name as course_name,
            c.code as course_code,
            (SELECT COUNT(*) FROM evaluation_questions WHERE evaluation_id = ev.id) as questions_count,
            (SELECT COUNT(*) FROM evaluation_attempts WHERE evaluation_id = ev.id) as submissions_count,
            (SELECT COUNT(*) FROM evaluation_attempts WHERE evaluation_id = ev.id AND status = 'GRADED') as graded_count,
            (SELECT AVG(score) FROM evaluation_attempts WHERE evaluation_id = ev.id AND status = 'GRADED') as average_score
          FROM evaluations ev
          JOIN courses c ON ev.course_id = c.id
          WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = $1)
          ORDER BY ev.created_at DESC
        `, [teacherId])

        return NextResponse.json({ evaluations: result.rows })
      }

      // Détails d'une évaluation pour passage
      if (action === 'start' && evaluationId && studentId) {
        // Vérifier si l'étudiant peut passer l'évaluation
        const evalResult = await client.query(`
          SELECT ev.*, c.name as course_name
          FROM evaluations ev
          JOIN courses c ON ev.course_id = c.id
          WHERE ev.id = $1 AND ev.is_published = TRUE
        `, [evaluationId])

        if (evalResult.rows.length === 0) {
          return NextResponse.json({ error: 'Évaluation non trouvée' }, { status: 404 })
        }

        const evaluation = evalResult.rows[0]
        const now = new Date()
        const startTime = new Date(evaluation.start_time)
        const endTime = new Date(evaluation.end_time)

        if (now < startTime) {
          return NextResponse.json({ error: 'L\'évaluation n\'a pas encore commencé' }, { status: 400 })
        }

        if (now > endTime) {
          return NextResponse.json({ error: 'L\'évaluation est terminée' }, { status: 400 })
        }

        // Vérifier le nombre de tentatives
        const attemptsResult = await client.query(`
          SELECT COUNT(*) as count FROM evaluation_attempts
          WHERE evaluation_id = $1 AND student_id = $2
        `, [evaluationId, studentId])

        if (parseInt(attemptsResult.rows[0].count) >= evaluation.max_attempts) {
          return NextResponse.json({ error: 'Nombre maximum de tentatives atteint' }, { status: 400 })
        }

        // Récupérer les questions (sans les réponses correctes)
        const questionsResult = await client.query(`
          SELECT id, question_text, question_type, options, points, order_index
          FROM evaluation_questions
          WHERE evaluation_id = $1
          ORDER BY ${evaluation.shuffle_questions ? 'RANDOM()' : 'order_index'}
        `, [evaluationId])

        return NextResponse.json({
          evaluation: {
            id: evaluation.id,
            title: evaluation.title,
            instructions: evaluation.instructions,
            duration_minutes: evaluation.duration_minutes,
            total_points: evaluation.total_points,
            course_name: evaluation.course_name,
            requires_file_upload: evaluation.requires_file_upload,
            plagiarism_check: evaluation.plagiarism_check
          },
          questions: questionsResult.rows.map(q => ({
            ...q,
            options: evaluation.shuffle_options && q.options
              ? [...q.options].sort(() => Math.random() - 0.5)
              : q.options
          }))
        })
      }

      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Evaluations API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une évaluation ou démarrer une tentative
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const client = await pool.connect()

    try {
      // Créer une nouvelle évaluation
      if (action === 'create') {
        const {
          teacherId,
          title,
          description,
          evaluation_type,
          course_id,
          start_time,
          end_time,
          duration_minutes,
          total_points,
          passing_score,
          max_attempts,
          instructions,
          requires_file_upload,
          plagiarism_check,
          shuffle_questions,
          shuffle_options,
          show_results
        } = body

        const result = await client.query(`
          INSERT INTO evaluations (
            title, description, evaluation_type, course_id,
            start_time, end_time, duration_minutes, total_points,
            passing_score, max_attempts, instructions, requires_file_upload,
            plagiarism_check, shuffle_questions, shuffle_options, show_results,
            status, is_published
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'DRAFT', FALSE)
          RETURNING *
        `, [
          title, description, evaluation_type, course_id,
          start_time, end_time, duration_minutes, total_points,
          passing_score, max_attempts, instructions, requires_file_upload,
          plagiarism_check, shuffle_questions, shuffle_options, show_results
        ])

        return NextResponse.json({ evaluation: result.rows[0] })
      }

      // Démarrer une tentative
      if (action === 'start') {
        const { evaluationId, studentId } = body

        // Vérifier l'évaluation
        const evalResult = await client.query(`
          SELECT * FROM evaluations WHERE id = $1 AND is_published = TRUE
        `, [evaluationId])

        if (evalResult.rows.length === 0) {
          return NextResponse.json({ error: 'Évaluation non trouvée' }, { status: 404 })
        }

        const evaluation = evalResult.rows[0]
        const now = new Date()

        // Créer la tentative
        const attemptResult = await client.query(`
          INSERT INTO evaluation_attempts (
            evaluation_id, student_id, started_at, status
          ) VALUES ($1, $2, $3, 'IN_PROGRESS')
          RETURNING id
        `, [evaluationId, studentId, now])

        const attemptId = attemptResult.rows[0].id

        // Récupérer les questions
        const questionsResult = await client.query(`
          SELECT id, question_text, question_type, options, points, order_index
          FROM evaluation_questions
          WHERE evaluation_id = $1
          ORDER BY ${evaluation.shuffle_questions ? 'RANDOM()' : 'order_index'}
        `, [evaluationId])

        const endTime = new Date(evaluation.end_time)
        const timeRemaining = Math.min(
          evaluation.duration_minutes * 60 * 1000,
          endTime.getTime() - now.getTime()
        )

        return NextResponse.json({
          attempt_id: attemptId,
          questions: questionsResult.rows,
          time_remaining: timeRemaining
        })
      }

      // Soumettre une évaluation
      if (action === 'submit') {
        const { attemptId, answers } = body

        // Récupérer la tentative et l'évaluation
        const attemptResult = await client.query(`
          SELECT ea.*, ev.total_points, ev.passing_score, ev.show_results
          FROM evaluation_attempts ea
          JOIN evaluations ev ON ea.evaluation_id = ev.id
          WHERE ea.id = $1
        `, [attemptId])

        if (attemptResult.rows.length === 0) {
          return NextResponse.json({ error: 'Tentative non trouvée' }, { status: 404 })
        }

        const attempt = attemptResult.rows[0]

        // Récupérer les questions avec réponses correctes
        const questionsResult = await client.query(`
          SELECT id, correct_answer, points, question_type
          FROM evaluation_questions
          WHERE evaluation_id = $1
        `, [attempt.evaluation_id])

        interface EvalQuestion {
          id: string
          correct_answer: string | string[]
          points: number
          question_type: string
        }

        const questionsMap = new Map<string, EvalQuestion>(
          questionsResult.rows.map((q: EvalQuestion) => [q.id, q])
        )
        let totalScore = 0

        // Calculer le score
        for (const answer of answers) {
          const question = questionsMap.get(answer.questionId)
          if (!question) continue

          let isCorrect = false
          let pointsEarned = 0

          if (question.question_type === 'MCQ' || question.question_type === 'TRUE_FALSE') {
            isCorrect = answer.answer === question.correct_answer
          } else if (question.question_type === 'MULTIPLE_SELECT') {
            const studentAnswer = Array.isArray(answer.answer) ? answer.answer.sort() : []
            const correctAnswer = Array.isArray(question.correct_answer) ? question.correct_answer.sort() : []
            isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer)
          } else if (question.question_type === 'SHORT_ANSWER') {
            const studentAns = typeof answer.answer === 'string' ? answer.answer : ''
            const correctAns = typeof question.correct_answer === 'string' ? question.correct_answer : ''
            isCorrect = studentAns.toLowerCase().trim() === correctAns.toLowerCase().trim()
          }

          if (isCorrect) {
            pointsEarned = question.points
            totalScore += pointsEarned
          }

          // Enregistrer la réponse
          await client.query(`
            INSERT INTO evaluation_responses (
              attempt_id, question_id, student_answer, is_correct, points_earned
            ) VALUES ($1, $2, $3, $4, $5)
          `, [attemptId, answer.questionId, JSON.stringify(answer.answer), isCorrect, pointsEarned])
        }

        // Mettre à jour la tentative
        const isPassed = totalScore >= (attempt.total_points * attempt.passing_score / 100)
        const timeSpent = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000)

        await client.query(`
          UPDATE evaluation_attempts
          SET status = 'SUBMITTED', submitted_at = NOW(), score = $1, time_spent = $2
          WHERE id = $3
        `, [totalScore, timeSpent, attemptId])

        return NextResponse.json({
          score: attempt.show_results ? totalScore : undefined,
          total_points: attempt.total_points,
          is_passed: attempt.show_results ? isPassed : undefined,
          time_spent: timeSpent
        })
      }

      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Evaluations API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une évaluation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, evaluationId } = body

    const client = await pool.connect()

    try {
      // Publier une évaluation
      if (action === 'publish') {
        await client.query(`
          UPDATE evaluations
          SET is_published = TRUE, status = 'SCHEDULED'
          WHERE id = $1
        `, [evaluationId])

        return NextResponse.json({ success: true })
      }

      // Mettre à jour le statut
      if (action === 'update_status') {
        const { status } = body
        await client.query(`
          UPDATE evaluations
          SET status = $1
          WHERE id = $2
        `, [status, evaluationId])

        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Evaluations API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une évaluation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const evaluationId = searchParams.get('id')

    if (!evaluationId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Vérifier qu'il n'y a pas de soumissions
      const submissionsResult = await client.query(`
        SELECT COUNT(*) as count FROM evaluation_attempts WHERE evaluation_id = $1
      `, [evaluationId])

      if (parseInt(submissionsResult.rows[0].count) > 0) {
        return NextResponse.json({ 
          error: 'Impossible de supprimer: des soumissions existent' 
        }, { status: 400 })
      }

      // Supprimer les questions puis l'évaluation
      await client.query('DELETE FROM evaluation_questions WHERE evaluation_id = $1', [evaluationId])
      await client.query('DELETE FROM evaluations WHERE id = $1', [evaluationId])

      return NextResponse.json({ success: true })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Evaluations API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
