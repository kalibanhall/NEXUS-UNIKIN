import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * API pour le téléversement de fichiers de soumission
 * 
 * Gère les fichiers soumis pour les évaluations de type:
 * - Travaux Pratiques (TP)
 * - Projets tutorés
 * - Devoirs (HOMEWORK)
 * - Questions FILE_UPLOAD
 */

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.odt',
  '.xls', '.xlsx', '.ods',
  '.ppt', '.pptx', '.odp',
  '.txt', '.md', '.rtf',
  '.zip', '.rar', '.7z',
  '.py', '.js', '.ts', '.java', '.c', '.cpp', '.h',
  '.html', '.css', '.json', '.xml',
  '.ipynb', '.sql',
  '.png', '.jpg', '.jpeg', '.gif', '.svg'
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'submissions')

// POST - Téléverser un fichier
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File | null
    const attemptId = formData.get('attempt_id') as string | null
    const questionId = formData.get('question_id') as string | null
    const studentId = formData.get('student_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    if (!attemptId) {
      return NextResponse.json({ error: 'attempt_id requis' }, { status: 400 })
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024} MB` 
      }, { status: 400 })
    }

    // Vérifier l'extension
    const extension = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ 
        error: `Type de fichier non autorisé. Extensions autorisées: ${ALLOWED_EXTENSIONS.join(', ')}` 
      }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      // Vérifier que la tentative existe et n'est pas encore soumise
      const attemptResult = await client.query(`
        SELECT ea.*, ev.title as evaluation_title, s.matricule
        FROM evaluation_attempts ea
        JOIN evaluations ev ON ea.evaluation_id = ev.id
        JOIN students s ON ea.student_id = s.id
        WHERE ea.id = $1
      `, [attemptId])

      if (attemptResult.rows.length === 0) {
        return NextResponse.json({ error: 'Tentative non trouvée' }, { status: 404 })
      }

      const attempt = attemptResult.rows[0]

      if (attempt.submitted_at) {
        return NextResponse.json({ 
          error: 'Impossible de téléverser un fichier après la soumission' 
        }, { status: 400 })
      }

      // Si question_id fourni, vérifier les restrictions de type
      if (questionId) {
        const questionResult = await client.query(`
          SELECT * FROM evaluation_questions WHERE id = $1
        `, [questionId])

        if (questionResult.rows.length > 0) {
          const question = questionResult.rows[0]
          
          if (question.file_types_allowed) {
            const allowedTypes = JSON.parse(question.file_types_allowed)
            if (!allowedTypes.includes(extension)) {
              return NextResponse.json({ 
                error: `Type de fichier non autorisé pour cette question. Types autorisés: ${allowedTypes.join(', ')}` 
              }, { status: 400 })
            }
          }

          if (question.max_file_size && file.size > question.max_file_size * 1024 * 1024) {
            return NextResponse.json({ 
              error: `Fichier trop volumineux pour cette question. Taille maximale: ${question.max_file_size} MB` 
            }, { status: 400 })
          }
        }
      }

      // Créer le répertoire s'il n'existe pas
      const uploadPath = path.join(UPLOAD_DIR, attempt.matricule, attemptId)
      if (!existsSync(uploadPath)) {
        await mkdir(uploadPath, { recursive: true })
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const finalFileName = `${timestamp}_${safeFileName}`
      const filePath = path.join(uploadPath, finalFileName)

      // Sauvegarder le fichier
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Extraire le contenu textuel si possible (pour l'analyse anti-plagiat)
      let textContent = null
      if (['.txt', '.md', '.py', '.js', '.ts', '.java', '.c', '.cpp', '.html', '.css', '.json', '.xml', '.sql'].includes(extension)) {
        textContent = buffer.toString('utf-8')
      }

      // Enregistrer dans la base de données
      const result = await client.query(`
        INSERT INTO submission_files (
          attempt_id, question_id, file_name, original_name, file_path,
          file_size, file_type, file_content, mime_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        attemptId,
        questionId,
        finalFileName,
        file.name,
        filePath,
        file.size,
        extension,
        textContent,
        file.type
      ])

      return NextResponse.json({
        message: 'Fichier téléversé avec succès',
        file: {
          id: result.rows[0].id,
          name: file.name,
          size: file.size,
          type: extension
        }
      }, { status: 201 })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Erreur serveur lors du téléversement' }, { status: 500 })
  }
}

// GET - Récupérer la liste des fichiers d'une tentative
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attemptId = searchParams.get('attempt_id')
    const questionId = searchParams.get('question_id')

    if (!attemptId) {
      return NextResponse.json({ error: 'attempt_id requis' }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      let query = `
        SELECT id, file_name, original_name, file_size, file_type, mime_type, created_at
        FROM submission_files
        WHERE attempt_id = $1
      `
      const params: any[] = [attemptId]

      if (questionId) {
        query += ` AND question_id = $2`
        params.push(questionId)
      }

      query += ` ORDER BY created_at DESC`

      const result = await client.query(query, params)

      return NextResponse.json({ files: result.rows })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un fichier
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('file_id')

    if (!fileId) {
      return NextResponse.json({ error: 'file_id requis' }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      // Vérifier que le fichier existe et que la tentative n'est pas soumise
      const fileResult = await client.query(`
        SELECT sf.*, ea.submitted_at
        FROM submission_files sf
        JOIN evaluation_attempts ea ON sf.attempt_id = ea.id
        WHERE sf.id = $1
      `, [fileId])

      if (fileResult.rows.length === 0) {
        return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
      }

      if (fileResult.rows[0].submitted_at) {
        return NextResponse.json({ 
          error: 'Impossible de supprimer un fichier après la soumission' 
        }, { status: 400 })
      }

      // Supprimer l'enregistrement (le fichier physique peut être nettoyé par un job)
      await client.query(`
        DELETE FROM submission_files WHERE id = $1
      `, [fileId])

      return NextResponse.json({ message: 'Fichier supprimé' })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
