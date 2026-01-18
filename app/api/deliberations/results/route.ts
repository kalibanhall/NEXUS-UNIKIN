/**
 * API Résultats de Délibération
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Résultats d'une délibération
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
    const deliberationId = searchParams.get('deliberationId')
    const studentId = searchParams.get('studentId')
    
    const canView = await hasPermission(userId, 'VIEW_DELIBERATIONS')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (deliberationId) {
      // Résultats d'une délibération spécifique
      const result = await query(`
        SELECT 
          dr.*,
          s.matricule,
          u.first_name,
          u.last_name,
          p.name as promotion_name,
          p.level
        FROM deliberation_results dr
        JOIN students s ON dr.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN promotions p ON s.promotion_id = p.id
        WHERE dr.deliberation_id = $1
        ORDER BY dr.rank_in_promotion ASC NULLS LAST, dr.annual_average DESC
      `, [deliberationId])
      
      return NextResponse.json({ results: result.rows })
    }
    
    if (studentId) {
      // Historique des résultats d'un étudiant
      const result = await query(`
        SELECT 
          dr.*,
          d.name as deliberation_name,
          d.semester,
          d.session_type,
          d.status as deliberation_status,
          ay.name as academic_year_name
        FROM deliberation_results dr
        JOIN deliberations d ON dr.deliberation_id = d.id
        JOIN academic_years ay ON d.academic_year_id = ay.id
        WHERE dr.student_id = $1
        ORDER BY ay.start_date DESC, d.semester
      `, [studentId])
      
      return NextResponse.json({ results: result.rows })
    }
    
    return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 })
  } catch (error) {
    console.error('Erreur API résultats délibération:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Calculer et enregistrer les résultats
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canManage = await hasPermission(userId, 'MANAGE_DELIBERATIONS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { deliberationId } = body
    
    if (!deliberationId) {
      return NextResponse.json({ error: 'ID délibération manquant' }, { status: 400 })
    }
    
    const client = await getClient()
    
    try {
      await client.query('BEGIN')
      
      // Récupérer les infos de la délibération
      const delib = await client.query(`
        SELECT d.*, p.department_id
        FROM deliberations d
        JOIN promotions p ON d.promotion_id = p.id
        WHERE d.id = $1
      `, [deliberationId])
      
      if (delib.rows.length === 0) {
        throw new Error('Délibération non trouvée')
      }
      
      const { promotion_id, academic_year_id, semester } = delib.rows[0]
      
      // Calculer les résultats pour chaque étudiant
      const studentsResult = await client.query(`
        SELECT 
          s.id as student_id,
          COALESCE(AVG(g.final_score), 0) as average,
          COALESCE(SUM(CASE WHEN g.final_score >= 10 THEN c.credits ELSE 0 END), 0) as credits_obtained,
          COALESCE(SUM(c.credits), 0) as credits_required,
          COUNT(g.id) as courses_graded
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id AND e.academic_year_id = $2
        LEFT JOIN courses c ON e.course_id = c.id 
          AND ($3 = 0 OR c.semester = $3)
        LEFT JOIN grades g ON s.id = g.student_id AND g.course_id = c.id AND g.academic_year_id = $2
        WHERE s.promotion_id = $1 AND s.status = 'ACTIVE'
        GROUP BY s.id
      `, [promotion_id, academic_year_id, semester])
      
      // Supprimer les anciens résultats
      await client.query(`
        DELETE FROM deliberation_results WHERE deliberation_id = $1
      `, [deliberationId])
      
      // Insérer les nouveaux résultats
      const results = studentsResult.rows
        .map(s => ({
          ...s,
          decision: calculateDecision(s.average, s.credits_obtained, s.credits_required),
          mention: calculateMention(s.average)
        }))
        .sort((a, b) => b.average - a.average)
      
      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        await client.query(`
          INSERT INTO deliberation_results (
            deliberation_id, student_id, semester_average, credits_obtained,
            credits_required, decision, rank_in_promotion, mention
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          deliberationId,
          r.student_id,
          r.average,
          r.credits_obtained,
          r.credits_required,
          r.decision,
          i + 1,
          r.mention
        ])
      }
      
      // Mettre à jour le statut
      await client.query(`
        UPDATE deliberations SET status = 'COMPILED', updated_at = NOW()
        WHERE id = $1 AND status = 'DRAFT'
      `, [deliberationId])
      
      await client.query('COMMIT')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Résultats calculés',
        count: results.length
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Erreur calcul résultats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un résultat individuel
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canManage = await hasPermission(userId, 'MANAGE_DELIBERATIONS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { id, decision, remarks, mention } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    
    const updates: string[] = []
    const params: any[] = [id]
    let paramIndex = 2
    
    if (decision) {
      updates.push(`decision = $${paramIndex}`)
      params.push(decision)
      paramIndex++
    }
    if (remarks !== undefined) {
      updates.push(`remarks = $${paramIndex}`)
      params.push(remarks)
      paramIndex++
    }
    if (mention !== undefined) {
      updates.push(`mention = $${paramIndex}`)
      params.push(mention)
      paramIndex++
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE deliberation_results 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
      
      // Marquer la délibération comme ajustée
      await query(`
        UPDATE deliberations d
        SET status = 'ADJUSTED', updated_at = NOW()
        FROM deliberation_results dr
        WHERE dr.deliberation_id = d.id AND dr.id = $1
        AND d.status IN ('COMPILED', 'IN_SESSION')
      `, [id])
    }
    
    return NextResponse.json({ success: true, message: 'Résultat mis à jour' })
  } catch (error) {
    console.error('Erreur mise à jour résultat:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Fonctions utilitaires
function calculateDecision(average: number, creditsObtained: number, creditsRequired: number): string {
  const ratio = creditsRequired > 0 ? creditsObtained / creditsRequired : 0
  
  if (average >= 10 && ratio >= 1) {
    return 'ADMIS'
  } else if (average >= 10 && ratio >= 0.8) {
    return 'ADMIS_DETTE' // Admis avec dette de crédits
  } else if (average < 10 && average >= 8) {
    return 'AJOURNE' // Peut repasser en rattrapage
  } else {
    return 'EXCLUS'
  }
}

function calculateMention(average: number): string | null {
  if (average >= 18) return 'Excellent'
  if (average >= 16) return 'Très Bien'
  if (average >= 14) return 'Bien'
  if (average >= 12) return 'Assez Bien'
  if (average >= 10) return 'Passable'
  return null
}
