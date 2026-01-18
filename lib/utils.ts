/**
 * ============================================================================
 * NEXUS UNIKIN - Fonctions utilitaires globales
 * ============================================================================
 * 
 * @description Ce module contient toutes les fonctions utilitaires réutilisables
 *              dans l'ensemble de l'application. Il inclut des fonctions de
 *              formatage, de calcul de notes, de génération de codes, etc.
 * 
 * @author Chris NGOZULU KASONGO
 * @email kasongongozulu@hmail.com
 * @version 1.0.0
 * @license Proprietary - UNIKIN
 * 
 * ============================================================================
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Fusionne les classes CSS avec Tailwind CSS
 * 
 * @description Combine clsx et tailwind-merge pour gérer intelligemment
 *              les classes CSS conditionnelles et éviter les conflits Tailwind.
 * 
 * @param {...ClassValue[]} inputs - Classes CSS à fusionner
 * @returns {string} - Chaîne de classes CSS fusionnées
 * 
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'hover:bg-gray-100')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// FONCTIONS DE FORMATAGE DE DATES ET HEURES
// ============================================================================

/**
 * Formate une date en français
 * 
 * @description Convertit une date en format lisible selon les conventions françaises.
 *              Par défaut: "08 janvier 2026"
 * 
 * @param {Date | string} date - La date à formater
 * @param {Intl.DateTimeFormatOptions} options - Options de formatage personnalisées
 * @returns {string} - La date formatée en français
 * 
 * @example
 * formatDate(new Date()) // "08 janvier 2026"
 * formatDate('2026-01-08', { weekday: 'long' }) // "jeudi 08 janvier 2026"
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  }
  return new Date(date).toLocaleDateString('fr-FR', defaultOptions)
}

/**
 * Formate une heure au format français
 * 
 * @description Remplace les deux-points par 'h' pour le format horaire français.
 *              Exemple: "14:30" devient "14h30"
 * 
 * @param {string} time - L'heure au format "HH:MM"
 * @returns {string} - L'heure au format "HHhMM"
 */
export function formatTime(time: string): string {
  return time.replace(':', 'h')
}

// ============================================================================
// FONCTIONS DE FORMATAGE MONÉTAIRE
// ============================================================================

/**
 * Formate un montant en devise
 * 
 * @description Formate un nombre en devise avec le symbole approprié.
 *              Par défaut utilise le Franc Congolais (CDF).
 * 
 * @param {number} amount - Le montant à formater
 * @param {string} currency - Code de la devise (défaut: 'CDF')
 * @returns {string} - Le montant formaté avec symbole de devise
 * 
 * @example
 * formatCurrency(50000) // "50 000 CDF"
 * formatCurrency(100, 'USD') // "100 $US"
 */
export function formatCurrency(amount: number, currency: string = 'CDF'): string {
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ============================================================================
// FONCTIONS DE CALCUL ACADÉMIQUE
// ============================================================================

/**
 * Calcule la note finale pondérée d'un étudiant
 * 
 * @description Calcule la moyenne pondérée des notes CC (contrôle continu),
 *              TP (travaux pratiques) et Examen selon les coefficients définis.
 * 
 * @param {number | null} noteCC - Note du contrôle continu (sur 20)
 * @param {number | null} noteTP - Note des travaux pratiques (sur 20)
 * @param {number | null} noteExam - Note de l'examen (sur 20)
 * @param {number} weightCC - Coefficient CC (défaut: 30%)
 * @param {number} weightTP - Coefficient TP (défaut: 20%)
 * @param {number} weightExam - Coefficient Examen (défaut: 50%)
 * @returns {number | null} - La note finale ou null si aucune note
 * 
 * @example
 * calculateFinalGrade(15, 14, 12) // 13.1 (15*0.3 + 14*0.2 + 12*0.5)
 */
export function calculateFinalGrade(
  noteCC: number | null,
  noteTP: number | null,
  noteExam: number | null,
  weightCC: number = 30,
  weightTP: number = 20,
  weightExam: number = 50
): number | null {
  const cc = noteCC ?? 0
  const tp = noteTP ?? 0
  const exam = noteExam ?? 0
  
  // Si aucune note n'est disponible, retourner null
  if (noteCC === null && noteTP === null && noteExam === null) {
    return null
  }

  return (cc * weightCC + tp * weightTP + exam * weightExam) / 100
}

// Déterminer la mention selon la note
export function getMention(average: number): string {
  if (average >= 18) return 'La Plus Grande Distinction'
  if (average >= 16) return 'Grande Distinction'
  if (average >= 14) return 'Distinction'
  if (average >= 12) return 'Satisfaction'
  if (average >= 10) return 'Passable'
  return 'Ajourné'
}

// Déterminer la décision de délibération
export function getDeliberationDecision(average: number, hasDebt: boolean): string {
  if (hasDebt) return 'EN ATTENTE (DETTE)'
  if (average >= 10) return 'ADMIS'
  if (average >= 8) return 'AJOURNÉ'
  return 'EXCLU'
}

// Couleur selon la note
export function getGradeColor(grade: number | null): string {
  if (grade === null) return 'text-gray-400'
  if (grade >= 16) return 'grade-excellent'
  if (grade >= 14) return 'grade-good'
  if (grade >= 10) return 'grade-average'
  return 'grade-fail'
}

// Générer un code aléatoire (pour présence)
export function generateValidationCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Générer un matricule
export function generateMatricule(
  promotion: string,
  department: string,
  year: number,
  sequence: number
): string {
  const seq = sequence.toString().padStart(4, '0')
  return `${promotion}-${department}-${year}-${seq}`
}

// Jours de la semaine
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
  { value: 7, label: 'Dimanche', short: 'Dim' },
]

