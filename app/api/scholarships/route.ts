/**
 * API Bourses - Programmes et candidatures
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Liste des programmes de bourses ou candidatures
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
    const programId = searchParams.get('programId')
    const applicationId = searchParams.get('applicationId')
    const myApplications = searchParams.get('myApplications')
    
    const canView = await hasPermission(userId, 'VIEW_SCHOLARSHIPS')

    // Voir ses propres candidatures
    if (myApplications === 'true') {
      const student = await query(`SELECT id FROM students WHERE user_id = $1`, [userId])
      
      if (student.rows.length === 0) {
        return NextResponse.json({ applications: [] })
      }
      
      const result = await query(`
        SELECT 
          sa.*,
          sp.name as program_name,
          sp.sponsor,
          sp.amount,
          sp.currency
        FROM scholarship_applications sa
        JOIN scholarship_programs sp ON sa.program_id = sp.id
        WHERE sa.student_id = $1
        ORDER BY sa.applied_at DESC
      `, [student.rows[0].id])
      
      return NextResponse.json({ applications: result.rows })
    }

    // Détail d'une candidature
    if (applicationId) {
      const canManage = await hasPermission(userId, 'MANAGE_SCHOLARSHIPS')
      
      const result = await query(`
        SELECT 
          sa.*,
          sp.name as program_name,
          sp.sponsor,
          sp.amount,
          sp.coverage_type,
          s.matricule,
          u.first_name,
          u.last_name,
          u.email,
          p.name as promotion_name,
          p.level,
          f.name as faculty_name
        FROM scholarship_applications sa
        JOIN scholarship_programs sp ON sa.program_id = sp.id
        JOIN students s ON sa.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN promotions p ON s.promotion_id = p.id
        JOIN departments d ON p.department_id = d.id
        JOIN faculties f ON d.faculty_id = f.id
        WHERE sa.id = $1
      `, [applicationId])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 })
      }
      
      // Vérifier l'accès
      const application = result.rows[0]
      const student = await query(`SELECT user_id FROM students WHERE id = $1`, [application.student_id])
      
      if (student.rows[0]?.user_id !== userId && !canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      return NextResponse.json({ application })
    }

    // Détail d'un programme
    if (programId) {
      const result = await query(`
        SELECT 
          sp.*,
          ay.name as academic_year_name,
          (SELECT COUNT(*) FROM scholarship_applications WHERE program_id = sp.id) as applications_count
        FROM scholarship_programs sp
        LEFT JOIN academic_years ay ON sp.academic_year_id = ay.id
        WHERE sp.id = $1
      `, [programId])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Programme non trouvé' }, { status: 404 })
      }
      
      return NextResponse.json({ program: result.rows[0] })
    }
    
    // Liste des programmes disponibles
    const now = new Date().toISOString().split('T')[0]
    
    const result = await query(`
      SELECT 
        sp.*,
        ay.name as academic_year_name,
        sp.slots_available - sp.slots_used as remaining_slots
      FROM scholarship_programs sp
      LEFT JOIN academic_years ay ON sp.academic_year_id = ay.id
      WHERE sp.is_active = TRUE
      ${!canView ? `AND sp.application_start <= '${now}' AND sp.application_end >= '${now}'` : ''}
      ORDER BY sp.application_end ASC
    `)
    
    return NextResponse.json({ programs: result.rows })
  } catch (error) {
    console.error('Erreur API bourses:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un programme ou soumettre une candidature
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
    
    if (action === 'apply') {
      // Soumettre une candidature (étudiant)
      const { programId, motivationLetter, documentsUrls, familyIncome, familySize, isOrphan, hasDisability } = body
      
      if (!programId) {
        return NextResponse.json({ error: 'ID programme manquant' }, { status: 400 })
      }
      
      // Récupérer l'étudiant
      const student = await query(`
        SELECT s.*, p.level,
          (SELECT AVG(g.final_score) FROM grades g WHERE g.student_id = s.id) as average
        FROM students s
        JOIN promotions p ON s.promotion_id = p.id
        WHERE s.user_id = $1
      `, [userId])
      
      if (student.rows.length === 0) {
        return NextResponse.json({ error: 'Profil étudiant non trouvé' }, { status: 400 })
      }
      
      const studentData = student.rows[0]
      
      // Vérifier le programme
      const program = await query(`SELECT * FROM scholarship_programs WHERE id = $1`, [programId])
      
      if (program.rows.length === 0) {
        return NextResponse.json({ error: 'Programme non trouvé' }, { status: 404 })
      }
      
      const prog = program.rows[0]
      
      // Vérifier les dates
      const now = new Date()
      if (prog.application_start && new Date(prog.application_start) > now) {
        return NextResponse.json({ error: 'Les candidatures ne sont pas encore ouvertes' }, { status: 400 })
      }
      if (prog.application_end && new Date(prog.application_end) < now) {
        return NextResponse.json({ error: 'Date limite dépassée' }, { status: 400 })
      }
      
      // Vérifier places disponibles
      if (prog.slots_available && prog.slots_used >= prog.slots_available) {
        return NextResponse.json({ error: 'Plus de places disponibles' }, { status: 400 })
      }
      
      // Vérifier éligibilité niveau
      if (prog.eligible_levels && !prog.eligible_levels.includes(studentData.level)) {
        return NextResponse.json({ error: 'Niveau non éligible pour cette bourse' }, { status: 400 })
      }
      
      // Vérifier moyenne minimale
      if (prog.min_average && studentData.average < prog.min_average) {
        return NextResponse.json({ 
          error: `Moyenne insuffisante (minimum: ${prog.min_average})` 
        }, { status: 400 })
      }
      
      // Vérifier candidature existante
      const existing = await query(`
        SELECT id FROM scholarship_applications 
        WHERE program_id = $1 AND student_id = $2
      `, [programId, studentData.id])
      
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Vous avez déjà candidaté à ce programme' }, { status: 400 })
      }
      
      // Créer la candidature
      const result = await query(`
        INSERT INTO scholarship_applications (
          program_id, student_id, motivation_letter, documents_urls,
          family_income, family_size, is_orphan, has_disability,
          academic_average, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
        RETURNING *
      `, [
        programId, studentData.id, motivationLetter, documentsUrls,
        familyIncome, familySize, isOrphan || false, hasDisability || false,
        studentData.average
      ])
      
      return NextResponse.json({ 
        success: true, 
        application: result.rows[0],
        message: 'Candidature soumise avec succès' 
      })
    }
    
    // Créer un programme (admin)
    const canManage = await hasPermission(userId, 'MANAGE_SCHOLARSHIPS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { 
      code, name, description, sponsor, amount, currency, coverageType,
      minAverage, maxIncome, eligibleLevels, eligibleFaculties,
      applicationStart, applicationEnd, academicYearId, slotsAvailable
    } = body
    
    if (!code || !name) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    const result = await query(`
      INSERT INTO scholarship_programs (
        code, name, description, sponsor, amount, currency, coverage_type,
        min_average, max_income, eligible_levels, eligible_faculties,
        application_start, application_end, academic_year_id, slots_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      code, name, description, sponsor, amount, currency || 'USD', coverageType,
      minAverage, maxIncome, eligibleLevels, eligibleFaculties,
      applicationStart, applicationEnd, academicYearId, slotsAvailable
    ])
    
    return NextResponse.json({ 
      success: true, 
      program: result.rows[0],
      message: 'Programme créé avec succès' 
    })
  } catch (error) {
    console.error('Erreur création bourse:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Traiter une candidature ou mettre à jour un programme
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId
    
    const canManage = await hasPermission(userId, 'MANAGE_SCHOLARSHIPS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { action } = body
    
    if (action === 'review') {
      // Traiter une candidature
      const { applicationId, status, decisionReason, score, rank } = body
      
      if (!applicationId || !status) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      const client = await getClient()
      
      try {
        await client.query('BEGIN')
        
        await client.query(`
          UPDATE scholarship_applications
          SET status = $2, decision_reason = $3, score = $4, rank = $5,
              reviewed_by = $6, reviewed_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `, [applicationId, status, decisionReason, score, rank, userId])
        
        // Si approuvé, incrémenter le compteur
        if (status === 'APPROVED') {
          await client.query(`
            UPDATE scholarship_programs sp
            SET slots_used = slots_used + 1
            FROM scholarship_applications sa
            WHERE sa.id = $1 AND sp.id = sa.program_id
          `, [applicationId])
        }
        
        // Notifier l'étudiant
        const app = await client.query(`
          SELECT s.user_id, sp.name as program_name
          FROM scholarship_applications sa
          JOIN students s ON sa.student_id = s.id
          JOIN scholarship_programs sp ON sa.program_id = sp.id
          WHERE sa.id = $1
        `, [applicationId])
        
        if (app.rows[0]) {
          const statusLabels: Record<string, string> = {
            'APPROVED': 'approuvée',
            'REJECTED': 'rejetée',
            'WAITLISTED': 'mise en liste d\'attente'
          }
          
          await client.query(`
            INSERT INTO notifications (user_id, title, message, type, link)
            VALUES ($1, $2, $3, $4, '/student/finances')
          `, [
            app.rows[0].user_id,
            'Résultat candidature bourse',
            `Votre candidature pour la bourse "${app.rows[0].program_name}" a été ${statusLabels[status] || status}.`,
            status === 'APPROVED' ? 'SUCCESS' : 'INFO'
          ])
        }
        
        await client.query('COMMIT')
        
        return NextResponse.json({ success: true, message: 'Candidature traitée' })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }
    
    // Mettre à jour un programme
    const { programId, name, description, applicationEnd, slotsAvailable, isActive } = body
    
    if (!programId) {
      return NextResponse.json({ error: 'ID programme manquant' }, { status: 400 })
    }
    
    const updates: string[] = []
    const params: any[] = [programId]
    let paramIndex = 2
    
    if (name) {
      updates.push(`name = $${paramIndex}`)
      params.push(name)
      paramIndex++
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`)
      params.push(description)
      paramIndex++
    }
    if (applicationEnd) {
      updates.push(`application_end = $${paramIndex}`)
      params.push(applicationEnd)
      paramIndex++
    }
    if (slotsAvailable !== undefined) {
      updates.push(`slots_available = $${paramIndex}`)
      params.push(slotsAvailable)
      paramIndex++
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`)
      params.push(isActive)
      paramIndex++
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE scholarship_programs 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
    }
    
    return NextResponse.json({ success: true, message: 'Programme mis à jour' })
  } catch (error) {
    console.error('Erreur mise à jour bourse:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
