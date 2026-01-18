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
  Bell,
  User,
  RefreshCw,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth/auth-context'

interface DashboardData {
  student: any
  courses: any[]
  payments: any[]
  totalPaid: number
  attendance: any
  currentAcademicYear: any
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?role=STUDENT&user_id=${user?.id}`)
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

  const paymentPercentage = data?.totalPaid ? Math.min(100, Math.round((data.totalPaid / 1300) * 100)) : 0
  const attendanceRate = (data?.attendance?.total ?? 0) > 0 
    ? Math.round(((data?.attendance?.present ?? 0) / (data?.attendance?.total ?? 1)) * 100) 
    : 0

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Soldé</Badge>
      case 'PARTIAL':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Partiel</Badge>
      case 'BLOCKED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Bloqué</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Impayé</Badge>
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
      {/* Student Info Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-blue-100">{data?.student?.matricule}</p>
                <p className="text-sm text-blue-200">
                  {data?.student?.promotion_name} • {data?.student?.faculty_name}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getPaymentStatusBadge(data?.student?.payment_status)}
              <p className="text-sm text-blue-200">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Cours inscrits</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Moyenne générale</p>
                <p className="text-3xl font-bold">
                  {(() => {
                    const courses = data?.courses || []
                    const withScores = courses.filter((c: any) => c.final_score)
                    if (withScores.length === 0) return '-'
                    const total = withScores.reduce((sum: number, c: any) => sum + (parseFloat(c.final_score) || 0), 0)
                    return (total / withScores.length).toFixed(2)
                  })()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Taux de présence</p>
                <p className="text-3xl font-bold">{attendanceRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Frais payés</p>
                <p className="text-3xl font-bold">${data?.totalPaid || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Mes cours
            </CardTitle>
            <CardDescription>Cours et évaluations du semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.courses?.length ? data.courses.slice(0, 5).map((course: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{course.code}</p>
                    <p className="text-sm text-gray-500 truncate">{course.name}</p>
                    {course.teacher_name && (
                      <p className="text-xs text-gray-400">{course.teacher_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {course.final_score ? (
                      <span className={`font-bold ${
                        parseFloat(course.final_score) >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(course.final_score).toFixed(1)}/20
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                    <p className="text-xs text-gray-400">{course.credits} crédits</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">Aucun cours inscrit</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/student/courses">
                Voir tous les cours
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Situation financière
            </CardTitle>
            <CardDescription>Suivi de vos paiements académiques</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Progression des paiements</span>
                <span className="font-medium">{paymentPercentage}%</span>
              </div>
              <Progress value={paymentPercentage} className="h-3" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">Payé: ${data?.totalPaid || 0}</span>
                <span className="text-gray-400">Total: $1,300</span>
              </div>
            </div>

            <div className="space-y-2">
              {data?.payments?.length ? data.payments.slice(0, 3).map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{payment.payment_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${parseFloat(payment.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{payment.receipt_number}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-4">Aucun paiement enregistré</p>
              )}
            </div>

            {data?.student?.payment_status !== 'PAID' && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-400">Solde restant</p>
                  <p className="text-sm text-yellow-600">${1300 - (data?.totalPaid || 0)} à payer</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/student/finances">
                Détails des paiements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accès rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/student/timetable">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <Calendar className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">Emploi du temps</p>
              </div>
            </Link>
            <Link href="/student/grades">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <ClipboardList className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">Mes notes</p>
              </div>
            </Link>
            <Link href="/student/attendance">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm font-medium">Présences</p>
              </div>
            </Link>
            <Link href="/student/documents">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <FileText className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-medium">Documents</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
