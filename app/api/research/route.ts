/**
 * API Recherche Scientifique - SGR
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Projets de recherche, publications, thèses
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
    const type = searchParams.get('type') // projects, publications, theses
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const facultyId = searchParams.get('faculty_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    const canView = await hasPermission(userId, 'VIEW_RESEARCH')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // ===== PROJETS DE RECHERCHE =====
    if (type === 'projects') {
      if (id) {
        // Détail d'un projet
        const result = await query(`
          SELECT 
            rp.*,
            f.name as faculty_name,
            d.name as department_name,
            (
              SELECT json_agg(json_build_object(
                'id', u.id,
                'name', u.first_name || ' ' || u.last_name,
                'role', rpm.role
              ))
              FROM research_project_members rpm
              JOIN users u ON rpm.researcher_id = u.id
              WHERE rpm.project_id = rp.id
            ) as members
          FROM research_projects rp
          LEFT JOIN faculties f ON rp.faculty_id = f.id
          LEFT JOIN departments d ON rp.department_id = d.id
          WHERE rp.id = $1
        `, [id])
        
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
        }
        
        return NextResponse.json({ project: result.rows[0] })
      }
      
      // Liste des projets
      let queryStr = `
        SELECT 
          rp.*,
          f.name as faculty_name,
          (SELECT COUNT(*) FROM research_project_members WHERE project_id = rp.id) as member_count
        FROM research_projects rp
        LEFT JOIN faculties f ON rp.faculty_id = f.id
        WHERE 1=1
      `
      const params: any[] = []
      let paramIndex = 1
      
      if (status) {
        queryStr += ` AND rp.status = $${paramIndex}`
        params.push(status)
        paramIndex++
      }
      if (facultyId) {
        queryStr += ` AND rp.faculty_id = $${paramIndex}`
        params.push(facultyId)
        paramIndex++
      }
      
      queryStr += ` ORDER BY rp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)
      
      const result = await query(queryStr, params)
      return NextResponse.json({ projects: result.rows })
    }

    // ===== PUBLICATIONS =====
    if (type === 'publications') {
      if (id) {
        const result = await query(`
          SELECT * FROM research_publications WHERE id = $1
        `, [id])
        
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Publication non trouvée' }, { status: 404 })
        }
        
        return NextResponse.json({ publication: result.rows[0] })
      }
      
      // Liste des publications
      const publicationType = searchParams.get('publication_type')
      const year = searchParams.get('year')
      
      let queryStr = `
        SELECT rp.*, f.name as faculty_name
        FROM research_publications rp
        LEFT JOIN faculties f ON rp.faculty_id = f.id
        WHERE 1=1
      `
      const params: any[] = []
      let paramIndex = 1
      
      if (publicationType) {
        queryStr += ` AND rp.publication_type = $${paramIndex}`
        params.push(publicationType)
        paramIndex++
      }
      if (year) {
        queryStr += ` AND rp.publication_year = $${paramIndex}`
        params.push(parseInt(year))
        paramIndex++
      }
      if (facultyId) {
        queryStr += ` AND rp.faculty_id = $${paramIndex}`
        params.push(facultyId)
        paramIndex++
      }
      
      queryStr += ` ORDER BY rp.publication_date DESC NULLS LAST, rp.created_at DESC 
                    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)
      
      const result = await query(queryStr, params)
      return NextResponse.json({ publications: result.rows })
    }

    // ===== THÈSES ET MÉMOIRES =====
    if (type === 'theses') {
      if (id) {
        const result = await query(`
          SELECT 
            t.*,
            s.first_name || ' ' || s.last_name as student_name,
            s.matricule as student_matricule,
            sup.first_name || ' ' || sup.last_name as supervisor_name,
            f.name as faculty_name,
            d.name as department_name,
            p.name as promotion_name
          FROM theses t
          LEFT JOIN students st ON t.student_id = st.id
          LEFT JOIN users s ON st.user_id = s.id
          LEFT JOIN users sup ON t.supervisor_id = sup.id
          LEFT JOIN faculties f ON t.faculty_id = f.id
          LEFT JOIN departments d ON t.department_id = d.id
          LEFT JOIN promotions p ON t.promotion_id = p.id
          WHERE t.id = $1
        `, [id])
        
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'Thèse non trouvée' }, { status: 404 })
        }
        
        return NextResponse.json({ thesis: result.rows[0] })
      }
      
      // Liste des thèses
      const thesisType = searchParams.get('thesis_type') // LICENCE, MASTER, DOCTORAT
      const academicYear = searchParams.get('academic_year')
      
      let queryStr = `
        SELECT 
          t.*,
          s.first_name || ' ' || s.last_name as student_name,
          sup.first_name || ' ' || sup.last_name as supervisor_name,
          f.name as faculty_name
        FROM theses t
        LEFT JOIN students st ON t.student_id = st.id
        LEFT JOIN users s ON st.user_id = s.id
        LEFT JOIN users sup ON t.supervisor_id = sup.id
        LEFT JOIN faculties f ON t.faculty_id = f.id
        WHERE 1=1
      `
      const params: any[] = []
      let paramIndex = 1
      
      if (thesisType) {
        queryStr += ` AND t.thesis_type = $${paramIndex}`
        params.push(thesisType)
        paramIndex++
      }
      if (status) {
        queryStr += ` AND t.status = $${paramIndex}`
        params.push(status)
        paramIndex++
      }
      if (academicYear) {
        queryStr += ` AND t.academic_year = $${paramIndex}`
        params.push(academicYear)
        paramIndex++
      }
      if (facultyId) {
        queryStr += ` AND t.faculty_id = $${paramIndex}`
        params.push(facultyId)
        paramIndex++
      }
      
      queryStr += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)
      
      const result = await query(queryStr, params)
      return NextResponse.json({ theses: result.rows })
    }

    // ===== STATISTIQUES SGR =====
    if (type === 'stats') {
      const canViewStats = await hasPermission(userId, 'VIEW_RESEARCH_STATS')
      
      // Projets par statut
      const projectsByStatus = await query(`
        SELECT status, COUNT(*) as count
        FROM research_projects
        GROUP BY status
      `)
      
      // Publications par type
      const publicationsByType = await query(`
        SELECT publication_type, COUNT(*) as count
        FROM research_publications
        GROUP BY publication_type
      `)
      
      // Thèses par type
      const thesesByType = await query(`
        SELECT thesis_type, status, COUNT(*) as count
        FROM theses
        GROUP BY thesis_type, status
      `)
      
      // Publications par année
      const publicationsByYear = await query(`
        SELECT publication_year, COUNT(*) as count
        FROM research_publications
        WHERE publication_year IS NOT NULL
        GROUP BY publication_year
        ORDER BY publication_year DESC
        LIMIT 10
      `)
      
      // Budget total des projets
      const totalBudget = await query(`
        SELECT 
          SUM(budget_allocated) as allocated,
          SUM(budget_spent) as spent
        FROM research_projects
        WHERE status IN ('IN_PROGRESS', 'COMPLETED')
      `)
      
      return NextResponse.json({
        projectsByStatus: projectsByStatus.rows,
        publicationsByType: publicationsByType.rows,
        thesesByType: thesesByType.rows,
        publicationsByYear: publicationsByYear.rows,
        budget: totalBudget.rows[0]
      })
    }
    
    return NextResponse.json({ error: 'Type non spécifié' }, { status: 400 })
  } catch (error) {
    console.error('Erreur API recherche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer projet, publication, thèse
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
    const { type } = body
    
    // ===== CRÉER UN PROJET =====
    if (type === 'project') {
      const canManage = await hasPermission(userId, 'MANAGE_RESEARCH')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const {
        title, description, researchArea, facultyId, departmentId,
        principalInvestigatorId, startDate, endDate, budgetAllocated,
        fundingSource, objectives, methodology, expectedOutcomes
      } = body
      
      if (!title || !facultyId || !principalInvestigatorId) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      const result = await query(`
        INSERT INTO research_projects (
          title, description, research_area, faculty_id, department_id,
          principal_investigator_id, start_date, end_date, budget_allocated,
          funding_source, objectives, methodology, expected_outcomes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        title, description, researchArea, facultyId, departmentId,
        principalInvestigatorId, startDate, endDate, budgetAllocated || 0,
        fundingSource, objectives, methodology, expectedOutcomes
      ])
      
      // Ajouter le PI comme membre
      await query(`
        INSERT INTO research_project_members (project_id, researcher_id, role)
        VALUES ($1, $2, 'PRINCIPAL_INVESTIGATOR')
      `, [result.rows[0].id, principalInvestigatorId])
      
      return NextResponse.json({ 
        success: true, 
        project: result.rows[0],
        message: 'Projet de recherche créé' 
      })
    }

    // ===== CRÉER UNE PUBLICATION =====
    if (type === 'publication') {
      const canManage = await hasPermission(userId, 'MANAGE_RESEARCH')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const {
        title, authors, publicationType, journalConferenceName, publicationYear,
        publicationDate, volume, issue, pages, doi, abstract,
        keywords, pdfUrl, facultyId, departmentId, projectId
      } = body
      
      if (!title || !authors || !publicationType) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      const result = await query(`
        INSERT INTO research_publications (
          title, authors, publication_type, journal_conference_name, publication_year,
          publication_date, volume, issue, pages, doi, abstract,
          keywords, pdf_url, faculty_id, department_id, project_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        title, authors, publicationType, journalConferenceName, publicationYear,
        publicationDate, volume, issue, pages, doi, abstract,
        keywords, pdfUrl, facultyId, departmentId, projectId
      ])
      
      return NextResponse.json({ 
        success: true, 
        publication: result.rows[0],
        message: 'Publication enregistrée' 
      })
    }

    // ===== ENREGISTRER UNE THÈSE =====
    if (type === 'thesis') {
      const canManage = await hasPermission(userId, 'MANAGE_THESES')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const {
        studentId, supervisorId, coSupervisorId, title, thesisType,
        facultyId, departmentId, promotionId, academicYear, researchArea,
        abstract, proposedDefenseDate
      } = body
      
      if (!studentId || !supervisorId || !title || !thesisType || !facultyId) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      // Vérifier si l'étudiant n'a pas déjà une thèse active
      const existing = await query(`
        SELECT id FROM theses 
        WHERE student_id = $1 AND status NOT IN ('DEFENDED', 'REJECTED')
      `, [studentId])
      
      if (existing.rows.length > 0) {
        return NextResponse.json({ 
          error: 'L\'étudiant a déjà une thèse en cours' 
        }, { status: 400 })
      }
      
      const result = await query(`
        INSERT INTO theses (
          student_id, supervisor_id, co_supervisor_id, title, thesis_type,
          faculty_id, department_id, promotion_id, academic_year, research_area,
          abstract, proposed_defense_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        studentId, supervisorId, coSupervisorId, title, thesisType,
        facultyId, departmentId, promotionId, academicYear, researchArea,
        abstract, proposedDefenseDate
      ])
      
      return NextResponse.json({ 
        success: true, 
        thesis: result.rows[0],
        message: 'Thèse enregistrée' 
      })
    }
    
    // ===== AJOUTER MEMBRE AU PROJET =====
    if (type === 'project_member') {
      const canManage = await hasPermission(userId, 'MANAGE_RESEARCH')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const { projectId, researcherId, role } = body
      
      if (!projectId || !researcherId) {
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
      }
      
      await query(`
        INSERT INTO research_project_members (project_id, researcher_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (project_id, researcher_id) DO UPDATE SET role = $3
      `, [projectId, researcherId, role || 'RESEARCHER'])
      
      return NextResponse.json({ success: true, message: 'Membre ajouté au projet' })
    }
    
    return NextResponse.json({ error: 'Type non spécifié' }, { status: 400 })
  } catch (error) {
    console.error('Erreur création recherche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour projet, thèse, publication
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
    const { type, id, action } = body
    
    // ===== MISE À JOUR PROJET =====
    if (type === 'project') {
      const canManage = await hasPermission(userId, 'MANAGE_RESEARCH')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      if (!id) {
        return NextResponse.json({ error: 'ID projet manquant' }, { status: 400 })
      }
      
      if (action === 'update_status') {
        const { status } = body
        await query(`UPDATE research_projects SET status = $2 WHERE id = $1`, [id, status])
        return NextResponse.json({ success: true, message: 'Statut mis à jour' })
      }
      
      if (action === 'update_budget') {
        const { budgetSpent } = body
        await query(`UPDATE research_projects SET budget_spent = $2 WHERE id = $1`, [id, budgetSpent])
        return NextResponse.json({ success: true, message: 'Budget mis à jour' })
      }
      
      // Mise à jour générale
      const { title, description, endDate, objectives, methodology, outcomes } = body
      
      const updates: string[] = []
      const params: any[] = [id]
      let paramIndex = 2
      
      if (title) { updates.push(`title = $${paramIndex++}`); params.push(title) }
      if (description) { updates.push(`description = $${paramIndex++}`); params.push(description) }
      if (endDate) { updates.push(`end_date = $${paramIndex++}`); params.push(endDate) }
      if (objectives) { updates.push(`objectives = $${paramIndex++}`); params.push(objectives) }
      if (methodology) { updates.push(`methodology = $${paramIndex++}`); params.push(methodology) }
      if (outcomes) { updates.push(`outcomes = $${paramIndex++}`); params.push(outcomes) }
      
      if (updates.length > 0) {
        await query(`UPDATE research_projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1`, params)
      }
      
      return NextResponse.json({ success: true, message: 'Projet mis à jour' })
    }

    // ===== MISE À JOUR THÈSE =====
    if (type === 'thesis') {
      const canManage = await hasPermission(userId, 'MANAGE_THESES')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      if (!id) {
        return NextResponse.json({ error: 'ID thèse manquant' }, { status: 400 })
      }
      
      if (action === 'update_status') {
        const { status } = body
        await query(`UPDATE theses SET status = $2, updated_at = NOW() WHERE id = $1`, [id, status])
        return NextResponse.json({ success: true, message: 'Statut mis à jour' })
      }
      
      if (action === 'set_defense') {
        const { defenseDate, defenseLocation, juryMembers } = body
        
        await query(`
          UPDATE theses 
          SET defense_date = $2, defense_location = $3, jury_members = $4, 
              status = 'DEFENSE_SCHEDULED', updated_at = NOW()
          WHERE id = $1
        `, [id, defenseDate, defenseLocation, JSON.stringify(juryMembers)])
        
        return NextResponse.json({ success: true, message: 'Soutenance programmée' })
      }
      
      if (action === 'record_result') {
        const { finalGrade, mention, status } = body
        
        await query(`
          UPDATE theses 
          SET final_grade = $2, mention = $3, status = $4, updated_at = NOW()
          WHERE id = $1
        `, [id, finalGrade, mention, status])
        
        return NextResponse.json({ success: true, message: 'Résultat enregistré' })
      }
      
      if (action === 'submit_document') {
        const { documentUrl } = body
        
        await query(`
          UPDATE theses 
          SET document_url = $2, submitted_at = NOW(), status = 'SUBMITTED', updated_at = NOW()
          WHERE id = $1
        `, [id, documentUrl])
        
        return NextResponse.json({ success: true, message: 'Document soumis' })
      }
      
      // Mise à jour générale
      const { title, abstract, proposedDefenseDate } = body
      
      const updates: string[] = []
      const params: any[] = [id]
      let paramIndex = 2
      
      if (title) { updates.push(`title = $${paramIndex++}`); params.push(title) }
      if (abstract) { updates.push(`abstract = $${paramIndex++}`); params.push(abstract) }
      if (proposedDefenseDate) { updates.push(`proposed_defense_date = $${paramIndex++}`); params.push(proposedDefenseDate) }
      
      if (updates.length > 0) {
        await query(`UPDATE theses SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1`, params)
      }
      
      return NextResponse.json({ success: true, message: 'Thèse mise à jour' })
    }
    
    return NextResponse.json({ error: 'Type non spécifié' }, { status: 400 })
  } catch (error) {
    console.error('Erreur mise à jour recherche:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
