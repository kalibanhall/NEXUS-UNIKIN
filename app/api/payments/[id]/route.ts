// API Paiement par ID
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Détails d'un paiement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await queryOne(
      `SELECT p.*, 
              s.matricule, u.first_name, u.last_name, u.email as student_email,
              ay.name as academic_year,
              ru.first_name || ' ' || ru.last_name as recorded_by_name
       FROM payments p
       JOIN students s ON p.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN academic_years ay ON p.academic_year_id = ay.id
       LEFT JOIN users ru ON p.recorded_by = ru.id
       WHERE p.id = $1`,
      [params.id]
    )

    if (!payment) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du paiement' }, { status: 500 })
  }
}

// PUT - Modifier un paiement (annuler, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, remarks } = body

    const existing = await queryOne('SELECT id, student_id, academic_year_id FROM payments WHERE id = $1', [params.id])
    if (!existing) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    const result = await query(
      `UPDATE payments 
       SET status = COALESCE($1, status),
           remarks = COALESCE($2, remarks)
       WHERE id = $3
       RETURNING *`,
      [status, remarks, params.id]
    )

    // Recalculer le statut de paiement de l'étudiant
    if (status) {
      const paidResult = await queryOne(
        `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments 
         WHERE student_id = $1 AND academic_year_id = $2 AND status = 'COMPLETED'`,
        [existing.student_id, existing.academic_year_id]
      )
      const totalPaid = parseFloat(paidResult?.total_paid || '0')
      
      let paymentStatus = 'UNPAID'
      if (totalPaid >= 1300) paymentStatus = 'PAID'
      else if (totalPaid > 0) paymentStatus = 'PARTIAL'
      
      await query('UPDATE students SET payment_status = $1 WHERE id = $2', [paymentStatus, existing.student_id])
    }

    return NextResponse.json({
      message: 'Paiement modifié avec succès',
      payment: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification du paiement' }, { status: 500 })
  }
}

// DELETE - Supprimer un paiement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await queryOne('SELECT student_id, academic_year_id, status FROM payments WHERE id = $1', [params.id])
    if (!existing) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    if (existing.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Impossible de supprimer un paiement complété. Annulez-le plutôt.' }, { status: 400 })
    }

    await query('DELETE FROM payments WHERE id = $1', [params.id])
    return NextResponse.json({ message: 'Paiement supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du paiement' }, { status: 500 })
  }
}
