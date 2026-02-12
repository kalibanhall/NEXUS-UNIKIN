// API Finances étudiants - Frais académiques, labo, enrollment, bordereaux
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// Grille tarifaire par niveau (en USD)
function getAcademicFeesByLevel(level: string): number {
  const upperLevel = (level || '').toUpperCase()
  // L1, L0, B1, PREP, GRADE1 → 350 USD (classes inférieures / première année)
  if (['L0', 'L1', 'B1', 'PREP', 'GRADE1', 'P1', 'IR1', 'D1'].includes(upperLevel)) {
    return 350
  }
  // Tous les autres niveaux → 270 USD
  return 270
}

// Frais d'inscription fixes en CDF
const FRAIS_INSCRIPTION_CDF = 145000

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

    // Obtenir le niveau de l'étudiant
    const student = await queryOne(
      `SELECT s.id, s.matricule, s.payment_status, p.level, p.name as promotion_name,
              d.name as department_name, f.name as faculty_name
       FROM students s
       LEFT JOIN promotions p ON s.promotion_id = p.id
       LEFT JOIN departments d ON p.department_id = d.id
       LEFT JOIN faculties f ON d.faculty_id = f.id
       WHERE s.id = $1`,
      [studentId]
    )

    const level = student?.level || 'L1'
    const academicFeeDue = getAcademicFeesByLevel(level)

    // Paiements USD
    const paymentsUSD = await query(
      `SELECT * FROM payments 
       WHERE student_id = $1 AND status = 'COMPLETED' AND (devise = 'USD' OR devise IS NULL)
       ORDER BY payment_date DESC`,
      [studentId]
    )

    // Paiements CDF (inscription)
    const paymentsCDF = await query(
      `SELECT * FROM payments 
       WHERE student_id = $1 AND status = 'COMPLETED' AND devise = 'CDF'
       ORDER BY payment_date DESC`,
      [studentId]
    )

    // Tous les paiements pour l'historique
    const allPayments = await query(
      `SELECT * FROM payments 
       WHERE student_id = $1 AND status = 'COMPLETED'
       ORDER BY payment_date DESC`,
      [studentId]
    )

    const totalPaidUSD = paymentsUSD.rows.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0)
    const totalPaidCDF = paymentsCDF.rows.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0)

    // Structure des frais
    const fees = [
      { 
        fee_type: 'FRAIS_ACADEMIQUES', 
        name: 'Frais académiques', 
        amount_due: academicFeeDue, 
        amount_paid: totalPaidUSD,
        currency: 'USD',
        description: level === 'L1' || level === 'L0' || level === 'B1' || level === 'PREP' 
          ? 'Frais académiques (1ère année)' 
          : 'Frais académiques'
      },
      { 
        fee_type: 'FRAIS_INSCRIPTION', 
        name: 'Frais d\'inscription', 
        amount_due: FRAIS_INSCRIPTION_CDF, 
        amount_paid: totalPaidCDF,
        currency: 'CDF',
        description: 'Frais d\'inscription et formulaire'
      },
    ]

    const remainingUSD = Math.max(0, academicFeeDue - totalPaidUSD)
    const remainingCDF = Math.max(0, FRAIS_INSCRIPTION_CDF - totalPaidCDF)

    // Pourcentage global (on pondère USD et CDF)
    const percentUSD = academicFeeDue > 0 ? Math.min(100, Math.round((totalPaidUSD / academicFeeDue) * 100)) : 100
    const percentCDF = FRAIS_INSCRIPTION_CDF > 0 ? Math.min(100, Math.round((totalPaidCDF / FRAIS_INSCRIPTION_CDF) * 100)) : 100

    return NextResponse.json({
      student: {
        level,
        promotion_name: student?.promotion_name,
        department_name: student?.department_name,
        faculty_name: student?.faculty_name,
        payment_status: student?.payment_status,
      },
      fees,
      payments: allPayments.rows,
      receipts: [],
      summary: {
        totalDueUSD: academicFeeDue,
        totalPaidUSD,
        remainingUSD,
        percentageUSD: percentUSD,
        totalDueCDF: FRAIS_INSCRIPTION_CDF,
        totalPaidCDF,
        remainingCDF,
        percentageCDF: percentCDF,
        // Legacy fields for backward compatibility
        totalDue: academicFeeDue,
        totalPaid: totalPaidUSD,
        totalRemaining: remainingUSD,
        percentagePaid: percentUSD,
        isComplete: remainingUSD <= 0 && remainingCDF <= 0
      },
    })
  } catch (error) {
    console.error('Error fetching student finances:', error)
    return NextResponse.json({ 
      fees: [],
      payments: [],
      receipts: [],
      summary: {
        totalDueUSD: 0, totalPaidUSD: 0, remainingUSD: 0, percentageUSD: 0,
        totalDueCDF: 0, totalPaidCDF: 0, remainingCDF: 0, percentageCDF: 0,
        totalDue: 0, totalPaid: 0, totalRemaining: 0, percentagePaid: 0,
        isComplete: false
      },
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
