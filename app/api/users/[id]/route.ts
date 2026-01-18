// API User par ID - Détails, modification, suppression
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - Détails d'un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const user = await queryOne(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.address, u.photo_url, 
              u.role, u.is_active, u.last_login, u.created_at
       FROM users u WHERE u.id = $1`,
      [userId]
    )

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer le profil selon le rôle
    let profile = null
    switch (user.role) {
      case 'STUDENT':
        profile = await queryOne(
          `SELECT s.*, p.name as promotion_name, p.level, d.name as department_name, f.name as faculty_name
           FROM students s
           LEFT JOIN promotions p ON s.promotion_id = p.id
           LEFT JOIN departments d ON p.department_id = d.id
           LEFT JOIN faculties f ON d.faculty_id = f.id
           WHERE s.user_id = $1`,
          [userId]
        )
        break
      case 'TEACHER':
        profile = await queryOne(
          `SELECT t.*, d.name as department_name, f.name as faculty_name
           FROM teachers t
           LEFT JOIN departments d ON t.department_id = d.id
           LEFT JOIN faculties f ON d.faculty_id = f.id
           WHERE t.user_id = $1`,
          [userId]
        )
        break
      case 'EMPLOYEE':
        profile = await queryOne(
          `SELECT * FROM employees WHERE user_id = $1`,
          [userId]
        )
        break
      case 'ADMIN':
      case 'SUPER_ADMIN':
        profile = await queryOne(
          `SELECT a.*, f.name as faculty_name, d.name as department_name
           FROM admins a
           LEFT JOIN faculties f ON a.faculty_id = f.id
           LEFT JOIN departments d ON a.department_id = d.id
           WHERE a.user_id = $1`,
          [userId]
        )
        break
    }

    return NextResponse.json({ user, profile })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'utilisateur' }, { status: 500 })
  }
}

// PUT - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()
    const { firstName, lastName, phone, address, isActive, password } = body

    // Vérifier si l'utilisateur existe
    const existing = await queryOne('SELECT id FROM users WHERE id = $1', [userId])
    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    let updateFields = []
    let updateParams: any[] = []
    let paramIndex = 1

    if (firstName) {
      updateFields.push(`first_name = $${paramIndex}`)
      updateParams.push(firstName)
      paramIndex++
    }
    if (lastName) {
      updateFields.push(`last_name = $${paramIndex}`)
      updateParams.push(lastName)
      paramIndex++
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`)
      updateParams.push(phone)
      paramIndex++
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex}`)
      updateParams.push(address)
      paramIndex++
    }
    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`)
      updateParams.push(isActive)
      paramIndex++
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateFields.push(`password = $${paramIndex}`)
      updateParams.push(hashedPassword)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 })
    }

    updateParams.push(userId)
    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, phone, role, is_active`,
      updateParams
    )

    return NextResponse.json({
      message: 'Utilisateur modifié avec succès',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de l\'utilisateur' }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Vérifier si l'utilisateur existe
    const existing = await queryOne('SELECT id, role FROM users WHERE id = $1', [userId])
    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Ne pas supprimer un super admin
    if (existing.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Impossible de supprimer un Super Admin' }, { status: 403 })
    }

    await query('DELETE FROM users WHERE id = $1', [userId])

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de l\'utilisateur' }, { status: 500 })
  }
}
