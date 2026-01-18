/**
 * API LMS - Ressources pédagogiques
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Liste des ressources
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
    const moduleId = searchParams.get('moduleId')
    const courseId = searchParams.get('courseId')
    const resourceId = searchParams.get('id')
    
    const canView = await hasPermission(userId, 'VIEW_LMS')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (resourceId) {
      // Détail d'une ressource + incrémenter le compteur de vues
      await query(`
        UPDATE course_resources SET views_count = views_count + 1 WHERE id = $1
      `, [resourceId])
      
      const result = await query(`
        SELECT cr.*, cm.title as module_title, cm.course_id
        FROM course_resources cr
        JOIN course_modules cm ON cr.module_id = cm.id
        WHERE cr.id = $1
      `, [resourceId])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 })
      }
      
      // Enregistrer la progression
      await query(`
        INSERT INTO student_progress (student_id, course_id, module_id, resource_id, last_accessed_at)
        SELECT s.id, $2, $3, $4, NOW()
        FROM students s WHERE s.user_id = $1
        ON CONFLICT (student_id, course_id, module_id, resource_id) 
        DO UPDATE SET last_accessed_at = NOW(), time_spent = student_progress.time_spent + 60
      `, [userId, result.rows[0].course_id, result.rows[0].module_id, resourceId])
      
      return NextResponse.json({ resource: result.rows[0] })
    }

    let queryStr = `
      SELECT cr.*, cm.title as module_title
      FROM course_resources cr
      JOIN course_modules cm ON cr.module_id = cm.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1
    
    if (moduleId) {
      queryStr += ` AND cr.module_id = $${paramIndex}`
      params.push(parseInt(moduleId))
      paramIndex++
    }
    
    if (courseId) {
      queryStr += ` AND cm.course_id = $${paramIndex}`
      params.push(parseInt(courseId))
      paramIndex++
    }
    
    queryStr += ` ORDER BY cm.order_index, cr.order_index`
    
    const result = await query(queryStr, params)
    
    return NextResponse.json({ resources: result.rows })
  } catch (error) {
    console.error('Erreur API ressources:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Ajouter une ressource
export async function POST(request: NextRequest) {
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
    
    const body = await request.json()
    const { 
      moduleId, 
      title, 
      description, 
      resourceType, 
      fileUrl, 
      fileSize,
      duration,
      isDownloadable,
      orderIndex 
    } = body
    
    if (!moduleId || !title || !resourceType) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    // Déterminer l'ordre
    let order = orderIndex
    if (order === undefined) {
      const maxOrder = await query(`
        SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
        FROM course_resources WHERE module_id = $1
      `, [moduleId])
      order = maxOrder.rows[0].next_order
    }
    
    const result = await query(`
      INSERT INTO course_resources (
        module_id, title, description, resource_type, file_url, 
        file_size, duration, is_downloadable, order_index
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      moduleId, title, description, resourceType, fileUrl,
      fileSize, duration, isDownloadable ?? true, order
    ])
    
    return NextResponse.json({ 
      success: true, 
      resource: result.rows[0],
      message: 'Ressource ajoutée avec succès' 
    })
  } catch (error) {
    console.error('Erreur ajout ressource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une ressource
export async function PUT(request: NextRequest) {
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
    
    const body = await request.json()
    const { id, title, description, fileUrl, isDownloadable, orderIndex } = body
    
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
    if (fileUrl) {
      updates.push(`file_url = $${paramIndex}`)
      params.push(fileUrl)
      paramIndex++
    }
    if (isDownloadable !== undefined) {
      updates.push(`is_downloadable = $${paramIndex}`)
      params.push(isDownloadable)
      paramIndex++
    }
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex}`)
      params.push(orderIndex)
      paramIndex++
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE course_resources 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
    }
    
    return NextResponse.json({ success: true, message: 'Ressource mise à jour' })
  } catch (error) {
    console.error('Erreur mise à jour ressource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une ressource
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
    
    await query(`DELETE FROM course_resources WHERE id = $1`, [id])
    
    return NextResponse.json({ success: true, message: 'Ressource supprimée' })
  } catch (error) {
    console.error('Erreur suppression ressource:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
