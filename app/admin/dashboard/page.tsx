'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  UserPlus,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface DashboardStats {
  students: number
  studentsApproximate?: boolean
  teachers: number
  courses: number
  faculties: number
  totalRevenue: number
  paymentStats: {
    paid: number
    partial: number
    unpaid: number
    blocked: number
  }
  recentPayments: any[]
  currentAcademicYear: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard?role=SUPER_ADMIN')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Étudiants',
      value: stats
        ? (stats.studentsApproximate
          ? `${stats.students.toLocaleString()}+`
          : stats.students.toLocaleString())
        : '...',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      description: stats?.studentsApproximate ? 'Étudiants actifs (approx.)' : 'Étudiants actifs',
    },
    {
      title: 'Enseignants',
      value: stats ? stats.teachers.toLocaleString() : '...',
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: 'Personnel actif',
    },
    {
      title: 'Cours Actifs',
      value: stats ? stats.courses.toLocaleString() : '...',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      description: 'Ce semestre',
    },
    {
      title: 'Recettes',
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '...',
      icon: CreditCard,
      color: 'from-amber-500 to-amber-600',
      description: 'Frais collectés',
    },
  ]

  const unpaidCount = stats?.paymentStats?.unpaid || 0
  const blockedCount = stats?.paymentStats?.blocked || 0
  const totalDebt = unpaidCount + blockedCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord administrateur
          </h1>
          <p className="text-gray-500">
            {stats?.currentAcademicYear 
              ? `Année académique ${stats.currentAcademicYear.name} — Vue d'ensemble`
              : "Vue d'ensemble du système NEXUS UNIKIN"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Rapport
          </Button>
          <Button className="gradient-primary" asChild>
            <Link href="/admin/users">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle action
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      ) : stat.value}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Situation des paiements
            </CardTitle>
            <CardDescription>
              Répartition du statut de paiement des étudiants actifs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Étudiants soldés</span>
                    <div className="flex items-center gap-4">
                      {!stats?.studentsApproximate && (
                        <span className="text-sm text-gray-500">{stats?.paymentStats?.paid || 0} étudiants</span>
                      )}
                      <Badge variant="default">{stats?.students ? Math.round(((stats?.paymentStats?.paid || 0) / stats.students) * 100) : 0}%</Badge>
                    </div>
                  </div>
                  <Progress value={stats?.students ? ((stats?.paymentStats?.paid || 0) / stats.students) * 100 : 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Paiements partiels</span>
                    <div className="flex items-center gap-4">
                      {!stats?.studentsApproximate && (
                        <span className="text-sm text-gray-500">{stats?.paymentStats?.partial || 0} étudiants</span>
                      )}
                      <Badge variant="secondary">{stats?.students ? Math.round(((stats?.paymentStats?.partial || 0) / stats.students) * 100) : 0}%</Badge>
                    </div>
                  </div>
                  <Progress value={stats?.students ? ((stats?.paymentStats?.partial || 0) / stats.students) * 100 : 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Impayés</span>
                    <div className="flex items-center gap-4">
                      {!stats?.studentsApproximate && (
                        <span className="text-sm text-gray-500">{stats?.paymentStats?.unpaid || 0} étudiants</span>
                      )}
                      <Badge variant="destructive">{stats?.students ? Math.round(((stats?.paymentStats?.unpaid || 0) / stats.students) * 100) : 0}%</Badge>
                    </div>
                  </div>
                  <Progress value={stats?.students ? ((stats?.paymentStats?.unpaid || 0) / stats.students) * 100 : 0} className="h-2" />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/finances" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Voir la gestion financière
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Derniers paiements
            </CardTitle>
            <CardDescription>
              Transactions récentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : stats?.recentPayments && stats.recentPayments.length > 0 ? (
              stats.recentPayments.map((payment: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {payment.student_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{payment.matricule}</span>
                      <Badge variant="secondary" className="text-xs">
                        ${parseFloat(payment.amount).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucun paiement récent</p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/finances" className="w-full">
              <Button variant="outline" className="w-full">
                Voir tous les paiements
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités clés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <span>Utilisateurs</span>
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <span>Cours</span>
                </Button>
              </Link>
              <Link href="/admin/deliberations">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                  <span>Délibérations</span>
                </Button>
              </Link>
              <Link href="/admin/announcements">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <span>Annonces</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5" />
              Attention requise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {totalDebt > 0 && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {stats?.studentsApproximate ? (
                        <>Des étudiants ont des <strong>dettes impayées</strong></>
                      ) : (
                        <><strong>{totalDebt} étudiant{totalDebt > 1 ? 's' : ''}</strong> {totalDebt > 1 ? 'ont' : 'a'} des dettes impayées</>
                      )}
                    </p>
                  </div>
                )}
                {(stats?.paymentStats?.partial || 0) > 0 && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {stats?.studentsApproximate ? (
                        <>Des étudiants sont en <strong>paiement partiel</strong></>
                      ) : (
                        <><strong>{stats?.paymentStats?.partial} étudiant{(stats?.paymentStats?.partial || 0) > 1 ? 's' : ''}</strong> en paiement partiel</>
                      )}
                    </p>
                  </div>
                )}
                {totalDebt === 0 && (stats?.paymentStats?.partial || 0) === 0 && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Tout est en ordre ! Aucune alerte.
                    </p>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Link href="/admin/finances">
                    <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100">
                      Gérer les finances
                    </Button>
                  </Link>
                  <Link href="/admin/students">
                    <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100">
                      Voir les étudiants
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
