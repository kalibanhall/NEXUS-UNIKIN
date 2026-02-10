'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  BookOpen, Clock, User, Calendar, ArrowLeft, RefreshCw, 
  GraduationCap, FileText, Users, MapPin, Award, Target,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/lib/auth/auth-context'

interface CourseDetail {
  id: number
  code: string
  name: string
  description: string
  credits: number
  hours_cm: number
  hours_td: number
  hours_tp: number
  semester: number
  course_type: string
  teacher_id: number
  teacher_first_name: string
  teacher_last_name: string
  teacher_email?: string
  promotion_name: string
  department_name: string
  faculty_name: string
}

interface CourseGrades {
  tp_score: number | null
  td_score: number | null
  exam_score: number | null
  final_score: number | null
  session: string
}

interface CourseSchedule {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  room_name: string
  building: string
  course_type: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [grades, setGrades] = useState<CourseGrades | null>(null)
  const [schedule, setSchedule] = useState<CourseSchedule[]>([])
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const courseId = params.id as string

  useEffect(() => {
    if (courseId && user?.userId) {
      fetchCourseDetails()
    }
  }, [courseId, user?.userId])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      
      // Récupérer les détails du cours
      const courseRes = await fetch(`/api/courses/${courseId}`)
      if (courseRes.ok) {
        const courseData = await courseRes.json()
        setCourse(courseData)
      }

      // Récupérer les notes de l'étudiant pour ce cours
      const gradesRes = await fetch(`/api/grades?course_id=${courseId}&user_id=${user?.userId}`)
      if (gradesRes.ok) {
        const gradesData = await gradesRes.json()
        setGrades(gradesData)
      }

