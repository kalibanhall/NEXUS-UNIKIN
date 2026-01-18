import { NextRequest, NextResponse } from "next/server"
import { queryOne, query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const student = await queryOne(
      `SELECT s.id, s.matricule, s.status, s.payment_status, s.enrollment_date, 
              s.birth_date, s.birth_place, s.gender, s.nationality, s.parent_name, s.parent_phone,
              u.id as user_id, u.email, u.first_name, u.last_name, u.phone, u.address, u.photo_url, u.is_active,
              p.id as promotion_id, p.name as promotion_name, p.level as promotion_level,
              d.id as department_id, d.name as department_name,
              f.id as faculty_id, f.name as faculty_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN promotions p ON s.promotion_id = p.id
       JOIN departments d ON p.department_id = d.id
       JOIN faculties f ON d.faculty_id = f.id
       WHERE s.id = $1`,
      [id]
    )
    if (!student) {
      return NextResponse.json({ error: "Etudiant non trouve" }, { status: 404 })
    }
    return NextResponse.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json({ error: "Erreur lors de la recuperation" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const existingStudent = await queryOne<{ user_id: number }>("SELECT user_id FROM students WHERE id = $1", [id])
    if (!existingStudent) {
      return NextResponse.json({ error: "Etudiant non trouve" }, { status: 404 })
    }
    if (body.firstName || body.lastName || body.phone) {
      await query(
        `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone) WHERE id = $4`,
        [body.firstName, body.lastName, body.phone, existingStudent.user_id]
      )
    }
    await query(
      `UPDATE students SET status = COALESCE($1, status), payment_status = COALESCE($2, payment_status) WHERE id = $3`,
      [body.status, body.paymentStatus, id]
    )
    return NextResponse.json({ success: true, message: "Etudiant mis a jour" })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Erreur mise a jour" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const student = await queryOne<{ user_id: number }>("SELECT user_id FROM students WHERE id = $1", [id])
    if (!student) {
      return NextResponse.json({ error: "Etudiant non trouve" }, { status: 404 })
    }
    await query("DELETE FROM users WHERE id = $1", [student.user_id])
    return NextResponse.json({ success: true, message: "Etudiant supprime" })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 })
  }
}
