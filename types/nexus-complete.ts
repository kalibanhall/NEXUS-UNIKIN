// ===========================================
// NEXUS UNIKIN - Types TypeScript Complets
// Version 2.0 - Toutes les fonctionnalités
// ===========================================

// ===========================================
// PARTIE 1: RÔLES HIÉRARCHIQUES
// ===========================================

export type HierarchicalRole =
  // Niveau Central
  | 'RECTEUR'
  | 'SGA'           // Secrétaire Général Académique
  | 'SGAD'          // Secrétaire Général Administratif
  | 'SGR'           // Secrétaire Général à la Recherche
  | 'AB'            // Administrateur du Budget
  // Niveau Faculté
  | 'DOYEN'
  | 'VICE_DOYEN_ENSEIGNEMENT'
  | 'VICE_DOYEN_RECHERCHE'
  | 'SECRETAIRE_ACADEMIQUE'
  // Niveau Département
  | 'CHEF_DEPARTEMENT'
  | 'PRESIDENT_JURY'
  | 'SECRETAIRE_JURY'
  | 'MEMBRE_JURY'
  // Niveau Enseignement
  | 'PROFESSEUR_ORDINAIRE'
  | 'PROFESSEUR'
  | 'PROFESSEUR_ASSOCIE'
  | 'CHEF_TRAVAUX'
  | 'ASSISTANT'
  // Niveau Étudiant
  | 'DELEGUE_PROMOTION'
  | 'ETUDIANT'
  // Administration
  | 'EMPLOYE_SCOLARITE'
  | 'EMPLOYE_CAISSE'
  | 'EMPLOYE_BIBLIOTHEQUE'
  | 'SUPER_ADMIN'

export type ScopeType = 'UNIVERSITY' | 'FACULTY' | 'DEPARTMENT' | 'PROMOTION'

