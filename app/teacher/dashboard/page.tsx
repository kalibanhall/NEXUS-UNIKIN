'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  UserCheck,
  Play,
  ArrowRight,
  Plus,
  RefreshCw,
  GraduationCap,
  Edit,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth/auth-context'

interface DashboardData {
  teacher: any
  courses: any[]
  totalStudents: number
  pendingGrades: number
  attendanceRate: number
  schedule: any[]
  currentAcademicYear: any
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCode, setActiveCode] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?role=TEACHER&user_id=${user?.id}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAttendanceCode = async (courseId: string) => {
    setGeneratingCode(courseId)
    // Generate a 6-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setActiveCode(code)
    
    try {
      // Create attendance session via API
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          attendance_code: code,
          teacher_id: data?.teacher?.id
        })
      })
    } catch (error) {
      console.error('Error creating attendance session:', error)
    } finally {
      setGeneratingCode(null)
    }
  }

  const getGradeStatusBadge = (course: any) => {
    const pendingCount = course.pending_grades || 0
    if (pendingCount === 0) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Complet</Badge>
    } else if (pendingCount < 10) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Partiel</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">À encoder</Badge>
  }

  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case 'LECTURE':
        return <Badge variant="outline" className="text-blue-600">CM</Badge>
      case 'TD':
        return <Badge variant="outline" className="text-green-600">TD</Badge>
      case 'TP':
        return <Badge variant="outline" className="text-purple-600">TP</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-emerald-100">{data?.teacher?.matricule}</p>
                <p className="text-sm text-emerald-200">
                  {data?.teacher?.department_name} • {data?.teacher?.faculty_name}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-white/20 text-white">{data?.teacher?.specialization}</Badge>
              <p className="text-sm text-emerald-200">
                {data?.currentAcademicYear?.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mes cours</p>
                <p className="text-3xl font-bold">{data?.courses?.length || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total étudiants</p>
                <p className="text-3xl font-bold">{data?.totalStudents || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes à encoder</p>
                <p className="text-3xl font-bold text-amber-600">{data?.pendingGrades || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <ClipboardList className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux présence</p>
                <p className="text-3xl font-bold">{data?.attendanceRate || 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Courses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Mes cours
                </CardTitle>
                <CardDescription>Cours que vous enseignez ce semestre</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/teacher/courses">
                  Voir tout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.courses?.length ? data.courses.map((course: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{course.code}</h4>
                        {getGradeStatusBadge(course)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{course.name}</p>
                      <p className="text-xs text-gray-400">{course.promotion_name}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{course.student_count || 0}</span>
                      </div>
                      <p className="text-xs text-gray-400">{course.credits} crédits</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateAttendanceCode(course.id)}
                      disabled={generatingCode === course.id}
                    >
                      {generatingCode === course.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Présence
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/teacher/grades?course=${course.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Notes
                      </Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">Aucun cours assigné</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Emploi du jour
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.schedule?.length ? data.schedule.map((session: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border-l-4 ${
                    session.status === 'current' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : session.status === 'completed'
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{session.start_time} - {session.end_time}</span>
                    </div>
                    {getSessionTypeBadge(session.session_type)}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.course_code}</p>
                  <p className="text-xs text-gray-500">{session.room_name}</p>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Pas de cours aujourd'hui</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/teacher/timetable">
                Emploi du temps complet
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Attendance Code Modal */}
      {activeCode && (
        <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-400">Code de présence actif</h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Communiquez ce code à vos étudiants
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-mono font-bold tracking-widest text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 px-6 py-3 rounded-lg">
                  {activeCode}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveCode(null)}
                  className="border-green-500 text-green-700 hover:bg-green-100"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/teacher/grades">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <ClipboardList className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">Encoder notes</p>
              </div>
            </Link>
            <Link href="/teacher/attendance">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <UserCheck className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">Présences</p>
              </div>
            </Link>
            <Link href="/teacher/timetable">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <Calendar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm font-medium">Emploi du temps</p>
              </div>
            </Link>
            <Link href="/teacher/reports">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <FileText className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-medium">Rapports</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
