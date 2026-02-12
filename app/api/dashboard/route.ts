// API Dashboard - Statistiques générales
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Statistiques du dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const userId = searchParams.get('user_id')

    // Statistiques communes
    const currentYear = await queryOne('SELECT * FROM academic_years WHERE is_current = TRUE')
    
    let stats: any = {
      currentAcademicYear: currentYear
    }

    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      // Stats admin
      const studentsCount = await queryOne('SELECT COUNT(*) as count FROM students WHERE status = $1', ['ACTIVE'])
      const teachersCount = await queryOne('SELECT COUNT(*) as count FROM teachers')
      const coursesCount = await queryOne('SELECT COUNT(*) as count FROM courses WHERE is_active = TRUE')
      const facultiesCount = await queryOne('SELECT COUNT(*) as count FROM faculties WHERE is_active = TRUE')
      
      const paymentStats = await queryOne(
        `SELECT 
           COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid,
           COUNT(CASE WHEN payment_status = 'PARTIAL' THEN 1 END) as partial,
           COUNT(CASE WHEN payment_status = 'UNPAID' THEN 1 END) as unpaid,
           COUNT(CASE WHEN payment_status = 'BLOCKED' THEN 1 END) as blocked
         FROM students WHERE status = 'ACTIVE'`
      )

      const recentPayments = await query(
        `SELECT p.*, s.matricule, u.first_name || ' ' || u.last_name as student_name
         FROM payments p
         JOIN students s ON p.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE p.status = 'COMPLETED'
         ORDER BY p.payment_date DESC LIMIT 5`
      )

      const totalRevenue = await queryOne(
        `SELECT COALESCE(SUM(amount), 0) as total FROM payments 
         WHERE status = 'COMPLETED' AND academic_year_id = $1`,
        [currentYear?.id || 1]
      )

      stats = {
        ...stats,
        students: parseInt(studentsCount?.count || '0'),
        teachers: parseInt(teachersCount?.count || '0'),
        courses: parseInt(coursesCount?.count || '0'),
        faculties: parseInt(facultiesCount?.count || '0'),
        paymentStats,
        recentPayments: recentPayments.rows,
        totalRevenue: parseFloat(totalRevenue?.total || '0')
      }
    } else if (role === 'TEACHER' && userId) {
      // Stats enseignant
      const teacher = await queryOne(
        `SELECT t.*, d.name as department_name, f.name as faculty_name
         FROM teachers t
         LEFT JOIN departments d ON t.department_id = d.id
         LEFT JOIN faculties f ON d.faculty_id = f.id
         WHERE t.user_id = $1`, 
        [userId]
      )
      
      if (teacher) {
        const courses = await query(
          `SELECT c.*, p.name as promotion_name, p.level,
                  (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as student_count,
                  (SELECT COUNT(*) FROM enrollments e 
                   LEFT JOIN grades g ON g.student_id = e.student_id AND g.course_id = c.id
                   WHERE e.course_id = c.id AND (g.final_score IS NULL OR g.is_validated = FALSE)) as pending_grades
           FROM courses c
           JOIN promotions p ON c.promotion_id = p.id
           WHERE c.teacher_id = $1 AND c.is_active = TRUE
           ORDER BY c.semester, c.name`,
          [teacher.id]
        )

        const totalStudents = await queryOne(
          `SELECT COUNT(DISTINCT e.student_id) as count FROM enrollments e
           JOIN courses c ON e.course_id = c.id
           WHERE c.teacher_id = $1`,
          [teacher.id]
        )

        const pendingGrades = courses.rows.reduce((sum: number, c: any) => sum + parseInt(c.pending_grades || '0'), 0)

        // Attendance rate for teacher's courses
        const attendanceStats = await queryOne(
          `SELECT 
             COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present,
             COUNT(*) as total
           FROM attendance a
           JOIN courses c ON a.course_id = c.id
           WHERE c.teacher_id = $1`,
          [teacher.id]
        )
        
        const attendanceRate = attendanceStats?.total > 0 
          ? Math.round((parseInt(attendanceStats.present) / parseInt(attendanceStats.total)) * 100) 
          : 0

        // Today's schedule
        const dayOfWeek = new Date().getDay()
        const schedule = await query(
          `SELECT cs.*, c.code as course_code, c.name as course_name, cs.room as room_name
           FROM course_schedules cs
           JOIN courses c ON cs.course_id = c.id
           WHERE c.teacher_id = $1 AND cs.day_of_week = $2
           ORDER BY cs.start_time`,
          [teacher.id, dayOfWeek]
        )

        stats = {
          ...stats,
          teacher,
          courses: courses.rows,
          totalStudents: parseInt(totalStudents?.count || '0'),
          pendingGrades,
          attendanceRate,
          schedule: schedule.rows
        }
      }
    } else if (role === 'STUDENT' && userId) {
      // Stats étudiant
      const student = await queryOne(
        `SELECT s.*, p.name as promotion_name, p.level, d.name as department_name, f.name as faculty_name,
                s.option_name, s.code_promotion
         FROM students s
         LEFT JOIN promotions p ON s.promotion_id = p.id
         LEFT JOIN departments d ON p.department_id = d.id
         LEFT JOIN faculties f ON d.faculty_id = f.id
         WHERE s.user_id = $1`,
        [userId]
      )

      if (student) {
        const enrolledCourses = await query(
          `SELECT c.*, e.status as enrollment_status,
                  g.tp_score, g.td_score, g.exam_score, g.final_score, g.grade_letter,
                  u.first_name || ' ' || u.last_name as teacher_name
           FROM enrollments e
           JOIN courses c ON e.course_id = c.id
           LEFT JOIN grades g ON g.student_id = $1 AND g.course_id = c.id
           LEFT JOIN teachers t ON c.teacher_id = t.id
           LEFT JOIN users u ON t.user_id = u.id
           WHERE e.student_id = $1
           ORDER BY c.semester, c.name`,
          [student.id]
        )

        const payments = await query(
          `SELECT * FROM payments 
           WHERE student_id = $1 AND status = 'COMPLETED'
           ORDER BY payment_date DESC`,
          [student.id]
        )

        const totalPaid = payments.rows.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0)

        const attendance = await queryOne(
          `SELECT 
             COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
             COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
             COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late,
             COUNT(*) as total
           FROM attendance WHERE student_id = $1`,
          [student.id]
        )

        stats = {
          ...stats,
          student,
          courses: enrolledCourses.rows,
          payments: payments.rows,
          totalPaid,
          attendance
        }
      }
    } else if (role === 'EMPLOYEE' && userId) {
      // Stats employé
      const employee = await queryOne(
        `SELECT e.*, d.name as department_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE e.user_id = $1`,
        [userId]
      )

      const totalStudents = await queryOne('SELECT COUNT(*) as count FROM students WHERE status = $1', ['ACTIVE'])

      const pendingDocuments = await queryOne(
        `SELECT COUNT(*) as count FROM documents WHERE status = 'PENDING'`
      )

      const todayPayments = await queryOne(
        `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
         FROM payments WHERE DATE(payment_date) = CURRENT_DATE AND status = 'COMPLETED'`
      )

      const monthPayments = await queryOne(
        `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
         FROM payments 
         WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND status = 'COMPLETED'`
      )

      // Recent payments
      const recentPayments = await query(
        `SELECT p.*, s.matricule, u.first_name || ' ' || u.last_name as student_name
         FROM payments p
         JOIN students s ON p.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE p.status = 'COMPLETED'
         ORDER BY p.payment_date DESC LIMIT 10`
      )

      // Recent documents
      const recentDocuments = await query(
        `SELECT d.*, s.matricule, u.first_name || ' ' || u.last_name as student_name
         FROM documents d
         JOIN students s ON d.student_id = s.id
         JOIN users u ON s.user_id = u.id
         ORDER BY d.request_date DESC LIMIT 10`
      )

      // Pending tasks (documents + others)
      const pendingTasks = await query(
        `SELECT 'DOCUMENT' as type, d.document_type as title, d.status, d.request_date,
                s.matricule, u.first_name || ' ' || u.last_name as student_name,
                CASE WHEN d.request_date < CURRENT_DATE - INTERVAL '3 days' THEN 'HIGH'
                     WHEN d.request_date < CURRENT_DATE - INTERVAL '1 day' THEN 'MEDIUM'
                     ELSE 'LOW' END as priority
         FROM documents d
         JOIN students s ON d.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE d.status = 'PENDING'
         ORDER BY d.request_date ASC LIMIT 10`
      )

      stats = {
        ...stats,
        employee,
        stats: {
          processedToday: parseInt(todayPayments?.count || '0'),
          pending: parseInt(pendingDocuments?.count || '0'),
          totalStudents: parseInt(totalStudents?.count || '0'),
          paymentsValidated: parseInt(monthPayments?.count || '0')
        },
        recentPayments: recentPayments.rows,
        recentDocuments: recentDocuments.rows,
        pendingTasks: pendingTasks.rows
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des statistiques' }, { status: 500 })
  }
}
