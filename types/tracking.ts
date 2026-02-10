// ===========================================
// NEXUS UNIKIN - Types pour le Système de Suivi de Projet
// ===========================================

// ===========================================
// Énumérations
// ===========================================

export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskCategory = 'deployment' | 'configuration' | 'training' | 'encoding' | 'testing' | 'bugfix' | 'optimization' | 'documentation' | 'reporting' | 'planning' | 'data_collection' | 'validation' | 'preparation'
export type UserType = 'prestataire' | 'client' | 'all'
export type CommentType = 'comment' | 'suggestion' | 'issue' | 'question' | 'validation'
export type NotificationTrackingType = 'info' | 'success' | 'warning' | 'error' | 'validation_required'
export type FacultyDeploymentStatus = 'pending' | 'in_progress' | 'completed' | 'issues'

// ===========================================
// Types Principaux
// ===========================================

export interface ProjectPhase {
  id: number
  name: string
  description?: string
  start_date: string
  end_date: string
  order_index: number
  status: PhaseStatus
  progress_percentage: number
  created_at: string
  updated_at: string
  // Relations
  weeks?: ProjectWeek[]
  tasks_count?: number
  completed_tasks_count?: number
}

export interface ProjectWeek {
  id: number
  phase_id: number
  week_number: number
  name: string
  description?: string
  start_date: string
  end_date: string
  objectives: string[]
  status: PhaseStatus
  progress_percentage: number
  prestataire_notes?: string
  client_notes?: string
  created_at: string
  updated_at: string
  // Relations
  phase?: ProjectPhase
  tasks?: ProjectTask[]
  tasks_count?: number
  completed_tasks_count?: number
}

export interface ProjectTask {
  id: number
  week_id?: number
  phase_id?: number
  title: string
  description?: string
  category?: TaskCategory
  priority: TaskPriority
  assigned_to?: string
  estimated_hours?: number
  actual_hours?: number
  start_date?: string
  due_date?: string
  completed_date?: string
  status: TaskStatus
  progress_percentage: number
  // Validation prestataire
  prestataire_completed: boolean
  prestataire_completed_at?: string
  prestataire_completed_by?: string
  // Validation client
  client_validated: boolean
  client_validated_at?: string
  client_validated_by?: string
  client_validation_notes?: string
  // Métadonnées
  order_index: number
  is_milestone: boolean
  dependencies?: number[]
  created_at: string
  updated_at: string
  // Relations
  week?: ProjectWeek
  phase?: ProjectPhase
  subtasks?: ProjectSubtask[]
  comments?: TaskComment[]
  subtasks_count?: number
  completed_subtasks_count?: number
}

export interface ProjectSubtask {
  id: number
  task_id: number
  title: string
  description?: string
  status: TaskStatus
  completed: boolean
  completed_at?: string
  completed_by?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: number
  task_id: number
  user_type: UserType
  user_name: string
  user_role?: string
  comment_type: CommentType
  content: string
  is_important: boolean
  parent_comment_id?: number
  created_at: string
  updated_at: string
  // Relations
  replies?: TaskComment[]
  attachments?: TaskAttachment[]
}

export interface TaskAttachment {
  id: number
  task_id?: number
  comment_id?: number
  file_name: string
  file_type?: string
  file_size?: number
  file_url: string
  uploaded_by?: string
  user_type?: UserType
  created_at: string
}

export interface DeploymentFaculty {
  id: number
  name: string
  code: string
  order_index: number
  week_id?: number
  status: FacultyDeploymentStatus
  students_count: number
  teachers_count: number
  employees_count: number
  students_encoded: number
  teachers_encoded: number
  employees_encoded: number
  focal_point_name?: string
  focal_point_contact?: string
  focal_point_trained: boolean
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  week?: ProjectWeek
  focal_points?: FocalPoint[]
}

export interface FocalPoint {
  id: number
  faculty_id: number
  name: string
  role?: string
  email?: string
  phone?: string
  is_trained: boolean
  training_date?: string
  training_notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectHistory {
  id: number
  entity_type: string
  entity_id: number
  action: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  changed_by?: string
  user_type?: UserType
  notes?: string
  created_at: string
}

export interface ProjectNotification {
  id: number
  user_type: UserType
  title: string
  message: string
  notification_type: NotificationTrackingType
  related_entity_type?: string
  related_entity_id?: number
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface WeeklyReport {
  id: number
  week_id: number
  report_date: string
  // Résumé prestataire
  prestataire_summary?: string
  tasks_completed: number
  tasks_in_progress: number
  tasks_blocked: number
  issues_encountered: string[]
  solutions_applied: string[]
  // Résumé client
  client_feedback?: string
  client_satisfaction_score?: number
  client_concerns: string[]
  // Planification
  next_week_priorities: string[]
  resources_needed: string[]
  risks_identified: string[]
  // Validation
  prestataire_validated: boolean
  prestataire_validated_at?: string
  client_validated: boolean
  client_validated_at?: string
  created_at: string
  updated_at: string
  // Relations
  week?: ProjectWeek
}

// ===========================================
// Types pour le Dashboard/Résumé
// ===========================================

export interface ProjectSummary {
  total_phases: number
  completed_phases: number
  total_weeks: number
  completed_weeks: number
  current_week: number
  total_tasks: number
  completed_tasks: number
  validated_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  total_faculties: number
  completed_faculties: number
  overall_progress: number
  days_remaining: number
  days_elapsed: number
  project_start_date: string
  project_end_date: string
}

export interface TaskStats {
  category: TaskCategory
  total: number
  completed: number
  percentage: number
}

export interface WeekProgress {
  week_id: number
  week_number: number
  week_name: string
  total_tasks: number
  completed_tasks: number
  validated_tasks: number
  progress_percentage: number
  status: PhaseStatus
}

// ===========================================
// Types pour les requêtes API
// ===========================================

export interface CreateTaskInput {
  week_id?: number
  phase_id?: number
  title: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  assigned_to?: string
  estimated_hours?: number
  start_date?: string
  due_date?: string
  is_milestone?: boolean
  dependencies?: number[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  assigned_to?: string
  estimated_hours?: number
  actual_hours?: number
  start_date?: string
  due_date?: string
  status?: TaskStatus
  progress_percentage?: number
  is_milestone?: boolean
}

export interface ValidateTaskInput {
  validated_by: string
  validation_notes?: string
  user_type: UserType
}

export interface CreateCommentInput {
  task_id: number
  user_type: UserType
  user_name: string
  user_role?: string
  comment_type?: CommentType
  content: string
  is_important?: boolean
  parent_comment_id?: number
}

export interface UpdateFacultyInput {
  status?: FacultyDeploymentStatus
  students_count?: number
  teachers_count?: number
  employees_count?: number
  students_encoded?: number
  teachers_encoded?: number
  employees_encoded?: number
  focal_point_name?: string
  focal_point_contact?: string
  focal_point_trained?: boolean
  notes?: string
}
