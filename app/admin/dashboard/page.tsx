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
  UserPlus,
  FileText,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
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

  const statsCards = [
    {
      title: 'Total Étudiants',
      value: stats?.students || 0,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/students',
    },
    {
      title: 'Enseignants',
      value: stats?.teachers || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      href: '/admin/users?role=TEACHER',
    },
    {
      title: 'Cours Actifs',
      value: stats?.courses || 0,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/academic',
    },
    {
      title: 'Recettes',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'from-amber-500 to-amber-600',
      href: '/admin/finances',
    },
  ]

  const paymentPercentage = stats?.paymentStats ? 
    Math.round((stats.paymentStats.paid / (stats.students || 1)) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Vue d'ensemble - {stats?.currentAcademicYear?.name || 'Année académique'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/users/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {loading ? '...' : stat.value}
                    </p>
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

      {/* Payment Status and Recent Payments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Statut des paiements
            </CardTitle>
            <CardDescription>Répartition des étudiants par statut de paiement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Taux de paiement global</span>
              <span className="font-bold text-lg">{paymentPercentage}%</span>
            </div>
            <Progress value={paymentPercentage} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Soldé</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {stats?.paymentStats?.paid || 0}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Partiel</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {stats?.paymentStats?.partial || 0}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Impayé</span>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats?.paymentStats?.unpaid || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">Bloqué</span>
                </div>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                  {stats?.paymentStats?.blocked || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Paiements récents
            </CardTitle>
            <CardDescription>Dernières transactions enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentPayments?.length ? stats.recentPayments.map((payment: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                      {payment.student_name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {payment.student_name}
                    </p>
                    <p className="text-xs text-gray-500">{payment.matricule}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      ${parseFloat(payment.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">Aucun paiement récent</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/finances">
                Voir tous les paiements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accès direct aux fonctions principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/students">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <GraduationCap className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">Gérer étudiants</p>
              </div>
            </Link>
            <Link href="/admin/academic">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <Building2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">Structure académique</p>
              </div>
            </Link>
            <Link href="/admin/deliberation">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <FileText className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm font-medium">Délibérations</p>
              </div>
            </Link>
            <Link href="/admin/finances">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <CreditCard className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-medium">Finances</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
