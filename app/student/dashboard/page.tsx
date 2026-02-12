'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Download,
  ArrowRight,
  QrCode,
  Bell,
  Lock,
  User,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/auth-context'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [attendanceCode, setAttendanceCode] = useState('')
  const [validatingAttendance, setValidatingAttendance] = useState(false)

  // Data from API
  const [studentData, setStudentData] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [attendance, setAttendance] = useState<any>(null)
  const [academicYear, setAcademicYear] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [schedule, setSchedule] = useState<any[]>([])

  useEffect(() => {
    if (user?.userId) {
      fetchDashboardData()
    }
  }, [user?.userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch main dashboard data
      const res = await fetch(`/api/dashboard?role=STUDENT&user_id=${user?.userId}`)
      if (res.ok) {
        const data = await res.json()
        setStudentData(data.student || null)
        setCourses(data.courses || [])
        setPayments(data.payments || [])
        setTotalPaid(data.totalPaid || 0)
        setAttendance(data.attendance || null)
        setAcademicYear(data.currentAcademicYear || null)
      }

      // Fetch announcements
      try {
        const annRes = await fetch('/api/announcements?limit=3')
        if (annRes.ok) {
          const annData = await annRes.json()
          setAnnouncements(Array.isArray(annData) ? annData : annData.announcements || [])
        }
      } catch { /* announcements are optional */ }

      // Fetch today's schedule
      try {
        const schedRes = await fetch(`/api/student-schedule?user_id=${user?.userId}`)
        if (schedRes.ok) {
          const schedData = await schedRes.json()
          setSchedule(Array.isArray(schedData) ? schedData : schedData.schedule || [])
        }
      } catch { /* schedule is optional */ }
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateAttendance = async () => {
    setValidatingAttendance(true)
    try {
      const res = await fetch('/api/attendance-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: attendanceCode,
          student_id: studentData?.id 
        })
      })
      if (res.ok) {
        setAttendanceCode('')
        // Refresh data after attendance validation
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Erreur validation présence:', error)
    } finally {
      setValidatingAttendance(false)
    }
  }

  const getGradeColor = (grade: number | null | undefined) => {
    if (grade === null || grade === undefined) return 'text-gray-400'
    if (grade >= 16) return 'text-green-600 font-bold'
    if (grade >= 14) return 'text-blue-600 font-semibold'
    if (grade >= 10) return 'text-gray-900 dark:text-white'
    return 'text-red-600 font-semibold'
  }

  // Computed values from real data
  const studentName = user?.profile?.first_name && user?.profile?.last_name 
    ? `${user.profile.first_name} ${user.profile.last_name}`
    : ''
  const matricule = studentData?.matricule || user?.profile?.matricule || ''
  const promotionName = studentData?.promotion_name || ''
  const level = studentData?.level || ''
  const departmentName = studentData?.department_name || ''
  const facultyName = studentData?.faculty_name || ''
  const yearName = academicYear?.name || ''
  const paymentStatus = studentData?.payment_status || 'UNPAID'
  const hasDebt = paymentStatus === 'BLOCKED'

  // Compute stats from real data
  const coursesCount = courses.length
  const coursesWithFinal = courses.filter((c: any) => c.final_score !== null && c.final_score !== undefined)
  const averageScore = coursesWithFinal.length > 0
    ? (coursesWithFinal.reduce((sum: number, c: any) => sum + parseFloat(c.final_score), 0) / coursesWithFinal.length).toFixed(1)
    : '-'
  const totalCredits = courses.reduce((sum: number, c: any) => sum + (parseInt(c.credits) || 0), 0)
  const validatedCredits = coursesWithFinal
    .filter((c: any) => parseFloat(c.final_score) >= 10)
    .reduce((sum: number, c: any) => sum + (parseInt(c.credits) || 0), 0)
  
  const attendanceTotal = parseInt(attendance?.total || '0')
  const attendancePresent = parseInt(attendance?.present || '0')
  const attendanceLate = parseInt(attendance?.late || '0')
  const attendanceRate = attendanceTotal > 0 
    ? Math.round(((attendancePresent + attendanceLate) / attendanceTotal) * 100) 
    : 0

  const stats = [
    { label: 'Cours inscrits', value: String(coursesCount), icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
    { label: 'Moyenne générale', value: averageScore, icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { label: 'Taux présence', value: attendanceTotal > 0 ? `${attendanceRate}%` : '-', icon: CheckCircle, color: 'text-purple-600 bg-purple-100' },
    { label: 'Crédits validés', value: totalCredits > 0 ? `${validatedCredits}/${totalCredits}` : '-', icon: ClipboardList, color: 'text-amber-600 bg-amber-100' },
  ]

  // Finance computed values
  const finTotalPaid = totalPaid || 0
  const recentPayments = payments.slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debt Alert */}
      {hasDebt && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Notes verrouillées - Dette en cours
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Vos notes sont verrouillées jusqu&apos;au règlement complet de vos frais académiques.
                </p>
                <Link href="/student/finances">
                  <Button size="sm" variant="destructive" className="mt-3">
                    Régulariser ma situation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord étudiant
          </h1>
          <p className="text-gray-500">
            {promotionName || level}{promotionName && departmentName ? ` • ${departmentName}` : ''}{yearName ? ` • ${yearName}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Validate Attendance Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                Valider présence
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Valider ma présence</DialogTitle>
                <DialogDescription>
                  Entrez le code de présence communiqué par votre enseignant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code de présence</Label>
                  <Input
                    id="code"
                    placeholder="Ex: ABC123"
                    value={attendanceCode}
                    onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-wider"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={validateAttendance}
                  disabled={attendanceCode.length !== 6 || validatingAttendance}
                >
                  {validatingAttendance ? 'Validation...' : 'Valider ma présence'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Link href="/student/documents">
            <Button className="gradient-primary">
              <Download className="w-4 h-4 mr-2" />
              Mes documents
            </Button>
          </Link>
        </div>
      </div>

      {/* Student Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Matricule</p>
                <p className="text-xl font-bold font-mono">{matricule}</p>
                {studentName && (
                  <p className="text-blue-100 text-sm mt-1">{studentName}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">{facultyName}</p>
              <p className="font-medium">{promotionName || `${level} ${departmentName}`}</p>
              {yearName && (
                <Badge variant="secondary" className="mt-1">
                  {yearName}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Grades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Mes notes
            </CardTitle>
            <CardDescription>
              {courses.length > 0 ? `${courses.length} cours inscrits` : 'Aucun cours inscrit pour le moment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Cours</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">TD</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">TP</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Exam</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Final</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Crédits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 6).map((course: any) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {hasDebt && <Lock className="w-4 h-4 text-red-500" />}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{course.code || course.name}</p>
                              {course.code && <p className="text-xs text-gray-500">{course.name}</p>}
                              {course.teacher_name && <p className="text-xs text-gray-400">{course.teacher_name}</p>}
                            </div>
                          </div>
                        </td>
                        <td className={`text-center py-3 px-2 ${getGradeColor(course.td_score)}`}>
                          {hasDebt ? <Lock className="w-3 h-3 mx-auto text-red-400" /> : (course.td_score ?? '-')}
                        </td>
                        <td className={`text-center py-3 px-2 ${getGradeColor(course.tp_score)}`}>
                          {hasDebt ? <Lock className="w-3 h-3 mx-auto text-red-400" /> : (course.tp_score ?? '-')}
                        </td>
                        <td className={`text-center py-3 px-2 ${getGradeColor(course.exam_score)}`}>
                          {hasDebt ? <Lock className="w-3 h-3 mx-auto text-red-400" /> : (course.exam_score ?? '-')}
                        </td>
                        <td className={`text-center py-3 px-2 ${getGradeColor(course.final_score)}`}>
                          {hasDebt ? <Lock className="w-3 h-3 mx-auto text-red-400" /> : (course.final_score != null ? parseFloat(course.final_score).toFixed(1) : '-')}
                        </td>
                        <td className="text-center py-3 px-2">
                          <Badge variant={course.final_score && parseFloat(course.final_score) >= 10 ? 'success' : 'secondary'}>
                            {course.credits || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {courses.length > 6 && (
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    + {courses.length - 6} autres cours
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune inscription aux cours trouvée</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/student/grades" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Voir tous les résultats
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Aujourd&apos;hui
            </CardTitle>
            <CardDescription>
              Vos cours du jour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedule.length > 0 ? (
              schedule.map((slot: any, index: number) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{slot.course_name || slot.course_code}</p>
                      <p className="text-sm text-gray-500">{slot.teacher_name || ''}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {slot.start_time && slot.end_time ? `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}` : ''} 
                        {slot.room_name ? ` • ${slot.room_name}` : ''}
                      </p>
                    </div>
                    {slot.type && (
                      <Badge variant={slot.type === 'CM' ? 'default' : slot.type === 'TD' ? 'secondary' : 'outline'}>
                        {slot.type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pas de cours programmé aujourd&apos;hui</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/student/timetable">
              <Button variant="outline" className="w-full">
                Emploi du temps complet
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Situation financière
            </CardTitle>
            <CardDescription>
              Frais académiques {yearName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payments.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total payé</span>
                  <span className="text-green-600 font-bold text-lg">
                    {finTotalPaid.toLocaleString()} CDF
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Nombre de paiements</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{payments.length}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-gray-400 mb-2">Derniers paiements</p>
                  {recentPayments.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-1.5 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString('fr-FR') : '-'}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {parseFloat(p.amount).toLocaleString()} {p.devise || 'CDF'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun paiement enregistré</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/student/finances" className="w-full">
              <Button variant="outline" className="w-full">
                Détails des paiements
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Annonces
            </CardTitle>
            <CardDescription>
              Communications importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement: any) => (
                <div 
                  key={announcement.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      announcement.priority === 'HIGH' || announcement.type === 'important' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {announcement.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {announcement.content || announcement.excerpt}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString('fr-FR') : announcement.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune annonce pour le moment</p>
              </div>
            )}
          </CardContent>
          {announcements.length > 0 && (
            <CardFooter>
              <Link href="/student/messages" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                Voir toutes les annonces
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/student/documents/transcript">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Relevé de notes</span>
          </Button>
        </Link>
        <Link href="/student/documents/card">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <QrCode className="w-6 h-6 text-green-600" />
            <span>Carte étudiante</span>
          </Button>
        </Link>
        <Link href="/student/attendance">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            <span>Mes présences</span>
          </Button>
        </Link>
        <Link href="/student/courses">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <BookOpen className="w-6 h-6 text-amber-600" />
            <span>Ressources cours</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
