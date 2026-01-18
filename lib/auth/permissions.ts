/**
 * ============================================================================
 * NEXUS UNIKIN - Système de Permissions Hiérarchiques
 * ============================================================================
 * 
 * Gestion des rôles et permissions avec portée (scope) limitée
 * par niveau hiérarchique (Université, Faculté, Département, Promotion)
 */

import { query } from '../db'
import { HierarchicalRole, ScopeType } from '@/types/nexus-complete'

// Définition de la hiérarchie des rôles (du plus élevé au plus bas)
export const ROLE_HIERARCHY: Record<HierarchicalRole, number> = {
  // Niveau Central (100-199)
  'RECTEUR': 100,
  'SGA': 95,
  'SGAD': 95,
  'SGR': 95,
  'AB': 90,
  'SUPER_ADMIN': 90,
  
  // Niveau Faculté (80-89)
  'DOYEN': 85,
  'VICE_DOYEN_ENSEIGNEMENT': 82,
  'VICE_DOYEN_RECHERCHE': 82,
  'SECRETAIRE_ACADEMIQUE': 80,
  
  // Niveau Département (70-79)
  'CHEF_DEPARTEMENT': 75,
  'PRESIDENT_JURY': 72,
  'SECRETAIRE_JURY': 70,
  'MEMBRE_JURY': 68,
  
  // Niveau Enseignement (50-69)
  'PROFESSEUR_ORDINAIRE': 65,
  'PROFESSEUR': 63,
  'PROFESSEUR_ASSOCIE': 60,
  'CHEF_TRAVAUX': 55,
  'ASSISTANT': 50,
  
  // Administration (40-49)
  'EMPLOYE_SCOLARITE': 45,
  'EMPLOYE_CAISSE': 43,
  'EMPLOYE_BIBLIOTHEQUE': 40,
  
  // Niveau Étudiant (10-39)
  'DELEGUE_PROMOTION': 25,
  'ETUDIANT': 10,
}

// Permissions par fonctionnalité
export type Permission =
  | 'VIEW_ALL_STUDENTS'
  | 'VIEW_FACULTY_STUDENTS'
  | 'VIEW_DEPARTMENT_STUDENTS'
  | 'VIEW_PROMOTION_STUDENTS'
  | 'VIEW_OWN_PROFILE'
  | 'EDIT_GRADES'
  | 'VIEW_GRADES'
  | 'MODIFY_GRADES'
  | 'VALIDATE_GRADES'
  | 'PUBLISH_GRADES'
  | 'VIEW_DELIBERATIONS'
  | 'MANAGE_DELIBERATIONS'
  | 'VALIDATE_DELIBERATIONS'
  | 'PUBLISH_DELIBERATIONS'
  | 'VIEW_FINANCES'
  | 'MANAGE_FINANCES'
  | 'VIEW_PAYMENTS'
  | 'RECORD_PAYMENTS'
  | 'VIEW_COURSES'
  | 'MANAGE_COURSES'
  | 'VIEW_TIMETABLE'
  | 'MANAGE_TIMETABLE'
  | 'VIEW_ATTENDANCE'
  | 'RECORD_ATTENDANCE'
  | 'VIEW_USERS'
  | 'MANAGE_USERS'
  | 'VIEW_REPORTS'
  | 'GENERATE_REPORTS'
  | 'VIEW_ANALYTICS'
  | 'VIEW_RESEARCH'
  | 'MANAGE_RESEARCH'
  | 'VIEW_LIBRARY'
  | 'MANAGE_LIBRARY'
  | 'VIEW_SCHOLARSHIPS'
  | 'MANAGE_SCHOLARSHIPS'
  | 'VIEW_CAREERS'
  | 'MANAGE_CAREERS'
  | 'VIEW_INTERNSHIPS'
  | 'MANAGE_INTERNSHIPS'
  | 'VIEW_SURVEYS'
  | 'MANAGE_SURVEYS'
  | 'RESPOND_SURVEYS'
  | 'VIEW_LMS'
  | 'MANAGE_LMS'
  | 'SUBMIT_ASSIGNMENTS'
  | 'GRADE_ASSIGNMENTS'
  | 'VIEW_EXAMS'
  | 'MANAGE_EXAMS'
  | 'SUPERVISE_EXAMS'
  | 'VIEW_PREDICTIONS'
  | 'VIEW_RESEARCH_STATS'
  | 'MANAGE_THESES'

