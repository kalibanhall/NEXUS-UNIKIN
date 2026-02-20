// API Password Reset - Demande et traitement de réinitialisation
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - Liste des demandes de réinitialisation (pour admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const requests = await query(
      `SELECT 
        prl.id, prl.matricule, prl.phone, prl.status, 
        prl.created_at, prl.processed_at,
        u.first_name, u.last_name, u.email, u.role,
        processor.first_name || ' ' || processor.last_name as processed_by_name
       FROM password_reset_log prl
       LEFT JOIN users u ON prl.user_id = u.id
       LEFT JOIN users processor ON prl.processed_by = processor.id
       ${status !== 'all' ? 'WHERE prl.status = $1' : ''}
       ORDER BY prl.created_at DESC
       LIMIT 100`,
      status !== 'all' ? [status] : []
    )

    const stats = await queryOne(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
        COUNT(*) as total
      FROM password_reset_log
    `)

    return NextResponse.json({
      requests: requests.rows,
      stats: stats || { pending: 0, approved: 0, rejected: 0, total: 0 }
    })
  } catch (error) {
    console.error('Error fetching reset requests:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une demande de réinitialisation (pour l'utilisateur)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matricule, phone } = body

    if (!matricule && !phone) {
      return NextResponse.json(
        { error: 'Veuillez fournir votre matricule ou votre numéro de téléphone' },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur par matricule (étudiant ou enseignant) ou téléphone
    let user = null

    if (matricule) {
      // Chercher dans students
      user = await queryOne(
        `SELECT u.id, u.first_name, u.last_name, u.phone, u.role, s.matricule
         FROM users u
         JOIN students s ON s.user_id = u.id
         WHERE s.matricule = $1`,
        [matricule.trim()]
      )

      // Si pas trouvé, chercher dans teachers
      if (!user) {
        user = await queryOne(
          `SELECT u.id, u.first_name, u.last_name, u.phone, u.role, t.matricule
           FROM users u
           JOIN teachers t ON t.user_id = u.id
           WHERE t.matricule = $1`,
          [matricule.trim()]
        )
      }
    }

    if (!user && phone) {
      user = await queryOne(
        `SELECT u.id, u.first_name, u.last_name, u.phone, u.role
         FROM users u WHERE u.phone = $1`,
        [phone.trim()]
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec ces informations. Veuillez vérifier votre matricule ou numéro de téléphone.' },
        { status: 404 }
      )
    }

    // Vérifier s'il y a déjà une demande en attente
    const existingRequest = await queryOne(
      `SELECT id FROM password_reset_log 
       WHERE user_id = $1 AND status = 'PENDING' AND created_at > NOW() - INTERVAL '24 hours'`,
      [user.id]
    )

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Une demande de réinitialisation est déjà en cours. Veuillez patienter.' },
        { status: 409 }
      )
    }

    // Créer la demande
    await query(
      `INSERT INTO password_reset_log (user_id, matricule, phone, status)
       VALUES ($1, $2, $3, 'PENDING')`,
      [user.id, matricule || user.matricule || null, phone || user.phone || null]
    )

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été enregistrée. L\'administrateur vous communiquera votre nouveau mot de passe.'
    })
  } catch (error) {
    console.error('Error creating reset request:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Traiter une demande (admin : approuver ou rejeter)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, action, processedBy, newPassword } = body

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId et action requis' }, { status: 400 })
    }

    // Récupérer la demande
    const resetRequest = await queryOne(
      `SELECT * FROM password_reset_log WHERE id = $1`,
      [requestId]
    )

    if (!resetRequest) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 })
    }

    if (action === 'approve') {
      // Générer un mot de passe temporaire si non fourni
      const tempPassword = newPassword || `Nexus${Math.random().toString(36).substring(2, 8)}!`
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Mettre à jour le mot de passe
      await query(
        `UPDATE users SET password = $1, must_change_password = TRUE WHERE id = $2`,
        [hashedPassword, resetRequest.user_id]
      )

      // Marquer la demande comme traitée
      await query(
        `UPDATE password_reset_log 
         SET status = 'APPROVED', processed_by = $2, processed_at = NOW()
         WHERE id = $1`,
        [requestId, processedBy]
      )

      return NextResponse.json({
        success: true,
        message: 'Mot de passe réinitialisé',
        tempPassword // Renvoyé à l'admin pour communiquer à l'utilisateur
      })
    }

    if (action === 'reject') {
      await query(
        `UPDATE password_reset_log 
         SET status = 'REJECTED', processed_by = $2, processed_at = NOW()
         WHERE id = $1`,
        [requestId, processedBy]
      )

      return NextResponse.json({ success: true, message: 'Demande rejetée' })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Error processing reset request:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
