'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Courses data
const myCourses = [
  {
    id: '1',
    code: 'INFO101',
    name: 'Introduction à l\'Informatique',
    promotion: 'L1 Informatique',
    students: 156,
    progress: 65,
    nextSession: 'Lundi 08:00 - 10:00',
    room: 'Auditoire A',
    gradeStatus: 'pending', // pending, partial, complete
    pendingGrades: 45,
  },
  {
    id: '2',
    code: 'INFO102',
    name: 'Algorithmique et Structures de Données',
    promotion: 'L1 Informatique',
    students: 156,
    progress: 50,
    nextSession: 'Mardi 10:00 - 12:00',
    room: 'Salle B-204',
    gradeStatus: 'partial',
    pendingGrades: 12,
  },
  {
    id: '3',
    code: 'INFO201',
    name: 'Programmation Orientée Objet',
    promotion: 'L2 Informatique',
    students: 98,
    progress: 40,
    nextSession: 'Mercredi 14:00 - 16:00',
    room: 'Labo Info 1',
    gradeStatus: 'complete',
    pendingGrades: 0,
  },
]

// Today's schedule
const todaySchedule = [
  { time: '08:00 - 10:00', course: 'INFO101', room: 'Auditoire A', type: 'CM', status: 'completed' },
  { time: '10:15 - 12:15', course: 'INFO102', room: 'Salle B-204', type: 'TD', status: 'current' },
  { time: '14:00 - 16:00', course: 'INFO201', room: 'Labo Info 1', type: 'TP', status: 'upcoming' },
]

// Recent student activities
const recentStudentActivities = [
  { name: 'Patrick Mbuyi', action: 'a validé sa présence', course: 'INFO101', time: '09:45' },
  { name: 'Marie Kasongo', action: 'a téléchargé le cours', course: 'INFO102', time: '10:30' },
  { name: 'Jean Ilunga', action: 'a posé une question', course: 'INFO101', time: '11:00' },
]

// Stats
const stats = [
  { label: 'Mes cours', value: '5', icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
  { label: 'Étudiants', value: '410', icon: Users, color: 'text-green-600 bg-green-100' },
  { label: 'Notes à encoder', value: '57', icon: ClipboardList, color: 'text-amber-600 bg-amber-100' },
  { label: 'Taux présence', value: '87%', icon: UserCheck, color: 'text-purple-600 bg-purple-100' },
]

export default function TeacherDashboard() {
  const [activeCode, setActiveCode] = useState<string | null>(null)

  // Generate attendance code
  const generateAttendanceCode = (courseId: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setActiveCode(code)
    // In real app, this would call the API
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord enseignant
          </h1>
          <p className="text-gray-500">
            Gérez vos cours, notes et présences
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher/grades">
            <Button variant="outline">
              <ClipboardList className="w-4 h-4 mr-2" />
              Encoder notes
            </Button>
          </Link>
          <Link href="/teacher/attendance">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90">
              <Play className="w-4 h-4 mr-2" />
              Démarrer présence
            </Button>
          </Link>
        </div>
      </div>

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

      {/* Active Attendance Code */}
      {activeCode && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Code de présence actif</p>
                  <p className="text-3xl font-mono font-bold text-green-800 dark:text-green-200 tracking-wider">
                    {activeCode}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">Expire dans</p>
                <p className="text-xl font-bold text-green-800 dark:text-green-200">14:32</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-red-600"
                  onClick={() => setActiveCode(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Mes cours
            </CardTitle>
            <CardDescription>
              Cours que vous dispensez ce semestre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myCourses.map((course) => (
              <div 
                key={course.id} 
                className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{course.code}</Badge>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {course.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{course.promotion}</p>
                  </div>
                  <Badge 
                    variant={
                      course.gradeStatus === 'complete' ? 'success' : 
                      course.gradeStatus === 'partial' ? 'warning' : 'secondary'
                    }
                  >
                    {course.gradeStatus === 'complete' ? 'Notes complètes' : 
                     course.gradeStatus === 'partial' ? `${course.pendingGrades} en attente` : 
                     `${course.pendingGrades} à encoder`}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students} étudiants
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.nextSession}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {course.room}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progression du cours</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateAttendanceCode(course.id)}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Présence
                  </Button>
                  <Link href={`/teacher/grades/${course.id}`}>
                    <Button size="sm" variant="outline">
                      <ClipboardList className="w-4 h-4 mr-1" />
                      Notes
                    </Button>
                  </Link>
                  <Link href={`/teacher/courses/${course.id}`}>
                    <Button size="sm" variant="ghost">
                      Détails
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Link href="/teacher/courses" className="text-green-600 hover:underline text-sm flex items-center gap-1">
              Voir tous mes cours
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Emploi du temps
            </CardTitle>
            <CardDescription>
              Vos cours aujourd'hui
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.map((slot, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  slot.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  slot.status === 'current' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse-slow' :
                  'border-gray-300 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{slot.course}</p>
                    <p className="text-sm text-gray-500">{slot.time}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={slot.type === 'CM' ? 'default' : slot.type === 'TD' ? 'secondary' : 'outline'}>
                      {slot.type}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{slot.room}</p>
                  </div>
                </div>
                {slot.status === 'completed' && (
                  <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Terminé
                  </div>
                )}
                {slot.status === 'current' && (
                  <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm">
                    <Play className="w-4 h-4" />
                    En cours
                  </div>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Link href="/teacher/timetable">
              <Button variant="outline" className="w-full">
                Voir l'emploi du temps complet
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente des étudiants</CardTitle>
          <CardDescription>
            Dernières interactions avec vos cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentStudentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    {activity.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.name}</span>
                    {' '}{activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.course} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/teacher/resources/upload">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Déposer un support</span>
          </Button>
        </Link>
        <Link href="/teacher/grades">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <ClipboardList className="w-6 h-6 text-green-600" />
            <span>Encoder les notes</span>
          </Button>
        </Link>
        <Link href="/teacher/students">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Liste étudiants</span>
          </Button>
        </Link>
        <Link href="/teacher/attendance">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <UserCheck className="w-6 h-6 text-amber-600" />
            <span>Suivi présences</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
