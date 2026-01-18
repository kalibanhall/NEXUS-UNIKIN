// API Attendance Codes - Gestion des codes de présence
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// Générer un code aléatoire de 6 caractères
function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// GET - Obtenir les codes actifs ou vérifier un code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacher_id')
    const code = searchParams.get('code')
    const courseId = searchParams.get('course_id')

    // Vérifier un code spécifique
    if (code) {
      const codeData = await queryOne(
        `SELECT ac.*, c.name as course_name, c.code as course_code,
                t.matricule as teacher_matricule,
                u.first_name || ' ' || u.last_name as teacher_name
         FROM attendance_codes ac
         JOIN courses c ON c.id = ac.course_id
         JOIN teachers t ON t.id = ac.teacher_id
         JOIN users u ON u.id = t.user_id
         WHERE ac.code = $1 AND ac.is_active = TRUE AND ac.valid_until > NOW()`,
        [code.toUpperCase()]
      )

      if (!codeData) {
        return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 })
      }

      return NextResponse.json({ codeData })
    }

    // Liste des codes actifs pour un enseignant
    if (teacherId) {
      const codes = await query(
        `SELECT ac.*, c.name as course_name, c.code as course_code,
                (SELECT COUNT(*) FROM attendance_submissions WHERE code_id = ac.id) as submissions_count
         FROM attendance_codes ac
         JOIN courses c ON c.id = ac.course_id
         WHERE ac.teacher_id = $1
         ORDER BY ac.created_at DESC
         LIMIT 20`,
        [teacherId]
      )

      return NextResponse.json({ codes: codes.rows })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau code de présence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, courseId, validMinutes = 15, scheduleId } = body

    if (!teacherId || !courseId) {
      return NextResponse.json({ error: 'teacherId et courseId requis' }, { status: 400 })
    }

    // Désactiver les anciens codes pour ce cours
    await query(
      `UPDATE attendance_codes SET is_active = FALSE 
       WHERE course_id = $1 AND teacher_id = $2 AND is_active = TRUE`,
      [courseId, teacherId]
    )

    // Générer un nouveau code unique
    let code = generateCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await queryOne(
        `SELECT id FROM attendance_codes WHERE code = $1 AND is_active = TRUE`,
        [code]
      )
      if (!existing) break
      code = generateCode()
      attempts++
    }

    const validUntil = new Date(Date.now() + validMinutes * 60 * 1000)

    const result = await query(
      `INSERT INTO attendance_codes (course_id, teacher_id, code, valid_until, schedule_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [courseId, teacherId, code, validUntil, scheduleId || null]
    )

    // Obtenir les infos du cours
    const courseInfo = await queryOne(
      `SELECT c.name, c.code as course_code FROM courses c WHERE c.id = $1`,
      [courseId]
    )

    return NextResponse.json({
      message: 'Code généré avec succès',
      data: {
        ...result.rows[0],
        course_name: courseInfo?.name,
        course_code: courseInfo?.course_code
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance code:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du code' }, { status: 500 })
  }
}

// PATCH - Soumettre un code de présence (étudiant)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, studentId, deviceInfo, ipAddress } = body

    if (!code || !studentId) {
      return NextResponse.json({ error: 'code et studentId requis' }, { status: 400 })
    }

    // Vérifier le code
    const codeData = await queryOne(
      `SELECT ac.*, c.name as course_name 
       FROM attendance_codes ac
       JOIN courses c ON c.id = ac.course_id
       WHERE ac.code = $1 AND ac.is_active = TRUE AND ac.valid_until > NOW()`,
      [code.toUpperCase()]
    )

    if (!codeData) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
    }

    // Vérifier si l'étudiant a déjà soumis
    const existing = await queryOne(
      `SELECT id FROM attendance_submissions WHERE code_id = $1 AND student_id = $2`,
      [codeData.id, studentId]
    )

    if (existing) {
      return NextResponse.json({ error: 'Vous avez déjà validé votre présence' }, { status: 400 })
    }

    // Enregistrer la soumission
    await query(
      `INSERT INTO attendance_submissions (code_id, student_id, device_info, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [codeData.id, studentId, deviceInfo || null, ipAddress || null]
    )

    // Enregistrer dans la table attendance
    await query(
      `INSERT INTO attendance (student_id, course_id, schedule_id, attendance_date, status, recorded_by)
       VALUES ($1, $2, $3, CURRENT_DATE, 'PRESENT', $4)
       ON CONFLICT DO NOTHING`,
      [studentId, codeData.course_id, codeData.schedule_id, codeData.teacher_id]
    )

    return NextResponse.json({
      message: 'Présence enregistrée avec succès',
      courseName: codeData.course_name
    })
  } catch (error) {
    console.error('Error submitting attendance:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
  }
}

// DELETE - Désactiver un code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const codeId = searchParams.get('id')

    if (!codeId) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    await query(
      `UPDATE attendance_codes SET is_active = FALSE WHERE id = $1`,
      [codeId]
    )

    return NextResponse.json({ message: 'Code désactivé' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
