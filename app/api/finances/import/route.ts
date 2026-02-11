/**
 * API Import des données financières via Excel
 * 
 * Accepte un fichier Excel (.xlsx, .xls, .csv) contenant les paiements étudiants
 * et met à jour la situation financière en conséquence.
 * 
 * Format attendu du fichier:
 * | Matricule | Nom | Prénom | Montant | Type de paiement | Mode de paiement | Référence | Date |
 */
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import * as XLSX from 'xlsx'

// Mapping des colonnes possibles
const COLUMN_MAPPINGS: Record<string, string[]> = {
  matricule: ['matricule', 'mat', 'id_etudiant', 'student_id', 'numero', 'num'],
  nom: ['nom', 'last_name', 'lastname', 'family_name', 'name'],
  prenom: ['prenom', 'prénom', 'first_name', 'firstname', 'given_name'],
  montant: ['montant', 'amount', 'somme', 'valeur', 'montant_usd', 'montant_cdf'],
  type_paiement: ['type', 'type_paiement', 'payment_type', 'categorie'],
  mode_paiement: ['mode', 'mode_paiement', 'payment_method', 'methode'],
  reference: ['reference', 'ref', 'numero_transaction', 'transaction', 'recu'],
  date: ['date', 'date_paiement', 'payment_date', 'date_payment'],
}

// Types de paiement acceptés
const PAYMENT_TYPES: Record<string, string> = {
  'inscription': 'INSCRIPTION',
  'frais inscription': 'INSCRIPTION',
  'frais_inscription': 'INSCRIPTION',
  'frais académiques': 'FRAIS_ACADEMIQUES',
  'frais academiques': 'FRAIS_ACADEMIQUES',
  'frais_academiques': 'FRAIS_ACADEMIQUES',
  'academique': 'FRAIS_ACADEMIQUES',
  'académique': 'FRAIS_ACADEMIQUES',
  'minerval': 'FRAIS_MINERVAL',
  'frais_minerval': 'FRAIS_MINERVAL',
  'laboratoire': 'LABORATOIRE',
  'frais_laboratoire': 'LABORATOIRE',
  'labo': 'LABORATOIRE',
  'autres': 'AUTRES',
  'autre': 'AUTRES',
  'other': 'AUTRES',
}

// Modes de paiement acceptés
const PAYMENT_METHODS: Record<string, string> = {
  'espèces': 'CASH',
  'especes': 'CASH',
  'cash': 'CASH',
  'virement': 'BANK',
  'banque': 'BANK',
  'bank': 'BANK',
  'virement bancaire': 'BANK',
  'mobile': 'MOBILE_MONEY',
  'mobile money': 'MOBILE_MONEY',
  'mobile_money': 'MOBILE_MONEY',
  'mpesa': 'MOBILE_MONEY',
  'm-pesa': 'MOBILE_MONEY',
  'airtel money': 'MOBILE_MONEY',
  'orange money': 'MOBILE_MONEY',
  'chèque': 'CHECK',
  'cheque': 'CHECK',
  'check': 'CHECK',
}

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[\s\-\.]/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function findColumn(headers: string[], targetKeys: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const normalized = normalizeColumnName(headers[i])
    if (targetKeys.some(key => normalized.includes(key) || key.includes(normalized))) {
      return i
    }
  }
  return -1
}

function parsePaymentType(value: string): string {
  const normalized = value.toLowerCase().trim()
  return PAYMENT_TYPES[normalized] || 'FRAIS_ACADEMIQUES'
}

function parsePaymentMethod(value: string): string {
  const normalized = value.toLowerCase().trim()
  return PAYMENT_METHODS[normalized] || 'CASH'
}

function parseAmount(value: any): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  const str = String(value).replace(/[^\d.,\-]/g, '').replace(',', '.')
  return parseFloat(str) || 0
}

function parseDate(value: any): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') {
    // Excel date serial
    const utc_days = Math.floor(value - 25569)
    const date = new Date(utc_days * 86400000)
    return date
  }
  if (typeof value === 'string') {
    // Try DD/MM/YYYY, DD-MM-YYYY
    const parts = value.split(/[\/\-\.]/)
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1])
      const year = parseInt(parts[2])
      if (day <= 31 && month <= 12) {
        return new Date(year < 100 ? year + 2000 : year, month - 1, day)
      }
    }
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

