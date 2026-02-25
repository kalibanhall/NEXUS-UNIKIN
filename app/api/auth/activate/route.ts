import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/activate
 * 
 * Activation universelle : Étudiants ET Enseignants
 * 
 * Étudiants: matricule → vérification nom → mot de passe
 * Enseignants: matricule UNIKIN + date de naissance → vérification nom → mot de passe
 */

interface PersonInfo {
  user_id: number
  person_id: number
  matricule: string
  first_name: string
  last_name: string
  postnom: string | null
  email: string
  account_activated: boolean
  must_change_password: boolean
  role: string
  birth_date: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matricule, step, password, confirmPassword, birthDate } = body

    if (!matricule) {
      return NextResponse.json({ error: 'Numéro matricule requis' }, { status: 400 })
    }

    const cleanMatricule = String(matricule).trim().toUpperCase().replace(/\s+/g, '')

    // Chercher d'abord dans les étudiants
    let person = await queryOne<PersonInfo>(`
      SELECT 
        u.id as user_id, s.id as person_id, s.matricule,
        u.first_name, u.last_name, u.postnom, u.email,
        u.account_activated, u.must_change_password,
        u.role, s.birth_date::text
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE UPPER(REPLACE(s.matricule, ' ', '')) = $1
    `, [cleanMatricule])

    // Si pas trouvé dans étudiants, chercher dans les enseignants
    if (!person) {
      person = await queryOne<PersonInfo>(`
        SELECT 
          u.id as user_id, t.id as person_id, t.matricule,
          u.first_name, u.last_name, u.postnom, u.email,
          u.account_activated, u.must_change_password,
          u.role, t.birth_date::text
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        WHERE UPPER(REPLACE(t.matricule, ' ', '')) = $1
      `, [cleanMatricule])
    }

    if (!person) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec ce numéro matricule. Vérifiez votre matricule ou contactez l\'administration.' },
        { status: 404 }
      )
    }

    // Vérifier si déjà activé
    if (person.account_activated && !person.must_change_password) {
      return NextResponse.json(
        { error: 'Ce compte est déjà activé. Connectez-vous avec votre email et mot de passe.', email: person.email },
        { status: 409 }
      )
    }

    // ============================================
    // ÉTAPE 1: Vérification du matricule
    // ============================================
    if (step === 'verify' || !step) {
      // Pour les enseignants: exiger la date de naissance
      if (person.role === 'TEACHER') {
        if (!birthDate) {
          return NextResponse.json({
            success: true,
            step: 'need_birthdate',
            role: person.role,
            message: 'Enseignant trouvé. Veuillez renseigner votre date de naissance pour vérification.'
          })
        }

        // Vérifier la date de naissance si elle existe en DB
        if (person.birth_date) {
          const dbDate = new Date(person.birth_date).toISOString().split('T')[0]
          const inputDate = new Date(birthDate).toISOString().split('T')[0]
          if (dbDate !== inputDate) {
            return NextResponse.json(
              { error: 'La date de naissance ne correspond pas à nos enregistrements.' },
              { status: 400 }
            )
          }
        }
        // Si pas de birth_date en DB, on l'enregistre lors de l'activation
      }

      // Masquer partiellement le nom pour confirmation
      const lastName = person.last_name || ''
      const postnom = person.postnom || ''
      const firstName = person.first_name || ''
      const maskedName = `${lastName} ${postnom ? postnom.charAt(0) + '***' : ''} ${firstName ? firstName.charAt(0) + '***' : ''}`.trim()

      return NextResponse.json({
        success: true,
        step: 'verify',
        role: person.role,
        matricule: person.matricule,
        maskedName: maskedName || lastName || 'Utilisateur',
        message: person.role === 'TEACHER' 
          ? 'Enseignant trouvé. Confirmez votre identité et créez votre mot de passe.'
          : 'Étudiant trouvé. Confirmez votre identité et créez votre mot de passe.'
      })
    }

    // ============================================
    // ÉTAPE 2: Activation - Créer le mot de passe
    // ============================================
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

      // Activer le compte utilisateur
      await query(
        `UPDATE users SET password = $1, account_activated = TRUE, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [hashedPassword, person.user_id]
      )

      // Si enseignant et birth_date fournie mais pas encore en DB, l'enregistrer
      if (person.role === 'TEACHER' && birthDate && !person.birth_date) {
        await query(
          `UPDATE teachers SET birth_date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [birthDate, person.person_id]
        )
      }

      const fullName = `${person.last_name || ''} ${person.postnom || ''} ${person.first_name || ''}`.trim()

      return NextResponse.json({
        success: true,
        step: 'activated',
        email: person.email,
        fullName,
        role: person.role,
        message: 'Votre compte a été activé avec succès! Vous pouvez maintenant vous connecter.'
      })
    }

    return NextResponse.json({ error: 'Étape invalide' }, { status: 400 })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ error: 'Erreur serveur lors de l\'activation' }, { status: 500 })
  }
}
