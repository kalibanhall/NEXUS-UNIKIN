// API Documents - Demandes et statistiques
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des demandes de documents et statistiques
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const status = searchParams.get('status')
    const docType = searchParams.get('type')

    // Mode admin - liste toutes les demandes
    if (!studentId) {
      let conditions = []
      let params: any[] = []
      let paramIndex = 1

      // Filtrer par statut
      if (status && status !== 'all' && status !== 'pending') {
        conditions.push(`dr.status = $${paramIndex}`)
        params.push(status.toUpperCase())
        paramIndex++
      } else if (status === 'pending') {
        conditions.push(`dr.status = 'PENDING'`)
      }

      // Filtrer par type de document
      if (docType && docType !== 'all') {
        conditions.push(`dr.document_type = $${paramIndex}`)
        params.push(docType)
        paramIndex++
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Récupérer les demandes avec infos étudiants
      const requests = await query(`
        SELECT 
          dr.id,
          dr.id as reference,
          dr.student_id,
          s.matricule as student_matricule,
          u.first_name || ' ' || u.last_name as student_name,
          p.name as promotion,
          dr.document_type,
          dr.copies as copies_count,
          dr.fee_amount,
          dr.fee_paid as is_paid,
          dr.notes as purpose,
          dr.status,
          dr.requested_at,
          dr.processed_at,
          processor.first_name || ' ' || processor.last_name as processed_by,
          dr.file_url as document_url,
          dr.rejection_reason
        FROM document_requests dr
        JOIN students s ON dr.student_id = s.id
        JOIN users u ON s.user_id = u.id
        LEFT JOIN promotions p ON s.promotion_id = p.id
        LEFT JOIN users processor ON dr.processed_by = processor.id
        ${whereClause}
        ORDER BY dr.requested_at DESC
        LIMIT 200
      `, params)

      // Statistiques globales
      const stats = await queryOne(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
          COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing,
          COUNT(*) FILTER (WHERE status = 'COMPLETED' OR status = 'APPROVED' OR status = 'READY') as completed,
          COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected
        FROM document_requests
      `)

      return NextResponse.json({
        requests: requests.rows,
        stats: stats || { pending: 0, processing: 0, completed: 0, rejected: 0 }
      })
    }

    // Liste des demandes d'un étudiant
    const requests = await query(
      `SELECT dr.*, 
              u.first_name || ' ' || u.last_name as processed_by_name
       FROM document_requests dr
       LEFT JOIN users u ON u.id = dr.processed_by
       WHERE dr.student_id = $1
       ORDER BY dr.requested_at DESC`,
      [studentId]
    )

    // Statistiques personnelles
    const personalStats = await queryOne(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'READY') as ready,
        COUNT(*) FILTER (WHERE collected_at IS NOT NULL) as collected,
        COALESCE(SUM(fee_amount), 0) as total_fees,
        COALESCE(SUM(fee_amount) FILTER (WHERE fee_paid = TRUE), 0) as fees_paid
       FROM document_requests WHERE student_id = $1`,
      [studentId]
    )

    return NextResponse.json({
      requests: requests.rows,
      stats: personalStats
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une demande de document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, documentType, copies = 1, notes } = body

    if (!studentId || !documentType) {
      return NextResponse.json({ error: 'studentId et documentType requis' }, { status: 400 })
    }

    // Calculer les frais selon le type
    const feeAmounts: Record<string, number> = {
      'ATTESTATION_INSCRIPTION': 5,
      'ATTESTATION_FREQUENTATION': 5,
      'RELEVE_NOTES': 10,
      'CERTIFICAT_SCOLARITE': 8,
      'DIPLOME': 50,
      'AUTRE': 5
    }

    const feeAmount = (feeAmounts[documentType] || 5) * copies

    const result = await query(
      `INSERT INTO document_requests (student_id, document_type, copies, fee_amount, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, documentType, copies, feeAmount, notes]
    )

    return NextResponse.json({
      message: 'Demande créée avec succès',
      request: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating document request:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// PATCH - Mettre à jour une demande (pour l'admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, processedBy, rejectionReason, fileUrl } = body

    if (!requestId || !status) {
      return NextResponse.json({ error: 'requestId et status requis' }, { status: 400 })
    }

    let updateFields = ['status = $2']
    let params: any[] = [requestId, status]
    let paramIndex = 3

    if (status === 'PROCESSING' || status === 'APPROVED' || status === 'REJECTED') {
      updateFields.push(`processed_at = NOW()`)
      if (processedBy) {
        updateFields.push(`processed_by = $${paramIndex}`)
        params.push(processedBy)
        paramIndex++
      }
    }

    if (status === 'READY') {
      updateFields.push(`ready_at = NOW()`)
    }

    if (status === 'REJECTED' && rejectionReason) {
      updateFields.push(`rejection_reason = $${paramIndex}`)
      params.push(rejectionReason)
      paramIndex++
    }

    if (fileUrl) {
      updateFields.push(`file_url = $${paramIndex}`)
      params.push(fileUrl)
      paramIndex++
    }

    const result = await query(
      `UPDATE document_requests SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      params
    )

    return NextResponse.json({
      message: 'Demande mise à jour',
      request: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating document request:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

// PUT - Traiter une demande (approve/reject) depuis la page admin
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, requestId, rejectionReason, processedBy } = body

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId et action requis' }, { status: 400 })
    }

    if (action === 'approve') {
      await query(`
        UPDATE document_requests 
        SET 
          status = 'COMPLETED',
          processed_at = NOW(),
          processed_by = $2
        WHERE id = $1
      `, [requestId, processedBy])

      return NextResponse.json({ success: true, message: 'Document approuvé' })
    }

    if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'Raison du rejet requise' }, { status: 400 })
      }

      await query(`
        UPDATE document_requests 
        SET 
          status = 'REJECTED',
          processed_at = NOW(),
          processed_by = $2,
          rejection_reason = $3
        WHERE id = $1
      `, [requestId, processedBy, rejectionReason])

      return NextResponse.json({ success: true, message: 'Demande rejetée' })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Error processing document request:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}