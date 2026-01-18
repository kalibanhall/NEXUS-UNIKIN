import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query } from '@/lib/db'

// GET - Obtenir toutes les annonces
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target')
    const publishedOnly = searchParams.get('published') === 'true'

    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (target) {
      whereClause += ` AND (a.target = $${paramIndex} OR a.target = 'ALL')`
      params.push(target)
      paramIndex++
    }

    if (publishedOnly) {
      whereClause += ` AND a.is_published = TRUE`
    }

    const announcements = await queryMany(
      `SELECT 
        a.id,
        a.title,
        a.content,
        a.target,
        a.priority,
        a.is_published,
        a.published_at,
        a.expires_at,
        a.views_count,
        a.created_at,
        a.updated_at,
        u.first_name as author_first_name,
        u.last_name as author_last_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       ${whereClause}
       ORDER BY 
         CASE a.priority 
           WHEN 'URGENT' THEN 1 
           WHEN 'HIGH' THEN 2 
           WHEN 'NORMAL' THEN 3 
           WHEN 'LOW' THEN 4 
         END,
         a.created_at DESC`,
      params
    )

    // Statistiques
    const stats = await queryOne<{
      total: number
      published: number
      draft: number
      urgent: number
    }>(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_published = TRUE) as published,
        COUNT(*) FILTER (WHERE is_published = FALSE) as draft,
        COUNT(*) FILTER (WHERE priority = 'URGENT' AND is_published = TRUE) as urgent
       FROM announcements`
    )

    return NextResponse.json({
      announcements: announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        target: a.target,
        priority: a.priority,
        isPublished: a.is_published,
        publishedAt: a.published_at,
        expiresAt: a.expires_at,
        viewsCount: a.views_count,
        author: a.author_first_name ? `${a.author_first_name} ${a.author_last_name}` : 'Système',
        createdAt: a.created_at,
        updatedAt: a.updated_at
      })),
      stats: {
        total: parseInt(stats?.total?.toString() || '0'),
        published: parseInt(stats?.published?.toString() || '0'),
        draft: parseInt(stats?.draft?.toString() || '0'),
        urgent: parseInt(stats?.urgent?.toString() || '0')
      }
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle annonce
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, target, priority, isPublished, expiresAt, createdBy } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu requis' },
        { status: 400 }
      )
    }

    const result = await queryOne<{ id: number }>(
      `INSERT INTO announcements (title, content, target, priority, is_published, published_at, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        title,
        content,
        target || 'ALL',
        priority || 'NORMAL',
        isPublished || false,
        isPublished ? new Date() : null,
        expiresAt || null,
        createdBy || 1
      ]
    )

    return NextResponse.json({
      success: true,
      id: result?.id,
      message: 'Annonce créée avec succès'
    })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'annonce' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une annonce
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, content, target, priority, isPublished, expiresAt } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE announcements 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           target = COALESCE($3, target),
           priority = COALESCE($4, priority),
           is_published = COALESCE($5, is_published),
           published_at = CASE WHEN $5 = TRUE AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
           expires_at = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [title, content, target, priority, isPublished, expiresAt, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Annonce mise à jour avec succès'
    })
  } catch (error) {
    console.error('Error updating announcement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'annonce' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une annonce
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    await query('DELETE FROM announcements WHERE id = $1', [parseInt(id)])

    return NextResponse.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'annonce' },
      { status: 500 }
    )
  }
}
