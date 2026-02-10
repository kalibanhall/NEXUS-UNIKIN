import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formater une date en français
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  }
  return new Date(date).toLocaleDateString('fr-FR', defaultOptions)
}

// Formater une heure
export function formatTime(time: string): string {
  return time.replace(':', 'h')
}

// Formater un montant en CDF
export function formatCurrency(amount: number, currency: string = 'CDF'): string {
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculer la note finale
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
