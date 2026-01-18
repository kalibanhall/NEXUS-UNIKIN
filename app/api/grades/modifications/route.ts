/**
 * API Modifications de Notes
 * Avec traçabilité et notifications automatiques
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Historique des modifications de notes
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
    const gradeId = searchParams.get('gradeId')
    const deliberationId = searchParams.get('deliberationId')
    const studentId = searchParams.get('studentId')
    
    const canView = await hasPermission(userId, 'VIEW_GRADES')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    let queryStr = `
      SELECT 
        gm.*,
        g.student_id,
        s.matricule,
        u_student.first_name as student_first_name,
        u_student.last_name as student_last_name,
        c.code as course_code,
        c.name as course_name,
        u_modifier.first_name as modifier_first_name,
        u_modifier.last_name as modifier_last_name,
        u_approver.first_name as approver_first_name,
        u_approver.last_name as approver_last_name,
        d.name as deliberation_name
      FROM grade_modifications gm
      JOIN grades g ON gm.grade_id = g.id
      JOIN students s ON g.student_id = s.id
      JOIN users u_student ON s.user_id = u_student.id
      JOIN courses c ON g.course_id = c.id
      JOIN users u_modifier ON gm.modified_by = u_modifier.id
      LEFT JOIN users u_approver ON gm.approved_by = u_approver.id
      LEFT JOIN deliberations d ON gm.deliberation_id = d.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (gradeId) {
      queryStr += ` AND gm.grade_id = $${paramIndex}`
      params.push(parseInt(gradeId))
      paramIndex++
    }
    
    if (deliberationId) {
      queryStr += ` AND gm.deliberation_id = $${paramIndex}`
      params.push(parseInt(deliberationId))
      paramIndex++
    }
    
    if (studentId) {
      queryStr += ` AND g.student_id = $${paramIndex}`
      params.push(parseInt(studentId))
      paramIndex++
    }
    
    queryStr += ` ORDER BY gm.created_at DESC`
    
    const result = await query(queryStr, params)
    
    return NextResponse.json({ modifications: result.rows })
  } catch (error) {
    console.error('Erreur API modifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une modification de note
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    // Seul le secrétaire du jury ou admin peut modifier
    const canModify = await hasPermission(userId, 'MODIFY_GRADES')
    if (!canModify) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { 
      gradeId, 
      deliberationId,
      newTpScore,
      newTdScore,
      newExamScore,
      justification,
      modificationType
    } = body
    
    if (!gradeId || !justification || !modificationType) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    const client = await getClient()
    
    try {
      await client.query('BEGIN')
      
      // Récupérer la note actuelle
      const currentGrade = await client.query(`
        SELECT 
          g.*,
          c.teacher_id,
          t.user_id as teacher_user_id
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        LEFT JOIN teachers t ON c.teacher_id = t.id
        WHERE g.id = $1
      `, [gradeId])
      
      if (currentGrade.rows.length === 0) {
        throw new Error('Note non trouvée')
      }
      
      const grade = currentGrade.rows[0]
      
      // Calculer la nouvelle note finale
      const newFinalScore = calculateFinalScore(
        newTpScore ?? grade.tp_score,
        newTdScore ?? grade.td_score,
        newExamScore ?? grade.exam_score
      )
      
      // Enregistrer la modification
      const modResult = await client.query(`
        INSERT INTO grade_modifications (
          grade_id, deliberation_id,
          old_tp_score, old_td_score, old_exam_score, old_final_score,
          new_tp_score, new_td_score, new_exam_score, new_final_score,
          justification, modification_type, modified_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        gradeId,
        deliberationId,
        grade.tp_score,
        grade.td_score,
        grade.exam_score,
        grade.final_score,
        newTpScore ?? grade.tp_score,
        newTdScore ?? grade.td_score,
        newExamScore ?? grade.exam_score,
        newFinalScore,
        justification,
        modificationType,
        userId
      ])
      
      // Mettre à jour la note
      await client.query(`
        UPDATE grades 
        SET 
          tp_score = COALESCE($2, tp_score),
          td_score = COALESCE($3, td_score),
          exam_score = COALESCE($4, exam_score),
          final_score = $5,
          updated_at = NOW()
        WHERE id = $1
      `, [gradeId, newTpScore, newTdScore, newExamScore, newFinalScore])
      
      // Notifier l'enseignant concerné
      if (grade.teacher_user_id) {
        await client.query(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES ($1, $2, $3, 'WARNING', $4)
        `, [
          grade.teacher_user_id,
          'Modification de note',
          `Une note que vous avez saisie a été modifiée. Justification: ${justification}`,
          `/teacher/grades?gradeId=${gradeId}`
        ])
        
        // Marquer comme notifié
        await client.query(`
          UPDATE grade_modifications 
          SET teacher_notified = TRUE, teacher_notified_at = NOW()
          WHERE id = $1
        `, [modResult.rows[0].id])
      }
      
      // Si dans une délibération, notifier aussi le président
      if (deliberationId) {
        const delib = await client.query(`
          SELECT president_id FROM deliberations WHERE id = $1
        `, [deliberationId])
        
        if (delib.rows[0]?.president_id) {
          await client.query(`
            INSERT INTO notifications (user_id, title, message, type, link)
            VALUES ($1, $2, $3, 'INFO', $4)
          `, [
            delib.rows[0].president_id,
            'Ajustement de note en délibération',
            `Une note a été ajustée. Type: ${modificationType}. Justification: ${justification}`,
            `/admin/deliberation/${deliberationId}`
          ])
          
          await client.query(`
            UPDATE grade_modifications 
            SET president_notified = TRUE
            WHERE id = $1
          `, [modResult.rows[0].id])
        }
        
        // Marquer la délibération comme ajustée
        await client.query(`
          UPDATE deliberations 
          SET status = 'ADJUSTED', updated_at = NOW()
          WHERE id = $1 AND status IN ('COMPILED', 'IN_SESSION')
        `, [deliberationId])
      }
      
      await client.query('COMMIT')
      
      return NextResponse.json({ 
        success: true, 
        modificationId: modResult.rows[0].id,
        message: 'Note modifiée avec succès. Notifications envoyées.' 
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Erreur modification note:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Calcul de la note finale (pondération standard UNIKIN)
function calculateFinalScore(tp: number | null, td: number | null, exam: number | null): number {
  // Pondération: TP = 10%, TD = 20%, Examen = 70%
  const tpWeight = 0.10
  const tdWeight = 0.20
  const examWeight = 0.70
  
  let total = 0
  let totalWeight = 0
  
  if (tp !== null) {
    total += tp * tpWeight
    totalWeight += tpWeight
  }
  if (td !== null) {
    total += td * tdWeight
    totalWeight += tdWeight
  }
  if (exam !== null) {
    total += exam * examWeight
    totalWeight += examWeight
  }
  
  if (totalWeight === 0) return 0
  
  // Normaliser si tous les composants ne sont pas présents
  return Math.round((total / totalWeight) * 100) / 100
}