      // Récupérer l'emploi du temps pour ce cours
      const scheduleRes = await fetch(`/api/timetable?course_id=${courseId}`)
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        setSchedule(scheduleData)
      }

      // Récupérer les statistiques de présence
      const attendanceRes = await fetch(`/api/attendance?course_id=${courseId}&user_id=${user?.userId}&stats=true`)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json()
        setAttendanceStats(attendanceData)
      }

    } catch (error) {
      console.error('Error fetching course details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (day: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return days[day] || 'Inconnu'
  }

  const getCourseTypeBadge = (type: string) => {
    switch (type) {
      case 'CM': return <Badge className="bg-blue-600">Cours Magistral</Badge>
      case 'TD': return <Badge className="bg-green-600">Travaux Dirigés</Badge>
      case 'TP': return <Badge className="bg-purple-600">Travaux Pratiques</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  const getGradeStatus = (score: number | null) => {
    if (score === null) return { icon: AlertCircle, color: 'text-gray-400', label: 'Non noté' }
    if (score >= 10) return { icon: CheckCircle, color: 'text-green-600', label: 'Validé' }
    return { icon: XCircle, color: 'text-red-600', label: 'Non validé' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <BookOpen className="h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-600">Cours non trouvé</h2>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  const totalHours = course.hours_cm + course.hours_td + course.hours_tp
  const gradeStatus = grades?.final_score ? getGradeStatus(grades.final_score) : getGradeStatus(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">{course.code}</Badge>
                <Badge>{course.credits} crédits</Badge>
                <Badge variant="secondary">Semestre {course.semester}</Badge>
              </div>
              <h1 className="text-2xl font-bold mt-1">{course.name}</h1>
              <p className="text-gray-500">{course.faculty_name} - {course.department_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Volume horaire</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ma note finale</p>
                <p className={`text-2xl font-bold ${grades?.final_score && grades.final_score >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                  {grades?.final_score ? `${grades.final_score.toFixed(2)}/20` : '-'}
                </p>
              </div>
              <gradeStatus.icon className={`h-8 w-8 ${gradeStatus.color}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Présences</p>
                <p className="text-2xl font-bold text-purple-600">
                  {attendanceStats?.present || 0}/{attendanceStats?.total || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taux de présence</p>
                <p className="text-2xl font-bold text-amber-600">
                  {attendanceStats?.total > 0 
                    ? Math.round((attendanceStats.present / attendanceStats.total) * 100) 
                    : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview" className="gap-2">
            <FileText className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="grades" className="gap-2">
            <Award className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            Horaires
          </TabsTrigger>
          <TabsTrigger value="teacher" className="gap-2">
            <User className="h-4 w-4" />
            Enseignant
          </TabsTrigger>
        </TabsList>

        {/* Aperçu */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Description du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {course.description || 'Aucune description disponible pour ce cours.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition horaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cours Magistral (CM)</span>
                    <span className="font-medium">{course.hours_cm}h</span>
                  </div>
                  <Progress value={(course.hours_cm / totalHours) * 100} className="h-2 bg-blue-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Travaux Dirigés (TD)</span>
                    <span className="font-medium">{course.hours_td}h</span>
                  </div>
                  <Progress value={(course.hours_td / totalHours) * 100} className="h-2 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Travaux Pratiques (TP)</span>
                    <span className="font-medium">{course.hours_tp}h</span>
                  </div>
                  <Progress value={(course.hours_tp / totalHours) * 100} className="h-2 bg-purple-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Type de cours</p>
                  <p className="font-medium">{course.course_type === 'OBLIGATOIRE' ? 'Obligatoire' : 'Optionnel'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Promotion</p>
                  <p className="font-medium">{course.promotion_name}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Département</p>
                  <p className="font-medium">{course.department_name}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Faculté</p>
                  <p className="font-medium">{course.faculty_name}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Semestre</p>
                  <p className="font-medium">Semestre {course.semester}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-500">Crédits ECTS</p>
                  <p className="font-medium">{course.credits} crédits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détail de mes notes</CardTitle>
              <CardDescription>Évaluations pour ce cours</CardDescription>
            </CardHeader>
            <CardContent>
              {grades ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                      <p className="text-sm text-gray-500 mb-1">Note TP</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {grades.tp_score !== null ? grades.tp_score : '-'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                      <p className="text-sm text-gray-500 mb-1">Note TD</p>
                      <p className="text-3xl font-bold text-green-600">
                        {grades.td_score !== null ? grades.td_score : '-'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                      <p className="text-sm text-gray-500 mb-1">Note Examen</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {grades.exam_score !== null ? grades.exam_score : '-'}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${grades.final_score != null && grades.final_score >= 10 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <p className="text-sm text-gray-500 mb-1">Moyenne Finale</p>
                      <p className={`text-3xl font-bold ${grades.final_score != null && grades.final_score >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {grades.final_score != null ? Number(grades.final_score).toFixed(2) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <gradeStatus.icon className={`h-6 w-6 ${gradeStatus.color}`} />
                        <div>
                          <p className="font-semibold">{gradeStatus.label}</p>
                          <p className="text-sm text-gray-500">
                            {grades.final_score != null 
                              ? Number(grades.final_score) >= 10 
                                ? `Vous avez validé ce cours avec ${course.credits} crédits`
                                : 'Vous devez repasser ce cours en session de rattrapage'
                              : 'Les notes ne sont pas encore disponibles'
                            }
                          </p>
                        </div>
                      </div>
                      {grades.session && (
                        <Badge variant="outline">{grades.session}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune note disponible pour ce cours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Horaires */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emploi du temps</CardTitle>
              <CardDescription>Horaires et salles de cours</CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jour</TableHead>
                      <TableHead>Horaire</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead>Bâtiment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((slot, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{getDayName(slot.day_of_week)}</TableCell>
                        <TableCell>{slot.start_time} - {slot.end_time}</TableCell>
                        <TableCell>{getCourseTypeBadge(slot.course_type)}</TableCell>
                        <TableCell>{slot.room_name || '-'}</TableCell>
                        <TableCell>{slot.building || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun horaire défini pour ce cours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enseignant */}
        <TabsContent value="teacher" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enseignant responsable</CardTitle>
            </CardHeader>
            <CardContent>
              {course.teacher_first_name ? (
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {course.teacher_first_name} {course.teacher_last_name}
                    </h3>
                    <p className="text-gray-500">Enseignant - {course.department_name}</p>
                    {course.teacher_email && (
                      <p className="text-sm text-primary">{course.teacher_email}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Voir le profil
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun enseignant assigné à ce cours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
