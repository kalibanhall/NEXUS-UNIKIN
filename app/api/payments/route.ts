// API Paiements - CRUD complet
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des paiements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const academicYearId = searchParams.get('academic_year_id')
    const status = searchParams.get('status')
    const paymentType = searchParams.get('payment_type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let conditions = []
    let params: any[] = []
    let paramIndex = 1

    if (studentId) {
      conditions.push(`p.student_id = $${paramIndex}`)
      params.push(studentId)
      paramIndex++
    }
    if (academicYearId) {
      conditions.push(`p.academic_year_id = $${paramIndex}`)
      params.push(academicYearId)
      paramIndex++
    }
    if (status) {
      conditions.push(`p.status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }
    if (paymentType) {
      conditions.push(`p.payment_type = $${paramIndex}`)
      params.push(paymentType)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count
    const countResult = await query(`SELECT COUNT(*) as total FROM payments p ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].total)

    // Get payments
    const result = await query(
      `SELECT p.*, 
              s.matricule, u.first_name || ' ' || u.last_name as student_name,
              ay.name as academic_year,
              ru.first_name || ' ' || ru.last_name as recorded_by_name
       FROM payments p
       JOIN students s ON p.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN academic_years ay ON p.academic_year_id = ay.id
       LEFT JOIN users ru ON p.recorded_by = ru.id
       ${whereClause}
       ORDER BY p.payment_date DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      payments: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des paiements' }, { status: 500 })
  }
}

// POST - Enregistrer un paiement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, academicYearId, amount, paymentType, paymentMethod, reference, remarks, recordedBy } = body

    if (!studentId || !academicYearId || !amount || !paymentType) {
      return NextResponse.json({ error: 'Étudiant, année, montant et type requis' }, { status: 400 })
    }

    // Générer le numéro de reçu
    const year = new Date().getFullYear()
    const countResult = await queryOne(
      "SELECT COUNT(*) as count FROM payments WHERE receipt_number LIKE $1",
      [`REC-${year}-%`]
    )
    const count = parseInt(countResult?.count || '0') + 1
    const receiptNumber = `REC-${year}-${String(count).padStart(5, '0')}`

    const result = await query(
      `INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_method, reference, receipt_number, status, recorded_by, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED', $8, $9)
       RETURNING *`,
      [studentId, academicYearId, amount, paymentType, paymentMethod || 'CASH', reference || null, receiptNumber, recordedBy || null, remarks || null]
    )

    // Mettre à jour le statut de paiement de l'étudiant
    await updateStudentPaymentStatus(studentId, academicYearId)

    return NextResponse.json({
      message: 'Paiement enregistré avec succès',
      payment: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du paiement' }, { status: 500 })
  }
}

async function updateStudentPaymentStatus(studentId: number, academicYearId: number) {
  // Calculer le total payé
  const paidResult = await queryOne(
    `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments 
     WHERE student_id = $1 AND academic_year_id = $2 AND status = 'COMPLETED'`,
    [studentId, academicYearId]
  )
  const totalPaid = parseFloat(paidResult?.total_paid || '0')

  // Récupérer le montant dû (depuis la configuration des frais)
  const student = await queryOne('SELECT promotion_id FROM students WHERE id = $1', [studentId])
  const feesResult = await queryOne(
    `SELECT COALESCE(SUM(amount), 0) as total_fees FROM fee_structures 
     WHERE academic_year_id = $1 AND (promotion_id = $2 OR promotion_id IS NULL) AND is_active = TRUE`,
    [academicYearId, student?.promotion_id]
  )
  const totalFees = parseFloat(feesResult?.total_fees || '1300') // Default 1300 USD

  let status = 'UNPAID'
  if (totalPaid >= totalFees) {
    status = 'PAID'
  } else if (totalPaid > 0) {
    status = 'PARTIAL'
  }

  await query('UPDATE students SET payment_status = $1 WHERE id = $2', [status, studentId])
}
