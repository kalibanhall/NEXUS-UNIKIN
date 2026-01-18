/**
 * API LMS - Modules de cours
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Liste des modules d'un cours
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
    const moduleId = searchParams.get('moduleId')
    
    const canView = await hasPermission(userId, 'VIEW_LMS')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    if (moduleId) {
      // Détail d'un module avec ses ressources
      const module = await query(`
        SELECT * FROM course_modules WHERE id = $1
      `, [moduleId])
      
      if (module.rows.length === 0) {
        return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 })
      }
      
      const resources = await query(`
        SELECT * FROM course_resources 
        WHERE module_id = $1 
        ORDER BY order_index
      `, [moduleId])
      
      return NextResponse.json({ 
        module: module.rows[0],
        resources: resources.rows
      })
    }

    if (!courseId) {
      return NextResponse.json({ error: 'ID cours requis' }, { status: 400 })
    }
    
    // Liste des modules d'un cours
    const modules = await query(`
      SELECT 
        cm.*,
        COUNT(cr.id) as resources_count,
        COALESCE(SUM(cr.duration), 0) as total_duration
      FROM course_modules cm
      LEFT JOIN course_resources cr ON cm.id = cr.module_id
      WHERE cm.course_id = $1
      GROUP BY cm.id
      ORDER BY cm.order_index
    `, [courseId])
    
    return NextResponse.json({ modules: modules.rows })
  } catch (error) {
    console.error('Erreur API modules:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un module
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
    const { courseId, title, description, orderIndex } = body
    
    if (!courseId || !title) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    // Vérifier que l'enseignant est bien responsable du cours
    const course = await query(`
      SELECT c.*, t.user_id as teacher_user_id
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = $1
    `, [courseId])
    
    if (course.rows.length === 0) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 })
    }
    
    // Déterminer l'ordre
    let order = orderIndex
    if (order === undefined) {
      const maxOrder = await query(`
        SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
        FROM course_modules WHERE course_id = $1
      `, [courseId])
      order = maxOrder.rows[0].next_order
    }
    
    const result = await query(`
      INSERT INTO course_modules (course_id, title, description, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [courseId, title, description, order])
    
    return NextResponse.json({ 
      success: true, 
      module: result.rows[0],
      message: 'Module créé avec succès' 
    })
  } catch (error) {
    console.error('Erreur création module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un module
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
    const { id, title, description, orderIndex, isPublished } = body
    
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
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex}`)
      params.push(orderIndex)
      paramIndex++
    }
    if (isPublished !== undefined) {
      updates.push(`is_published = $${paramIndex}`)
      params.push(isPublished)
      paramIndex++
      if (isPublished) {
        updates.push(`published_at = NOW()`)
      }
    }
    
    if (updates.length > 0) {
      await query(`
        UPDATE course_modules 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
      `, params)
    }
    
    return NextResponse.json({ success: true, message: 'Module mis à jour' })
  } catch (error) {
    console.error('Erreur mise à jour module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un module
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
    
    await query(`DELETE FROM course_modules WHERE id = $1`, [id])
    
    return NextResponse.json({ success: true, message: 'Module supprimé' })
  } catch (error) {
    console.error('Erreur suppression module:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
