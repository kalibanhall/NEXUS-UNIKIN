// API Student Schedule - Emploi du temps du jour pour un étudiant
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 })
    }

    // Get the student record from user_id
    const student = await queryOne(
      `SELECT s.id, s.promotion_id FROM students s WHERE s.user_id = $1`,
      [userId]
    )

    if (!student) {
      return NextResponse.json({ schedule: [] })
    }

    // Get today's day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const dayOfWeek = new Date().getDay()

    // Get schedule for today based on courses in the student's promotion
    // Students are enrolled in courses via enrollments, or courses belong to their promotion
    const scheduleResult = await query(
      `SELECT DISTINCT cs.*, c.code as course_code, c.name as course_name, cs.schedule_type as type,
              u.first_name || ' ' || u.last_name as teacher_name, cs.room as room_name
       FROM course_schedules cs
       JOIN courses c ON cs.course_id = c.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE cs.day_of_week = $1
         AND (
           c.id IN (SELECT course_id FROM enrollments WHERE student_id = $2)
           OR c.promotion_id = $3
         )
       ORDER BY cs.start_time`,
      [dayOfWeek, student.id, student.promotion_id]
    )

    return NextResponse.json({ schedule: scheduleResult.rows })
  } catch (error) {
    console.error('Erreur student-schedule:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
