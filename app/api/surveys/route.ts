/**
 * API Système de Feedback et Enquêtes
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Liste des enquêtes, réponses, statistiques
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const surveyId = searchParams.get('id')
    
    if (action === 'available') {
      // Enquêtes disponibles pour l'utilisateur
      const result = await query(`
        SELECT 
          s.*,
          CASE WHEN sr.id IS NOT NULL THEN true ELSE false END as already_responded
        FROM surveys s
        LEFT JOIN survey_responses sr ON sr.survey_id = s.id AND sr.user_id = $1
        WHERE s.status = 'PUBLISHED'
          AND s.start_date <= NOW()
          AND s.end_date >= NOW()
          AND (s.target_audience = 'ALL' OR s.target_audience = 
            (SELECT role FROM users WHERE id = $1))
        ORDER BY s.end_date ASC
      `, [userId])
      
      return NextResponse.json({ surveys: result.rows })
    }
    
    if (action === 'my_responses') {
      // Mes réponses
      const result = await query(`
        SELECT 
          sr.*,
          s.title,
          s.description
        FROM survey_responses sr
        JOIN surveys s ON sr.survey_id = s.id
        WHERE sr.user_id = $1
        ORDER BY sr.submitted_at DESC
      `, [userId])
      
      return NextResponse.json({ responses: result.rows })
    }
    
    if (action === 'stats' && surveyId) {
      // Statistiques d'une enquête
      const canView = await hasPermission(userId, 'VIEW_SURVEYS')
      if (!canView) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      // Info enquête
      const survey = await query(`SELECT * FROM surveys WHERE id = $1`, [surveyId])
      if (survey.rows.length === 0) {
        return NextResponse.json({ error: 'Enquête non trouvée' }, { status: 404 })
      }
      
      // Nombre total de réponses
      const totalResponses = await query(`
        SELECT COUNT(*) as count FROM survey_responses WHERE survey_id = $1
      `, [surveyId])
      
      // Statistiques par question
      const questions = survey.rows[0].questions || []
      const stats: any[] = []
      
      for (const question of questions) {
        const questionStats: any = {
          questionId: question.id,
          questionText: question.text,
          questionType: question.type
        }
        
        if (question.type === 'RATING' || question.type === 'SCALE') {
          // Moyenne pour les notes
          const avgResult = await query(`
            SELECT 
              AVG((answers->>'${question.id}')::numeric) as average,
              MIN((answers->>'${question.id}')::numeric) as min,
              MAX((answers->>'${question.id}')::numeric) as max
            FROM survey_responses
            WHERE survey_id = $1 AND answers ? '${question.id}'
          `, [surveyId])
          
          questionStats.average = parseFloat(avgResult.rows[0]?.average || '0').toFixed(2)
          questionStats.min = avgResult.rows[0]?.min
          questionStats.max = avgResult.rows[0]?.max
        } else if (question.type === 'CHOICE' || question.type === 'MULTIPLE_CHOICE') {
          // Distribution pour les choix
          const distribution = await query(`
            SELECT 
              answers->>'${question.id}' as choice,
              COUNT(*) as count
            FROM survey_responses
            WHERE survey_id = $1 AND answers ? '${question.id}'
            GROUP BY answers->>'${question.id}'
            ORDER BY count DESC
          `, [surveyId])
          
          questionStats.distribution = distribution.rows
        } else if (question.type === 'TEXT') {
          // Échantillon de réponses textuelles
          const textResponses = await query(`
            SELECT answers->>'${question.id}' as response
            FROM survey_responses
            WHERE survey_id = $1 AND answers ? '${question.id}'
            LIMIT 10
          `, [surveyId])
          
          questionStats.sampleResponses = textResponses.rows.map(r => r.response)
        }
        
        stats.push(questionStats)
      }
      
      return NextResponse.json({
        survey: survey.rows[0],
        totalResponses: parseInt(totalResponses.rows[0].count),
        questionStats: stats
      })
    }

    if (surveyId) {
      // Détail d'une enquête
      const result = await query(`SELECT * FROM surveys WHERE id = $1`, [surveyId])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Enquête non trouvée' }, { status: 404 })
      }
      
      // Vérifier si déjà répondu
      const response = await query(`
        SELECT id FROM survey_responses WHERE survey_id = $1 AND user_id = $2
      `, [surveyId, userId])
      
      return NextResponse.json({ 
        survey: result.rows[0],
        alreadyResponded: response.rows.length > 0
      })
    }
    
    // Liste de toutes les enquêtes (admin)
    const canManage = await hasPermission(userId, 'MANAGE_SURVEYS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const status = searchParams.get('status')
    const facultyId = searchParams.get('faculty_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    let queryStr = `
      SELECT 
        s.*,
        f.name as faculty_name,
        (SELECT COUNT(*) FROM survey_responses WHERE survey_id = s.id) as response_count
      FROM surveys s
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1
    
    if (status) {
      queryStr += ` AND s.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (facultyId) {
      queryStr += ` AND s.faculty_id = $${paramIndex}`
      params.push(facultyId)
      paramIndex++
    }
    
    const offset = (page - 1) * limit
    queryStr += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    
    const result = await query(queryStr, params)
    
    return NextResponse.json({ surveys: result.rows })
  } catch (error) {
    console.error('Erreur API enquêtes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer enquête, soumettre réponse
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const body = await request.json()
    const { action } = body
    
    if (action === 'respond') {
      // Soumettre une réponse
      const { surveyId, answers } = body
      
      if (!surveyId || !answers) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      // Vérifier l'enquête
      const survey = await query(`
        SELECT * FROM surveys 
        WHERE id = $1 AND status = 'PUBLISHED' 
          AND start_date <= NOW() AND end_date >= NOW()
      `, [surveyId])
      
      if (survey.rows.length === 0) {
        return NextResponse.json({ error: 'Enquête non disponible' }, { status: 404 })
      }
      
      // Vérifier si pas déjà répondu
      if (!survey.rows[0].is_anonymous) {
        const existing = await query(`
          SELECT id FROM survey_responses WHERE survey_id = $1 AND user_id = $2
        `, [surveyId, userId])
        
        if (existing.rows.length > 0) {
          return NextResponse.json({ error: 'Vous avez déjà répondu à cette enquête' }, { status: 400 })
        }
      }
      
      // Valider les réponses requises
      const questions = survey.rows[0].questions || []
      for (const q of questions) {
        if (q.required && !answers[q.id]) {
          return NextResponse.json({ 
            error: `La question "${q.text}" est obligatoire` 
          }, { status: 400 })
        }
      }
      
      // Enregistrer la réponse
      const result = await query(`
        INSERT INTO survey_responses (survey_id, user_id, answers)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [surveyId, survey.rows[0].is_anonymous ? null : userId, answers])
      
      return NextResponse.json({ 
        success: true, 
        responseId: result.rows[0].id,
        message: 'Merci pour votre participation!' 
      })
    }
    
    // Créer une enquête (admin/enseignant)
    const canManage = await hasPermission(userId, 'MANAGE_SURVEYS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const {
      title, description, surveyType, facultyId, departmentId, courseId,
      startDate, endDate, questions, targetAudience, isAnonymous
    } = body
    
    if (!title || !surveyType || !startDate || !endDate || !questions) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    // Valider les questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Au moins une question est requise' }, { status: 400 })
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.id) q.id = `q_${i + 1}`
      if (!q.text || !q.type) {
        return NextResponse.json({ 
          error: `Question ${i + 1}: texte et type requis` 
        }, { status: 400 })
      }
    }
    
    const result = await query(`
      INSERT INTO surveys (
        title, description, survey_type, faculty_id, department_id, course_id,
        created_by, start_date, end_date, questions, target_audience, is_anonymous
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      title, description, surveyType, facultyId, departmentId, courseId,
      userId, startDate, endDate, JSON.stringify(questions), 
      targetAudience || 'ALL', isAnonymous !== false
    ])
    
    return NextResponse.json({ 
      success: true, 
      survey: result.rows[0],
      message: 'Enquête créée avec succès' 
    })
  } catch (error) {
    console.error('Erreur création enquête:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour, publier, clôturer
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canManage = await hasPermission(userId, 'MANAGE_SURVEYS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { surveyId, action } = body
    
    if (!surveyId) {
      return NextResponse.json({ error: 'ID enquête manquant' }, { status: 400 })
    }
    
    const survey = await query(`SELECT * FROM surveys WHERE id = $1`, [surveyId])
    if (survey.rows.length === 0) {
      return NextResponse.json({ error: 'Enquête non trouvée' }, { status: 404 })
    }
    
    if (action === 'publish') {
      await query(`UPDATE surveys SET status = 'PUBLISHED' WHERE id = $1`, [surveyId])
      return NextResponse.json({ success: true, message: 'Enquête publiée' })
    }
    
    if (action === 'close') {
      await query(`UPDATE surveys SET status = 'CLOSED' WHERE id = $1`, [surveyId])
      return NextResponse.json({ success: true, message: 'Enquête clôturée' })
    }
    
    if (action === 'archive') {
      await query(`UPDATE surveys SET status = 'ARCHIVED' WHERE id = $1`, [surveyId])
      return NextResponse.json({ success: true, message: 'Enquête archivée' })
    }
    
    // Mise à jour générale
    const { title, description, startDate, endDate, questions, targetAudience } = body
    
    const updates: string[] = []
    const params: any[] = [surveyId]
    let paramIndex = 2
    
    if (title) {
      updates.push(`title = $${paramIndex}`)
      params.push(title)
      paramIndex++
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`)
      params.push(description)
      paramIndex++
    }
    if (startDate) {
      updates.push(`start_date = $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }
    if (endDate) {
      updates.push(`end_date = $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }
    if (questions) {
      updates.push(`questions = $${paramIndex}`)
      params.push(JSON.stringify(questions))
      paramIndex++
    }
    if (targetAudience) {
      updates.push(`target_audience = $${paramIndex}`)
      params.push(targetAudience)
      paramIndex++
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE surveys 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
    }
    
    return NextResponse.json({ success: true, message: 'Enquête mise à jour' })
  } catch (error) {
    console.error('Erreur mise à jour enquête:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une enquête
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canManage = await hasPermission(userId, 'MANAGE_SURVEYS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const surveyId = searchParams.get('id')
    
    if (!surveyId) {
      return NextResponse.json({ error: 'ID enquête manquant' }, { status: 400 })
    }
    
    // Vérifier qu'il n'y a pas de réponses
    const responses = await query(`
      SELECT COUNT(*) as count FROM survey_responses WHERE survey_id = $1
    `, [surveyId])
    
    if (parseInt(responses.rows[0].count) > 0) {
      return NextResponse.json({ 
        error: 'Impossible de supprimer une enquête avec des réponses. Archivez-la plutôt.' 
      }, { status: 400 })
    }
    
    await query(`DELETE FROM surveys WHERE id = $1`, [surveyId])
    
    return NextResponse.json({ success: true, message: 'Enquête supprimée' })
  } catch (error) {
    console.error('Erreur suppression enquête:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
