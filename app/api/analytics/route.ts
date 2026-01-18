/**
 * API Analytics et Prédiction IA
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { hasPermission } from '@/lib/auth/permissions'

// GET - Dashboard analytics, KPIs, prédictions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const facultyId = searchParams.get('faculty_id')
    const departmentId = searchParams.get('department_id')
    const academicYear = searchParams.get('academic_year')
    
    const canView = await hasPermission(userId, 'VIEW_ANALYTICS')
    if (!canView) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // ===== KPIs GLOBAUX =====
    if (type === 'global_kpis') {
      // Total étudiants actifs
      const students = await query(`
        SELECT COUNT(*) as total FROM students WHERE status = 'ACTIVE'
      `)
      
      // Total enseignants
      const teachers = await query(`
        SELECT COUNT(*) as total FROM teachers WHERE status = 'ACTIVE'
      `)
      
      // Taux de réussite global
      const successRate = await query(`
        SELECT 
          COUNT(*) FILTER (WHERE decision = 'ADMIS' OR decision = 'ADMIS_AVEC_DETTE') as passed,
          COUNT(*) as total
        FROM student_deliberations
        WHERE academic_year = $1
      `, [academicYear || '2024-2025'])
      
      const rate = successRate.rows[0]
      const passRate = rate.total > 0 ? ((rate.passed / rate.total) * 100).toFixed(1) : '0'
      
      // Revenus collectés
      const revenues = await query(`
        SELECT SUM(amount) as total FROM payments WHERE status = 'COMPLETED'
      `)
      
      // Cours actifs
      const courses = await query(`
        SELECT COUNT(*) as total FROM courses WHERE is_active = true
      `)
      
      return NextResponse.json({
        kpis: {
          totalStudents: parseInt(students.rows[0].total),
          totalTeachers: parseInt(teachers.rows[0].total),
          successRate: parseFloat(passRate),
          totalRevenue: parseFloat(revenues.rows[0]?.total || '0'),
          activeCourses: parseInt(courses.rows[0].total)
        }
      })
    }

    // ===== TENDANCES INSCRIPTIONS =====
    if (type === 'enrollment_trends') {
      const trends = await query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM students
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `)
      
      return NextResponse.json({ trends: trends.rows })
    }

    // ===== RÉPARTITION PAR FACULTÉ =====
    if (type === 'faculty_distribution') {
      const distribution = await query(`
        SELECT 
          f.id,
          f.name,
          f.code,
          COUNT(DISTINCT s.id) as student_count,
          COUNT(DISTINCT t.id) as teacher_count,
          (
            SELECT COUNT(*) 
            FROM student_deliberations sd
            JOIN promotions p ON sd.promotion_id = p.id
            JOIN departments d ON p.department_id = d.id
            WHERE d.faculty_id = f.id 
              AND (sd.decision = 'ADMIS' OR sd.decision = 'ADMIS_AVEC_DETTE')
          ) as passed_count
        FROM faculties f
        LEFT JOIN departments d ON d.faculty_id = f.id
        LEFT JOIN promotions p ON p.department_id = d.id
        LEFT JOIN students s ON s.promotion_id = p.id AND s.status = 'ACTIVE'
        LEFT JOIN teachers t ON t.department_id = d.id AND t.status = 'ACTIVE'
        GROUP BY f.id, f.name, f.code
        ORDER BY student_count DESC
      `)
      
      return NextResponse.json({ distribution: distribution.rows })
    }

    // ===== PERFORMANCE ACADÉMIQUE =====
    if (type === 'academic_performance') {
      let whereClause = ''
      const params: any[] = []
      let paramIndex = 1
      
      if (facultyId) {
        whereClause += ` AND d.faculty_id = $${paramIndex}`
        params.push(facultyId)
        paramIndex++
      }
      if (departmentId) {
        whereClause += ` AND p.department_id = $${paramIndex}`
        params.push(departmentId)
        paramIndex++
      }
      
      // Distribution des moyennes
      const grades = await query(`
        SELECT 
          CASE 
            WHEN average >= 16 THEN 'Distinction (16+)'
            WHEN average >= 14 THEN 'Très Bien (14-15.99)'
            WHEN average >= 12 THEN 'Bien (12-13.99)'
            WHEN average >= 10 THEN 'Passable (10-11.99)'
            ELSE 'Échec (<10)'
          END as category,
          COUNT(*) as count
        FROM student_deliberations sd
        JOIN promotions p ON sd.promotion_id = p.id
        JOIN departments d ON p.department_id = d.id
        WHERE average IS NOT NULL ${whereClause}
        GROUP BY category
        ORDER BY 
          CASE category 
            WHEN 'Distinction (16+)' THEN 1
            WHEN 'Très Bien (14-15.99)' THEN 2
            WHEN 'Bien (12-13.99)' THEN 3
            WHEN 'Passable (10-11.99)' THEN 4
            ELSE 5
          END
      `, params)
      
      // Évolution taux réussite par année
      const yearlyRates = await query(`
        SELECT 
          academic_year,
          COUNT(*) FILTER (WHERE decision = 'ADMIS' OR decision = 'ADMIS_AVEC_DETTE') as passed,
          COUNT(*) as total
        FROM student_deliberations
        GROUP BY academic_year
        ORDER BY academic_year DESC
        LIMIT 5
      `)
      
      return NextResponse.json({ 
        gradeDistribution: grades.rows,
        yearlyRates: yearlyRates.rows.map(r => ({
          ...r,
          rate: r.total > 0 ? ((r.passed / r.total) * 100).toFixed(1) : '0'
        }))
      })
    }

    // ===== ANALYSE FINANCIÈRE =====
    if (type === 'financial_analysis') {
      // Revenus par mois
      const monthlyRevenue = await query(`
        SELECT 
          DATE_TRUNC('month', payment_date) as month,
          SUM(amount) as total,
          payment_type
        FROM payments
        WHERE status = 'COMPLETED' AND payment_date >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', payment_date), payment_type
        ORDER BY month ASC
      `)
      
      // Taux de recouvrement
      const recovery = await query(`
        SELECT 
          (SELECT SUM(amount) FROM payments WHERE status = 'COMPLETED') as collected,
          (SELECT SUM(total_amount) FROM students WHERE status = 'ACTIVE') as expected
      `)
      
      // Arriérés par faculté
      const arrears = await query(`
        SELECT 
          f.name as faculty,
          SUM(s.total_amount - s.paid_amount) as arrears
        FROM students s
        JOIN promotions p ON s.promotion_id = p.id
        JOIN departments d ON p.department_id = d.id
        JOIN faculties f ON d.faculty_id = f.id
        WHERE s.status = 'ACTIVE' AND s.total_amount > s.paid_amount
        GROUP BY f.id, f.name
        ORDER BY arrears DESC
      `)
      
      return NextResponse.json({
        monthlyRevenue: monthlyRevenue.rows,
        recovery: recovery.rows[0],
        arrears: arrears.rows
      })
    }

    // ===== PRÉDICTIONS IA =====
    if (type === 'predictions') {
      const canPredict = await hasPermission(userId, 'VIEW_PREDICTIONS')
      
      // Prédiction étudiants à risque basée sur:
      // - Assiduité < 75%
      // - Notes moyennes < 10
      // - Retards de paiement
      const atRiskStudents = await query(`
        SELECT 
          s.id,
          u.first_name || ' ' || u.last_name as name,
          u.matricule,
          p.name as promotion,
          f.name as faculty,
          COALESCE(att.attendance_rate, 0) as attendance_rate,
          COALESCE(gr.average_grade, 0) as average_grade,
          CASE WHEN s.paid_amount < s.total_amount * 0.5 THEN true ELSE false END as payment_risk,
          (
            (CASE WHEN COALESCE(att.attendance_rate, 0) < 75 THEN 30 ELSE 0 END) +
            (CASE WHEN COALESCE(gr.average_grade, 0) < 10 THEN 40 ELSE 0 END) +
            (CASE WHEN s.paid_amount < s.total_amount * 0.5 THEN 30 ELSE 0 END)
          ) as risk_score
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN promotions p ON s.promotion_id = p.id
        JOIN departments d ON p.department_id = d.id
        JOIN faculties f ON d.faculty_id = f.id
        LEFT JOIN (
          SELECT student_id, AVG(CASE WHEN status = 'PRESENT' THEN 100 ELSE 0 END) as attendance_rate
          FROM attendance
          GROUP BY student_id
        ) att ON att.student_id = s.id
        LEFT JOIN (
          SELECT student_id, AVG(COALESCE(final_grade, 0)) as average_grade
          FROM grades
          GROUP BY student_id
        ) gr ON gr.student_id = s.id
        WHERE s.status = 'ACTIVE'
        HAVING (
          (CASE WHEN COALESCE(att.attendance_rate, 0) < 75 THEN 30 ELSE 0 END) +
          (CASE WHEN COALESCE(gr.average_grade, 0) < 10 THEN 40 ELSE 0 END) +
          (CASE WHEN s.paid_amount < s.total_amount * 0.5 THEN 30 ELSE 0 END)
        ) >= 50
        ORDER BY risk_score DESC
        LIMIT 50
      `)
      
      // Prédiction taux réussite par promotion
      const promotionPredictions = await query(`
        SELECT 
          p.id,
          p.name as promotion,
          d.name as department,
          f.name as faculty,
          COUNT(DISTINCT s.id) as student_count,
          AVG(COALESCE(gr.average_grade, 0)) as current_average,
          ROUND(
            (AVG(COALESCE(gr.average_grade, 0)) / 20) * 100 * 
            (1 + (AVG(COALESCE(att.rate, 0)) - 75) / 100)
          , 1) as predicted_success_rate
        FROM promotions p
        JOIN departments d ON p.department_id = d.id
        JOIN faculties f ON d.faculty_id = f.id
        LEFT JOIN students s ON s.promotion_id = p.id AND s.status = 'ACTIVE'
        LEFT JOIN (
          SELECT student_id, AVG(COALESCE(final_grade, 0)) as average_grade
          FROM grades
          GROUP BY student_id
        ) gr ON gr.student_id = s.id
        LEFT JOIN (
          SELECT student_id, AVG(CASE WHEN status = 'PRESENT' THEN 100 ELSE 0 END) as rate
          FROM attendance
          GROUP BY student_id
        ) att ON att.student_id = s.id
        GROUP BY p.id, p.name, d.name, f.name
        HAVING COUNT(DISTINCT s.id) > 0
        ORDER BY predicted_success_rate ASC
        LIMIT 20
      `)
      
      return NextResponse.json({
        atRiskStudents: atRiskStudents.rows,
        promotionPredictions: promotionPredictions.rows
      })
    }

    // ===== COMPARAISON INTER-FACULTÉS =====
    if (type === 'faculty_comparison') {
      const comparison = await query(`
        SELECT 
          f.id,
          f.name,
          COUNT(DISTINCT s.id) as students,
          COUNT(DISTINCT t.id) as teachers,
          ROUND(AVG(COALESCE(gr.avg, 0)), 2) as avg_grade,
          ROUND(
            COUNT(DISTINCT CASE WHEN sd.decision IN ('ADMIS', 'ADMIS_AVEC_DETTE') THEN sd.student_id END)::numeric /
            NULLIF(COUNT(DISTINCT sd.student_id), 0) * 100
          , 1) as success_rate,
          ROUND(AVG(COALESCE(att.rate, 0)), 1) as attendance_rate
        FROM faculties f
        LEFT JOIN departments d ON d.faculty_id = f.id
        LEFT JOIN promotions p ON p.department_id = d.id
        LEFT JOIN students s ON s.promotion_id = p.id AND s.status = 'ACTIVE'
        LEFT JOIN teachers t ON t.department_id = d.id AND t.status = 'ACTIVE'
        LEFT JOIN (
          SELECT student_id, AVG(final_grade) as avg FROM grades GROUP BY student_id
        ) gr ON gr.student_id = s.id
        LEFT JOIN student_deliberations sd ON sd.student_id = s.id
        LEFT JOIN (
          SELECT student_id, AVG(CASE WHEN status = 'PRESENT' THEN 100 ELSE 0 END) as rate
          FROM attendance GROUP BY student_id
        ) att ON att.student_id = s.id
        GROUP BY f.id, f.name
        ORDER BY f.name
      `)
      
      return NextResponse.json({ comparison: comparison.rows })
    }

    // ===== RÉSUMÉ DASHBOARD =====
    // Données globales pour le dashboard principal
    const [studentsCount, teachersCount, revenueTotal, pendingPayments] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM students WHERE status = 'ACTIVE'`),
      query(`SELECT COUNT(*) as total FROM teachers WHERE status = 'ACTIVE'`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED'`),
      query(`SELECT COUNT(*) as total FROM payments WHERE status = 'PENDING'`)
    ])
    
    return NextResponse.json({
      summary: {
        totalStudents: parseInt(studentsCount.rows[0].total),
        totalTeachers: parseInt(teachersCount.rows[0].total),
        totalRevenue: parseFloat(revenueTotal.rows[0].total),
        pendingPayments: parseInt(pendingPayments.rows[0].total)
      }
    })
  } catch (error) {
    console.error('Erreur API analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
