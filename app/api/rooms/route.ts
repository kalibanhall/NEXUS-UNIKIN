// API Salles
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Liste des salles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const building = searchParams.get('building')
    const roomType = searchParams.get('type')
    const available = searchParams.get('available')

    let conditions = []
    let params: any[] = []
    let paramIndex = 1

    if (building) {
      conditions.push(`building = $${paramIndex}`)
      params.push(building)
      paramIndex++
    }
    if (roomType) {
      conditions.push(`room_type = $${paramIndex}`)
      params.push(roomType)
      paramIndex++
    }
    if (available === 'true') {
      conditions.push('is_available = TRUE')
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await query(
      `SELECT * FROM rooms ${whereClause} ORDER BY building, code`,
      params
    )

    // Grouper par bâtiment
    const buildings = await query('SELECT DISTINCT building FROM rooms ORDER BY building')
    
    return NextResponse.json({
      rooms: result.rows,
      buildings: buildings.rows.map((b: any) => b.building)
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des salles' }, { status: 500 })
  }
}

// POST - Créer une salle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, building, floor, capacity, roomType, equipment } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'Code et nom requis' }, { status: 400 })
    }

    const existing = await queryOne('SELECT id FROM rooms WHERE code = $1', [code])
    if (existing) {
      return NextResponse.json({ error: 'Ce code de salle existe déjà' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO rooms (code, name, building, floor, capacity, room_type, equipment, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING *`,
      [code, name, building || null, floor || null, capacity || 30, roomType || 'SALLE', equipment || null]
    )

    return NextResponse.json({
      message: 'Salle créée',
      room: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la salle' }, { status: 500 })
  }
}
