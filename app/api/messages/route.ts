// API Messagerie - Système de messages entre utilisateurs
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des conversations et messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const contactId = searchParams.get('contact_id')
    const type = searchParams.get('type') // 'conversations' ou 'messages'

    if (!userId) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 })
    }

    // Si on demande les messages d'une conversation spécifique
    if (type === 'messages' && contactId) {
      const messages = await query(
        `SELECT m.*, 
                u_sender.first_name || ' ' || u_sender.last_name as sender_name,
                u_sender.role as sender_role
         FROM messages m
         JOIN users u_sender ON m.sender_id = u_sender.id
         WHERE (m.sender_id = $1 AND m.receiver_id = $2)
            OR (m.sender_id = $2 AND m.receiver_id = $1)
         ORDER BY m.created_at ASC`,
        [userId, contactId]
      )

      // Marquer les messages reçus comme lus
      await query(
        `UPDATE messages SET is_read = TRUE, read_at = NOW() 
         WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE`,
        [userId, contactId]
      )

      return NextResponse.json({ messages: messages.rows })
    }

    // Sinon, retourner la liste des conversations
    const conversations = await query(
      `WITH last_messages AS (
        SELECT DISTINCT ON (
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
        )
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        is_read,
        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as contact_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY contact_id, created_at DESC
      )
      SELECT 
        lm.*,
        u.first_name || ' ' || u.last_name as contact_name,
        u.role as contact_role,
        u.email as contact_email,
        us.is_online,
        us.last_seen,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = lm.contact_id AND receiver_id = $1 AND is_read = FALSE) as unread_count
      FROM last_messages lm
      JOIN users u ON u.id = lm.contact_id
      LEFT JOIN user_status us ON us.user_id = u.id
      ORDER BY lm.created_at DESC`,
      [userId]
    )

    // Total des messages non lus
    const unreadTotal = await queryOne(
      `SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = FALSE`,
      [userId]
    )

    return NextResponse.json({ 
      conversations: conversations.rows,
      unreadTotal: parseInt(unreadTotal?.count || '0')
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 })
  }
}

// POST - Envoyer un message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, content, attachmentUrl, attachmentType } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'senderId, receiverId et content requis' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, content, attachment_url, attachment_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [senderId, receiverId, content.trim(), attachmentUrl || null, attachmentType || null]
    )

    // Créer une notification pour le destinataire
    const sender = await queryOne(
      `SELECT first_name || ' ' || last_name as name FROM users WHERE id = $1`,
      [senderId]
    )

    await query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, 'INFO', '/student/messages')`,
      [receiverId, 'Nouveau message', `Vous avez reçu un message de ${sender?.name}`]
    )

    return NextResponse.json({
      message: 'Message envoyé',
      data: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 })
  }
}

// PATCH - Marquer comme lu
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contactId, messageIds } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    if (contactId) {
      // Marquer tous les messages d'un contact comme lus
      await query(
        `UPDATE messages SET is_read = TRUE, read_at = NOW() 
         WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE`,
        [userId, contactId]
      )
    } else if (messageIds && messageIds.length > 0) {
      // Marquer des messages spécifiques comme lus
      await query(
        `UPDATE messages SET is_read = TRUE, read_at = NOW() 
         WHERE receiver_id = $1 AND id = ANY($2) AND is_read = FALSE`,
        [userId, messageIds]
      )
    }

    return NextResponse.json({ message: 'Messages marqués comme lus' })
  } catch (error) {
    console.error('Error updating messages:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
