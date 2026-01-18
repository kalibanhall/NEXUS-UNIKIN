// API Emploi du temps
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Emploi du temps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const promotionId = searchParams.get('promotion_id')
    const teacherId = searchParams.get('teacher_id')
    const studentId = searchParams.get('student_id')
    const roomId = searchParams.get('room_id')

    let conditions = []
    let params: any[] = []
    let paramIndex = 1

    let joinClauses = `
      JOIN courses c ON cs.course_id = c.id
      LEFT JOIN promotions p ON c.promotion_id = p.id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      LEFT JOIN rooms r ON cs.room = r.code
    `

    if (promotionId) {
      conditions.push(`c.promotion_id = $${paramIndex}`)
      params.push(promotionId)
      paramIndex++
    }

    if (teacherId) {
      conditions.push(`c.teacher_id = $${paramIndex}`)
      params.push(teacherId)
      paramIndex++
    }

    if (studentId) {
      // Récupérer la promotion de l'étudiant
      const student = await queryOne('SELECT promotion_id FROM students WHERE id = $1', [studentId])
      if (student) {
        conditions.push(`c.promotion_id = $${paramIndex}`)
        params.push(student.promotion_id)
        paramIndex++
      }
    }

    if (roomId) {
      conditions.push(`r.id = $${paramIndex}`)
      params.push(roomId)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')} AND c.is_active = TRUE` : 'WHERE c.is_active = TRUE'

    const result = await query(
      `SELECT cs.*, c.code as course_code, c.name as course_name, c.credits,
              p.name as promotion_name, p.level,
              tu.first_name || ' ' || tu.last_name as teacher_name,
              r.name as room_name, r.building, r.capacity
       FROM course_schedules cs
       ${joinClauses}
       ${whereClause}
       ORDER BY cs.day_of_week, cs.start_time`,
      params
    )

    // Organiser par jour de la semaine
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const scheduleByDay: any = {}
    
    for (let i = 0; i <= 6; i++) {
      scheduleByDay[i] = {
        dayName: days[i],
        dayNumber: i,
        schedules: result.rows.filter((s: any) => s.day_of_week === i)
      }
    }

    return NextResponse.json({
      schedules: result.rows,
      byDay: scheduleByDay
    })
  } catch (error) {
    console.error('Error fetching timetable:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'emploi du temps' }, { status: 500 })
  }
}

// POST - Créer un horaire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, dayOfWeek, startTime, endTime, room, scheduleType } = body

    if (!courseId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: 'Cours, jour, heures requis' }, { status: 400 })
    }

    // Vérifier les conflits de salle
    if (room) {
      const conflict = await queryOne(
        `SELECT cs.*, c.name as course_name FROM course_schedules cs
         JOIN courses c ON cs.course_id = c.id
         WHERE cs.room = $1 AND cs.day_of_week = $2
         AND ((cs.start_time <= $3 AND cs.end_time > $3) 
              OR (cs.start_time < $4 AND cs.end_time >= $4)
              OR (cs.start_time >= $3 AND cs.end_time <= $4))`,
        [room, dayOfWeek, startTime, endTime]
      )
      if (conflict) {
        return NextResponse.json(
          { error: `Conflit: La salle est occupée par "${conflict.course_name}" de ${conflict.start_time} à ${conflict.end_time}` },
          { status: 400 }
        )
      }
    }

    const result = await query(
      `INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room, schedule_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [courseId, dayOfWeek, startTime, endTime, room || null, scheduleType || 'CM']
    )

    return NextResponse.json({
      message: 'Horaire créé',
      schedule: result.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'horaire' }, { status: 500 })
  }
}
