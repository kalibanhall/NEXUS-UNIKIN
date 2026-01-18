/**
 * API LMS - Devoirs et soumissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Liste des devoirs ou détail
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
    const courseId = searchParams.get('courseId')
    const assignmentId = searchParams.get('id')
    const studentId = searchParams.get('studentId')
    
    const canView = await hasPermission(userId, 'VIEW_LMS')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (assignmentId) {
      // Détail d'un devoir
      const assignment = await query(`
        SELECT a.*, c.name as course_name, c.code as course_code
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE a.id = $1
      `, [assignmentId])
      
      if (assignment.rows.length === 0) {
        return NextResponse.json({ error: 'Devoir non trouvé' }, { status: 404 })
      }
      
      // Récupérer la soumission de l'utilisateur si c'est un étudiant
      const submission = await query(`
        SELECT asub.*
        FROM assignment_submissions asub
        JOIN students s ON asub.student_id = s.id
        WHERE asub.assignment_id = $1 AND s.user_id = $2
        ORDER BY asub.attempt_number DESC
        LIMIT 1
      `, [assignmentId, userId])
      
      return NextResponse.json({ 
        assignment: assignment.rows[0],
        submission: submission.rows[0] || null
      })
    }

    // Liste des devoirs d'un cours
    if (!courseId) {
      // Tous les devoirs de l'étudiant connecté
      const result = await query(`
        SELECT 
          a.*,
          c.name as course_name,
          c.code as course_code,
          asub.id as submission_id,
          asub.submitted_at,
          asub.score,
          asub.is_late
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id
        JOIN students s ON e.student_id = s.id
        LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = s.id
        WHERE s.user_id = $1 AND a.is_published = TRUE
        ORDER BY a.due_date ASC
      `, [userId])
      
      return NextResponse.json({ assignments: result.rows })
    }
    
    let queryStr = `
      SELECT 
        a.*,
        (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submissions_count
      FROM assignments a
      WHERE a.course_id = $1
    `
    const params: any[] = [parseInt(courseId)]
    
    // Si c'est un étudiant, ne montrer que les devoirs publiés
    const isStudent = decoded.role === 'STUDENT'
    if (isStudent) {
      queryStr += ` AND a.is_published = TRUE`
    }
    
    queryStr += ` ORDER BY a.due_date ASC`
    
    const result = await query(queryStr, params)
    
    return NextResponse.json({ assignments: result.rows })
  } catch (error) {
    console.error('Erreur API devoirs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un devoir ou soumettre une réponse
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
    
    if (action === 'submit') {
      // Soumettre un devoir (étudiant)
      const canSubmit = await hasPermission(userId, 'SUBMIT_ASSIGNMENTS')
      if (!canSubmit) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const { assignmentId, fileUrl, fileName, fileSize, content } = body
      
      if (!assignmentId) {
        return NextResponse.json({ error: 'ID devoir manquant' }, { status: 400 })
      }
      
      // Récupérer l'ID étudiant
      const student = await query(`
        SELECT id FROM students WHERE user_id = $1
      `, [userId])
      
      if (student.rows.length === 0) {
        return NextResponse.json({ error: 'Profil étudiant non trouvé' }, { status: 400 })
      }
      
      const studentId = student.rows[0].id
      
      // Vérifier le devoir
      const assignment = await query(`
        SELECT * FROM assignments WHERE id = $1
      `, [assignmentId])
      
      if (assignment.rows.length === 0) {
        return NextResponse.json({ error: 'Devoir non trouvé' }, { status: 404 })
      }
      
      const devoir = assignment.rows[0]
      const now = new Date()
      const dueDate = new Date(devoir.due_date)
      const lateDueDate = devoir.late_due_date ? new Date(devoir.late_due_date) : null
      
      // Vérifier les délais
      let isLate = now > dueDate
      if (!devoir.allow_late_submission && isLate) {
        return NextResponse.json({ error: 'Date limite dépassée' }, { status: 400 })
      }
      if (lateDueDate && now > lateDueDate) {
        return NextResponse.json({ error: 'Date limite de soumission tardive dépassée' }, { status: 400 })
      }
      
      // Vérifier le nombre de tentatives
      const attempts = await query(`
        SELECT COUNT(*) as count FROM assignment_submissions
        WHERE assignment_id = $1 AND student_id = $2
      `, [assignmentId, studentId])
      
      const attemptCount = parseInt(attempts.rows[0].count)
      if (attemptCount >= devoir.max_attempts) {
        return NextResponse.json({ error: 'Nombre maximum de tentatives atteint' }, { status: 400 })
      }
      
      // Créer la soumission
      const result = await query(`
        INSERT INTO assignment_submissions (
          assignment_id, student_id, file_url, file_name, file_size,
          content, is_late, attempt_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        assignmentId, studentId, fileUrl, fileName, fileSize,
        content, isLate, attemptCount + 1
      ])
      
      return NextResponse.json({ 
        success: true, 
        submission: result.rows[0],
        message: isLate ? 'Devoir soumis (en retard)' : 'Devoir soumis avec succès'
      })
    }
    
    // Créer un devoir (enseignant)
    const canManage = await hasPermission(userId, 'MANAGE_LMS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { 
      courseId, 
      moduleId,
      title, 
      description,
      instructions,
      assignmentType,
      maxScore,
      coefficient,
      availableFrom,
      dueDate,
      lateDueDate,
      allowLateSubmission,
      latePenaltyPercent,
      maxAttempts,
      isPublished
    } = body
    
    if (!courseId || !title || !dueDate || !assignmentType) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    const result = await query(`
      INSERT INTO assignments (
        course_id, module_id, title, description, instructions,
        assignment_type, max_score, coefficient, available_from, due_date,
        late_due_date, allow_late_submission, late_penalty_percent,
        max_attempts, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      courseId, moduleId, title, description, instructions,
      assignmentType, maxScore || 20, coefficient || 1, availableFrom, dueDate,
      lateDueDate, allowLateSubmission || false, latePenaltyPercent || 0,
      maxAttempts || 1, isPublished || false
    ])
    
    return NextResponse.json({ 
      success: true, 
      assignment: result.rows[0],
      message: 'Devoir créé avec succès' 
    })
  } catch (error) {
    console.error('Erreur création/soumission devoir:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Noter un devoir ou mettre à jour
export async function PUT(request: NextRequest) {
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
    
    if (action === 'grade') {
      // Noter une soumission
      const canGrade = await hasPermission(userId, 'GRADE_ASSIGNMENTS')
      if (!canGrade) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const { submissionId, score, feedback } = body
      
      if (!submissionId || score === undefined) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      await query(`
        UPDATE assignment_submissions
        SET score = $2, feedback = $3, graded_by = $4, graded_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [submissionId, score, feedback, userId])
      
      // Notifier l'étudiant
      const submission = await query(`
        SELECT s.user_id, a.title
        FROM assignment_submissions asub
        JOIN students s ON asub.student_id = s.id
        JOIN assignments a ON asub.assignment_id = a.id
        WHERE asub.id = $1
      `, [submissionId])
      
      if (submission.rows[0]) {
        await query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES ($1, 'Devoir noté', $2, 'SUCCESS', '/student/courses')
        `, [
          submission.rows[0].user_id,
          `Votre devoir "${submission.rows[0].title}" a été noté: ${score}/20`
        ])
      }
      
      return NextResponse.json({ success: true, message: 'Note enregistrée' })
    }
    
    // Mettre à jour un devoir
    const canManage = await hasPermission(userId, 'MANAGE_LMS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { id, title, description, dueDate, isPublished } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    
    const updates: string[] = []
    const params: any[] = [id]
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
    if (dueDate) {
      updates.push(`due_date = $${paramIndex}`)
      params.push(dueDate)
      paramIndex++
    }
    if (isPublished !== undefined) {
      updates.push(`is_published = $${paramIndex}`)
      params.push(isPublished)
      paramIndex++
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE assignments 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
    }
    
    return NextResponse.json({ success: true, message: 'Devoir mis à jour' })
  } catch (error) {
    console.error('Erreur mise à jour devoir:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un devoir
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canManage = await hasPermission(userId, 'MANAGE_LMS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    
    // Vérifier s'il y a des soumissions
    const submissions = await query(`
      SELECT COUNT(*) as count FROM assignment_submissions WHERE assignment_id = $1
    `, [id])
    
    if (parseInt(submissions.rows[0].count) > 0) {
      return NextResponse.json({ 
        error: 'Impossible de supprimer: des soumissions existent' 
      }, { status: 400 })
    }
    
    await query(`DELETE FROM assignments WHERE id = $1`, [id])
    
    return NextResponse.json({ success: true, message: 'Devoir supprimé' })
  } catch (error) {
    console.error('Erreur suppression devoir:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
