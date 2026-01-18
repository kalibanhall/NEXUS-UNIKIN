/**
 * API Bibliothèque Numérique
 */

import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Catalogue, recherche, emprunts
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
    const resourceId = searchParams.get('id')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const canView = await hasPermission(userId, 'VIEW_LIBRARY')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (action === 'my_loans') {
      // Emprunts de l'utilisateur
      const result = await query(`
        SELECT 
          ll.*,
          lr.title,
          lr.authors,
          lr.cover_image_url,
          lr.resource_type
        FROM library_loans ll
        JOIN library_resources lr ON ll.resource_id = lr.id
        WHERE ll.user_id = $1
        ORDER BY ll.borrowed_at DESC
      `, [userId])
      
      return NextResponse.json({ loans: result.rows })
    }
    
    if (action === 'my_reservations') {
      // Réservations de l'utilisateur
      const result = await query(`
        SELECT 
          lres.*,
          lr.title,
          lr.authors,
          lr.cover_image_url
        FROM library_reservations lres
        JOIN library_resources lr ON lres.resource_id = lr.id
        WHERE lres.user_id = $1 AND lres.status = 'ACTIVE'
        ORDER BY lres.reserved_at DESC
      `, [userId])
      
      return NextResponse.json({ reservations: result.rows })
    }
    
    if (action === 'my_favorites') {
      // Favoris de l'utilisateur
      const result = await query(`
        SELECT 
          lf.*,
          lr.title,
          lr.authors,
          lr.cover_image_url,
          lr.resource_type,
          lr.available_copies
        FROM library_favorites lf
        JOIN library_resources lr ON lf.resource_id = lr.id
        WHERE lf.user_id = $1
        ORDER BY lf.added_at DESC
      `, [userId])
      
      return NextResponse.json({ favorites: result.rows })
    }
    
    if (action === 'categories') {
      // Liste des catégories
      const result = await query(`
        SELECT category, COUNT(*) as count
        FROM library_resources
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
      `)
      
      return NextResponse.json({ categories: result.rows })
    }

    if (resourceId) {
      // Détail d'une ressource
      await query(`
        UPDATE library_resources SET views_count = views_count + 1 WHERE id = $1
      `, [resourceId])
      
      const result = await query(`
        SELECT * FROM library_resources WHERE id = $1
      `, [resourceId])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 })
      }
      
      // Vérifier si favori
      const favorite = await query(`
        SELECT id FROM library_favorites WHERE user_id = $1 AND resource_id = $2
      `, [userId, resourceId])
      
      return NextResponse.json({ 
        resource: result.rows[0],
        isFavorite: favorite.rows.length > 0
      })
    }
    
    // Catalogue avec recherche et filtres
    let queryStr = `
      SELECT 
        id, title, authors, publisher, publication_year,
        resource_type, category, cover_image_url,
        available_copies, total_copies, is_digital,
        views_count
      FROM library_resources
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1
    
    if (search) {
      queryStr += ` AND (
        title ILIKE $${paramIndex} OR 
        $${paramIndex} = ANY(authors) OR
        $${paramIndex} = ANY(keywords) OR
        description ILIKE $${paramIndex}
      )`
      params.push(`%${search}%`)
      paramIndex++
    }
    
    if (category) {
      queryStr += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }
    
    if (type) {
      queryStr += ` AND resource_type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }
    
    // Comptage total
    const countResult = await query(
      queryStr.replace('SELECT id, title,', 'SELECT COUNT(*) as total FROM (SELECT id,') + ') AS subquery',
      params
    )
    const total = parseInt(countResult.rows[0]?.total || '0')
    
    // Pagination
    const offset = (page - 1) * limit
    queryStr += ` ORDER BY views_count DESC, title ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    
    const result = await query(queryStr, params)
    
    return NextResponse.json({ 
      resources: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur API bibliothèque:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Ajouter ressource, emprunter, réserver, favoris
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
    
    if (action === 'borrow') {
      // Emprunter un livre
      const { resourceId } = body
      
      if (!resourceId) {
        return NextResponse.json({ error: 'ID ressource manquant' }, { status: 400 })
      }
      
      // Vérifier disponibilité
      const resource = await query(`
        SELECT * FROM library_resources WHERE id = $1
      `, [resourceId])
      
      if (resource.rows.length === 0) {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 })
      }
      
      const res = resource.rows[0]
      
      if (res.is_digital) {
        return NextResponse.json({ error: 'Ressource numérique non empruntable' }, { status: 400 })
      }
      
      if (res.available_copies <= 0) {
        return NextResponse.json({ error: 'Aucun exemplaire disponible' }, { status: 400 })
      }
      
      // Vérifier emprunts actifs de l'utilisateur
      const activeLoans = await query(`
        SELECT COUNT(*) as count FROM library_loans
        WHERE user_id = $1 AND status = 'ACTIVE'
      `, [userId])
      
      if (parseInt(activeLoans.rows[0].count) >= 5) {
        return NextResponse.json({ error: 'Limite d\'emprunts atteinte (max 5)' }, { status: 400 })
      }
      
      // Créer l'emprunt (14 jours par défaut)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)
      
      const result = await query(`
        INSERT INTO library_loans (resource_id, user_id, due_date)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [resourceId, userId, dueDate])
      
      return NextResponse.json({ 
        success: true, 
        loan: result.rows[0],
        message: `Emprunt enregistré. À retourner avant le ${dueDate.toLocaleDateString('fr-FR')}` 
      })
    }
    
    if (action === 'reserve') {
      // Réserver un livre
      const { resourceId } = body
      
      if (!resourceId) {
        return NextResponse.json({ error: 'ID ressource manquant' }, { status: 400 })
      }
      
      // Vérifier si déjà réservé
      const existing = await query(`
        SELECT id FROM library_reservations
        WHERE user_id = $1 AND resource_id = $2 AND status = 'ACTIVE'
      `, [userId, resourceId])
      
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Vous avez déjà réservé cette ressource' }, { status: 400 })
      }
      
      const expires = new Date()
      expires.setDate(expires.getDate() + 7)
      
      const result = await query(`
        INSERT INTO library_reservations (resource_id, user_id, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [resourceId, userId, expires])
      
      return NextResponse.json({ 
        success: true, 
        reservation: result.rows[0],
        message: 'Réservation enregistrée' 
      })
    }
    
    if (action === 'favorite') {
      // Ajouter aux favoris
      const { resourceId } = body
      
      if (!resourceId) {
        return NextResponse.json({ error: 'ID ressource manquant' }, { status: 400 })
      }
      
      await query(`
        INSERT INTO library_favorites (user_id, resource_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, resource_id) DO NOTHING
      `, [userId, resourceId])
      
      return NextResponse.json({ success: true, message: 'Ajouté aux favoris' })
    }
    
    if (action === 'unfavorite') {
      // Retirer des favoris
      const { resourceId } = body
      
      await query(`
        DELETE FROM library_favorites WHERE user_id = $1 AND resource_id = $2
      `, [userId, resourceId])
      
      return NextResponse.json({ success: true, message: 'Retiré des favoris' })
    }
    
    // Ajouter une ressource (admin/bibliothécaire)
    const canManage = await hasPermission(userId, 'MANAGE_LIBRARY')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const {
      isbn, title, authors, publisher, publicationYear, resourceType,
      category, subcategory, subjects, keywords, language, description,
      tableOfContents, fileUrl, coverImageUrl, previewUrl,
      location, shelfNumber, totalCopies, isDigital, isDownloadable, accessLevel
    } = body
    
    if (!title || !resourceType) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    const result = await query(`
      INSERT INTO library_resources (
        isbn, title, authors, publisher, publication_year, resource_type,
        category, subcategory, subjects, keywords, language, description,
        table_of_contents, file_url, cover_image_url, preview_url,
        location, shelf_number, total_copies, available_copies,
        is_digital, is_downloadable, access_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $19, $20, $21, $22)
      RETURNING *
    `, [
      isbn, title, authors, publisher, publicationYear, resourceType,
      category, subcategory, subjects, keywords, language || 'Français', description,
      tableOfContents, fileUrl, coverImageUrl, previewUrl,
      location, shelfNumber, totalCopies || 1,
      isDigital || false, isDownloadable || false, accessLevel || 'ALL'
    ])
    
    return NextResponse.json({ 
      success: true, 
      resource: result.rows[0],
      message: 'Ressource ajoutée avec succès' 
    })
  } catch (error) {
    console.error('Erreur bibliothèque:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Retourner un livre, renouveler
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
    const { action, loanId, resourceId } = body
    
    if (action === 'return') {
      // Retourner un livre (bibliothécaire)
      const canManage = await hasPermission(userId, 'MANAGE_LIBRARY')
      if (!canManage) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      if (!loanId) {
        return NextResponse.json({ error: 'ID emprunt manquant' }, { status: 400 })
      }
      
      const loan = await query(`SELECT * FROM library_loans WHERE id = $1`, [loanId])
      
      if (loan.rows.length === 0) {
        return NextResponse.json({ error: 'Emprunt non trouvé' }, { status: 404 })
      }
      
      const l = loan.rows[0]
      
      // Calculer les pénalités si en retard
      let fineAmount = 0
      if (l.is_overdue || new Date() > new Date(l.due_date)) {
        const daysOverdue = Math.ceil((Date.now() - new Date(l.due_date).getTime()) / (1000 * 60 * 60 * 24))
        fineAmount = Math.max(0, daysOverdue * 100) // 100 CDF par jour de retard
      }
      
      await query(`
        UPDATE library_loans
        SET status = 'RETURNED', returned_at = NOW(), fine_amount = $2
        WHERE id = $1
      `, [loanId, fineAmount])
      
      return NextResponse.json({ 
        success: true, 
        fineAmount,
        message: fineAmount > 0 
          ? `Livre retourné. Pénalité de retard: ${fineAmount} CDF`
          : 'Livre retourné avec succès'
      })
    }
    
    if (action === 'renew') {
      // Renouveler un emprunt
      if (!loanId) {
        return NextResponse.json({ error: 'ID emprunt manquant' }, { status: 400 })
      }
      
      const loan = await query(`
        SELECT * FROM library_loans WHERE id = $1 AND user_id = $2
      `, [loanId, userId])
      
      if (loan.rows.length === 0) {
        return NextResponse.json({ error: 'Emprunt non trouvé' }, { status: 404 })
      }
      
      const l = loan.rows[0]
      
      if (l.renewals_count >= l.max_renewals) {
        return NextResponse.json({ error: 'Nombre maximum de renouvellements atteint' }, { status: 400 })
      }
      
      if (l.is_overdue) {
        return NextResponse.json({ error: 'Impossible de renouveler un emprunt en retard' }, { status: 400 })
      }
      
      // Prolonger de 14 jours
      const newDueDate = new Date(l.due_date)
      newDueDate.setDate(newDueDate.getDate() + 14)
      
      await query(`
        UPDATE library_loans
        SET due_date = $2, renewals_count = renewals_count + 1
        WHERE id = $1
      `, [loanId, newDueDate])
      
      return NextResponse.json({ 
        success: true, 
        newDueDate,
        message: `Emprunt renouvelé jusqu'au ${newDueDate.toLocaleDateString('fr-FR')}`
      })
    }
    
    // Mise à jour ressource (admin)
    const canManage = await hasPermission(userId, 'MANAGE_LIBRARY')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    if (!resourceId) {
      return NextResponse.json({ error: 'ID ressource manquant' }, { status: 400 })
    }
    
    const { title, description, totalCopies, isDownloadable } = body
    
    const updates: string[] = []
    const params: any[] = [resourceId]
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
    if (totalCopies !== undefined) {
      updates.push(`total_copies = $${paramIndex}`)
      params.push(totalCopies)
      paramIndex++
    }
    if (isDownloadable !== undefined) {
      updates.push(`is_downloadable = $${paramIndex}`)
      params.push(isDownloadable)
      paramIndex++
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE library_resources 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
    }
    
    return NextResponse.json({ success: true, message: 'Ressource mise à jour' })
  } catch (error) {
    console.error('Erreur mise à jour bibliothèque:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
