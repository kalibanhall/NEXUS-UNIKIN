// ===========================================
// NEXUS UNIKIN - Types TypeScript
// ===========================================

// ===========================================
// Énumérations
// ===========================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'EMPLOYEE'
export type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED'
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'BLOCKED'
export type TeacherGrade = 'ASSISTANT' | 'CHEF_TRAVAUX' | 'PROFESSEUR_ASSOCIE' | 'PROFESSEUR' | 'PROFESSEUR_ORDINAIRE'
export type CourseType = 'OBLIGATOIRE' | 'OPTIONNEL' | 'LIBRE'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
export type PaymentType = 'INSCRIPTION' | 'FRAIS_ACADEMIQUES' | 'FRAIS_MINERVAL' | 'AUTRES'
export type PaymentMethod = 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'CHECK'
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
export type PromotionLevel = 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | 'D1' | 'D2' | 'D3'
export type AdminType = 'SUPER_ADMIN' | 'FACULTY_ADMIN' | 'DEPARTMENT_ADMIN'
export type ContractType = 'PERMANENT' | 'CONTRACT' | 'TEMPORARY'
export type ScheduleType = 'CM' | 'TD' | 'TP'

// ===========================================
// Types de base
// ===========================================

export interface User {
  id: number
  email: string
  password?: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  photo_url?: string
  role: UserRole
  is_active: boolean
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface AcademicYear {
  id: number
  name: string
  start_date: Date
  end_date: Date
  is_current: boolean
}

export interface Faculty {
  id: number
  code: string
  name: string
  description?: string
  dean_id?: number
  is_active: boolean
}

export interface Department {
  id: number
  code: string
  name: string
  description?: string
  faculty_id: number
  head_id?: number
  is_active: boolean
}

export interface Promotion {
  id: number
  code: string
  name: string
  level: PromotionLevel
  department_id: number
  academic_year_id: number
  is_active: boolean
}

// ===========================================
// Types utilisateurs spécifiques
// ===========================================

export interface Admin {
  id: number
  user_id: number
  admin_type: AdminType
  faculty_id?: number
  department_id?: number
}

export interface Teacher {
  id: number
  user_id: number
  matricule: string
  grade: TeacherGrade
  specialization?: string
  department_id?: number
  hire_date?: Date
  is_permanent: boolean
}

export interface Student {
  id: number
  user_id: number
  matricule: string
  promotion_id: number
  enrollment_date: Date
  status: StudentStatus
  payment_status: PaymentStatus
  birth_date?: Date
  birth_place?: string
  nationality: string
  gender?: 'M' | 'F'
  parent_name?: string
  parent_phone?: string
}

export interface Employee {
  id: number
  user_id: number
  matricule: string
  position: string
  department?: string
  service?: string
  hire_date?: Date
  contract_type?: ContractType
}

// ===========================================
// Types académiques
// ===========================================

export interface Course {
  id: number
  code: string
  name: string
  description?: string
  credits: number
  hours_cm: number
  hours_td: number
  hours_tp: number
  promotion_id: number
  teacher_id?: number
  semester: 1 | 2
  course_type: CourseType
  is_active: boolean
}

export interface CourseSchedule {
  id: number
  course_id: number
  day_of_week: number
  start_time: string
  end_time: string
  room?: string
  schedule_type: ScheduleType
}

export interface Enrollment {
  id: number
  student_id: number
  course_id: number
  academic_year_id: number
  enrollment_date: Date
  status: 'ENROLLED' | 'DROPPED' | 'COMPLETED'
}

export interface Grade {
  id: number
  student_id: number
  course_id: number
  academic_year_id: number
  tp_score?: number
  td_score?: number
  exam_score?: number
  final_score?: number
  grade_letter?: string
  is_validated: boolean
  validated_by?: number
  validated_at?: Date
  remarks?: string
}

export interface Attendance {
  id: number
  student_id: number
  course_id: number
  schedule_id?: number
  attendance_date: Date
  status: AttendanceStatus
  remarks?: string
  recorded_by?: number
}

export interface Payment {
  id: number
  student_id: number
  academic_year_id: number
  amount: number
  payment_type: PaymentType
  payment_date: Date
  payment_method?: PaymentMethod
  reference?: string
  receipt_number?: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  recorded_by?: number
  remarks?: string
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  link?: string
  created_at: Date
}

// ===========================================
// Types d'authentification
// ===========================================

export interface AuthUser {
  id: number
  email: string
  role: UserRole
  firstName: string
  lastName: string
  profile: StudentProfile | TeacherProfile | EmployeeProfile | AdminProfile | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SessionData {
  userId: number
  email: string
  role: UserRole
  firstName: string
  lastName: string
  profile: any
}

// ===========================================
// Profils utilisateurs avec relations
// ===========================================

export interface StudentProfile extends Student {
  user?: User
  promotion_name?: string
  promotion_level?: string
  department_name?: string
  faculty_name?: string
}

export interface TeacherProfile extends Teacher {
  user?: User
  department_name?: string
}

export interface EmployeeProfile extends Employee {
  user?: User
}

export interface AdminProfile extends Admin {
  user?: User
}

// ===========================================
// Types pour les listes avec détails
// ===========================================

export interface StudentWithDetails {
  id: number
  matricule: string
  status: StudentStatus
  payment_status: PaymentStatus
  enrollment_date: Date
  user_id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_active: boolean
  promotion_id: number
  promotion_name: string
  promotion_level: string
  department_id: number
  department_name: string
  faculty_id: number
  faculty_name: string
}

export interface CourseWithDetails {
  id: number
  code: string
  name: string
  description?: string
  credits: number
  hours_cm: number
  hours_td: number
  hours_tp: number
  semester: number
  course_type: CourseType
  is_active: boolean
  promotion_id: number
  promotion_name: string
  promotion_level: string
  teacher_id?: number
  teacher_first_name?: string
  teacher_last_name?: string
  department_name: string
  faculty_name: string
}

export interface GradeWithDetails {
  id: number
  tp_score?: number
  td_score?: number
  exam_score?: number
  final_score?: number
  grade_letter?: string
  is_validated: boolean
  validated_at?: Date
  remarks?: string
  student_id: number
  matricule: string
  student_first_name: string
  student_last_name: string
  course_id: number
  course_code: string
  course_name: string
  credits: number
  academic_year: string
}

// ===========================================
// Types pour l'emploi du temps
// ===========================================

export interface TimetableSlot {
  id: string
  courseCode: string
  courseName: string
  teacherName: string
  teacherTitle: string
  room: string
  building: string
  type: 'THEORY' | 'PRACTICAL' | 'LAB' | 'TUTORIAL'
  dayOfWeek: number
  startTime: string
  endTime: string
  credits: number
  color?: string
  studentsCount?: number
}

// ===========================================
// Types pour les statistiques
// ===========================================

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  activeEnrollments: number
  passRate: number
  paymentRate: number
}

export interface DeliberationStats {
  totalStudents: number
  passedStudents: number
  failedStudents: number
  passRate: string
}

export interface DeliberationStudent {
  id: number
  matricule: string
  first_name: string
  last_name: string
  status: StudentStatus
  payment_status: PaymentStatus
  average?: number
  credits_validated?: number
  total_credits?: number
  courses_count?: number
  courses_passed?: number
  decision: string
}

// ===========================================
// Types pour les formulaires
// ===========================================

export interface CreateStudentForm {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  matricule: string
  promotionId: number
  birthDate?: string
  birthPlace?: string
  gender?: 'M' | 'F'
  nationality?: string
  parentName?: string
  parentPhone?: string
}

export interface UpdateStudentForm {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  promotionId?: number
  status?: StudentStatus
  paymentStatus?: PaymentStatus
  birthDate?: string
  birthPlace?: string
  gender?: 'M' | 'F'
  parentName?: string
  parentPhone?: string
}

export interface CreateCourseForm {
  code: string
  name: string
  description?: string
  credits?: number
  hoursCm?: number
  hoursTd?: number
  hoursTp?: number
  promotionId: number
  teacherId?: number
  semester: 1 | 2
  courseType?: CourseType
}

export interface GradeForm {
  studentId: number
  courseId: number
  academicYearId: number
  tpScore?: number
  tdScore?: number
  examScore?: number
  remarks?: string
}

// ===========================================
// Types pour les réponses API
// ===========================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
