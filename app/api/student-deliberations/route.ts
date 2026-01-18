// API Délibérations étudiants - Résultats de délibération
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Obtenir les résultats de délibération d'un étudiant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const semester = searchParams.get('semester')
    const academicYearId = searchParams.get('academic_year_id')

    if (!studentId) {
      return NextResponse.json({ error: 'student_id requis' }, { status: 400 })
    }

    // Vérifier le statut de paiement de l'étudiant
    const student = await queryOne(
      `SELECT s.*, p.name as promotion_name, p.level, d.name as department_name, f.name as faculty_name
       FROM students s
       JOIN promotions p ON p.id = s.promotion_id
       JOIN departments d ON d.id = p.department_id
       JOIN faculties f ON f.id = d.faculty_id
       WHERE s.id = $1`,
      [studentId]
    )

    if (!student) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    // Récupérer les notes de l'étudiant directement depuis la table grades
    let courseGrades: any[] = []
    
    // Récupérer les notes de l'étudiant
    courseGrades = (await query(
      `SELECT g.*, c.code, c.name as course_name, c.credits, c.semester,
              u.first_name || ' ' || u.last_name as teacher_name,
              ay.name as academic_year_name, ay.id as academic_year_id
       FROM grades g
       JOIN courses c ON c.id = g.course_id
       JOIN academic_years ay ON ay.id = g.academic_year_id
       LEFT JOIN teachers t ON t.id = c.teacher_id
       LEFT JOIN users u ON u.id = t.user_id
       WHERE g.student_id = $1
       ORDER BY ay.start_date DESC, c.semester, c.code`,
      [studentId]
    )).rows

    // Calculer les statistiques par semestre et année
    const gradesBySemester: { [key: string]: any } = {}
    
    courseGrades.forEach((grade: any) => {
      const key = `${grade.academic_year_id}-${grade.semester}`
      if (!gradesBySemester[key]) {
        gradesBySemester[key] = {
          academic_year_id: grade.academic_year_id,
          academic_year_name: grade.academic_year_name,
          semester: grade.semester,
          session_type: 'NORMAL',
          grades: [],
          totalCredits: 0,
          validatedCredits: 0,
          totalPoints: 0,
          averageScore: 0
        }
      }
      gradesBySemester[key].grades.push(grade)
      gradesBySemester[key].totalCredits += grade.credits || 0
      if (grade.is_validated) {
        gradesBySemester[key].validatedCredits += grade.credits || 0
      }
      if (grade.final_score) {
        gradesBySemester[key].totalPoints += (grade.final_score * (grade.credits || 1))
      }
    })

    // Calculer les moyennes
    Object.keys(gradesBySemester).forEach(key => {
      const data = gradesBySemester[key]
      if (data.totalCredits > 0) {
        data.averageScore = Math.round((data.totalPoints / data.totalCredits) * 100) / 100
      }
    })

    // Message si frais non complets
    const accessMessage = student.payment_status !== 'PAID' 
      ? 'Veuillez régulariser votre situation financière pour accéder à vos résultats de délibération.'
      : null

    // Créer les résultats à partir des données calculées
    const results = Object.values(gradesBySemester).map((data: any) => ({
      academic_year_id: data.academic_year_id,
      academic_year_name: data.academic_year_name,
      semester: data.semester,
      session_type: data.session_type,
      average_score: data.averageScore,
      validated_credits: data.validatedCredits,
      total_credits: data.totalCredits,
      decision: data.averageScore >= 10 ? 'ADMIS' : 'EN_ATTENTE',
      can_view: student.payment_status === 'PAID',
      grades: data.grades
    }))

    return NextResponse.json({
      student: {
        matricule: student.matricule,
        promotion: student.promotion_name,
        level: student.level,
        department: student.department_name,
        faculty: student.faculty_name,
        paymentStatus: student.payment_status
      },
      results: results,
      grades: courseGrades,
      gradesBySemester: Object.values(gradesBySemester),
      accessMessage,
      canViewResults: student.payment_status === 'PAID'
    })
  } catch (error) {
    console.error('Error fetching deliberation results:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      student: null,
      results: [],
      grades: [],
      gradesBySemester: [],
      canViewResults: false,
      accessMessage: 'Une erreur est survenue lors de la récupération des données'
    }, { status: 200 })
  }
}
