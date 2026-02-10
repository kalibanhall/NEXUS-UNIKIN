import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

/**
 * API de vérification anti-plagiat
 * 
 * Cette API simule un système de détection de plagiat.
 * Dans un environnement de production, elle serait connectée à un service
 * externe comme Turnitin, Copyleaks, ou un système propriétaire.
 * 
 * Fonctionnalités:
 * - Analyse de similarité de texte
 * - Détection de sources potentielles
 * - Génération de rapports détaillés
 */

interface PlagiarismSource {
  source: string
  similarity: number
  matched_text: string
}

interface SuspiciousSection {
  text: string
  similarity: number
  source?: string
}

interface PlagiarismReport {
  overall_score: number
  status: 'CLEAN' | 'SUSPICIOUS' | 'PLAGIARIZED'
  sources: PlagiarismSource[]
  suspicious_sections: SuspiciousSection[]
  analysis_date: string
}

// GET - Récupérer un rapport de plagiat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submission_id')

    if (!submissionId) {
      return NextResponse.json({ error: 'submission_id requis' }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      // Récupérer le rapport existant
      const result = await client.query(`
        SELECT pr.*
        FROM plagiarism_reports pr
        WHERE pr.submission_id = $1
        ORDER BY pr.created_at DESC
        LIMIT 1
      `, [submissionId])

      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Aucun rapport trouvé. Lancez d\'abord une analyse.' 
        }, { status: 404 })
      }

      const report = result.rows[0]

      return NextResponse.json({
        report: {
          overall_score: report.overall_score,
          status: report.status,
          sources: report.sources || [],
          suspicious_sections: report.suspicious_sections || [],
          analysis_date: report.created_at
        }
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Plagiarism API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Lancer une analyse anti-plagiat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submission_id } = body

    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id requis' }, { status: 400 })
    }

    const client = await pool!.connect()

    try {
      // Récupérer la soumission
      const submissionResult = await client.query(`
        SELECT ea.*, ev.title as evaluation_title, ev.plagiarism_check
        FROM evaluation_attempts ea
        JOIN evaluations ev ON ea.evaluation_id = ev.id
        WHERE ea.id = $1
      `, [submission_id])

      if (submissionResult.rows.length === 0) {
        return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 })
      }

      const submission = submissionResult.rows[0]

      if (!submission.plagiarism_check) {
        return NextResponse.json({ 
          error: 'La vérification anti-plagiat n\'est pas activée pour cette évaluation' 
        }, { status: 400 })
      }

      // Récupérer les réponses de type texte/essay
      const responsesResult = await client.query(`
        SELECT er.student_answer, eq.question_type
        FROM evaluation_responses er
        JOIN evaluation_questions eq ON er.question_id = eq.id
        WHERE er.attempt_id = $1
          AND eq.question_type IN ('ESSAY', 'SHORT_ANSWER')
      `, [submission_id])

      // Récupérer les fichiers soumis
      const filesResult = await client.query(`
        SELECT file_content, file_name
        FROM submission_files
        WHERE attempt_id = $1
      `, [submission_id])

      // Combiner tout le contenu à analyser
      let contentToAnalyze = ''
      
      for (const response of responsesResult.rows) {
        try {
          const answer = JSON.parse(response.student_answer)
          if (typeof answer === 'string') {
            contentToAnalyze += answer + '\n'
          }
        } catch {
          contentToAnalyze += response.student_answer + '\n'
        }
      }

      for (const file of filesResult.rows) {
        if (file.file_content) {
          contentToAnalyze += file.file_content + '\n'
        }
      }

      // Simuler l'analyse anti-plagiat
      // En production, ceci appellerait un service externe
      const report = await simulatePlagiarismAnalysis(contentToAnalyze, submission_id, client)

      // Enregistrer le rapport
      await client.query(`
        INSERT INTO plagiarism_reports (
          submission_id, overall_score, status, sources, suspicious_sections
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        submission_id,
        report.overall_score,
        report.status,
        JSON.stringify(report.sources),
        JSON.stringify(report.suspicious_sections)
      ])

      // Mettre à jour la soumission
      await client.query(`
        UPDATE evaluation_attempts
        SET plagiarism_score = $1, plagiarism_status = $2
        WHERE id = $3
      `, [report.overall_score, report.status, submission_id])

      return NextResponse.json({ report, status: report.status })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Plagiarism API error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * Simule une analyse anti-plagiat
 * 
 * Cette fonction simule le comportement d'un véritable système anti-plagiat.
 * En production, elle serait remplacée par un appel à un service comme:
 * - Turnitin
 * - Copyleaks
 * - PlagScan
 * - Un algorithme personnalisé basé sur la base de données
 */
async function simulatePlagiarismAnalysis(
  content: string,
  submissionId: string,
  client: any
): Promise<PlagiarismReport> {
  
  // Simuler un délai d'analyse
  await new Promise(resolve => setTimeout(resolve, 1000))

  const sources: PlagiarismSource[] = []
  const suspiciousSections: SuspiciousSection[] = []

  // Comparer avec les autres soumissions de la même évaluation
  const evaluationIdResult = await client.query(`
    SELECT evaluation_id FROM evaluation_attempts WHERE id = $1
  `, [submissionId])
  
  const evaluationId = evaluationIdResult.rows[0]?.evaluation_id

  if (evaluationId) {
    // Récupérer les autres soumissions pour comparaison
    const otherSubmissionsResult = await client.query(`
      SELECT ea.id, er.student_answer, s.matricule
      FROM evaluation_attempts ea
      JOIN evaluation_responses er ON er.attempt_id = ea.id
      JOIN students s ON ea.student_id = s.id
      WHERE ea.evaluation_id = $1 
        AND ea.id != $2
        AND ea.submitted_at < (SELECT submitted_at FROM evaluation_attempts WHERE id = $2)
    `, [evaluationId, submissionId])

    // Simuler la détection de similarités
    for (const otherSubmission of otherSubmissionsResult.rows) {
      const similarity = calculateSimulatedSimilarity(content, otherSubmission.student_answer)
      
      if (similarity > 20) {
        sources.push({
          source: `Soumission précédente (${otherSubmission.matricule})`,
          similarity: similarity,
          matched_text: extractMatchedText(content, otherSubmission.student_answer)
        })
      }
    }
  }

  // Simuler la détection de sources web communes
  const commonPhrases = detectCommonPhrases(content)
  for (const phrase of commonPhrases) {
    if (phrase.confidence > 0.5) {
      sources.push({
        source: phrase.possibleSource,
        similarity: Math.round(phrase.confidence * 100),
        matched_text: phrase.text
      })

      suspiciousSections.push({
        text: phrase.text,
        similarity: Math.round(phrase.confidence * 100),
        source: phrase.possibleSource
      })
    }
  }

  // Calculer le score global
  const overallScore = sources.length > 0 
    ? Math.min(100, Math.round(sources.reduce((acc, s) => acc + s.similarity, 0) / sources.length))
    : Math.floor(Math.random() * 15) // Score faible aléatoire si pas de source trouvée

  // Déterminer le statut
  let status: 'CLEAN' | 'SUSPICIOUS' | 'PLAGIARIZED'
  if (overallScore < 15) {
    status = 'CLEAN'
  } else if (overallScore < 40) {
    status = 'SUSPICIOUS'
  } else {
    status = 'PLAGIARIZED'
  }

  return {
    overall_score: overallScore,
    status,
    sources,
    suspicious_sections: suspiciousSections,
    analysis_date: new Date().toISOString()
  }
}

/**
 * Calcule une similarité simulée entre deux textes
 */
function calculateSimulatedSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0

  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)

  // Calculer les mots communs
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  const intersection = Array.from(set1).filter(w => set2.has(w))

  // Coefficient de Jaccard simplifié
  const union = new Set(words1.concat(words2))
  const similarity = (intersection.length / union.size) * 100

  return Math.round(similarity)
}

/**
 * Extrait le texte correspondant entre deux documents
 */
function extractMatchedText(text1: string, text2: string): string {
  const words1 = text1.split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  const set2 = new Set(words2)

  // Trouver une séquence commune
  let matchedWords: string[] = []
  let longestMatch: string[] = []

  for (const word of words1) {
    if (set2.has(word.toLowerCase())) {
      matchedWords.push(word)
      if (matchedWords.length > longestMatch.length) {
        longestMatch = [...matchedWords]
      }
    } else {
      matchedWords = []
    }
  }

  return longestMatch.slice(0, 10).join(' ') + (longestMatch.length > 10 ? '...' : '')
}

/**
 * Détecte des phrases communes qui pourraient indiquer du plagiat
 */
function detectCommonPhrases(content: string): {
  text: string
  confidence: number
  possibleSource: string
}[] {
  const phrases: { text: string; confidence: number; possibleSource: string }[] = []

  // Liste de phrases académiques communes qui pourraient indiquer du copier-coller
  const suspiciousPatterns = [
    {
      pattern: /selon\s+(?:les|des)\s+études\s+récentes/gi,
      source: 'Article académique générique'
    },
    {
      pattern: /il\s+est\s+important\s+de\s+noter\s+que/gi,
      source: 'Expression commune'
    },
    {
      pattern: /en\s+conclusion,?\s+(?:on\s+peut\s+dire\s+que|nous\s+pouvons)/gi,
      source: 'Structure de conclusion standard'
    },
    {
      pattern: /la\s+(?:problématique|question)\s+(?:centrale|principale)\s+est/gi,
      source: 'Introduction académique type'
    }
  ]

  for (const { pattern, source } of suspiciousPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      for (const match of matches) {
        phrases.push({
          text: match,
          confidence: 0.3 + Math.random() * 0.3, // 30-60% de confiance
          possibleSource: source
        })
      }
    }
  }

  // Simuler quelques détections aléatoires pour les tests
  if (content.length > 500) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30)
    if (sentences.length > 3) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)]
      if (Math.random() > 0.7) { // 30% de chance
        phrases.push({
          text: randomSentence.trim().substring(0, 100) + '...',
          confidence: 0.25 + Math.random() * 0.35,
          possibleSource: 'Source web potentielle'
        })
      }
    }
  }

  return phrases
}
