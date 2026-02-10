'use client'

import { useState } from 'react'
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

// Student info mock
const studentInfo = {
  matricule: 'L1-INFO-2025-001',
  promotion: 'L1 Informatique',
  faculty: 'Faculté des Sciences',
  department: 'Informatique',
  academicYear: '2025-2026',
  semester: 'Semestre 1',
  hasDebt: false,
  debtAmount: 0,
}

// Stats
const stats = [
  { label: 'Cours inscrits', value: '6', icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
  { label: 'Moyenne générale', value: '14.5', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
  { label: 'Taux présence', value: '92%', icon: CheckCircle, color: 'text-purple-600 bg-purple-100' },
  { label: 'Crédits validés', value: '24/30', icon: ClipboardList, color: 'text-amber-600 bg-amber-100' },
]

// My courses
const myCourses = [
  {
    id: '1',
    code: 'INFO101',
    name: 'Introduction à l\'Informatique',
    teacher: 'Prof. Kabongo',
    credits: 4,
    noteCC: 15,
    noteTP: 16,
    noteExam: null,
    noteFinal: null,
    isLocked: false,
  },
  {
    id: '2',
    code: 'INFO102',
    name: 'Algorithmique',
    teacher: 'Prof. Kabongo',
    credits: 5,
    noteCC: 14,
    noteTP: 15,
    noteExam: 13,
    noteFinal: 13.9,
    isLocked: false,
  },
  {
    id: '3',
    code: 'MATH101',
    name: 'Mathématiques',
    teacher: 'Dr. Mutombo',
    credits: 3,
    noteCC: 12,
    noteTP: null,
    noteExam: 11,
    noteFinal: 11.5,
    isLocked: false,
  },
]

// Today's schedule
const todaySchedule = [
  { time: '08:00 - 10:00', course: 'INFO101', teacher: 'Prof. Kabongo', room: 'Auditoire A', type: 'CM', status: 'completed' },
  { time: '10:15 - 12:15', course: 'INFO102', teacher: 'Prof. Kabongo', room: 'Salle B-204', type: 'TD', status: 'current' },
  { time: '14:00 - 16:00', course: 'MATH101', teacher: 'Dr. Mutombo', room: 'Auditoire C', type: 'CM', status: 'upcoming' },
]

// Finance status
const financeStatus = {
  totalDue: 480000,
  totalPaid: 350000,
  balance: 130000,
  nextDueDate: '15 Février 2026',
  payments: [
    { date: '15 Oct 2025', amount: 200000, method: 'Mobile Money', status: 'paid' },
    { date: '15 Déc 2025', amount: 150000, method: 'Banque', status: 'paid' },
    { date: '15 Fév 2026', amount: 130000, method: '-', status: 'pending' },
  ],
}

// Recent announcements
const announcements = [
  {
    id: 1,
    title: 'Calendrier des examens S1',
    excerpt: 'Les examens du premier semestre débuteront le 20 janvier 2026...',
    date: '5 Jan 2026',
    type: 'important',
  },
  {
    id: 2,
    title: 'Fermeture administrative',
    excerpt: 'L\'université sera fermée du 24 au 26 décembre 2025...',
    date: '20 Déc 2025',
    type: 'info',
  },
]

export default function StudentDashboard() {
  const [attendanceCode, setAttendanceCode] = useState('')
  const [validatingAttendance, setValidatingAttendance] = useState(false)

  const validateAttendance = async () => {
    setValidatingAttendance(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setValidatingAttendance(false)
    setAttendanceCode('')
    // Show success message
  }

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-400'
    if (grade >= 16) return 'text-green-600 font-bold'
    if (grade >= 14) return 'text-blue-600 font-semibold'
    if (grade >= 10) return 'text-gray-900 dark:text-white'
    return 'text-red-600 font-semibold'
  }

  return (
    <div className="space-y-6">
      {/* Debt Alert */}
      {studentInfo.hasDebt && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Notes verrouillées - Dette en cours
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Vous avez une dette de <strong>{studentInfo.debtAmount.toLocaleString()} CDF</strong>. 
                  Vos notes sont verrouillées jusqu'au règlement complet.
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
            {studentInfo.promotion} • {studentInfo.academicYear}
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
                <p className="text-xl font-bold font-mono">{studentInfo.matricule}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">{studentInfo.faculty}</p>
              <p className="font-medium">{studentInfo.promotion}</p>
              <Badge variant="secondary" className="mt-1">
                {studentInfo.semester}
              </Badge>
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
              Résultats du semestre en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Cours</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">CC</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">TP</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Exam</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Final</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Crédits</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {course.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{course.code}</p>
                            <p className="text-xs text-gray-500">{course.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`text-center py-3 px-2 ${getGradeColor(course.noteCC)}`}>
                        {course.noteCC ?? '-'}
                      </td>
                      <td className={`text-center py-3 px-2 ${getGradeColor(course.noteTP)}`}>
                        {course.noteTP ?? '-'}
                      </td>
                      <td className={`text-center py-3 px-2 ${getGradeColor(course.noteExam)}`}>
                        {course.noteExam ?? '-'}
                      </td>
                      <td className={`text-center py-3 px-2 ${getGradeColor(course.noteFinal)}`}>
                        {course.noteFinal?.toFixed(1) ?? '-'}
                      </td>
                      <td className="text-center py-3 px-2">
                        <Badge variant={course.noteFinal && course.noteFinal >= 10 ? 'success' : 'secondary'}>
                          {course.credits}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              Aujourd'hui
            </CardTitle>
            <CardDescription>
              Vos cours du jour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySchedule.map((slot, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  slot.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                  slot.status === 'current' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                  'border-gray-300 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{slot.course}</p>
                    <p className="text-sm text-gray-500">{slot.teacher}</p>
                    <p className="text-xs text-gray-400 mt-1">{slot.time} • {slot.room}</p>
                  </div>
                  <Badge variant={slot.type === 'CM' ? 'default' : slot.type === 'TD' ? 'secondary' : 'outline'}>
                    {slot.type}
                  </Badge>
                </div>
              </div>
            ))}
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
              Frais académiques {studentInfo.academicYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total à payer</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {financeStatus.totalDue.toLocaleString()} CDF
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Déjà payé</span>
              <span className="text-green-600 font-medium">
                {financeStatus.totalPaid.toLocaleString()} CDF
              </span>
            </div>
            <Progress value={(financeStatus.totalPaid / financeStatus.totalDue) * 100} className="h-3" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Solde restant</span>
              <span className={`font-bold ${financeStatus.balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {financeStatus.balance.toLocaleString()} CDF
              </span>
            </div>
            {financeStatus.balance > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Prochaine échéance: {financeStatus.nextDueDate}</span>
                </div>
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
            {announcements.map((announcement) => (
              <div 
                key={announcement.id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    announcement.type === 'important' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {announcement.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {announcement.excerpt}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{announcement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Link href="/student/announcements" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Voir toutes les annonces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardFooter>
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
