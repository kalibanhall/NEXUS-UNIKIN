'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Stats cards data
const stats = [
  {
    title: 'Dossiers traités',
    value: '47',
    subValue: 'Cette semaine',
    icon: FileText,
    trend: '+12%',
    color: 'bg-blue-500',
  },
  {
    title: 'En attente',
    value: '23',
    subValue: 'À traiter',
    icon: Clock,
    trend: '-5%',
    color: 'bg-amber-500',
  },
  {
    title: 'Étudiants gérés',
    value: '1,245',
    subValue: 'Informatique',
    icon: GraduationCap,
    trend: '+2%',
    color: 'bg-purple-500',
  },
  {
    title: 'Paiements validés',
    value: '89',
    subValue: 'Ce mois',
    icon: Wallet,
    trend: '+18%',
    color: 'bg-green-500',
  },
]

// Pending tasks
const pendingTasks = [
  {
    id: 1,
    type: 'inscription',
    title: 'Validation inscription',
    student: 'Patrick Mbuyi',
    matricule: 'L1-INFO-2025-001',
    date: '2025-01-15',
    priority: 'high',
  },
  {
    id: 2,
    type: 'document',
    title: 'Demande de relevé de notes',
    student: 'Marie Kasongo',
    matricule: 'L2-INFO-2024-042',
    date: '2025-01-14',
    priority: 'medium',
  },
  {
    id: 3,
    type: 'payment',
    title: 'Validation paiement frais',
    student: 'Jean Ilunga',
    matricule: 'L1-INFO-2025-015',
    date: '2025-01-14',
    priority: 'high',
  },
  {
    id: 4,
    type: 'document',
    title: 'Attestation d\'inscription',
    student: 'Sarah Mutombo',
    matricule: 'L3-INFO-2023-028',
    date: '2025-01-13',
    priority: 'low',
  },
  {
    id: 5,
    type: 'inscription',
    title: 'Réinscription L2',
    student: 'David Lukusa',
    matricule: 'L1-INFO-2024-089',
    date: '2025-01-13',
    priority: 'medium',
  },
]

// Recent payments
const recentPayments = [
  {
    id: 1,
    student: 'Patrick Mbuyi',
    amount: 250000,
    type: '1ère Tranche',
    method: 'Mobile Money',
    date: '2025-01-15 10:30',
    status: 'validated',
  },
  {
    id: 2,
    student: 'Marie Kasongo',
    amount: 125000,
    type: '2ème Tranche',
    method: 'Virement',
    date: '2025-01-15 09:15',
    status: 'pending',
  },
  {
    id: 3,
    student: 'Jean Ilunga',
    amount: 250000,
    type: '1ère Tranche',
    method: 'Cash',
    date: '2025-01-14 16:45',
    status: 'validated',
  },
  {
    id: 4,
    student: 'Sarah Mutombo',
    amount: 125000,
    type: '3ème Tranche',
    method: 'Mobile Money',
    date: '2025-01-14 14:20',
    status: 'rejected',
  },
]

// Announcements
const announcements = [
  {
    id: 1,
    title: 'Clôture des inscriptions',
    message: 'Date limite: 31 janvier 2025',
    date: '2025-01-15',
    type: 'warning',
  },
  {
    id: 2,
    title: 'Formation système',
    message: 'Session de formation le 20 janvier',
    date: '2025-01-14',
    type: 'info',
  },
  {
    id: 3,
    title: 'Nouveau tarif frais',
    message: 'Mise à jour des barèmes validée',
    date: '2025-01-13',
    type: 'success',
  },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function EmployeeDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('tasks')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-500">
            Bienvenue, <span className="font-medium">Agent Mutombo</span> • Bureau des inscriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Rapport journalier
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-600">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle inscription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className={`w-4 h-4 ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400">vs semaine dernière</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks & Payments - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un étudiant (nom, matricule)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="enrolled">Inscrit</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="debt">Avec dette</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tasks">
                    <Clock className="w-4 h-4 mr-2" />
                    Tâches en attente ({pendingTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <Wallet className="w-4 h-4 mr-2" />
                    Paiements récents
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="pt-4">
                <TabsContent value="tasks" className="m-0">
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            task.type === 'inscription' ? 'bg-blue-100 text-blue-600' :
                            task.type === 'document' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {task.type === 'inscription' ? <Users className="w-5 h-5" /> :
                             task.type === 'document' ? <FileText className="w-5 h-5" /> :
                             <Wallet className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500">
                              {task.student} • <span className="font-mono">{task.matricule}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'warning' : 'secondary'
                          }>
                            {task.priority === 'high' ? 'Urgent' :
                             task.priority === 'medium' ? 'Normal' : 'Bas'}
                          </Badge>
                          <span className="text-xs text-gray-400">{task.date}</span>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Étudiant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.student}</TableCell>
                          <TableCell>{payment.type}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell className="text-gray-500 text-sm">{payment.date}</TableCell>
                          <TableCell>
                            <Badge variant={
                              payment.status === 'validated' ? 'success' :
                              payment.status === 'pending' ? 'warning' : 'destructive'
                            }>
                              {payment.status === 'validated' ? 'Validé' :
                               payment.status === 'pending' ? 'En attente' : 'Rejeté'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Traiter
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle inscription
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Générer attestation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="w-4 h-4 mr-2" />
                Enregistrer paiement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer carte étudiant
              </Button>
            </CardContent>
          </Card>

          {/* Progress Today */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progression du jour</CardTitle>
              <CardDescription>Tâches accomplies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Inscriptions</span>
                  <span className="text-sm font-medium">12/15</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Paiements</span>
                  <span className="text-sm font-medium">8/10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="text-sm font-medium">5/8</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Annonces
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    announcement.type === 'warning' ? 'bg-amber-50 border-amber-400 dark:bg-amber-900/20' :
                    announcement.type === 'info' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
                    'bg-green-50 border-green-400 dark:bg-green-900/20'
                  }`}
                >
                  <p className="font-medium text-sm">{announcement.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{announcement.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{announcement.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Présence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">07:45:32</div>
                <p className="text-sm text-gray-500 mt-1">Temps de travail</p>
                <div className="flex justify-between mt-4 text-sm">
                  <div>
                    <p className="text-gray-400">Arrivée</p>
                    <p className="font-medium">08:00</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pause</p>
                    <p className="font-medium">12:00-13:00</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Fin prévue</p>
                    <p className="font-medium">17:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