// Matrice des permissions par rôle
export const ROLE_PERMISSIONS: Record<HierarchicalRole, Permission[]> = {
  'RECTEUR': [
    'VIEW_ALL_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS', 'VIEW_FINANCES',
    'VIEW_REPORTS', 'GENERATE_REPORTS', 'VIEW_ANALYTICS', 'VIEW_RESEARCH',
    'MANAGE_RESEARCH', 'VIEW_USERS', 'MANAGE_USERS'
  ],
  'SGA': [
    'VIEW_ALL_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS', 'VALIDATE_DELIBERATIONS',
    'PUBLISH_DELIBERATIONS', 'VIEW_REPORTS', 'GENERATE_REPORTS', 'VIEW_ANALYTICS',
    'VIEW_TIMETABLE', 'MANAGE_TIMETABLE', 'VIEW_EXAMS', 'MANAGE_EXAMS', 'VIEW_USERS'
  ],
  'SGAD': [
    'VIEW_ALL_STUDENTS', 'VIEW_FINANCES', 'MANAGE_FINANCES', 'VIEW_PAYMENTS',
    'VIEW_REPORTS', 'GENERATE_REPORTS', 'VIEW_USERS', 'MANAGE_USERS'
  ],
  'SGR': [
    'VIEW_ALL_STUDENTS', 'VIEW_RESEARCH', 'MANAGE_RESEARCH', 'VIEW_REPORTS',
    'GENERATE_REPORTS', 'VIEW_ANALYTICS', 'VIEW_LIBRARY', 'MANAGE_LIBRARY',
    'VIEW_RESEARCH_STATS', 'MANAGE_THESES', 'VIEW_PREDICTIONS'
  ],
  'AB': [
    'VIEW_FINANCES', 'MANAGE_FINANCES', 'VIEW_PAYMENTS', 'VIEW_REPORTS',
    'GENERATE_REPORTS', 'VIEW_SCHOLARSHIPS', 'MANAGE_SCHOLARSHIPS'
  ],
  'SUPER_ADMIN': [
    'VIEW_ALL_STUDENTS', 'VIEW_GRADES', 'EDIT_GRADES', 'MODIFY_GRADES',
    'VIEW_DELIBERATIONS', 'MANAGE_DELIBERATIONS', 'VIEW_FINANCES', 'MANAGE_FINANCES',
    'VIEW_PAYMENTS', 'RECORD_PAYMENTS', 'VIEW_COURSES', 'MANAGE_COURSES',
    'VIEW_TIMETABLE', 'MANAGE_TIMETABLE', 'VIEW_USERS', 'MANAGE_USERS',
    'VIEW_REPORTS', 'GENERATE_REPORTS', 'VIEW_ANALYTICS', 'VIEW_RESEARCH',
    'MANAGE_RESEARCH', 'VIEW_LIBRARY', 'MANAGE_LIBRARY', 'VIEW_SCHOLARSHIPS',
    'MANAGE_SCHOLARSHIPS', 'VIEW_CAREERS', 'MANAGE_CAREERS', 'VIEW_INTERNSHIPS',
    'MANAGE_INTERNSHIPS', 'VIEW_SURVEYS', 'MANAGE_SURVEYS', 'VIEW_LMS',
    'MANAGE_LMS', 'VIEW_EXAMS', 'MANAGE_EXAMS', 'VIEW_PREDICTIONS',
    'VIEW_RESEARCH_STATS', 'MANAGE_THESES'
  ],
  'DOYEN': [
    'VIEW_FACULTY_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS', 'VALIDATE_DELIBERATIONS',
    'VIEW_FINANCES', 'VIEW_REPORTS', 'GENERATE_REPORTS', 'VIEW_ANALYTICS',
    'VIEW_COURSES', 'VIEW_TIMETABLE', 'VIEW_RESEARCH', 'MANAGE_RESEARCH',
    'VIEW_INTERNSHIPS', 'MANAGE_INTERNSHIPS', 'VIEW_SURVEYS'
  ],
  'VICE_DOYEN_ENSEIGNEMENT': [
    'VIEW_FACULTY_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS', 'VIEW_REPORTS',
    'VIEW_COURSES', 'MANAGE_COURSES', 'VIEW_TIMETABLE', 'MANAGE_TIMETABLE',
    'VIEW_LMS', 'MANAGE_LMS', 'VIEW_EXAMS', 'MANAGE_EXAMS'
  ],
  'VICE_DOYEN_RECHERCHE': [
    'VIEW_FACULTY_STUDENTS', 'VIEW_RESEARCH', 'MANAGE_RESEARCH', 'VIEW_INTERNSHIPS',
    'MANAGE_INTERNSHIPS', 'VIEW_LIBRARY', 'VIEW_REPORTS'
  ],
  'SECRETAIRE_ACADEMIQUE': [
    'VIEW_FACULTY_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS', 'VIEW_TIMETABLE',
    'VIEW_ATTENDANCE', 'RECORD_ATTENDANCE', 'VIEW_REPORTS', 'VIEW_EXAMS'
  ],
  'CHEF_DEPARTEMENT': [
    'VIEW_DEPARTMENT_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS', 'MANAGE_DELIBERATIONS',
    'VIEW_COURSES', 'MANAGE_COURSES', 'VIEW_TIMETABLE', 'VIEW_REPORTS',
    'VIEW_ATTENDANCE', 'VIEW_LMS', 'VIEW_RESEARCH'
  ],
  'PRESIDENT_JURY': [
    'VIEW_PROMOTION_STUDENTS', 'VIEW_GRADES', 'VALIDATE_GRADES', 'VIEW_DELIBERATIONS',
    'MANAGE_DELIBERATIONS', 'VALIDATE_DELIBERATIONS', 'VIEW_REPORTS'
  ],
  'SECRETAIRE_JURY': [
    'VIEW_PROMOTION_STUDENTS', 'VIEW_GRADES', 'MODIFY_GRADES', 'VIEW_DELIBERATIONS',
    'MANAGE_DELIBERATIONS', 'VIEW_REPORTS'
  ],
  'MEMBRE_JURY': [
    'VIEW_PROMOTION_STUDENTS', 'VIEW_GRADES', 'VIEW_DELIBERATIONS'
  ],
  'PROFESSEUR_ORDINAIRE': [
    'VIEW_PROMOTION_STUDENTS', 'EDIT_GRADES', 'VIEW_GRADES', 'VIEW_COURSES',
    'VIEW_TIMETABLE', 'VIEW_ATTENDANCE', 'RECORD_ATTENDANCE', 'VIEW_LMS',
    'MANAGE_LMS', 'GRADE_ASSIGNMENTS', 'VIEW_RESEARCH', 'MANAGE_RESEARCH',
    'VIEW_EXAMS', 'SUPERVISE_EXAMS'
  ],
  'PROFESSEUR': [
    'VIEW_PROMOTION_STUDENTS', 'EDIT_GRADES', 'VIEW_GRADES', 'VIEW_COURSES',
    'VIEW_TIMETABLE', 'VIEW_ATTENDANCE', 'RECORD_ATTENDANCE', 'VIEW_LMS',
    'MANAGE_LMS', 'GRADE_ASSIGNMENTS', 'VIEW_RESEARCH', 'VIEW_EXAMS', 'SUPERVISE_EXAMS'
  ],
  'PROFESSEUR_ASSOCIE': [
    'VIEW_PROMOTION_STUDENTS', 'EDIT_GRADES', 'VIEW_GRADES', 'VIEW_COURSES',
    'VIEW_TIMETABLE', 'VIEW_ATTENDANCE', 'RECORD_ATTENDANCE', 'VIEW_LMS',
    'MANAGE_LMS', 'GRADE_ASSIGNMENTS', 'SUPERVISE_EXAMS'
  ],
  'CHEF_TRAVAUX': [
    'VIEW_PROMOTION_STUDENTS', 'EDIT_GRADES', 'VIEW_GRADES', 'VIEW_COURSES',
    'VIEW_TIMETABLE', 'VIEW_ATTENDANCE', 'RECORD_ATTENDANCE', 'VIEW_LMS',
    'GRADE_ASSIGNMENTS', 'SUPERVISE_EXAMS'
  ],
  'ASSISTANT': [
    'VIEW_PROMOTION_STUDENTS', 'EDIT_GRADES', 'VIEW_GRADES', 'VIEW_COURSES',
    'VIEW_TIMETABLE', 'VIEW_ATTENDANCE', 'RECORD_ATTENDANCE', 'VIEW_LMS',
    'GRADE_ASSIGNMENTS'
  ],
  'EMPLOYE_SCOLARITE': [
    'VIEW_ALL_STUDENTS', 'VIEW_GRADES', 'VIEW_TIMETABLE', 'VIEW_ATTENDANCE',
    'RECORD_ATTENDANCE', 'VIEW_REPORTS'
  ],
  'EMPLOYE_CAISSE': [
    'VIEW_ALL_STUDENTS', 'VIEW_PAYMENTS', 'RECORD_PAYMENTS', 'VIEW_FINANCES'
  ],
  'EMPLOYE_BIBLIOTHEQUE': [
    'VIEW_LIBRARY', 'MANAGE_LIBRARY'
  ],
  'DELEGUE_PROMOTION': [
    'VIEW_PROMOTION_STUDENTS', 'VIEW_GRADES', 'VIEW_COURSES', 'VIEW_TIMETABLE',
    'VIEW_ATTENDANCE', 'VIEW_LMS', 'RESPOND_SURVEYS', 'SUBMIT_ASSIGNMENTS'
  ],
  'ETUDIANT': [
    'VIEW_OWN_PROFILE', 'VIEW_GRADES', 'VIEW_COURSES', 'VIEW_TIMETABLE',
    'VIEW_ATTENDANCE', 'VIEW_LMS', 'SUBMIT_ASSIGNMENTS', 'RESPOND_SURVEYS',
    'VIEW_LIBRARY', 'VIEW_SCHOLARSHIPS', 'VIEW_CAREERS', 'VIEW_INTERNSHIPS'
  ]
}

