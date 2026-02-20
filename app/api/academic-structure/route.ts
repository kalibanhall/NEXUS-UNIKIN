// API Academic Structure - Faculties, Departments, Promotions
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const facultyId = searchParams.get('faculty_id')
    const departmentId = searchParams.get('department_id')

    // Liste des facultés
    if (type === 'faculties' || (!type && !facultyId && !departmentId)) {
      const result = await query(
        `SELECT id, name, code FROM faculties WHERE is_active = TRUE ORDER BY name`
      )
      return NextResponse.json({ faculties: result.rows })
    }

    // Liste des départements d'une faculté
    if (type === 'departments' && facultyId) {
      const result = await query(
        `SELECT id, name, code FROM departments WHERE faculty_id = $1 AND is_active = TRUE ORDER BY name`,
        [parseInt(facultyId)]
      )
      return NextResponse.json({ departments: result.rows })
    }

    // Liste des promotions d'un département
    if (type === 'promotions' && departmentId) {
      const result = await query(
        `SELECT id, name, level, code FROM promotions WHERE department_id = $1 AND is_active = TRUE ORDER BY level, name`,
        [parseInt(departmentId)]
      )
      return NextResponse.json({ promotions: result.rows })
    }

    return NextResponse.json({ error: 'Paramètres manquants. Utilisez type=faculties, departments (avec faculty_id), ou promotions (avec department_id)' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching academic structure:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
