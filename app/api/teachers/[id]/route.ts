// API Enseignant par ID
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Détails d'un enseignant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await queryOne(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.photo_url, u.address,
              d.name as department_name, d.code as department_code,
              f.name as faculty_name
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN departments d ON t.department_id = d.id
       LEFT JOIN faculties f ON d.faculty_id = f.id
       WHERE t.id = $1`,
      [params.id]
    )

    if (!teacher) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    // Récupérer les cours
    const courses = await query(
      `SELECT c.*, p.name as promotion_name, p.level,
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as students_count
       FROM courses c
       LEFT JOIN promotions p ON c.promotion_id = p.id
       WHERE c.teacher_id = $1
       ORDER BY c.semester, c.name`,
      [params.id]
    )

    // Statistiques
    const stats = await queryOne(
      `SELECT 
         (SELECT COUNT(*) FROM courses WHERE teacher_id = $1) as total_courses,
         (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e 
          JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = $1) as total_students,
         (SELECT AVG(g.final_score) FROM grades g 
          JOIN courses c ON g.course_id = c.id WHERE c.teacher_id = $1) as avg_grade`,
      [params.id]
    )

    return NextResponse.json({
      teacher,
      courses: courses.rows,
      stats
    })
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'enseignant' }, { status: 500 })
  }
}

// PUT - Modifier un enseignant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { firstName, lastName, phone, grade, specialization, departmentId, isPermanent } = body

    const teacher = await queryOne('SELECT user_id FROM teachers WHERE id = $1', [params.id])
    if (!teacher) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    // Mettre à jour l'utilisateur
    if (firstName || lastName || phone) {
      await query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone)
         WHERE id = $4`,
        [firstName, lastName, phone, teacher.user_id]
      )
    }

    // Mettre à jour l'enseignant
    const result = await query(
      `UPDATE teachers 
       SET grade = COALESCE($1, grade),
           specialization = COALESCE($2, specialization),
           department_id = COALESCE($3, department_id),
           is_permanent = COALESCE($4, is_permanent)
       WHERE id = $5
       RETURNING *`,
      [grade, specialization, departmentId, isPermanent, params.id]
    )

    return NextResponse.json({
      message: 'Enseignant modifié avec succès',
      teacher: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de l\'enseignant' }, { status: 500 })
  }
}

// DELETE - Supprimer un enseignant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await queryOne('SELECT user_id FROM teachers WHERE id = $1', [params.id])
    if (!teacher) {
      return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 })
    }

    // Vérifier s'il a des cours
    const courseCount = await queryOne('SELECT COUNT(*) as count FROM courses WHERE teacher_id = $1', [params.id])
    if (parseInt(courseCount?.count || '0') > 0) {
      // Désactiver plutôt que supprimer
      await query('UPDATE users SET is_active = FALSE WHERE id = $1', [teacher.user_id])
      return NextResponse.json({ message: 'Enseignant désactivé (a des cours assignés)' })
    }

    await query('DELETE FROM users WHERE id = $1', [teacher.user_id])
    return NextResponse.json({ message: 'Enseignant supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de l\'enseignant' }, { status: 500 })
  }
}
