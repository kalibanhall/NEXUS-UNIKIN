import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

/**
 * API pour la gestion des questions d'évaluation
 * 
 * Supporte tous les types de questions:
 * - MCQ: Question à choix multiple
 * - TRUE_FALSE: Vrai ou Faux
 * - SHORT_ANSWER: Réponse courte
 * - ESSAY: Rédaction longue
 * - MULTIPLE_SELECT: Choix multiples
 * - FILE_UPLOAD: Téléversement de fichier
 */

type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'MULTIPLE_SELECT' | 'FILE_UPLOAD'

interface QuestionOption {
  id: string
  text: string
  is_correct?: boolean
}

interface Question {
  id?: string
  evaluation_id: string
  question_text: string
  question_type: QuestionType
  options?: QuestionOption[]
  correct_answer?: string | string[]
  points: number
  order_index: number
  explanation?: string
  file_types_allowed?: string[] // Pour FILE_UPLOAD
  max_file_size?: number // En MB
}

// GET - Récupérer les questions d'une évaluation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const evaluationId = searchParams.get('evaluation_id')
    const questionId = searchParams.get('question_id')

    const client = await pool!.connect()

    try {
      if (questionId) {
        // Récupérer une question spécifique
        const result = await client.query(`
          SELECT * FROM evaluation_questions WHERE id = $1
        `, [questionId])

        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 })
        }

        return NextResponse.json({ question: result.rows[0] })
      }

      if (!evaluationId) {
        return NextResponse.json({ error: 'evaluation_id requis' }, { status: 400 })
      }

      // Récupérer toutes les questions de l'évaluation
      const result = await client.query(`
        SELECT eq.*
        FROM evaluation_questions eq
        WHERE eq.evaluation_id = $1
        ORDER BY eq.order_index ASC
      `, [evaluationId])

      // Parser les options JSON pour chaque question
      const questions = result.rows.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
        correct_answer: q.correct_answer ? JSON.parse(q.correct_answer) : null,
        file_types_allowed: q.file_types_allowed ? JSON.parse(q.file_types_allowed) : null
      }))

      return NextResponse.json({ questions })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une ou plusieurs questions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { evaluation_id, questions } = body

    if (!evaluation_id || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ 
        error: 'evaluation_id et questions (tableau) requis' 
      }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      await client.query('BEGIN')

      // Vérifier que l'évaluation existe
      const evalResult = await client.query(`
        SELECT id, status FROM evaluations WHERE id = $1
      `, [evaluation_id])

      if (evalResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Évaluation non trouvée' }, { status: 404 })
      }

      if (evalResult.rows[0].status !== 'DRAFT') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          error: 'Impossible de modifier les questions d\'une évaluation publiée' 
        }, { status: 400 })
      }

      const createdQuestions = []

      for (const question of questions) {
        // Validation
        const validationError = validateQuestion(question)
        if (validationError) {
          await client.query('ROLLBACK')
          return NextResponse.json({ error: validationError }, { status: 400 })
        }

        // Insérer la question
        const result: any = await client.query(`
          INSERT INTO evaluation_questions (
            evaluation_id, question_text, question_type, options,
            correct_answer, points, order_index, explanation,
            file_types_allowed, max_file_size
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `, [
          evaluation_id,
          question.question_text,
          question.question_type,
          question.options ? JSON.stringify(question.options) : null,
          question.correct_answer ? JSON.stringify(question.correct_answer) : null,
          question.points || 1,
          question.order_index || createdQuestions.length + 1,
          question.explanation || null,
          question.file_types_allowed ? JSON.stringify(question.file_types_allowed) : null,
          question.max_file_size || null
        ])

        createdQuestions.push(result.rows[0])
      }

      // Mettre à jour le nombre total de points de l'évaluation
      await updateTotalPoints(client, evaluation_id)

      await client.query('COMMIT')

      return NextResponse.json({ 
        message: `${createdQuestions.length} question(s) créée(s)`,
        questions: createdQuestions 
      }, { status: 201 })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une question
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { question_id, ...updateData } = body

    if (!question_id) {
      return NextResponse.json({ error: 'question_id requis' }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      await client.query('BEGIN')

      // Vérifier que la question existe et que l'évaluation est en brouillon
      const checkResult = await client.query(`
        SELECT eq.*, ev.status as evaluation_status
        FROM evaluation_questions eq
        JOIN evaluations ev ON eq.evaluation_id = ev.id
        WHERE eq.id = $1
      `, [question_id])

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 })
      }

      if (checkResult.rows[0].evaluation_status !== 'DRAFT') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          error: 'Impossible de modifier les questions d\'une évaluation publiée' 
        }, { status: 400 })
      }

      // Construire la mise à jour dynamiquement
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (updateData.question_text !== undefined) {
        updates.push(`question_text = $${paramIndex++}`)
        values.push(updateData.question_text)
      }

      if (updateData.question_type !== undefined) {
        updates.push(`question_type = $${paramIndex++}`)
        values.push(updateData.question_type)
      }

      if (updateData.options !== undefined) {
        updates.push(`options = $${paramIndex++}`)
        values.push(JSON.stringify(updateData.options))
      }

      if (updateData.correct_answer !== undefined) {
        updates.push(`correct_answer = $${paramIndex++}`)
        values.push(JSON.stringify(updateData.correct_answer))
      }

      if (updateData.points !== undefined) {
        updates.push(`points = $${paramIndex++}`)
        values.push(updateData.points)
      }

      if (updateData.order_index !== undefined) {
        updates.push(`order_index = $${paramIndex++}`)
        values.push(updateData.order_index)
      }

      if (updateData.explanation !== undefined) {
        updates.push(`explanation = $${paramIndex++}`)
        values.push(updateData.explanation)
      }

      if (updateData.file_types_allowed !== undefined) {
        updates.push(`file_types_allowed = $${paramIndex++}`)
        values.push(JSON.stringify(updateData.file_types_allowed))
      }

      if (updateData.max_file_size !== undefined) {
        updates.push(`max_file_size = $${paramIndex++}`)
        values.push(updateData.max_file_size)
      }

      if (updates.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
      }

      updates.push(`updated_at = NOW()`)
      values.push(question_id)

      const result = await client.query(`
        UPDATE evaluation_questions
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values)

      // Mettre à jour le nombre total de points si nécessaire
      if (updateData.points !== undefined) {
        await updateTotalPoints(client, checkResult.rows[0].evaluation_id)
      }

      await client.query('COMMIT')

      return NextResponse.json({ 
        message: 'Question mise à jour',
        question: result.rows[0] 
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une question
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('question_id')

    if (!questionId) {
      return NextResponse.json({ error: 'question_id requis' }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      await client.query('BEGIN')

      // Vérifier que la question existe et que l'évaluation est en brouillon
      const checkResult = await client.query(`
        SELECT eq.evaluation_id, ev.status as evaluation_status
        FROM evaluation_questions eq
        JOIN evaluations ev ON eq.evaluation_id = ev.id
        WHERE eq.id = $1
      `, [questionId])

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 })
      }

      if (checkResult.rows[0].evaluation_status !== 'DRAFT') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          error: 'Impossible de supprimer les questions d\'une évaluation publiée' 
        }, { status: 400 })
      }

      const evaluationId = checkResult.rows[0].evaluation_id

      // Supprimer la question
      await client.query(`
        DELETE FROM evaluation_questions WHERE id = $1
      `, [questionId])

      // Renuméroter les questions restantes
      await client.query(`
        WITH ordered_questions AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY order_index) as new_order
          FROM evaluation_questions
          WHERE evaluation_id = $1
        )
        UPDATE evaluation_questions eq
        SET order_index = oq.new_order
        FROM ordered_questions oq
        WHERE eq.id = oq.id
      `, [evaluationId])

      // Mettre à jour le nombre total de points
      await updateTotalPoints(client, evaluationId)

      await client.query('COMMIT')

      return NextResponse.json({ message: 'Question supprimée' })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Réordonner les questions
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { evaluation_id, question_order } = body

    if (!evaluation_id || !question_order || !Array.isArray(question_order)) {
      return NextResponse.json({ 
        error: 'evaluation_id et question_order (tableau d\'IDs) requis' 
      }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      await client.query('BEGIN')

      // Vérifier que l'évaluation existe et est en brouillon
      const evalResult = await client.query(`
        SELECT id, status FROM evaluations WHERE id = $1
      `, [evaluation_id])

      if (evalResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Évaluation non trouvée' }, { status: 404 })
      }

      if (evalResult.rows[0].status !== 'DRAFT') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          error: 'Impossible de modifier l\'ordre des questions d\'une évaluation publiée' 
        }, { status: 400 })
      }

      // Mettre à jour l'ordre des questions
      for (let i = 0; i < question_order.length; i++) {
        await client.query(`
          UPDATE evaluation_questions
          SET order_index = $1
          WHERE id = $2 AND evaluation_id = $3
        `, [i + 1, question_order[i], evaluation_id])
      }

      await client.query('COMMIT')

      return NextResponse.json({ message: 'Ordre des questions mis à jour' })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Valide une question avant insertion
 */
function validateQuestion(question: Partial<Question>): string | null {
  if (!question.question_text || question.question_text.trim().length === 0) {
    return 'Le texte de la question est requis'
  }

  if (!question.question_type) {
    return 'Le type de question est requis'
  }

  const validTypes: QuestionType[] = [
    'MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'MULTIPLE_SELECT', 'FILE_UPLOAD'
  ]

  if (!validTypes.includes(question.question_type as QuestionType)) {
    return `Type de question invalide. Types autorisés: ${validTypes.join(', ')}`
  }

  // Validation spécifique par type
  switch (question.question_type) {
    case 'MCQ':
    case 'MULTIPLE_SELECT':
      if (!question.options || question.options.length < 2) {
        return 'Les questions à choix (MCQ/MULTIPLE_SELECT) nécessitent au moins 2 options'
      }
      if (!question.options.some(o => o.is_correct)) {
        return 'Au moins une option doit être marquée comme correcte'
      }
      break

    case 'TRUE_FALSE':
      if (question.correct_answer === undefined) {
        return 'La réponse correcte (true/false) est requise'
      }
      break

    case 'FILE_UPLOAD':
      if (!question.file_types_allowed || question.file_types_allowed.length === 0) {
        return 'Les types de fichiers autorisés sont requis pour FILE_UPLOAD'
      }
      break
  }

  if (question.points !== undefined && question.points < 0) {
    return 'Les points ne peuvent pas être négatifs'
  }

  return null
}

/**
 * Met à jour le nombre total de points de l'évaluation
 */
async function updateTotalPoints(client: any, evaluationId: string) {
  await client.query(`
    UPDATE evaluations
    SET total_points = COALESCE((
      SELECT SUM(points) FROM evaluation_questions WHERE evaluation_id = $1
    ), 0)
    WHERE id = $1
  `, [evaluationId])
}
