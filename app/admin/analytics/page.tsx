'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Activity,
  RefreshCw,
  Search,
  Library,
  MessageSquare,
  Award,
  Microscope,
  Target,
  PieChart,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardStats {
  students: number
  teachers: number
  courses: number
  faculties: number
  paymentStats: {
    paid: number
    partial: number
    unpaid: number
    blocked: number
  }
  recentPayments: any[]
  totalRevenue: number
  currentAcademicYear: any
}

interface AnalyticsData {
  kpis: {
    totalStudents: number
    totalTeachers: number
    successRate: number
    totalRevenue: number
    activeCourses: number
  }
  atRiskStudents: any[]
  facultyComparison: any[]
}

export default function AdminDashboardEnhanced() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchAnalytics()
    ])
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard?role=SUPER_ADMIN')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const [kpisRes, predictionsRes, comparisonRes] = await Promise.all([
        fetch('/api/analytics?type=global_kpis'),
        fetch('/api/analytics?type=predictions'),
        fetch('/api/analytics?type=faculty_comparison')
      ])

      const kpis = kpisRes.ok ? await kpisRes.json() : null
      const predictions = predictionsRes.ok ? await predictionsRes.json() : null
      const comparison = comparisonRes.ok ? await comparisonRes.json() : null

      setAnalytics({
        kpis: kpis?.kpis || null,
        atRiskStudents: predictions?.atRiskStudents || [],
        facultyComparison: comparison?.comparison || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const mainStats = [
    {
      title: 'Total Étudiants',
      value: analytics?.kpis?.totalStudents || stats?.students || 0,
      icon: GraduationCap,
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      href: '/admin/students',
    },
    {
      title: 'Enseignants',
      value: analytics?.kpis?.totalTeachers || stats?.teachers || 0,
      icon: Users,
      change: '+3%',
      trend: 'up',
      color: 'from-green-500 to-green-600',
      href: '/admin/users?role=TEACHER',
    },
    {
      title: 'Taux de Réussite',
      value: `${analytics?.kpis?.successRate || 0}%`,
      icon: Target,
      change: analytics?.kpis?.successRate && analytics.kpis.successRate > 70 ? '+5%' : '-2%',
      trend: analytics?.kpis?.successRate && analytics.kpis.successRate > 70 ? 'up' : 'down',
      color: 'from-purple-500 to-purple-600',
      href: '/admin/deliberations',
    },
    {
      title: 'Recettes (CDF)',
      value: ((analytics?.kpis?.totalRevenue || stats?.totalRevenue || 0) / 1000000).toFixed(1) + 'M',
      icon: CreditCard,
      change: '+8%',
      trend: 'up',
      color: 'from-amber-500 to-amber-600',
      href: '/admin/finances',
    },
  ]

  const quickActions = [
    { label: 'Nouvel étudiant', href: '/admin/students/new', icon: GraduationCap },
    { label: 'Délibérations', href: '/admin/deliberations', icon: FileText },
    { label: 'Paiements', href: '/admin/finances', icon: CreditCard },
    { label: 'Emplois du temps', href: '/admin/academic', icon: Clock },
    { label: 'Bourses', href: '/admin/scholarships', icon: Award },
    { label: 'Bibliothèque', href: '/admin/library', icon: Library },
    { label: 'Recherche', href: '/admin/research', icon: Microscope },
    { label: 'Enquêtes', href: '/admin/surveys', icon: MessageSquare },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tableau de Bord NEXUS
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de l'Université de Kinshasa - Année académique {stats?.currentAcademicYear?.name || '2024-2025'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => {
                  setLoading(true)
                  Promise.all([fetchDashboardStats(), fetchAnalytics()])
                }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Actualiser les données</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics complets
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">vs mois dernier</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary hover:text-primary-foreground">
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              État des Paiements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.paymentStats && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Soldés</span>
                    <span className="font-medium text-green-600">{stats.paymentStats.paid}</span>
                  </div>
                  <Progress value={(stats.paymentStats.paid / (stats.students || 1)) * 100} className="h-2 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Partiels</span>
                    <span className="font-medium text-amber-600">{stats.paymentStats.partial}</span>
                  </div>
                  <Progress value={(stats.paymentStats.partial / (stats.students || 1)) * 100} className="h-2 bg-amber-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Non payés</span>
                    <span className="font-medium text-red-600">{stats.paymentStats.unpaid}</span>
                  </div>
                  <Progress value={(stats.paymentStats.unpaid / (stats.students || 1)) * 100} className="h-2 bg-red-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bloqués</span>
                    <span className="font-medium text-gray-600">{stats.paymentStats.blocked}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/finances">Voir tous les paiements</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* At Risk Students (IA Prediction) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Étudiants à Risque (Prédiction IA)
              </CardTitle>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {analytics?.atRiskStudents?.length || 0} détectés
              </Badge>
            </div>
            <CardDescription>
              Basé sur l'assiduité, les notes et les paiements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.atRiskStudents && analytics.atRiskStudents.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {analytics.atRiskStudents.slice(0, 5).map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {student.name?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.matricule} - {student.promotion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Score risque</p>
                        <p className={`font-bold ${student.risk_score >= 70 ? 'text-red-600' : 'text-amber-600'}`}>
                          {student.risk_score}%
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {student.attendance_rate < 75 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="bg-red-50 text-red-700 text-xs px-1">
                                  <Clock className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Assiduité faible ({student.attendance_rate?.toFixed(0)}%)</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {student.average_grade < 10 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="bg-red-50 text-red-700 text-xs px-1">
                                  <BookOpen className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Moyenne faible ({student.average_grade?.toFixed(1)}/20)</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {student.payment_risk && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="bg-red-50 text-red-700 text-xs px-1">
                                  <CreditCard className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Paiement en retard</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>Aucun étudiant à risque détecté</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/analytics?view=predictions">
                Voir toutes les prédictions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Faculty Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Comparaison des Facultés
          </CardTitle>
          <CardDescription>
            Performance académique par faculté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Faculté</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Étudiants</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Enseignants</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Moy. Notes</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Taux Réussite</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Assiduité</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.facultyComparison?.slice(0, 8).map((faculty: any) => (
                  <tr key={faculty.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{faculty.name}</td>
                    <td className="py-3 px-2 text-center">{faculty.students || 0}</td>
                    <td className="py-3 px-2 text-center">{faculty.teachers || 0}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={faculty.avg_grade >= 12 ? 'default' : faculty.avg_grade >= 10 ? 'secondary' : 'destructive'}>
                        {faculty.avg_grade?.toFixed(1) || '-'}/20
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-medium ${faculty.success_rate >= 70 ? 'text-green-600' : faculty.success_rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {faculty.success_rate || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`${faculty.attendance_rate >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                        {faculty.attendance_rate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {stats?.recentPayments && stats.recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Derniers Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentPayments.slice(0, 5).map((payment: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                        {payment.student_name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{payment.student_name}</p>
                      <p className="text-xs text-muted-foreground">{payment.payment_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {parseFloat(payment.amount).toLocaleString()} CDF
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
