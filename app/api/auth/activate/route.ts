import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/activate
 * 
 * Étape 1 - Vérification: { matricule } → retourne nom masqué pour confirmation
 * Étape 2 - Activation: { matricule, password, confirmPassword } → active le compte
 */

interface StudentInfo {
  user_id: number
  student_id: number
  matricule: string
  first_name: string
  last_name: string
  postnom: string | null
  email: string
  account_activated: boolean
  must_change_password: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matricule, step, password, confirmPassword } = body

    if (!matricule) {
      return NextResponse.json({ error: 'Numéro matricule requis' }, { status: 400 })
    }

    const cleanMatricule = String(matricule).trim().toUpperCase()

    // Chercher l'étudiant par matricule
    const student = await queryOne<StudentInfo>(`
      SELECT 
        u.id as user_id, s.id as student_id, s.matricule,
        u.first_name, u.last_name, u.postnom, u.email,
        u.account_activated, u.must_change_password
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE UPPER(s.matricule) = $1
    `, [cleanMatricule])

    if (!student) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec ce numéro matricule. Vérifiez votre matricule ou contactez l\'administration.' },
        { status: 404 }
      )
    }

    // Vérifier si déjà activé
    if (student.account_activated && !student.must_change_password) {
      return NextResponse.json(
        { error: 'Ce compte est déjà activé. Connectez-vous avec votre email et mot de passe.', email: student.email },
        { status: 409 }
      )
    }

    // ÉTAPE 1: Vérification - Retourner les infos masquées
    if (step === 'verify' || !step) {
      // Masquer partiellement le nom pour confirmation
      const maskedName = `${student.last_name} ${student.postnom ? student.postnom.charAt(0) + '***' : ''} ${student.first_name.charAt(0)}***`

      return NextResponse.json({
        success: true,
        step: 'verify',
        matricule: student.matricule,
        maskedName: maskedName.trim(),
        message: 'Étudiant trouvé. Confirmez votre identité et créez votre mot de passe.'
      })
    }

    // ÉTAPE 2: Activation - Créer le mot de passe
    if (step === 'activate') {
      if (!password || !confirmPassword) {
        return NextResponse.json({ error: 'Mot de passe et confirmation requis' }, { status: 400 })
      }

      if (password !== confirmPassword) {
        return NextResponse.json({ error: 'Les mots de passe ne correspondent pas' }, { status: 400 })
      }

      if (password.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
      }

      // Vérifier complexité
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' },
          { status: 400 }
        )
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10)

      // Activer le compte
      await query(
        `UPDATE users SET password = $1, account_activated = TRUE, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [hashedPassword, student.user_id]
      )

      return NextResponse.json({
        success: true,
        step: 'activated',
        email: student.email,
        fullName: `${student.last_name} ${student.postnom || ''} ${student.first_name}`.trim(),
        message: 'Votre compte a été activé avec succès! Vous pouvez maintenant vous connecter.'
      })
    }

    return NextResponse.json({ error: 'Étape invalide' }, { status: 400 })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'activation' }, { status: 500 })
  }
}
