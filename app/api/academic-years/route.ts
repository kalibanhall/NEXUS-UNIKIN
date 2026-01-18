// API Années Académiques
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des années académiques
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const current = searchParams.get('current')

    let sql = 'SELECT * FROM academic_years'
    let params: any[] = []

    if (current === 'true') {
      sql += ' WHERE is_current = TRUE'
    }

    sql += ' ORDER BY start_date DESC'

    const result = await query(sql, params)
    return NextResponse.json({ academicYears: result.rows })
  } catch (error) {
    console.error('Error fetching academic years:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des années académiques' }, { status: 500 })
  }
}

// POST - Créer une année académique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, startDate, endDate, isCurrent } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Nom, date début et date fin requis' }, { status: 400 })
    }

    // Si c'est l'année courante, désactiver les autres
    if (isCurrent) {
      await query('UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE')
    }

    const result = await query(
      `INSERT INTO academic_years (name, start_date, end_date, is_current)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, startDate, endDate, isCurrent || false]
    )

    return NextResponse.json({
      message: 'Année académique créée',
      academicYear: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating academic year:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'année académique' }, { status: 500 })
  }
}

// PUT - Modifier (pour définir l'année courante)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isCurrent } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    if (isCurrent) {
      await query('UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE')
    }

    const result = await query(
      'UPDATE academic_years SET is_current = $1 WHERE id = $2 RETURNING *',
      [isCurrent, id]
    )

    return NextResponse.json({
      message: 'Année académique modifiée',
      academicYear: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating academic year:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 })
  }
}
