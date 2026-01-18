import { NextRequest, NextResponse } from 'next/server'
import { queryMany } from '@/lib/db'

// GET - Obtenir des statistiques et données agrégées sur les cours
export async function GET(request: NextRequest) {
  try {
    const courses = await queryMany(
      `SELECT 
        c.id, c.code, c.name, c.credits, c.semester, c.is_active, c.course_type,
        d.name as department_name,
        t.id as teacher_id,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name,
        COUNT(DISTINCT e.student_id) as enrolled_students
       FROM courses c
       JOIN promotions p ON c.promotion_id = p.id
       JOIN departments d ON p.department_id = d.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'ENROLLED'
       WHERE c.is_active = TRUE
       GROUP BY c.id, c.code, c.name, c.credits, c.semester, c.is_active, c.course_type, 
                d.name, t.id, u.first_name, u.last_name
       ORDER BY d.name, c.semester, c.name`
    )

    // Récupérer les statistiques
    const statsResult = await queryMany(
      `SELECT 
        COUNT(*) as total_courses,
        SUM(credits) as total_credits,
        COUNT(DISTINCT p.department_id) as departments_count
       FROM courses c
       JOIN promotions p ON c.promotion_id = p.id
       WHERE c.is_active = TRUE`
    )

    const stats = statsResult[0] || { total_courses: 0, total_credits: 0, departments_count: 0 }

    // Formater les cours
    const formattedCourses = courses.map((c: any) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      credits: c.credits,
      semester: c.semester,
      courseType: c.course_type,
      isActive: c.is_active,
      department: c.department_name,
      teacher: c.teacher_first_name ? `Prof. ${c.teacher_last_name}` : 'Non assigné',
      teacherId: c.teacher_id,
      enrolledStudents: parseInt(c.enrolled_students) || 0
    }))

    return NextResponse.json({
      courses: formattedCourses,
      stats: {
        totalCourses: parseInt(stats.total_courses) || 0,
        totalCredits: parseInt(stats.total_credits) || 0,
        departmentsCount: parseInt(stats.departments_count) || 0
      }
    })
  } catch (error) {
    console.error('Error fetching courses stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