// POST - Prévisualiser ou importer un fichier Excel
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const action = formData.get('action') as string || 'preview'
    const academicYearId = formData.get('academicYearId') as string || '1'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Lire le fichier
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    
    // Prendre la première feuille
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: 'Le fichier ne contient aucune feuille de données' }, { status: 400 })
    }

    const sheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][]

    if (jsonData.length < 2) {
      return NextResponse.json({ error: 'Le fichier doit contenir au moins un en-tête et une ligne de données' }, { status: 400 })
    }

    // Identifier les colonnes
    const headers = jsonData[0].map((h: any) => String(h))
    const colMap = {
      matricule: findColumn(headers, COLUMN_MAPPINGS.matricule),
      nom: findColumn(headers, COLUMN_MAPPINGS.nom),
      prenom: findColumn(headers, COLUMN_MAPPINGS.prenom),
      montant: findColumn(headers, COLUMN_MAPPINGS.montant),
      type_paiement: findColumn(headers, COLUMN_MAPPINGS.type_paiement),
      mode_paiement: findColumn(headers, COLUMN_MAPPINGS.mode_paiement),
      reference: findColumn(headers, COLUMN_MAPPINGS.reference),
      date: findColumn(headers, COLUMN_MAPPINGS.date),
    }

    if (colMap.matricule === -1) {
      return NextResponse.json({ 
        error: 'Colonne "Matricule" non trouvée. Assurez-vous que le fichier contient une colonne avec le matricule des étudiants.',
        headers: headers 
      }, { status: 400 })
    }

    if (colMap.montant === -1) {
      return NextResponse.json({ 
        error: 'Colonne "Montant" non trouvée. Assurez-vous que le fichier contient une colonne avec les montants.',
        headers: headers 
      }, { status: 400 })
    }

    // Parser les données
    const rows = jsonData.slice(1).filter(row => {
      const matricule = row[colMap.matricule]
      const montant = row[colMap.montant]
      return matricule && montant
    })

    const parsedData = rows.map((row, index) => ({
      row: index + 2, // Numéro de ligne dans le fichier
      matricule: String(row[colMap.matricule]).trim(),
      nom: colMap.nom >= 0 ? String(row[colMap.nom]).trim() : '',
      prenom: colMap.prenom >= 0 ? String(row[colMap.prenom]).trim() : '',
      montant: parseAmount(row[colMap.montant]),
      type_paiement: colMap.type_paiement >= 0 ? parsePaymentType(String(row[colMap.type_paiement])) : 'FRAIS_ACADEMIQUES',
      mode_paiement: colMap.mode_paiement >= 0 ? parsePaymentMethod(String(row[colMap.mode_paiement])) : 'CASH',
      reference: colMap.reference >= 0 ? String(row[colMap.reference]).trim() : '',
      date: colMap.date >= 0 ? parseDate(row[colMap.date]) : new Date(),
    }))

    // Mode prévisualisation
    if (action === 'preview') {
      // Vérifier quels matricules existent
      const matricules = Array.from(new Set(parsedData.map(d => d.matricule)))
      const existingStudents = await query(
        `SELECT s.matricule, u.first_name, u.last_name, s.id as student_id
         FROM students s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.matricule = ANY($1)`,
        [matricules]
      )

      const existingMap = new Map(existingStudents.rows.map((s: any) => [s.matricule, s]))

      const preview = parsedData.map(d => ({
        ...d,
        date: d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date,
        found: existingMap.has(d.matricule),
        student_name: existingMap.has(d.matricule) 
          ? `${existingMap.get(d.matricule).first_name} ${existingMap.get(d.matricule).last_name}`
          : null,
      }))

      const totalAmount = parsedData.reduce((sum, d) => sum + d.montant, 0)
      const foundCount = preview.filter(p => p.found).length
      const notFoundCount = preview.filter(p => !p.found).length

      return NextResponse.json({
        success: true,
        preview: preview.slice(0, 100), // Limiter la prévisualisation à 100 lignes
        totalRows: parsedData.length,
        previewCount: Math.min(parsedData.length, 100),
        summary: {
          total_lines: parsedData.length,
          total_amount: totalAmount,
          students_found: foundCount,
          students_not_found: notFoundCount,
          detected_columns: Object.entries(colMap)
            .filter(([_, idx]) => idx >= 0)
            .map(([name, idx]) => ({ name, header: headers[idx] })),
        },
        sheet_name: sheetName,
        headers,
      })
    }

    // Mode import
    if (action === 'import') {
      let imported = 0
      let skipped = 0
      let errors: { row: number; matricule: string; error: string }[] = []

      // Récupérer l'année académique
      const academicYear = await queryOne(
        'SELECT id FROM academic_years WHERE id = $1',
        [academicYearId]
      )

      if (!academicYear) {
        return NextResponse.json({ error: 'Année académique non trouvée' }, { status: 400 })
      }

      for (const data of parsedData) {
        try {
          // Trouver l'étudiant par matricule
          const student = await queryOne(
            'SELECT s.id FROM students s WHERE s.matricule = $1',
            [data.matricule]
          )

          if (!student) {
            skipped++
            errors.push({ row: data.row, matricule: data.matricule, error: 'Étudiant non trouvé' })
            continue
          }

          if (data.montant <= 0) {
            skipped++
            errors.push({ row: data.row, matricule: data.matricule, error: 'Montant invalide' })
            continue
          }

          // Générer le numéro de reçu
          const year = new Date().getFullYear()
          const countResult = await queryOne(
            "SELECT COUNT(*) as count FROM payments WHERE receipt_number LIKE $1",
            [`REC-${year}-%`]
          )
          const count = parseInt(countResult?.count || '0') + 1
          const receiptNumber = `REC-${year}-${String(count).padStart(5, '0')}`

          // Insérer le paiement
          await query(
            `INSERT INTO payments (student_id, academic_year_id, amount, payment_type, payment_method, reference, receipt_number, status, payment_date, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED', $8, $9)`,
            [
              student.id,
              academicYearId,
              data.montant,
              data.type_paiement,
              data.mode_paiement,
              data.reference || null,
              receiptNumber,
              data.date,
              `Import Excel - ${file.name}`,
            ]
          )

          imported++
        } catch (err: any) {
          skipped++
          errors.push({ row: data.row, matricule: data.matricule, error: err.message || 'Erreur inconnue' })
        }
      }

      return NextResponse.json({
        success: true,
        result: {
          imported,
          skipped,
          total: parsedData.length,
          errors: errors.slice(0, 50), // Limiter les erreurs retournées
        }
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Error importing finance data:', error)
    return NextResponse.json(
      { error: `Erreur lors de l'importation: ${error.message || 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
