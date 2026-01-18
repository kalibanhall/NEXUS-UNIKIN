// API Finances étudiants - Frais académiques, labo, enrollment, bordereaux
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Obtenir la situation financière d'un étudiant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const academicYearId = searchParams.get('academic_year_id')

    if (!studentId) {
      return NextResponse.json({ error: 'student_id requis' }, { status: 400 })
    }

    // Obtenir l'année académique courante si non spécifiée
    let yearId = academicYearId
    if (!yearId) {
      const currentYear = await queryOne(
        `SELECT id FROM academic_years WHERE is_current = TRUE`
      )
      yearId = currentYear?.id
    }

    // Paiements effectués (table existante)
    const payments = await query(
      `SELECT * FROM payments 
       WHERE student_id = $1 AND academic_year_id = $2 AND status = 'COMPLETED'
       ORDER BY payment_date DESC`,
      [studentId, yearId]
    )

    // Calculer les frais par type de paiement
    const paymentsByType: { [key: string]: number } = {}
    payments.rows.forEach((p: any) => {
      if (!paymentsByType[p.payment_type]) {
        paymentsByType[p.payment_type] = 0
      }
      paymentsByType[p.payment_type] += parseFloat(p.amount || 0)
    })

    // Créer des estimations par défaut basées sur les types de paiement existants
    const defaultFees = [
      { fee_type: 'INSCRIPTION', name: 'Frais d\'inscription', amount_due: 50 },
      { fee_type: 'FRAIS_ACADEMIQUES', name: 'Frais académiques', amount_due: 250 },
      { fee_type: 'FRAIS_MINERVAL', name: 'Minerval', amount_due: 100 }
    ]
    
    const fees = defaultFees.map(f => ({
      ...f,
      amount_paid: paymentsByType[f.fee_type] || 0,
      currency: 'USD'
    }))
    
    const totalDue = fees.reduce((sum: number, f: any) => sum + f.amount_due, 0)
    const totalPaid = payments.rows.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0)
    const totalRemaining = Math.max(0, totalDue - totalPaid)

    // Par catégorie
    const byCategory = fees.reduce((acc: any, f: any) => {
      const category = f.fee_type
      if (!acc[category]) {
        acc[category] = { due: 0, paid: 0, items: [] }
      }
      acc[category].due += f.amount_due
      acc[category].paid += f.amount_paid
      acc[category].items.push(f)
      return acc
    }, {})

    return NextResponse.json({
      fees: fees,
      payments: payments.rows,
      receipts: [],
      summary: {
        totalDue,
        totalPaid,
        totalRemaining,
        percentagePaid: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0,
        isComplete: totalPaid >= totalDue
      },
      byCategory
    })
  } catch (error) {
    console.error('Error fetching student finances:', error)
    return NextResponse.json({ 
      fees: [],
      payments: [],
      receipts: [],
      summary: {
        totalDue: 0,
        totalPaid: 0,
        totalRemaining: 0,
        percentagePaid: 0,
        isComplete: false
      },
      byCategory: {}
    }, { status: 200 })
  }
}

// POST - Enregistrer un bordereau/reçu de paiement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      studentId, 
      receiptType, 
      receiptNumber, 
      bankName, 
      bankReference, 
      amount, 
      paymentDate, 
      scanUrl, 
      notes 
    } = body

    if (!studentId || !receiptNumber || !amount || !paymentDate) {
      return NextResponse.json({ 
        error: 'studentId, receiptNumber, amount et paymentDate requis' 
      }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO payment_receipts 
       (student_id, receipt_type, receipt_number, bank_name, bank_reference, amount, payment_date, scan_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [studentId, receiptType || 'BORDEREAU', receiptNumber, bankName, bankReference, amount, paymentDate, scanUrl, notes]
    )

    return NextResponse.json({
      message: 'Bordereau enregistré avec succès',
      receipt: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
  }
}
