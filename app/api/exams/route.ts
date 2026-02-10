import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// GET - Récupérer examens, quiz, et tentatives
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const courseId = searchParams.get('course_id')
    const examId = searchParams.get('exam_id')
    const studentId = searchParams.get('student_id')
    const teacherId = searchParams.get('teacher_id')

    const client = await pool!.connect()

    try {
      // Liste des examens disponibles pour un étudiant
      if (action === 'available' && studentId) {
        const result = await client.query(`
          SELECT 
            e.id,
            e.title,
            e.description,
            e.exam_type,
            e.start_time,
            e.end_time,
            e.duration_minutes,
            e.total_points,
            e.passing_score,
            e.max_attempts,
            e.is_published,
            e.instructions,
            c.code as course_code,
            c.name as course_name,
            COALESCE(attempts.count, 0) as attempts_used,
            COALESCE(attempts.best_score, 0) as best_score,
            CASE 
              WHEN NOW() < e.start_time THEN 'UPCOMING'
              WHEN NOW() > e.end_time THEN 'CLOSED'
              WHEN COALESCE(attempts.count, 0) >= e.max_attempts THEN 'MAX_ATTEMPTS'
              ELSE 'AVAILABLE'
            END as availability_status
          FROM exams e
          JOIN courses c ON e.course_id = c.id
          JOIN enrollments enr ON c.id = enr.course_id
          LEFT JOIN (
            SELECT 
              exam_id, 
              COUNT(*) as count,
              MAX(score) as best_score
            FROM exam_attempts
            WHERE student_id = $1
            GROUP BY exam_id
          ) attempts ON e.id = attempts.exam_id
          WHERE enr.student_id = $1
            AND e.is_published = true
            AND e.deleted_at IS NULL
          ORDER BY e.start_time DESC
        `, [studentId])

        return NextResponse.json({ exams: result.rows })
      }

      // Examens créés par un enseignant
      if (action === 'my_exams' && teacherId) {
        const result = await client.query(`
          SELECT 
            e.*,
            c.code as course_code,
            c.name as course_name,
            (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as questions_count,
            (SELECT COUNT(DISTINCT student_id) FROM exam_attempts WHERE exam_id = e.id) as participants_count
          FROM exams e
          JOIN courses c ON e.course_id = c.id
          WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = $1)
            AND e.deleted_at IS NULL
          ORDER BY e.created_at DESC
        `, [teacherId])

        return NextResponse.json({ exams: result.rows })
      }

      // Détails d'un examen avec questions (pour passer l'examen)
      if (action === 'start' && examId && studentId) {
        // Vérifier si l'étudiant peut passer l'examen
        const examCheck = await client.query(`
          SELECT 
            e.*,
            c.name as course_name,
            COALESCE(attempts.count, 0) as attempts_used
          FROM exams e
          JOIN courses c ON e.course_id = c.id
          JOIN enrollments enr ON c.id = enr.course_id AND enr.student_id = $2
          LEFT JOIN (
            SELECT exam_id, COUNT(*) as count
            FROM exam_attempts
            WHERE student_id = $2
            GROUP BY exam_id
          ) attempts ON e.id = attempts.exam_id
          WHERE e.id = $1
            AND e.is_published = true
        `, [examId, studentId])

        if (examCheck.rows.length === 0) {
          return NextResponse.json({ error: 'Examen non trouvé ou non autorisé' }, { status: 404 })
        }

        const exam = examCheck.rows[0]
        const now = new Date()
        const startTime = new Date(exam.start_time)
        const endTime = new Date(exam.end_time)

        if (now < startTime) {
          return NextResponse.json({ error: "L'examen n'a pas encore commencé" }, { status: 400 })
        }

        if (now > endTime) {
          return NextResponse.json({ error: "L'examen est terminé" }, { status: 400 })
        }

        if (exam.attempts_used >= exam.max_attempts) {
          return NextResponse.json({ error: 'Nombre maximum de tentatives atteint' }, { status: 400 })
        }

        // Créer une nouvelle tentative
        const attemptResult = await client.query(`
          INSERT INTO exam_attempts (exam_id, student_id, started_at)
          VALUES ($1, $2, NOW())
          RETURNING id
        `, [examId, studentId])

        const attemptId = attemptResult.rows[0].id

        // Récupérer les questions (sans les réponses correctes)
        const questionsResult = await client.query(`
          SELECT 
            id,
            question_text,
            question_type,
            options,
            points,
            order_index,
            image_url
          FROM exam_questions
          WHERE exam_id = $1
          ORDER BY order_index
        `, [examId])

        // Si c'est un quiz avec ordre aléatoire
        let questions = questionsResult.rows
        if (exam.shuffle_questions) {
          questions = questions.sort(() => Math.random() - 0.5)
        }

        return NextResponse.json({
          exam: {
            id: exam.id,
            title: exam.title,
            instructions: exam.instructions,
            duration_minutes: exam.duration_minutes,
            total_points: exam.total_points,
            course_name: exam.course_name
          },
          attempt_id: attemptId,
          questions: questions.map((q: { correct_answer?: string | string[], options?: string[], [key: string]: unknown }) => ({
            ...q,
            options: exam.shuffle_options && q.options
              ? [...q.options].sort(() => Math.random() - 0.5)
              : q.options
          })),
          time_remaining: Math.min(
            exam.duration_minutes * 60 * 1000,
            endTime.getTime() - now.getTime()
          )
        })
      }

      // Résultats d'une tentative
      if (action === 'result' && examId) {
        const attemptId = searchParams.get('attempt_id')
        
        const result = await client.query(`
          SELECT 
            ea.*,
            e.title as exam_title,
            e.total_points,
            e.passing_score,
            e.show_correct_answers,
            c.name as course_name
          FROM exam_attempts ea
          JOIN exams e ON ea.exam_id = e.id
          JOIN courses c ON e.course_id = c.id
          WHERE ea.id = $1 AND ea.exam_id = $2
        `, [attemptId, examId])

        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Tentative non trouvée' }, { status: 404 })
        }

        const attempt = result.rows[0]

        // Récupérer les réponses avec correction si autorisé
        let answers: any[] = []
        if (attempt.show_correct_answers) {
          const answersResult = await client.query(`
            SELECT 
              ear.*,
              eq.question_text,
              eq.correct_answer,
              eq.explanation
            FROM exam_attempt_responses ear
            JOIN exam_questions eq ON ear.question_id = eq.id
            WHERE ear.attempt_id = $1
            ORDER BY eq.order_index
          `, [attemptId])
          answers = answersResult.rows
        }

        return NextResponse.json({
          result: {
            ...attempt,
            is_passed: attempt.score >= attempt.passing_score,
            percentage: Math.round((attempt.score / attempt.total_points) * 100)
          },
          answers
        })
      }

      // Statistiques d'un examen (pour enseignant)
      if (action === 'statistics' && examId) {
        const statsResult = await client.query(`
          SELECT 
            COUNT(DISTINCT student_id) as total_participants,
            AVG(score) as average_score,
            MAX(score) as highest_score,
            MIN(score) as lowest_score,
            COUNT(CASE WHEN score >= e.passing_score THEN 1 END) as passed_count,
            COUNT(*) as total_attempts
          FROM exam_attempts ea
          JOIN exams e ON ea.exam_id = e.id
          WHERE ea.exam_id = $1 AND ea.submitted_at IS NOT NULL
          GROUP BY e.id
        `, [examId])

        // Distribution des scores
        const distributionResult = await client.query(`
          SELECT 
            FLOOR(score / 10) * 10 as score_range,
            COUNT(*) as count
          FROM exam_attempts
          WHERE exam_id = $1 AND submitted_at IS NOT NULL
          GROUP BY FLOOR(score / 10) * 10
          ORDER BY score_range
        `, [examId])

        // Résultats par question
        const questionsStats = await client.query(`
          SELECT 
            eq.id,
            eq.question_text,
            eq.points,
            COUNT(ear.id) as total_responses,
            COUNT(CASE WHEN ear.is_correct THEN 1 END) as correct_count,
            ROUND(COUNT(CASE WHEN ear.is_correct THEN 1 END)::numeric / NULLIF(COUNT(ear.id), 0) * 100, 1) as success_rate
          FROM exam_questions eq
          LEFT JOIN exam_attempt_responses ear ON eq.id = ear.question_id
          WHERE eq.exam_id = $1
          GROUP BY eq.id
          ORDER BY eq.order_index
        `, [examId])

        return NextResponse.json({
          statistics: statsResult.rows[0] || {},
          distribution: distributionResult.rows,
          questions_stats: questionsStats.rows
        })
      }

      // Liste par défaut (pour admin)
      const result = await client.query(`
        SELECT 
          e.*,
          c.code as course_code,
          c.name as course_name,
          t.first_name || ' ' || t.last_name as teacher_name
        FROM exams e
        JOIN courses c ON e.course_id = c.id
        JOIN teachers t ON c.teacher_id = t.id
        WHERE e.deleted_at IS NULL
        ORDER BY e.created_at DESC
        LIMIT 100
      `)

      return NextResponse.json({ exams: result.rows })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Créer un examen ou soumettre une tentative
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const client = await pool!.connect()

    try {
      await client.query('BEGIN')

      // Créer un nouvel examen
      if (action === 'create') {
        const {
          courseId,
          title,
          description,
          examType,
          startTime,
          endTime,
          durationMinutes,
          totalPoints,
          passingScore,
          maxAttempts,
          instructions,
          shuffleQuestions,
          shuffleOptions,
          showCorrectAnswers,
          questions
        } = body

        const examResult = await client.query(`
          INSERT INTO exams (
            course_id, title, description, exam_type,
            start_time, end_time, duration_minutes,
            total_points, passing_score, max_attempts,
            instructions, shuffle_questions, shuffle_options,
            show_correct_answers, is_published
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false)
          RETURNING id
        `, [
          courseId, title, description, examType || 'EXAM',
          startTime, endTime, durationMinutes,
          totalPoints, passingScore || 50, maxAttempts || 1,
          instructions, shuffleQuestions || false, shuffleOptions || false,
          showCorrectAnswers || false
        ])

        const examId = examResult.rows[0].id

        // Ajouter les questions
        if (questions && questions.length > 0) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            await client.query(`
              INSERT INTO exam_questions (
                exam_id, question_text, question_type, options,
                correct_answer, points, order_index, explanation, image_url
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              examId, q.questionText, q.questionType, JSON.stringify(q.options || []),
              q.correctAnswer, q.points || 1, i + 1, q.explanation, q.imageUrl
            ])
          }
        }

        await client.query('COMMIT')

        return NextResponse.json({
          success: true,
          message: 'Examen créé avec succès',
          exam_id: examId
        })
      }

      // Soumettre une tentative
      if (action === 'submit') {
        const { attemptId, answers, studentId } = body

        // Vérifier la tentative
        const attemptCheck = await client.query(`
          SELECT 
            ea.*,
            e.duration_minutes,
            e.end_time
          FROM exam_attempts ea
          JOIN exams e ON ea.exam_id = e.id
          WHERE ea.id = $1 AND ea.student_id = $2 AND ea.submitted_at IS NULL
        `, [attemptId, studentId])

        if (attemptCheck.rows.length === 0) {
          await client.query('ROLLBACK')
          return NextResponse.json({ error: 'Tentative invalide ou déjà soumise' }, { status: 400 })
        }

        const attempt = attemptCheck.rows[0]
        const startedAt = new Date(attempt.started_at)
        const now = new Date()
        const elapsed = (now.getTime() - startedAt.getTime()) / 1000 / 60

        // Vérifier si le temps n'est pas dépassé (avec 2 min de tolérance)
        if (elapsed > attempt.duration_minutes + 2) {
          // Marquer comme auto-soumis
        }

        // Récupérer les questions et corriger
        const questionsResult = await client.query(`
          SELECT id, correct_answer, points, question_type
          FROM exam_questions
          WHERE exam_id = $1
        `, [attempt.exam_id])

        interface ExamQuestion {
          id: string
          correct_answer: string | string[]
          points: number
          question_type: string
        }

        const questionsMap = new Map<string, ExamQuestion>(
          questionsResult.rows.map((q: ExamQuestion) => [q.id, q])
        )
        let totalScore = 0

        // Enregistrer les réponses
        for (const answer of answers) {
          const question = questionsMap.get(answer.questionId)
          if (!question) continue

          let isCorrect = false
          let pointsEarned = 0

          // Vérifier la réponse selon le type
          if (question.question_type === 'MCQ' || question.question_type === 'TRUE_FALSE') {
            isCorrect = answer.answer === question.correct_answer
          } else if (question.question_type === 'MULTIPLE_SELECT') {
            // Pour sélection multiple, comparer les tableaux triés
            const studentAnswer = Array.isArray(answer.answer) ? answer.answer.sort() : []
            const correctAnswer = Array.isArray(question.correct_answer) ? question.correct_answer.sort() : []
            isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer)
          } else if (question.question_type === 'SHORT_ANSWER') {
            // Comparaison insensible à la casse
            const studentAns = typeof answer.answer === 'string' ? answer.answer : ''
            const correctAns = typeof question.correct_answer === 'string' ? question.correct_answer : ''
            isCorrect = studentAns.toLowerCase().trim() === correctAns.toLowerCase().trim()
          }
          // Pour ESSAY, la correction est manuelle

          if (isCorrect) {
            pointsEarned = question.points
            totalScore += pointsEarned
          }

          await client.query(`
            INSERT INTO exam_attempt_responses (
              attempt_id, question_id, student_answer, is_correct, points_earned
            ) VALUES ($1, $2, $3, $4, $5)
          `, [attemptId, answer.questionId, JSON.stringify(answer.answer), isCorrect, pointsEarned])
        }

        // Mettre à jour la tentative
        await client.query(`
          UPDATE exam_attempts
          SET submitted_at = NOW(), score = $1, time_spent_minutes = $2
          WHERE id = $3
        `, [totalScore, Math.round(elapsed), attemptId])

        await client.query('COMMIT')

        return NextResponse.json({
          success: true,
          message: 'Examen soumis avec succès',
          score: totalScore,
          time_spent: Math.round(elapsed)
        })
      }

      // Ajouter une question
      if (action === 'add_question') {
        const { examId, questionText, questionType, options, correctAnswer, points, explanation, imageUrl } = body

        // Récupérer le prochain index
        const orderResult = await client.query(`
          SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
          FROM exam_questions WHERE exam_id = $1
        `, [examId])

        const nextOrder = orderResult.rows[0].next_order

        const result = await client.query(`
          INSERT INTO exam_questions (
            exam_id, question_text, question_type, options,
            correct_answer, points, order_index, explanation, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          examId, questionText, questionType, JSON.stringify(options || []),
          correctAnswer, points || 1, nextOrder, explanation, imageUrl
        ])

        await client.query('COMMIT')

        return NextResponse.json({
          success: true,
          question_id: result.rows[0].id
        })
      }

      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in exam POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Modifier un examen
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, examId } = body

    const client = await pool!.connect()

    try {
      await client.query('BEGIN')

      // Publier/Dépublier un examen
      if (action === 'toggle_publish') {
        await client.query(`
          UPDATE exams SET is_published = NOT is_published WHERE id = $1
        `, [examId])

        await client.query('COMMIT')
        return NextResponse.json({ success: true })
      }

      // Mettre à jour les infos d'un examen
      if (action === 'update') {
        const { title, description, startTime, endTime, durationMinutes, instructions, passingScore, maxAttempts } = body

        await client.query(`
          UPDATE exams
          SET 
            title = COALESCE($2, title),
            description = COALESCE($3, description),
            start_time = COALESCE($4, start_time),
            end_time = COALESCE($5, end_time),
            duration_minutes = COALESCE($6, duration_minutes),
            instructions = COALESCE($7, instructions),
            passing_score = COALESCE($8, passing_score),
            max_attempts = COALESCE($9, max_attempts),
            updated_at = NOW()
          WHERE id = $1
        `, [examId, title, description, startTime, endTime, durationMinutes, instructions, passingScore, maxAttempts])

        await client.query('COMMIT')
        return NextResponse.json({ success: true })
      }

      // Noter une réponse (pour questions ouvertes)
      if (action === 'grade_response') {
        const { responseId, pointsEarned, feedback } = body

        await client.query(`
          UPDATE exam_attempt_responses
          SET points_earned = $2, feedback = $3, is_correct = ($2 > 0)
          WHERE id = $1
        `, [responseId, pointsEarned, feedback])

        // Recalculer le score total
        const attemptResult = await client.query(`
          SELECT attempt_id FROM exam_attempt_responses WHERE id = $1
        `, [responseId])

        if (attemptResult.rows.length > 0) {
          await client.query(`
            UPDATE exam_attempts ea
            SET score = (
              SELECT COALESCE(SUM(points_earned), 0)
              FROM exam_attempt_responses
              WHERE attempt_id = ea.id
            )
            WHERE id = $1
          `, [attemptResult.rows[0].attempt_id])
        }

        await client.query('COMMIT')
        return NextResponse.json({ success: true })
      }

      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in exam PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Supprimer un examen ou une question
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('exam_id')
    const questionId = searchParams.get('question_id')

    const client = await pool!.connect()

    try {
      if (questionId) {
        await client.query(`DELETE FROM exam_questions WHERE id = $1`, [questionId])
      } else if (examId) {
        // Soft delete
        await client.query(`UPDATE exams SET deleted_at = NOW() WHERE id = $1`, [examId])
      }

      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