/**
 * Interface pour un rôle avec sa portée
 */
export interface UserRoleWithScope {
  role: HierarchicalRole
  scope_type: ScopeType
  faculty_id?: number
  department_id?: number
  promotion_id?: number
  is_primary: boolean
}

/**
 * Récupère tous les rôles d'un utilisateur
 */
export async function getUserRoles(userId: number): Promise<UserRoleWithScope[]> {
  const result = await query<UserRoleWithScope>(`
    SELECT role, scope_type, faculty_id, department_id, promotion_id, is_primary
    FROM user_roles
    WHERE user_id = $1 AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY is_primary DESC
  `, [userId])
  
  return result.rows
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export async function hasPermission(
  userId: number,
  permission: Permission,
  context?: {
    faculty_id?: number
    department_id?: number
    promotion_id?: number
    student_id?: number
  }
): Promise<boolean> {
  const roles = await getUserRoles(userId)
  
  for (const userRole of roles) {
    const permissions = ROLE_PERMISSIONS[userRole.role]
    
    if (permissions.includes(permission)) {
      // Vérifier la portée si un contexte est fourni
      if (context) {
        if (await checkScope(userRole, context)) {
          return true
        }
      } else {
        return true
      }
    }
  }
  
  return false
}

/**
 * Vérifie si la portée du rôle couvre le contexte demandé
 */
export async function checkScope(
  userRole: UserRoleWithScope,
  context: {
    faculty_id?: number
    department_id?: number
    promotion_id?: number
    student_id?: number
  }
): Promise<boolean> {
  switch (userRole.scope_type) {
    case 'UNIVERSITY':
      // Accès à toute l'université
      return true
      
    case 'FACULTY':
      // Vérifier si le contexte est dans la faculté
      if (context.faculty_id && userRole.faculty_id === context.faculty_id) {
        return true
      }
      // Vérifier via le département
      if (context.department_id) {
        const dept = await query(`
          SELECT faculty_id FROM departments WHERE id = $1
        `, [context.department_id])
        if (dept.rows[0]?.faculty_id === userRole.faculty_id) {
          return true
        }
      }
      // Vérifier via la promotion
      if (context.promotion_id) {
        const promo = await query(`
          SELECT d.faculty_id 
          FROM promotions p
          JOIN departments d ON p.department_id = d.id
          WHERE p.id = $1
        `, [context.promotion_id])
        if (promo.rows[0]?.faculty_id === userRole.faculty_id) {
          return true
        }
      }
      // Vérifier via l'étudiant
      if (context.student_id) {
        const student = await query(`
          SELECT d.faculty_id 
          FROM students s
          JOIN promotions p ON s.promotion_id = p.id
          JOIN departments d ON p.department_id = d.id
          WHERE s.id = $1
        `, [context.student_id])
        if (student.rows[0]?.faculty_id === userRole.faculty_id) {
          return true
        }
      }
      return false
      
    case 'DEPARTMENT':
      // Vérifier si le contexte est dans le département
      if (context.department_id && userRole.department_id === context.department_id) {
        return true
      }
      // Vérifier via la promotion
      if (context.promotion_id) {
        const promo = await query(`
          SELECT department_id FROM promotions WHERE id = $1
        `, [context.promotion_id])
        if (promo.rows[0]?.department_id === userRole.department_id) {
          return true
        }
      }
      // Vérifier via l'étudiant
      if (context.student_id) {
        const student = await query(`
          SELECT p.department_id 
          FROM students s
          JOIN promotions p ON s.promotion_id = p.id
          WHERE s.id = $1
        `, [context.student_id])
        if (student.rows[0]?.department_id === userRole.department_id) {
          return true
        }
      }
      return false
      
    case 'PROMOTION':
      // Vérifier si le contexte est dans la promotion
      if (context.promotion_id && userRole.promotion_id === context.promotion_id) {
        return true
      }
      // Vérifier via l'étudiant
      if (context.student_id) {
        const student = await query(`
          SELECT promotion_id FROM students WHERE id = $1
        `, [context.student_id])
        if (student.rows[0]?.promotion_id === userRole.promotion_id) {
          return true
        }
      }
      return false
      
    default:
      return false
  }
}

/**
 * Récupère le niveau hiérarchique le plus élevé d'un utilisateur
 */
export async function getHighestRoleLevel(userId: number): Promise<number> {
  const roles = await getUserRoles(userId)
  
  if (roles.length === 0) return 0
  
  return Math.max(...roles.map(r => ROLE_HIERARCHY[r.role] || 0))
}

/**
 * Vérifie si un utilisateur a un rôle spécifique ou supérieur
 */
export async function hasRoleOrHigher(
  userId: number,
  role: HierarchicalRole
): Promise<boolean> {
  const userLevel = await getHighestRoleLevel(userId)
  const requiredLevel = ROLE_HIERARCHY[role]
  
  return userLevel >= requiredLevel
}

/**
 * Récupère la portée d'accès d'un utilisateur (IDs des entités accessibles)
 */
export async function getUserAccessScope(userId: number): Promise<{
  university: boolean
  faculties: number[]
  departments: number[]
  promotions: number[]
}> {
  const roles = await getUserRoles(userId)
  
  const scope = {
    university: false,
    faculties: [] as number[],
    departments: [] as number[],
    promotions: [] as number[]
  }
  
  for (const role of roles) {
    switch (role.scope_type) {
      case 'UNIVERSITY':
        scope.university = true
        break
      case 'FACULTY':
        if (role.faculty_id && !scope.faculties.includes(role.faculty_id)) {
          scope.faculties.push(role.faculty_id)
        }
        break
      case 'DEPARTMENT':
        if (role.department_id && !scope.departments.includes(role.department_id)) {
          scope.departments.push(role.department_id)
        }
        break
      case 'PROMOTION':
        if (role.promotion_id && !scope.promotions.includes(role.promotion_id)) {
          scope.promotions.push(role.promotion_id)
        }
        break
    }
  }
  
  return scope
}

/**
 * Construit une clause WHERE pour filtrer par portée
 */
export async function buildScopeFilter(
  userId: number,
  tableAlias: string = '',
  facultyColumn: string = 'faculty_id',
  departmentColumn: string = 'department_id',
  promotionColumn: string = 'promotion_id'
): Promise<{ clause: string; params: any[] }> {
  const scope = await getUserAccessScope(userId)
  const prefix = tableAlias ? `${tableAlias}.` : ''
  
  if (scope.university) {
    return { clause: '1=1', params: [] }
  }
  
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1
  
  if (scope.faculties.length > 0) {
    conditions.push(`${prefix}${facultyColumn} = ANY($${paramIndex})`)
    params.push(scope.faculties)
    paramIndex++
  }
  
  if (scope.departments.length > 0) {
    conditions.push(`${prefix}${departmentColumn} = ANY($${paramIndex})`)
    params.push(scope.departments)
    paramIndex++
  }
  
  if (scope.promotions.length > 0) {
    conditions.push(`${prefix}${promotionColumn} = ANY($${paramIndex})`)
    params.push(scope.promotions)
    paramIndex++
  }
  
  if (conditions.length === 0) {
    return { clause: '1=0', params: [] } // Pas d'accès
  }
  
  return { clause: `(${conditions.join(' OR ')})`, params }
}

/**
 * Attribue un rôle à un utilisateur
 */
export async function assignRole(
  userId: number,
  role: HierarchicalRole,
  scopeType: ScopeType,
  assignedBy: number,
  options?: {
    faculty_id?: number
    department_id?: number
    promotion_id?: number
    is_primary?: boolean
    expires_at?: Date
  }
): Promise<number> {
  const result = await query(`
    INSERT INTO user_roles (
      user_id, role, scope_type, faculty_id, department_id, promotion_id,
      is_primary, assigned_by, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_id, role, faculty_id, department_id) 
    DO UPDATE SET is_active = TRUE, updated_at = NOW()
    RETURNING id
  `, [
    userId,
    role,
    scopeType,
    options?.faculty_id || null,
    options?.department_id || null,
    options?.promotion_id || null,
    options?.is_primary || false,
    assignedBy,
    options?.expires_at || null
  ])
  
  return result.rows[0].id
}

/**
 * Retire un rôle à un utilisateur
 */
export async function revokeRole(
  userId: number,
  role: HierarchicalRole,
  options?: {
    faculty_id?: number
    department_id?: number
    promotion_id?: number
  }
): Promise<boolean> {
  const result = await query(`
    UPDATE user_roles 
    SET is_active = FALSE, updated_at = NOW()
    WHERE user_id = $1 AND role = $2
    ${options?.faculty_id ? 'AND faculty_id = $3' : ''}
    ${options?.department_id ? 'AND department_id = $4' : ''}
    ${options?.promotion_id ? 'AND promotion_id = $5' : ''}
  `, [
    userId,
    role,
    options?.faculty_id,
    options?.department_id,
    options?.promotion_id
  ].filter(v => v !== undefined))
  
  return (result.rowCount ?? 0) > 0
}
