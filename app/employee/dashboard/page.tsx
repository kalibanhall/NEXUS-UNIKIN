'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Building2,
  GraduationCap,
  Wallet,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Printer,
  RefreshCw,
  ArrowRight,
  CreditCard,
  UserCheck,
  ClipboardList,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/lib/auth/auth-context'

interface DashboardData {
  employee: any
  stats: {
    processedToday: number
    pending: number
    totalStudents: number
    paymentsValidated: number
  }
  recentDocuments: any[]
  recentPayments: any[]
  pendingTasks: any[]
  currentAcademicYear: any
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard?role=EMPLOYEE&user_id=${user?.id}`)
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    try {
      const response = await fetch(`/api/students?search=${searchTerm}`)
      if (response.ok) {
        const students = await response.json()
        // Handle search results
        console.log('Search results:', students)
      }
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approuvé</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">En attente</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
      <Card className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-slate-300">{data?.employee?.matricule}</p>
                <p className="text-sm text-slate-400">
                  {data?.employee?.department_name} • {data?.employee?.position}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-white/20 text-white">Personnel administratif</Badge>
              <p className="text-sm text-slate-300">
                {data?.currentAcademicYear?.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un étudiant (matricule, nom...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dossiers traités</p>
                <p className="text-3xl font-bold">{data?.stats?.processedToday || 0}</p>
                <p className="text-xs text-gray-400">Aujourd'hui</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
                <p className="text-3xl font-bold text-amber-600">{data?.stats?.pending || 0}</p>
                <p className="text-xs text-gray-400">À traiter</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Étudiants gérés</p>
                <p className="text-3xl font-bold">{data?.stats?.totalStudents || 0}</p>
                <p className="text-xs text-gray-400">Au total</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Paiements validés</p>
                <p className="text-3xl font-bold text-green-600">{data?.stats?.paymentsValidated || 0}</p>
                <p className="text-xs text-gray-400">Ce mois</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Tâches en attente
            </CardTitle>
            <CardDescription>Demandes à traiter en priorité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.pendingTasks?.length ? data.pendingTasks.slice(0, 5).map((task: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      task.priority === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {task.type === 'DOCUMENT' ? (
                        <FileText className={`h-4 w-4 ${
                          task.priority === 'HIGH' ? 'text-red-600' :
                          task.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      ) : task.type === 'PAYMENT' ? (
                        <CreditCard className={`h-4 w-4 ${
                          task.priority === 'HIGH' ? 'text-red-600' :
                          task.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      ) : (
                        <Clock className={`h-4 w-4 ${
                          task.priority === 'HIGH' ? 'text-red-600' :
                          task.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.student_name} • {task.matricule}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-gray-500">Aucune tâche en attente</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/employee/tasks">
                Toutes les tâches
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Paiements récents
            </CardTitle>
            <CardDescription>Derniers paiements enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentPayments?.length ? data.recentPayments.slice(0, 5).map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{payment.student_name}</p>
                    <p className="text-xs text-gray-500">{payment.receipt_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${parseFloat(payment.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{payment.payment_type}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">Aucun paiement récent</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/employee/payments">
                Tous les paiements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents récents
          </CardTitle>
          <CardDescription>Demandes de documents traitées récemment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Type de document</TableHead>
                <TableHead>Date demande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentDocuments?.length ? data.recentDocuments.slice(0, 5).map((doc: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{doc.student_name}</p>
                      <p className="text-xs text-gray-500">{doc.matricule}</p>
                    </div>
                  </TableCell>
                  <TableCell>{doc.document_type}</TableCell>
                  <TableCell>{new Date(doc.request_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.status === 'APPROVED' && (
                        <Button size="sm" variant="outline">
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    Aucun document récent
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/employee/documents">
              Tous les documents
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/employee/students">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm font-medium">Étudiants</p>
              </div>
            </Link>
            <Link href="/employee/payments/new">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <Plus className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">Nouveau paiement</p>
              </div>
            </Link>
            <Link href="/employee/documents">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <FileText className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm font-medium">Documents</p>
              </div>
            </Link>
            <Link href="/employee/reports">
              <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-medium">Rapports</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