// Créneaux horaires
export const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '08h00 - 10h00' },
  { start: '10:15', end: '12:15', label: '10h15 - 12h15' },
  { start: '14:15', end: '16:15', label: '14h15 - 16h15' },
  { start: '16:30', end: '18:30', label: '16h30 - 18h30' },
]

// Types de cours
export const COURSE_TYPES = [
  { value: 'THEORY', label: 'Cours Magistral', color: 'bg-blue-500' },
  { value: 'PRACTICAL', label: 'Travaux Pratiques', color: 'bg-green-500' },
  { value: 'LAB', label: 'Laboratoire', color: 'bg-purple-500' },
  { value: 'TUTORIAL', label: 'Travaux Dirigés', color: 'bg-orange-500' },
]

// Statuts de paiement
export const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'En attente', color: 'bg-yellow-500' },
  { value: 'PAID', label: 'Payé', color: 'bg-green-500' },
  { value: 'OVERDUE', label: 'En retard', color: 'bg-red-500' },
  { value: 'PARTIAL', label: 'Partiel', color: 'bg-orange-500' },
]

// Couleurs de rôles
export const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-500',
  ADMIN: 'bg-blue-500',
  TEACHER: 'bg-green-500',
  STUDENT: 'bg-cyan-500',
  EMPLOYEE: 'bg-orange-500',
}

// Années académiques
export function getAcademicYears(count: number = 5): string[] {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let i = 0; i < count; i++) {
    years.push(`${currentYear - i}-${currentYear - i + 1}`)
  }
  return years
}

// Semestres
export const SEMESTERS = [
  { value: 1, label: 'Semestre 1' },
  { value: 2, label: 'Semestre 2' },
]

// Promotions (niveaux)
export const PROMOTION_LEVELS = [
  { value: 'L1', label: 'Licence 1 (Graduat 1)' },
  { value: 'L2', label: 'Licence 2 (Graduat 2)' },
  { value: 'L3', label: 'Licence 3 (Graduat 3)' },
  { value: 'M1', label: 'Master 1 (Licence 1)' },
  { value: 'M2', label: 'Master 2 (Licence 2)' },
  { value: 'D1', label: 'Doctorat 1' },
  { value: 'D2', label: 'Doctorat 2' },
  { value: 'D3', label: 'Doctorat 3' },
]

// Statuts de grade
export const GRADE_STATUSES = {
  DRAFT: { label: 'Brouillon', color: 'status-pending' },
  SUBMITTED: { label: 'Soumis', color: 'status-pending' },
  LOCKED: { label: 'Verrouillé', color: 'status-error' },
  VALIDATED: { label: 'Validé', color: 'status-active' },
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Vérifier si c'est un email valide
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Capitaliser la première lettre
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Initiales d'un nom
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Délai pour les requêtes
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
