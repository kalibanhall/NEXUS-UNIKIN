/**
 * API Rôles - Liste et attribution des rôles
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission, assignRole, revokeRole, getUserRoles } from '@/lib/auth/permissions'

// GET - Liste des rôles d'un utilisateur ou tous les rôles
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const currentUserId = decoded.userId

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const facultyId = searchParams.get('facultyId')
    const departmentId = searchParams.get('departmentId')
    
    // Vérifier les permissions
    const canView = await hasPermission(currentUserId, 'VIEW_USERS')
    
    if (userId) {
      // Récupérer les rôles d'un utilisateur spécifique
      if (!canView && parseInt(userId) !== currentUserId) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
      
      const roles = await getUserRoles(parseInt(userId))
      return NextResponse.json({ roles })
    }
    
    // Liste de tous les utilisateurs avec leurs rôles
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    let queryStr = `
      SELECT 
        ur.id,
        ur.user_id,
        u.first_name,
        u.last_name,
        u.email,
        ur.role,
        ur.scope_type,
        ur.faculty_id,
        f.name as faculty_name,
        ur.department_id,
        d.name as department_name,
        ur.promotion_id,
        p.name as promotion_name,
        ur.is_primary,
        ur.is_active,
        ur.assigned_at,
        ur.expires_at
      FROM user_roles ur
      JOIN users u ON ur.user_id = u.id
      LEFT JOIN faculties f ON ur.faculty_id = f.id
      LEFT JOIN departments d ON ur.department_id = d.id
      LEFT JOIN promotions p ON ur.promotion_id = p.id
      WHERE ur.is_active = TRUE
    `
    
    const params: any[] = []
    let paramIndex = 1
    
    if (facultyId) {
      queryStr += ` AND ur.faculty_id = $${paramIndex}`
      params.push(parseInt(facultyId))
      paramIndex++
    }
    
    if (departmentId) {
      queryStr += ` AND ur.department_id = $${paramIndex}`
      params.push(parseInt(departmentId))
      paramIndex++
    }
    
    queryStr += ` ORDER BY u.last_name, u.first_name`
    
    const result = await query(queryStr, params)
    
    return NextResponse.json({ roles: result.rows })
  } catch (error) {
    console.error('Erreur API roles:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Attribuer un rôle
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const currentUserId = decoded.userId
    
    // Vérifier les permissions
    const canManage = await hasPermission(currentUserId, 'MANAGE_USERS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const body = await request.json()
    const { userId, role, scopeType, facultyId, departmentId, promotionId, isPrimary, expiresAt } = body
    
    if (!userId || !role || !scopeType) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    const roleId = await assignRole(
      userId,
      role,
      scopeType,
      currentUserId,
      {
        faculty_id: facultyId,
        department_id: departmentId,
        promotion_id: promotionId,
        is_primary: isPrimary,
        expires_at: expiresAt ? new Date(expiresAt) : undefined
      }
    )
    
    return NextResponse.json({ 
      success: true, 
      roleId,
      message: 'Rôle attribué avec succès' 
    })
  } catch (error) {
    console.error('Erreur attribution rôle:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Retirer un rôle
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const currentUserId = decoded.userId
    
    // Vérifier les permissions
    const canManage = await hasPermission(currentUserId, 'MANAGE_USERS')
    if (!canManage) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    const success = await revokeRole(parseInt(userId), role as any, {
      faculty_id: searchParams.get('facultyId') ? parseInt(searchParams.get('facultyId')!) : undefined,
      department_id: searchParams.get('departmentId') ? parseInt(searchParams.get('departmentId')!) : undefined,
      promotion_id: searchParams.get('promotionId') ? parseInt(searchParams.get('promotionId')!) : undefined
    })
    
    return NextResponse.json({ 
      success, 
      message: success ? 'Rôle retiré avec succès' : 'Rôle non trouvé' 
    })
  } catch (error) {
    console.error('Erreur suppression rôle:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
