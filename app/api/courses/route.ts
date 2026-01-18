import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, query } from '@/lib/db'

// GET - Liste des cours
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promotionId = searchParams.get('promotionId')
    const teacherId = searchParams.get('teacherId')
    const semester = searchParams.get('semester')
    const search = searchParams.get('search')

    let whereConditions = ['1=1']
    let params: any[] = []
    let paramIndex = 1

    if (promotionId) {
      whereConditions.push(`c.promotion_id = $${paramIndex}`)
      params.push(parseInt(promotionId))
      paramIndex++
    }

    if (teacherId) {
      whereConditions.push(`c.teacher_id = $${paramIndex}`)
      params.push(parseInt(teacherId))
      paramIndex++
    }

    if (semester) {
      whereConditions.push(`c.semester = $${paramIndex}`)
      params.push(parseInt(semester))
      paramIndex++
    }

    if (search) {
      whereConditions.push(`(c.name ILIKE $${paramIndex} OR c.code ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.join(' AND ')

    const courses = await queryMany(
      `SELECT c.id, c.code, c.name, c.description, c.credits, c.hours_cm, c.hours_td, c.hours_tp,
              c.semester, c.course_type, c.is_active,
              p.id as promotion_id, p.name as promotion_name, p.level as promotion_level,
              t.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
              d.name as department_name, f.name as faculty_name
       FROM courses c
       JOIN promotions p ON c.promotion_id = p.id
       JOIN departments d ON p.department_id = d.id
       JOIN faculties f ON d.faculty_id = f.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE ${whereClause}
       ORDER BY c.semester, c.name`,
      params
    )

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cours' },
      { status: 500 }
    )
  }
}

// POST - Créer un cours
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      name,
      description,
      credits,
      hoursCm,
      hoursTd,
      hoursTp,
      promotionId,
      teacherId,
      semester,
      courseType
    } = body

    if (!code || !name || !promotionId || !semester) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    const result = await queryOne<{ id: number }>(
      `INSERT INTO courses (code, name, description, credits, hours_cm, hours_td, hours_tp, promotion_id, teacher_id, semester, course_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [code, name, description, credits || 3, hoursCm || 0, hoursTd || 0, hoursTp || 0, promotionId, teacherId, semester, courseType || 'OBLIGATOIRE']
    )

    return NextResponse.json({
      success: true,
      courseId: result?.id,
      message: 'Cours créé avec succès'
    })
  } catch (error: any) {
    console.error('Error creating course:', error)
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ce code de cours existe déjà pour cette promotion' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du cours' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un cours
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID du cours requis' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE courses SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        credits = COALESCE($3, credits),
        hours_cm = COALESCE($4, hours_cm),
        hours_td = COALESCE($5, hours_td),
        hours_tp = COALESCE($6, hours_tp),
        teacher_id = $7,
        semester = COALESCE($8, semester),
        course_type = COALESCE($9, course_type),
        is_active = COALESCE($10, is_active)
       WHERE id = $11`,
      [data.name, data.description, data.credits, data.hoursCm, data.hoursTd, data.hoursTp, data.teacherId, data.semester, data.courseType, data.isActive, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Cours mis à jour avec succès'
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du cours' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un cours
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du cours requis' },
        { status: 400 }
      )
    }

    await query('DELETE FROM courses WHERE id = $1', [parseInt(id)])

    return NextResponse.json({
      success: true,
      message: 'Cours supprimé avec succès'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du cours' },
      { status: 500 }
    )
  }
}
