// API User Status - Gestion des statuts en ligne/hors ligne
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Obtenir le statut d'un ou plusieurs utilisateurs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const userIds = searchParams.get('user_ids') // Comma-separated

    if (userId) {
      const status = await queryOne(
        `SELECT us.*, u.first_name || ' ' || u.last_name as name, u.role
         FROM user_status us
         JOIN users u ON u.id = us.user_id
         WHERE us.user_id = $1`,
        [userId]
      )
      return NextResponse.json({ status })
    }

    if (userIds) {
      const ids = userIds.split(',').map(id => parseInt(id.trim()))
      const statuses = await query(
        `SELECT us.*, u.first_name || ' ' || u.last_name as name, u.role
         FROM user_status us
         JOIN users u ON u.id = us.user_id
         WHERE us.user_id = ANY($1)`,
        [ids]
      )
      return NextResponse.json({ statuses: statuses.rows })
    }

    // Tous les utilisateurs en ligne
    const onlineUsers = await query(
      `SELECT us.*, u.first_name || ' ' || u.last_name as name, u.role
       FROM user_status us
       JOIN users u ON u.id = us.user_id
       WHERE us.is_online = TRUE
       ORDER BY us.last_seen DESC`
    )

    const totalOnline = await queryOne(
      `SELECT COUNT(*) as count FROM user_status WHERE is_online = TRUE`
    )

    return NextResponse.json({ 
      onlineUsers: onlineUsers.rows,
      totalOnline: parseInt(totalOnline?.count || '0')
    })
  } catch (error) {
    console.error('Error fetching user status:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

// POST - Mettre à jour le statut (en ligne/hors ligne)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, isOnline, deviceInfo } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Upsert le statut
    const result = await query(
      `INSERT INTO user_status (user_id, is_online, last_seen, device_info)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET is_online = $2, last_seen = NOW(), device_info = COALESCE($3, user_status.device_info)
       RETURNING *`,
      [userId, isOnline !== false, deviceInfo || null]
    )

    return NextResponse.json({ status: result.rows[0] })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

// Endpoint pour heartbeat / mise à jour automatique
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Mise à jour du last_seen
    await query(
      `UPDATE user_status SET last_seen = NOW(), is_online = TRUE WHERE user_id = $1`,
      [userId]
    )

    // Marquer les utilisateurs inactifs depuis plus de 5 minutes comme hors ligne
    await query(
      `UPDATE user_status SET is_online = FALSE 
       WHERE last_seen < NOW() - INTERVAL '5 minutes' AND is_online = TRUE`
    )

    return NextResponse.json({ message: 'Status updated' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
