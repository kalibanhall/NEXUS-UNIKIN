import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query } from '@/lib/db'

// GET - Liste des présences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereConditions = ['1=1']
    let params: any[] = []
    let paramIndex = 1

    if (studentId) {
      whereConditions.push(`a.student_id = $${paramIndex}`)
      params.push(parseInt(studentId))
      paramIndex++
    }

    if (courseId) {
      whereConditions.push(`a.course_id = $${paramIndex}`)
      params.push(parseInt(courseId))
      paramIndex++
    }

    if (startDate) {
      whereConditions.push(`a.attendance_date >= $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      whereConditions.push(`a.attendance_date <= $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    const attendances = await queryMany(
      `SELECT a.id, a.attendance_date, a.status, a.remarks,
              s.id as student_id, s.matricule, u.first_name as student_first_name, u.last_name as student_last_name,
              c.id as course_id, c.code as course_code, c.name as course_name
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN courses c ON a.course_id = c.id
       WHERE ${whereClause}
       ORDER BY a.attendance_date DESC, u.last_name`,
      params
    )

    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des présences' },
      { status: 500 }
    )
  }
}

// POST - Enregistrer des présences (en lot)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, date, attendances, recordedBy } = body

    if (!courseId || !date || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json(
        { error: 'Données de présence incomplètes' },
        { status: 400 }
      )
    }

    let insertedCount = 0
    let updatedCount = 0

    for (const attendance of attendances) {
      const { studentId, status, remarks } = attendance

      // Vérifier si une présence existe déjà pour cette date
      const existing = await queryOne<{ id: number }>(
        'SELECT id FROM attendance WHERE student_id = $1 AND course_id = $2 AND attendance_date = $3',
        [studentId, courseId, date]
      )

      if (existing) {
        await query(
          'UPDATE attendance SET status = $1, remarks = $2, recorded_by = $3 WHERE id = $4',
          [status, remarks, recordedBy, existing.id]
        )
        updatedCount++
      } else {
        await query(
          'INSERT INTO attendance (student_id, course_id, attendance_date, status, remarks, recorded_by) VALUES ($1, $2, $3, $4, $5, $6)',
          [studentId, courseId, date, status, remarks, recordedBy]
        )
        insertedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${insertedCount} présence(s) enregistrée(s), ${updatedCount} mise(s) à jour`
    })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement des présences' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une présence
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, remarks } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la présence requis' },
        { status: 400 }
      )
    }

    await query(
      'UPDATE attendance SET status = COALESCE($1, status), remarks = $2 WHERE id = $3',
      [status, remarks, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Présence mise à jour avec succès'
    })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la présence' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une présence
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la présence requis' },
        { status: 400 }
      )
    }

    await query('DELETE FROM attendance WHERE id = $1', [parseInt(id)])

    return NextResponse.json({
      success: true,
      message: 'Présence supprimée avec succès'
    })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la présence' },
      { status: 500 }
    )
  }
}