export interface UserRole {
  id: number
  user_id: number
  role: HierarchicalRole
  scope_type: ScopeType
  faculty_id?: number
  department_id?: number
  promotion_id?: number
  is_primary: boolean
  assigned_by?: number
  assigned_at: Date
  expires_at?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// ===========================================
// PARTIE 2: SYSTÈME DE DÉLIBÉRATION
// ===========================================

export type DeliberationStatus = 
  | 'DRAFT'
  | 'COMPILED'
  | 'IN_SESSION'
  | 'ADJUSTED'
  | 'VALIDATED'
  | 'PUBLISHED'

export type SessionType = 'NORMALE' | 'RATTRAPAGE' | 'SPECIALE'
export type JuryRole = 'PRESIDENT' | 'SECRETAIRE' | 'MEMBRE'
export type ModificationType = 
  | 'ERREUR_SAISIE'
  | 'REPECHAGE'
  | 'BONUS_ASSIDUITE'
  | 'AJUSTEMENT_JURY'
  | 'RECLAMATION'
  | 'CORRECTION_EXAMEN'
  | 'AUTRE'

export type DeliberationDecision = 
  | 'ADMIS'
  | 'AJOURNE'
  | 'EXCLUS'
  | 'ADMIS_DETTE'
  | 'EN_ATTENTE'

export interface Deliberation {
  id: number
  code: string
  name: string
  promotion_id: number
  academic_year_id: number
  semester: 0 | 1 | 2
  session_type: SessionType
  status: DeliberationStatus
  grades_deadline?: Date
  deliberation_date?: Date
  publication_date?: Date
  president_id?: number
  validated_by?: number
  validated_at?: Date
  published_by?: number
  published_at?: Date
  remarks?: string
  created_at: Date
  updated_at: Date
}

export interface JuryMember {
  id: number
  deliberation_id: number
  user_id: number
  role: JuryRole
  is_present: boolean
  joined_at?: Date
  created_at: Date
}

export interface GradeModification {
  id: number
  grade_id: number
  deliberation_id?: number
  old_tp_score?: number
  old_td_score?: number
  old_exam_score?: number
  old_final_score?: number
  new_tp_score?: number
  new_td_score?: number
  new_exam_score?: number
  new_final_score?: number
  justification: string
  modification_type: ModificationType
  modified_by: number
  approved_by?: number
  approved_at?: Date
  teacher_notified: boolean
  teacher_notified_at?: Date
  president_notified: boolean
  created_at: Date
}

export interface DeliberationResult {
  id: number
  deliberation_id: number
  student_id: number
  semester_average?: number
  annual_average?: number
  credits_obtained: number
  credits_required: number
  decision: DeliberationDecision
  rank_in_promotion?: number
  mention?: string
  remarks?: string
  created_at: Date
  updated_at: Date
}

// ===========================================
// PARTIE 3: LMS - COURS EN LIGNE
// ===========================================

export type ResourceType = 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK' | 'DOCUMENT' | 'PRESENTATION' | 'IMAGE'
export type AssignmentType = 'DEVOIR' | 'TP' | 'TD' | 'PROJET' | 'RAPPORT' | 'EXPOSE'
export type QuizType = 'QUIZ' | 'EXAMEN' | 'AUTO_EVALUATION' | 'SONDAGE'
export type QuestionType = 'QCM' | 'QCU' | 'VRAI_FAUX' | 'TEXTE_COURT' | 'TEXTE_LONG' | 'NUMERIQUE' | 'CORRESPONDANCE'

export interface CourseModule {
  id: number
  course_id: number
  title: string
  description?: string
  order_index: number
  is_published: boolean
  published_at?: Date
  created_at: Date
  updated_at: Date
}

export interface CourseResource {
  id: number
  module_id: number
  title: string
  description?: string
  resource_type: ResourceType
  file_url?: string
  file_size?: number
  duration?: number
  order_index: number
  is_downloadable: boolean
  views_count: number
  created_at: Date
  updated_at: Date
}

export interface Assignment {
  id: number
  course_id: number
  module_id?: number
  title: string
  description?: string
  instructions?: string
  assignment_type: AssignmentType
  max_score: number
  coefficient: number
  available_from?: Date
  due_date: Date
  late_due_date?: Date
  allow_late_submission: boolean
  late_penalty_percent: number
  max_attempts: number
  is_published: boolean
  created_at: Date
  updated_at: Date
}

export interface AssignmentSubmission {
  id: number
  assignment_id: number
  student_id: number
  file_url?: string
  file_name?: string
  file_size?: number
  content?: string
  score?: number
  feedback?: string
  graded_by?: number
  graded_at?: Date
  submitted_at: Date
  is_late: boolean
  attempt_number: number
  plagiarism_score?: number
  plagiarism_checked: boolean
  created_at: Date
  updated_at: Date
}

export interface Quiz {
  id: number
  course_id: number
  module_id?: number
  title: string
  description?: string
  quiz_type: QuizType
  time_limit?: number
  max_attempts: number
  passing_score?: number
  shuffle_questions: boolean
  shuffle_answers: boolean
  show_correct_answers: boolean
  show_score_immediately: boolean
  available_from?: Date
  available_until?: Date
  is_published: boolean
  created_at: Date
  updated_at: Date
}

export interface QuizQuestion {
  id: number
  quiz_id: number
  question_text: string
  question_type: QuestionType
  points: number
  order_index: number
  explanation?: string
  image_url?: string
  created_at: Date
}

export interface QuizAnswer {
  id: number
  question_id: number
  answer_text: string
  is_correct: boolean
  order_index: number
  feedback?: string
}

export interface QuizAttempt {
  id: number
  quiz_id: number
  student_id: number
  started_at: Date
  submitted_at?: Date
  score?: number
  percentage?: number
  passed?: boolean
  time_spent?: number
  attempt_number: number
  is_completed: boolean
}

export interface QuizResponse {
  id: number
  attempt_id: number
  question_id: number
  answer_id?: number
  text_answer?: string
  numeric_answer?: number
  is_correct?: boolean
  points_earned: number
  created_at: Date
}

export interface DiscussionForum {
  id: number
  course_id: number
  title: string
  description?: string
  is_locked: boolean
  created_at: Date
}

export interface DiscussionTopic {
  id: number
  forum_id: number
  author_id: number
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  views_count: number
  created_at: Date
  updated_at: Date
}

export interface DiscussionReply {
  id: number
  topic_id: number
  author_id: number
  parent_reply_id?: number
  content: string
  is_solution: boolean
  created_at: Date
  updated_at: Date
}

export interface StudentProgress {
  id: number
  student_id: number
  course_id: number
  module_id?: number
  resource_id?: number
  progress_percent: number
  last_accessed_at?: Date
  time_spent: number
  is_completed: boolean
  completed_at?: Date
  created_at: Date
  updated_at: Date
}

// ===========================================
// PARTIE 4: ANTIPLAGIAT
// ===========================================

export type PlagiarismStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type SourceType = 'INTERNET' | 'STUDENT_PAPER' | 'PUBLICATION' | 'DATABASE'

export interface PlagiarismReport {
  id: number
  submission_id: number
  overall_score: number
  status: PlagiarismStatus
  sources_count: number
  internet_score?: number
  database_score?: number
  student_papers_score?: number
  report_url?: string
  processed_at?: Date
  created_at: Date
}

export interface PlagiarismMatch {
  id: number
  report_id: number
  source_type: SourceType
  source_url?: string
  source_title?: string
  source_author?: string
  matched_text?: string
  similarity_percent: number
  word_count?: number
  created_at: Date
}

// ===========================================
// PARTIE 5: BOURSES & AIDES FINANCIÈRES
// ===========================================

export type CoverageType = 'FULL' | 'PARTIAL' | 'TUITION_ONLY' | 'LIVING_EXPENSES' | 'MERIT_BASED'
export type ApplicationStatus = 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED'
export type DisbursementStatus = 'PENDING' | 'PROCESSED' | 'PAID' | 'CANCELLED'

export interface ScholarshipProgram {
  id: number
  code: string
  name: string
  description?: string
  sponsor?: string
  amount?: number
  currency: string
  coverage_type?: CoverageType
  min_average?: number
  max_income?: number
  eligible_levels?: string[]
  eligible_faculties?: number[]
  application_start?: Date
  application_end?: Date
  academic_year_id?: number
  slots_available?: number
  slots_used: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface ScholarshipApplication {
  id: number
  program_id: number
  student_id: number
  motivation_letter?: string
  documents_urls?: string[]
  family_income?: number
  family_size?: number
  is_orphan: boolean
  has_disability: boolean
  academic_average?: number
  score?: number
  rank?: number
  status: ApplicationStatus
  reviewed_by?: number
  reviewed_at?: Date
  decision_reason?: string
  applied_at: Date
  created_at: Date
  updated_at: Date
}

export interface ScholarshipDisbursement {
  id: number
  application_id: number
  amount: number
  disbursement_date?: Date
  period?: string
  status: DisbursementStatus
  payment_reference?: string
  processed_by?: number
  created_at: Date
}

// ===========================================
// PARTIE 6: CARRIÈRE & ALUMNI
// ===========================================

export type JobType = 'STAGE' | 'EMPLOI' | 'ALTERNANCE' | 'FREELANCE' | 'BENEVOLAT'
export type JobPostingStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'EXPIRED'
export type JobApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN'
export type MentorshipStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface AlumniProfile {
  id: number
  user_id: number
  student_id?: number
  graduation_year?: number
  degree?: string
  faculty_id?: number
  department_id?: number
  current_position?: string
  current_company?: string
  industry?: string
  linkedin_url?: string
  professional_email?: string
  location?: string
  is_mentor: boolean
  mentor_topics?: string[]
  bio?: string
  is_public: boolean
  created_at: Date
  updated_at: Date
}

export interface JobPosting {
  id: number
  posted_by?: number
  company_name: string
  company_logo_url?: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  job_type: JobType
  contract_type?: string
  location?: string
  is_remote: boolean
  salary_min?: number
  salary_max?: number
  salary_currency: string
  eligible_faculties?: number[]
  eligible_levels?: string[]
  required_skills?: string[]
  application_deadline?: Date
  start_date?: Date
  application_url?: string
  contact_email?: string
  views_count: number
  applications_count: number
  status: JobPostingStatus
  created_at: Date
  updated_at: Date
}

export interface JobApplication {
  id: number
  posting_id: number
  applicant_id: number
  cover_letter?: string
  cv_url?: string
  additional_documents?: string[]
  status: JobApplicationStatus
  notes?: string
  applied_at: Date
  updated_at: Date
}

export interface CVProfile {
  id: number
  user_id: number
  headline?: string
  summary?: string
  website?: string
  github_url?: string
  portfolio_url?: string
  skills?: string[]
  languages?: string[]
  interests?: string[]
  is_public: boolean
  created_at: Date
  updated_at: Date
}

export interface CVExperience {
  id: number
  cv_id: number
  company: string
  position: string
  location?: string
  start_date?: Date
  end_date?: Date
  is_current: boolean
  description?: string
  achievements?: string[]
  order_index: number
  created_at: Date
}

export interface CVEducation {
  id: number
  cv_id: number
  institution: string
  degree: string
  field_of_study?: string
  location?: string
  start_date?: Date
  end_date?: Date
  grade?: string
  description?: string
  order_index: number
  created_at: Date
}

export interface MentorshipRelation {
  id: number
  mentor_id: number
  mentee_id: number
  topic?: string
  status: MentorshipStatus
  started_at?: Date
  ended_at?: Date
  created_at: Date
}

// ===========================================
// PARTIE 7: MODULE STAGES
// ===========================================

export type InternshipStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ReportType = 'WEEKLY' | 'MONTHLY' | 'MIDTERM' | 'FINAL'
export type EvaluatorType = 'ACADEMIC' | 'COMPANY' | 'SELF'

export interface PartnerCompany {
  id: number
  name: string
  industry?: string
  description?: string
  address?: string
  city?: string
  country: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  contact_person?: string
  contact_position?: string
  contact_email?: string
  contact_phone?: string
  partnership_start?: Date
  partnership_end?: Date
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface InternshipAgreement {
  id: number
  code: string
  student_id: number
  company_id: number
  academic_supervisor_id?: number
  company_supervisor_name?: string
  company_supervisor_email?: string
  company_supervisor_phone?: string
  title: string
  description?: string
  objectives?: string
  start_date: Date
  end_date: Date
  hours_per_week: number
  is_paid: boolean
  monthly_compensation?: number
  compensation_currency: string
  convention_url?: string
  status: InternshipStatus
  approved_by?: number
  approved_at?: Date
  created_at: Date
  updated_at: Date
}

export interface InternshipReport {
  id: number
  agreement_id: number
  report_type: ReportType
  title?: string
  content?: string
  file_url?: string
  submitted_at: Date
  score?: number
  feedback?: string
  evaluated_by?: number
  evaluated_at?: Date
  created_at: Date
}

export interface InternshipEvaluation {
  id: number
  agreement_id: number
  evaluator_type: EvaluatorType
  evaluator_id?: number
  technical_skills?: number
  soft_skills?: number
  punctuality?: number
  initiative?: number
  teamwork?: number
  communication?: number
  overall_score?: number
  strengths?: string
  areas_for_improvement?: string
  comments?: string
  evaluated_at: Date
}

// ===========================================
// PARTIE 8: BIBLIOTHÈQUE NUMÉRIQUE
// ===========================================

export type LibraryResourceType = 'BOOK' | 'EBOOK' | 'JOURNAL' | 'THESIS' | 'ARTICLE' | 'MAGAZINE' | 'NEWSPAPER' | 'VIDEO' | 'AUDIO'
export type AccessLevel = 'ALL' | 'STUDENT' | 'TEACHER' | 'RESEARCHER' | 'ADMIN'
export type ReservationStatus = 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED'
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST'

export interface LibraryResource {
  id: number
  isbn?: string
  title: string
  authors?: string[]
  publisher?: string
  publication_year?: number
  resource_type: LibraryResourceType
  category?: string
  subcategory?: string
  subjects?: string[]
  keywords?: string[]
  language: string
  description?: string
  table_of_contents?: string
  file_url?: string
  cover_image_url?: string
  preview_url?: string
  location?: string
  shelf_number?: string
  total_copies: number
  available_copies: number
  is_digital: boolean
  is_downloadable: boolean
  access_level: AccessLevel
  views_count: number
  downloads_count: number
  created_at: Date
  updated_at: Date
}

export interface LibraryReservation {
  id: number
  resource_id: number
  user_id: number
  reserved_at: Date
  expected_available_date?: Date
  expires_at?: Date
  status: ReservationStatus
  notified: boolean
}

export interface LibraryLoan {
  id: number
  resource_id: number
  user_id: number
  reservation_id?: number
  borrowed_at: Date
  due_date: Date
  returned_at?: Date
  renewals_count: number
  max_renewals: number
  is_overdue: boolean
  fine_amount: number
  fine_paid: boolean
  status: LoanStatus
  notes?: string
}

export interface LibraryFavorite {
  id: number
  user_id: number
  resource_id: number
  added_at: Date
}

// ===========================================
// PARTIE 9: PAIEMENTS MOBILE
// ===========================================

export type MobileProvider = 'AIRTEL_MONEY' | 'MPESA' | 'ORANGE_MONEY' | 'AFRIMONEY'
export type TransactionType = 'PAYMENT' | 'REFUND' | 'REVERSAL'
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

export interface MobileMoneyAccount {
  id: number
  user_id: number
  provider: MobileProvider
  phone_number: string
  account_name?: string
  is_verified: boolean
  verified_at?: Date
  is_default: boolean
  created_at: Date
}

export interface MobileMoneyTransaction {
  id: number
  payment_id?: number
  account_id?: number
  provider: MobileProvider
  transaction_id?: string
  reference?: string
  phone_number: string
  amount: number
  currency: string
  transaction_type: TransactionType
  status: TransactionStatus
  provider_response?: string
  provider_message?: string
  provider_fee?: number
  initiated_at: Date
  completed_at?: Date
  webhook_received: boolean
  webhook_data?: string
}

// ===========================================
// PARTIE 10: SYSTÈME DE FEEDBACK
// ===========================================

export type SurveyType = 'COURSE_EVALUATION' | 'TEACHER_EVALUATION' | 'SERVICE_FEEDBACK' | 'GENERAL'
export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
export type SurveyQuestionType = 'RATING' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'SCALE'

export interface Survey {
  id: number
  title: string
  description?: string
  survey_type: SurveyType
  target_course_id?: number
  target_teacher_id?: number
  target_roles?: string[]
  start_date?: Date
  end_date?: Date
  is_anonymous: boolean
  is_mandatory: boolean
  status: SurveyStatus
  created_by?: number
  created_at: Date
  updated_at: Date
}

export interface SurveyQuestion {
  id: number
  survey_id: number
  question_text: string
  question_type: SurveyQuestionType
  options?: string[]
  min_value?: number
  max_value?: number
  is_required: boolean
  order_index: number
  created_at: Date
}

export interface SurveyResponse {
  id: number
  survey_id: number
  respondent_id?: number
  submitted_at: Date
  ip_address?: string
}

export interface SurveyAnswer {
  id: number
  response_id: number
  question_id: number
  rating_value?: number
  text_value?: string
  selected_options?: string[]
  created_at: Date
}

// ===========================================
// PARTIE 11: EXAMENS ET PLANIFICATION
// ===========================================

export type ExamSessionStatus = 'PLANNING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
export type ExamScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
export type SupervisorRole = 'CHIEF' | 'SUPERVISOR' | 'ASSISTANT'
export type RoomType = 'CLASSROOM' | 'AMPHITHEATER' | 'LAB' | 'COMPUTER_LAB' | 'MEETING_ROOM'

export interface ExamSession {
  id: number
  name: string
  academic_year_id: number
  semester: 1 | 2
  session_type: 'NORMALE' | 'RATTRAPAGE'
  start_date: Date
  end_date: Date
  status: ExamSessionStatus
  created_at: Date
}

export interface ExamSchedule {
  id: number
  session_id: number
  course_id: number
  exam_date: Date
  start_time: string
  end_time: string
  duration: number
  room_id?: number
  chief_supervisor_id?: number
  expected_students?: number
  status: ExamScheduleStatus
  notes?: string
  created_at: Date
}

export interface ExamSupervisor {
  id: number
  schedule_id: number
  teacher_id: number
  role: SupervisorRole
  confirmed: boolean
  attended?: boolean
  created_at: Date
}

export interface Room {
  id: number
  code: string
  name: string
  building?: string
  floor?: number
  capacity: number
  room_type: RoomType
  equipment?: string[]
  is_available: boolean
  created_at: Date
}

// ===========================================
// PARTIE 12: ANALYTICS & IA
// ===========================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface PerformancePrediction {
  id: number
  student_id: number
  course_id?: number
  academic_year_id?: number
  predicted_score?: number
  confidence_level?: number
  risk_level?: RiskLevel
  factors?: Record<string, any>
  recommendations?: string[]
  predicted_at: Date
  actual_score?: number
  model_version?: string
}

export interface UserActivityLog {
  id: number
  user_id?: number
  activity_type: string
  entity_type?: string
  entity_id?: number
  metadata?: Record<string, any>
  session_id?: string
  ip_address?: string
  user_agent?: string
  created_at: Date
}

export interface KPISnapshot {
  id: number
  kpi_type: string
  scope_type: ScopeType
  faculty_id?: number
  department_id?: number
  promotion_id?: number
  academic_year_id?: number
  period?: string
  period_date?: Date
  value: number
  previous_value?: number
  change_percent?: number
  metadata?: Record<string, any>
  created_at: Date
}

// ===========================================
// PARTIE 13: RECHERCHE SCIENTIFIQUE
// ===========================================

export type ResearchType = 'FUNDAMENTAL' | 'APPLIED' | 'DEVELOPMENT' | 'DOCTORAL' | 'MASTER'
export type ResearchStatus = 'PROPOSAL' | 'UNDER_REVIEW' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED'
export type ResearchMemberRole = 'PRINCIPAL_INVESTIGATOR' | 'CO_INVESTIGATOR' | 'RESEARCHER' | 'DOCTORAL_STUDENT' | 'MASTER_STUDENT' | 'ASSISTANT'
export type PublicationType = 'JOURNAL_ARTICLE' | 'CONFERENCE_PAPER' | 'BOOK' | 'BOOK_CHAPTER' | 'THESIS' | 'DISSERTATION' | 'REPORT' | 'PATENT' | 'OTHER'
export type PublicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED'
export type ThesisType = 'LICENCE' | 'MASTER' | 'DOCTORATE'
export type ThesisStatus = 'REGISTERED' | 'IN_PROGRESS' | 'SUBMITTED' | 'DEFENDED' | 'APPROVED' | 'REJECTED'
export type ThesisJuryRole = 'PRESIDENT' | 'RAPPORTEUR' | 'EXAMINATEUR' | 'MEMBRE'

export interface ResearchProject {
  id: number
  code: string
  title: string
  description?: string
  research_type?: ResearchType
  domain?: string
  keywords?: string[]
  principal_investigator_id: number
  department_id?: number
  faculty_id?: number
  start_date?: Date
  end_date?: Date
  funding_source?: string
  budget?: number
  currency: string
  status: ResearchStatus
  approved_by?: number
  approved_at?: Date
  created_at: Date
  updated_at: Date
}

export interface ResearchProjectMember {
  id: number
  project_id: number
  user_id: number
  role: ResearchMemberRole
  joined_at: Date
  left_at?: Date
}

export interface ScientificPublication {
  id: number
  project_id?: number
  title: string
  authors: string[]
  abstract?: string
  publication_type?: PublicationType
  journal_name?: string
  conference_name?: string
  publisher?: string
  volume?: string
  issue?: string
  pages?: string
  publication_date?: Date
  doi?: string
  issn?: string
  file_url?: string
  status: PublicationStatus
  created_at: Date
  updated_at: Date
}

export interface Thesis {
  id: number
  student_id: number
  title: string
  abstract?: string
  keywords?: string[]
  thesis_type: ThesisType
  supervisor_id: number
  co_supervisor_id?: number
  jury_president_id?: number
  registration_date?: Date
  defense_date?: Date
  manuscript_url?: string
  presentation_url?: string
  grade?: number
  mention?: string
  status: ThesisStatus
  created_at: Date
  updated_at: Date
}

export interface ThesisJuryMember {
  id: number
  thesis_id: number
  user_id: number
  role: ThesisJuryRole
  is_external: boolean
  institution?: string
  created_at: Date
}

// ===========================================
// PARTIE 14: CHATBOT & VISIOCONFÉRENCE
// ===========================================

export type VideoProvider = 'INTERNAL' | 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS'
export type ConferenceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface ChatbotConversation {
  id: number
  user_id?: number
  session_id?: string
  started_at: Date
  ended_at?: Date
  messages_count: number
  was_helpful?: boolean
  feedback?: string
}

export interface ChatbotMessage {
  id: number
  conversation_id: number
  role: 'USER' | 'BOT'
  content: string
  intent?: string
  confidence?: number
  metadata?: Record<string, any>
  created_at: Date
}

export interface FAQEntry {
  id: number
  category: string
  question: string
  answer: string
  keywords?: string[]
  order_index: number
  views_count: number
  helpful_count: number
  is_published: boolean
  created_at: Date
  updated_at: Date
}

export interface VideoConference {
  id: number
  course_id?: number
  title: string
  description?: string
  provider: VideoProvider
  meeting_url?: string
  meeting_id?: string
  meeting_password?: string
  host_id: number
  scheduled_at: Date
  duration: number
  is_recorded: boolean
  recording_url?: string
  status: ConferenceStatus
  created_at: Date
}

export interface VideoConferenceParticipant {
  id: number
  conference_id: number
  user_id: number
  joined_at?: Date
  left_at?: Date
  duration?: number
}

// ===========================================
// TYPES UTILITAIRES
// ===========================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SearchParams {
  query?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}
