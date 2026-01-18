// API Notifications - CRUD complet
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const isRead = searchParams.get('is_read')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 })
    }

    let conditions = [`user_id = $1`]
    let params: any[] = [userId]

    if (isRead !== null && isRead !== undefined && isRead !== '') {
      conditions.push(`is_read = $2`)
      params.push(isRead === 'true')
    }

    const result = await query(
      `SELECT * FROM notifications 
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1}`,
      [...params, limit]
    )

    // Count unread
    const unreadCount = await queryOne(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    )

    return NextResponse.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCount?.count || '0')
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 })
  }
}

// POST - Créer une notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type, link } = body

    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'userId, title et message requis' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, link, is_read)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING *`,
      [userId, title, message, type || 'INFO', link || null]
    )

    return NextResponse.json({
      message: 'Notification créée',
      notification: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la notification' }, { status: 500 })
  }
}

// PATCH - Marquer comme lue (pour plusieurs)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationIds, markAll } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    if (markAll) {
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
        [userId]
      )
    } else if (notificationIds && notificationIds.length > 0) {
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND id = ANY($2)',
        [userId, notificationIds]
      )
    }

    return NextResponse.json({ message: 'Notifications marquées comme lues' })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des notifications' }, { status: 500 })
  }
}
